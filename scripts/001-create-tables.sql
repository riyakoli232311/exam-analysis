-- Exam Analytics Platform Schema

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  selected_exam TEXT,
  display_name TEXT,
  dark_mode BOOLEAN DEFAULT false,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_user_id)
);

CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  total_score NUMERIC,
  max_score NUMERIC,
  accuracy NUMERIC,
  time_taken_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_number INTEGER,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  exam_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
