import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const agents = db
    .prepare(
      `
      SELECT id, name, claimed_by
      FROM agents
      ORDER BY id ASC
      `
    )
    .all();

  const availability = db
    .prepare(
      `
      SELECT id, agent_id, day, start_hour, end_hour
      FROM availability
      ORDER BY id DESC
      `
    )
    .all();

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

  return NextResponse.json({
    agents,
    availability,
    meetings: meetingsWithParticipants,
    server_time: new Date().toISOString(),
  });
}