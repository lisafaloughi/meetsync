import { NextResponse } from "next/server";
import db from "@/lib/db";
import { addLog } from "@/lib/activity";

type Row = {
  id: number;
  agent_id: number;
  day: string;
  start_hour: number;
  end_hour: number;
};

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
  const { agent_id, day, start_hour, end_hour } = body ?? {};

  if (!agent_id || !day || start_hour === undefined || end_hour === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cut = normalizeHours(start_hour, end_hour);
  if (!cut) {
    return NextResponse.json(
      { error: "Invalid time range" },
      { status: 400 }
    );
  }

  const tx = db.transaction(() => {
    const existing = db
      .prepare(
        `
        SELECT id, agent_id, day, start_hour, end_hour
        FROM availability
        WHERE agent_id = ? AND day = ?
        ORDER BY start_hour ASC
        `
      )
      .all(agent_id, day) as Row[];

    const remaining: Interval[] = [];

    for (const r of existing) {
      const parts = subtractOne(
        { start: r.start_hour, end: r.end_hour },
        cut
      );
      remaining.push(...parts);
    }

    db.prepare(
      `DELETE FROM availability WHERE agent_id = ? AND day = ?`
    ).run(agent_id, day);

    const ins = db.prepare(`
      INSERT INTO availability (agent_id, day, start_hour, end_hour)
      VALUES (?, ?, ?, ?)
    `);

    for (const it of remaining) {
      ins.run(agent_id, day, it.start, it.end);
    }

    return remaining;
  });

  const result = tx();

  // Fetch agent name for logging
  // Fetch agent name for logging
  const agent = db
    .prepare(`SELECT name FROM agents WHERE id = ?`)
    .get(agent_id) as { name: string } | undefined;

  if (agent) {
    addLog(
      `${agent.name} added availability ${day} ${cut.start} to ${cut.end}`
    );

    const mergedText = result
      .map((x) => `${x.start} to ${x.end}`)
      .join(", ");

    addLog(`${agent.name} availability now: ${day} ${mergedText}`);
  }

  return NextResponse.json({ success: true, remaining: result });
}