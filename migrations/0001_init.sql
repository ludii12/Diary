CREATE TABLE IF NOT EXISTS diaries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT '',
  weather TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  media TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date);
CREATE INDEX IF NOT EXISTS idx_diaries_updated_at ON diaries(updated_at);