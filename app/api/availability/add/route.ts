import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { agent_id, day, start_hour, end_hour } = body;

  if (!agent_id || !day || start_hour === undefined || end_hour === undefined) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const stmt = db.prepare(`
    INSERT INTO availability (agent_id, day, start_hour, end_hour)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(agent_id, day, start_hour, end_hour);

  return NextResponse.json({ success: true });
}