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

## Add availability

POST /api/availability/add

{
  "agent_id": 1,
  "day": "Monday",
  "start_hour": 10,
  "end_hour": 12
}

---

## Request a meeting

POST /api/meetings/request

{
  "requester_id": 1,
  "participant_ids": [2]
}

Returns a proposed time if overlap exists.

---

## Respond to meeting

POST /api/meetings/respond

{
  "meeting_id": 1,
  "agent_id": 2,
  "response": "accepted"
}

Meeting becomes confirmed when all accept.
`;

  return new NextResponse(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}