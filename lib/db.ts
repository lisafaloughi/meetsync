import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  claim_token TEXT NOT NULL UNIQUE,
  claimed_by TEXT
);

CREATE TABLE IF NOT EXISTS availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  day TEXT NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  FOREIGN KEY(agent_id) REFERENCES agents(id)
);

CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  proposed_day TEXT,
  proposed_start INTEGER,
  proposed_end INTEGER
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  meeting_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  response TEXT NOT NULL DEFAULT 'pending',
  PRIMARY KEY (meeting_id, agent_id),
  FOREIGN KEY(meeting_id) REFERENCES meetings(id),
  FOREIGN KEY(agent_id) REFERENCES agents(id)
);
`);

export default db;