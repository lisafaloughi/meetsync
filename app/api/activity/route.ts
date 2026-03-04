import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const logs = db
    .prepare(
      `
      SELECT id, message, created_at
      FROM activity_log
      ORDER BY id DESC
      LIMIT 50
      `
    )
    .all();

  return NextResponse.json({ logs });
}