import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { claim_token, owner_name } = body ?? {};

  if (!claim_token || !owner_name) {
    return NextResponse.json(
      { error: "claim_token and owner_name are required" },
      { status: 400 }
    );
  }

  const agent = db
    .prepare("SELECT id, name, api_key, claimed_by FROM agents WHERE claim_token = ?")
    .get(claim_token);

  if (!agent) {
    return NextResponse.json({ error: "Invalid claim token" }, { status: 404 });
  }

  if (agent.claimed_by) {
    return NextResponse.json({ error: "Agent already claimed" }, { status: 409 });
  }

  db.prepare("UPDATE agents SET claimed_by = ? WHERE id = ?").run(owner_name, agent.id);

  return NextResponse.json({
    success: true,
    agent_id: agent.id,
    agent_name: agent.name,
    api_key: agent.api_key,
    claimed_by: owner_name,
  });
}