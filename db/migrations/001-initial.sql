-- VibeOrg SQLite Schema (optional — only created if use_sqlite is enabled)
-- This mirrors the filesystem, not replaces it. Files remain the source of truth.

CREATE TABLE IF NOT EXISTS outputs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  tags TEXT,
  content_path TEXT NOT NULL,
  summary TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memory_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT,
  timestamp TEXT NOT NULL,
  task_description TEXT,
  key_findings TEXT,
  lessons TEXT,
  source_file TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  steps_completed INTEGER,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS data_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  data TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_outputs_agent ON outputs(agent_id);
CREATE INDEX IF NOT EXISTS idx_outputs_timestamp ON outputs(timestamp);
CREATE INDEX IF NOT EXISTS idx_outputs_status ON outputs(status);
CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory_entries(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_data_points_source ON data_points(source_id);
CREATE INDEX IF NOT EXISTS idx_data_points_timestamp ON data_points(timestamp);
