CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_slug TEXT NOT NULL,
  reason TEXT NOT NULL,
  comment TEXT,
  user_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_reports_slug ON question_reports (question_slug);
