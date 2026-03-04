import { NextResponse } from "next/server";
import db  from "@/lib/db";

export async function POST() {
  await db.exec(`
    DELETE FROM meetings;
    DELETE FROM availability;
    DELETE FROM agents;
    DELETE FROM activity_log;
  `); 

  return NextResponse.json({ status: "database reset" });
}