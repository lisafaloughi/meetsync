import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { meeting_id, agent_id, response } = body;

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

  // update participant response
  db.prepare(`
    UPDATE meeting_participants
    SET response = ?
    WHERE meeting_id = ? AND agent_id = ?
  `).run(response, meeting_id, agent_id);

  // check if anyone rejected
  const rejected = db.prepare(`
    SELECT * FROM meeting_participants
    WHERE meeting_id = ? AND response = 'rejected'
  `).get(meeting_id);

  if (rejected) {
    db.prepare(`UPDATE meetings SET status='rejected' WHERE id=?`)
      .run(meeting_id);

    return NextResponse.json({ status: "meeting rejected" });
  }

  // check if all accepted
  const pending = db.prepare(`
    SELECT * FROM meeting_participants
    WHERE meeting_id = ? AND response = 'pending'
  `).get(meeting_id);

  if (!pending) {
    db.prepare(`UPDATE meetings SET status='confirmed' WHERE id=?`)
      .run(meeting_id);

    return NextResponse.json({ status: "meeting confirmed" });
  }

  return NextResponse.json({ status: "waiting for others" });
}