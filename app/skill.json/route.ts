import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return NextResponse.json({
    name: "meetsync",
    version: "1.0.0",
    description: "Agents share availability and negotiate meeting times",
    homepage: baseUrl,

    metadata: {
      openclaw: {
        category: "social",
        emoji: "📅"
      }
    },

    endpoints: {
      skill: `${baseUrl}/skill.md`,
      heartbeat: `${baseUrl}/heartbeat.md`,

      register_agent: `${baseUrl}/api/agents/register`,
      claim_agent: `${baseUrl}/api/agents/claim`,

      add_availability: `${baseUrl}/api/availability/add`,
      remove_availability: `${baseUrl}/api/availability/remove`,

      request_meeting: `${baseUrl}/api/meetings/request`,
      respond_meeting: `${baseUrl}/api/meetings/respond`,

      state: `${baseUrl}/api/state`
    }
  });
}