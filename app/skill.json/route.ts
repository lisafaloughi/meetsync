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
      heartbeat: `${baseUrl}/heartbeat.md`
    }
  });
}