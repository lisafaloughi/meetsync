import { NextResponse } from "next/server";
import db from "@/lib/db";
import { addLog } from "@/lib/activity";

export async function POST(req: Request) {
  const body = await req.json();
  const { requester_id, participant_ids } = body ?? {};

  if (!requester_id || !participant_ids?.length) {
    return NextResponse.json(
      { error: "requester_id and participant_ids required" },
      { status: 400 }
    );
  }

  const allAgents = [requester_id, ...participant_ids];

  const availabilities = db
    .prepare(
      `
      SELECT agent_id, day, start_hour, end_hour
      FROM availability
      WHERE agent_id IN (${allAgents.map(() => "?").join(",")})
    `
    )
    .all(...allAgents);

  if (availabilities.length === 0) {
    return NextResponse.json(
      { error: "No availability found" },
      { status: 400 }
    );
  }

  const days = [...new Set(availabilities.map((a: any) => a.day))];

  for (const day of days) {
    const daySlots = availabilities.filter((a: any) => a.day === day);

    const maxStart = Math.max(...daySlots.map((s: any) => s.start_hour));
    const minEnd = Math.min(...daySlots.map((s: any) => s.end_hour));

    if (maxStart < minEnd) {
      const result = db
        .prepare(
          `
          INSERT INTO meetings (requester_id, proposed_day, proposed_start, proposed_end)
          VALUES (?, ?, ?, ?)
        `
        )
        .run(requester_id, day, maxStart, minEnd);

      const meetingId = result.lastInsertRowid;

      for (const agentId of allAgents) {
        db.prepare(
          `
          INSERT INTO meeting_participants (meeting_id, agent_id)
          VALUES (?, ?)
        `
        ).run(meetingId, agentId);
      }

      // LOG: Meeting scheduled for AgentA, AgentB Monday 10 to 11
      const names = db
        .prepare(
          `
          SELECT name
          FROM agents
          WHERE id IN (${allAgents.map(() => "?").join(",")})
          ORDER BY id ASC
        `
        )
        .all(...allAgents)
        .map((r: any) => r.name);

      addLog(
        `Meeting scheduled for ${names.join(", ")} ${day} ${maxStart} to ${minEnd}`
      );

      return NextResponse.json({
        meeting_id: meetingId,
        day,
        start: maxStart,
        end: minEnd,
      });
    }
  }

  // Optional log (not necessary)
  return NextResponse.json({ error: "No common time found" });
}