CREATE TABLE IF NOT EXISTS pathora_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  profile JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS pathora_progress (
  career TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS pathora_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pathora_student (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data JSONB NOT NULL CHECK (jsonb_typeof(data) = 'object')
);

CREATE TABLE IF NOT EXISTS pathora_career_catalog (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS pathora_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS pathora_user_students (
  user_id UUID PRIMARY KEY REFERENCES pathora_users(id) ON DELETE CASCADE,
  data JSONB NOT NULL CHECK (jsonb_typeof(data) = 'object')
);
CREATE TABLE IF NOT EXISTS pathora_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES pathora_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS pathora_sessions_expiry ON pathora_sessions(expires_at);
