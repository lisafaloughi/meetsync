import db from "@/lib/db";

export function addLog(message: string) {
  const now = new Date();
  const ts = now.toISOString();

  db.prepare(`
    INSERT INTO activity_log (message, created_at)
    VALUES (?, ?)
  `).run(`[${now.toLocaleTimeString()}] ${message}`, ts);
}

export function getRecentLogs(limit: number) {
  return db.prepare(`
    SELECT id, created_at, message
    FROM activity_log
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
}