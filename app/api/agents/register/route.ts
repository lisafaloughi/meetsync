import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import db from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const apiKey = nanoid(32);
  const claimToken = nanoid(16);

  const stmt = db.prepare(`
    INSERT INTO agents (name, api_key, claim_token)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(name, apiKey, claimToken);

  return NextResponse.json({
    agent_id: result.lastInsertRowid,
    api_key: apiKey,
    claim_token: claimToken,
  });
}