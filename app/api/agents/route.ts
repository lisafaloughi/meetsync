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

  return NextResponse.json({ agents });
}