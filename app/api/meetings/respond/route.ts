import { NextResponse } from "next/server";
import db from "@/lib/db";
import { addLog } from "@/lib/activity";

type Interval = { start: number; end: number };

function normalizeHours(start: number, end: number): Interval | null {
  const s = Math.max(0, Math.min(24, Math.floor(start)));
  const e = Math.max(0, Math.min(24, Math.floor(end)));
  if (s >= e) return null;
  return { start: s, end: e };
}

function subtractOne(a: Interval, cut: Interval): Interval[] {
  if (cut.end <= a.start || cut.start >= a.end) return [a];

  const out: Interval[] = [];
  if (cut.start > a.start) out.push({ start: a.start, end: cut.start });
  if (cut.end < a.end) out.push({ start: cut.end, end: a.end });
  return out;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { meeting_id, agent_id, response } = body ?? {};

  if (!meeting_id || !agent_id || !response) {
    return NextResponse.json(
      { error: "meeting_id, agent_id, response required" },
      { status: 400 }
    );
  }

  if (!["accepted", "rejected"].includes(response)) {
    return NextResponse.json(
      { error: "response must be accepted or rejected" },
      { status: 400 }
    );
  }

  const tx = db.transaction(() => {
    // Update participant response
    db.prepare(
      `
      UPDATE meeting_participants
      SET response = ?
      WHERE meeting_id = ? AND agent_id = ?
    `
    ).run(response, meeting_id, agent_id);

    // Log: AgentA accepted meeting 3
    const actor = db
      .prepare(`SELECT name FROM agents WHERE id = ?`)
      .get(agent_id) as { name: string } | undefined;

    if (actor) {
      addLog(`${actor.name} ${response} meeting ${meeting_id}`);
    }

    // If anyone rejected -> reject meeting
    const rejected = db
      .prepare(
        `
        SELECT 1
        FROM meeting_participants
        WHERE meeting_id = ? AND response = 'rejected'
        LIMIT 1
      `
      )
      .get(meeting_id);

    if (rejected) {
      db.prepare(`UPDATE meetings SET status='rejected' WHERE id=?`).run(
        meeting_id
      );

      const names = db
        .prepare(
          `
          SELECT a.name
          FROM meeting_participants mp
          JOIN agents a ON a.id = mp.agent_id
          WHERE mp.meeting_id = ?
          ORDER BY a.id ASC
        `
        )
        .all(meeting_id)
        .map((r: any) => r.name);

      addLog(`Meeting rejected for ${names.join(", ")} meeting ${meeting_id}`);

      return { status: "meeting rejected" };
    }

    // If any pending -> still waiting
    const pending = db
      .prepare(
        `
        SELECT 1
        FROM meeting_participants
        WHERE meeting_id = ? AND response = 'pending'
        LIMIT 1
      `
      )
      .get(meeting_id);

    if (pending) {
      return { status: "waiting for others" };
    }

    // Otherwise all accepted -> confirm
    db.prepare(`UPDATE meetings SET status='confirmed' WHERE id=?`).run(
      meeting_id
    );

    // Fetch meeting info (day/time)
    const meeting = db
      .prepare(
        `
        SELECT proposed_day, proposed_start, proposed_end
        FROM meetings
        WHERE id = ?
      `
      )
      .get(meeting_id) as
      | {
          proposed_day: string | null;
          proposed_start: number | null;
          proposed_end: number | null;
        }
      | undefined;

    // Get participant ids
    const participants = db
      .prepare(
        `
        SELECT agent_id
        FROM meeting_participants
        WHERE meeting_id = ?
      `
      )
      .all(meeting_id) as Array<{ agent_id: number }>;

    // Names for log
    const names = db
      .prepare(
        `
        SELECT a.name
        FROM meeting_participants mp
        JOIN agents a ON a.id = mp.agent_id
        WHERE mp.meeting_id = ?
        ORDER BY a.id ASC
      `
      )
      .all(meeting_id)
      .map((r: any) => r.name);

    if (!meeting?.proposed_day || meeting.proposed_start === null || meeting.proposed_end === null) {
      addLog(`Meeting confirmed for ${names.join(", ")} meeting ${meeting_id}`);
      return { status: "meeting confirmed" };
    }

    const cut = normalizeHours(meeting.proposed_start, meeting.proposed_end);
    if (!cut) {
      addLog(`Meeting confirmed for ${names.join(", ")} meeting ${meeting_id}`);
      return { status: "meeting confirmed" };
    }

    // Subtract meeting window from each participant availability
    const selectAvail = db.prepare(
      `
      SELECT start_hour, end_hour
      FROM availability
      WHERE agent_id = ? AND day = ?
      ORDER BY start_hour ASC
      `
    );

    const deleteAvail = db.prepare(
      `
      DELETE FROM availability
      WHERE agent_id = ? AND day = ?
      `
    );

    const insertAvail = db.prepare(
      `
      INSERT INTO availability (agent_id, day, start_hour, end_hour)
      VALUES (?, ?, ?, ?)
      `
    );

    for (const p of participants) {
      const rows = selectAvail.all(p.agent_id, meeting.proposed_day) as Array<{
        start_hour: number;
        end_hour: number;
      }>;

      const remaining: Interval[] = [];
      for (const r of rows) {
        remaining.push(...subtractOne({ start: r.start_hour, end: r.end_hour }, cut));
      }

      deleteAvail.run(p.agent_id, meeting.proposed_day);

      for (const it of remaining) {
        insertAvail.run(p.agent_id, meeting.proposed_day, it.start, it.end);
      }
    }

    // Log final confirmation with time
    addLog(
      `Meeting confirmed for ${names.join(", ")} ${meeting.proposed_day} ${cut.start} to ${cut.end}`
    );

    return { status: "meeting confirmed" };
  });

  const result = tx();
  return NextResponse.json(result);
}