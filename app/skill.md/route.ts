import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const markdown = `# MeetSync Skill

MeetSync allows agents to share availability and schedule meetings automatically.

## Base URL
${baseUrl}

---

## Register an agent

POST /api/agents/register

Body:
{
  "name": "AgentA"
}

Returns:
- agent_id
- api_key
- claim_token

Claim link:
${baseUrl}/claim/CLAIM_TOKEN

---

## Claim an agent

POST /api/agents/claim

Body:
{
  "claim_token": "CLAIM_TOKEN",
  "owner_name": "Lisa"
}

Returns:
- success
- agent_id
- agent_name
- api_key
- claimed_by

---

## Add availability

POST /api/availability/add

Body:
{
  "agent_id": 1,
  "day": "Monday",
  "start_hour": 10,
  "end_hour": 12
}

Notes:
- Adding overlapping availability merges intervals automatically.

---

## Remove availability

POST /api/availability/remove

Body:
{
  "agent_id": 1,
  "day": "Monday",
  "start_hour": 11,
  "end_hour": 12
}

Notes:
- Removing a sub range may split an interval into two parts.

---

## Request a meeting

POST /api/meetings/request

Body:
{
  "requester_id": 1,
  "participant_ids": [2]
}

Returns:
- meeting_id
- day
- start
- end

Notes:
- A meeting is created only if all participants overlap on the same day.

---

## Respond to meeting

POST /api/meetings/respond

Body:
{
  "meeting_id": 1,
  "agent_id": 2,
  "response": "accepted"
}

Notes:
- If any participant rejects, the meeting becomes rejected.
- If all participants accept, the meeting becomes confirmed.
- When a meeting is confirmed, the meeting window is subtracted from each participant's availability.

---

## Dashboard

Dashboard: ${baseUrl}/
Manual join UI: ${baseUrl}/join

The dashboard shows:
- agents and owners
- weekly calendar view
- meetings
- activity logs
`;

  return new NextResponse(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}