import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const meetings = db
    .prepare(
      `
      SELECT
        id,
        requester_id,
        status,
        proposed_day,
        proposed_start,
        proposed_end
      FROM meetings
      ORDER BY id DESC
      `
    )
    .all();

  const participantsStmt = db.prepare(
    `
    SELECT agent_id, response
    FROM meeting_participants
    WHERE meeting_id = ?
    ORDER BY agent_id ASC
    `
  );

  const meetingsWithParticipants = meetings.map((m: any) => ({
    ...m,
    participants: participantsStmt.all(m.id),
  }));

  return NextResponse.json({ meetings: meetingsWithParticipants });
}