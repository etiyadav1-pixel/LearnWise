-- ============================================================
-- LearnWise × Kraftshala — Complete Supabase Schema
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Student accounts (Name + Password auth)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_name_lower 
  ON public.students (LOWER(student_name));

-- 2. Login event log
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  student_name TEXT NOT NULL,
  logged_in_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT
);

-- 3. Quiz results (final scores per attempt)
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  student_name TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  percentage INT NOT NULL,
  xp_earned INT DEFAULT 0,
  best_combo INT DEFAULT 0,
  strong_areas TEXT[],
  weak_areas TEXT[],
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Per-question answer log (progress tracking)
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  attempt_id UUID,
  question_id TEXT NOT NULL,
  question_topic TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  xp_awarded INT DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student progress (resume-able state)
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) UNIQUE,
  current_screen TEXT DEFAULT 'cover',
  current_question INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  best_score INT DEFAULT 0,
  best_percentage INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security on ALL tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Students table
DROP POLICY IF EXISTS "service_role_all_students" ON public.students;
CREATE POLICY "service_role_all_students" ON public.students
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_students" ON public.students;
CREATE POLICY "anon_read_students" ON public.students
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON public.students;
CREATE POLICY "anon_insert_students" ON public.students
  FOR INSERT TO anon WITH CHECK (true);

-- User logins
DROP POLICY IF EXISTS "insert_logins" ON public.user_logins;
CREATE POLICY "insert_logins" ON public.user_logins
  FOR INSERT TO anon, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "read_logins" ON public.user_logins;
CREATE POLICY "read_logins" ON public.user_logins
  FOR SELECT TO anon, service_role USING (true);

-- Quiz results
DROP POLICY IF EXISTS "insert_results" ON public.quiz_results;
CREATE POLICY "insert_results" ON public.quiz_results
  FOR INSERT TO anon, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "read_results" ON public.quiz_results;
CREATE POLICY "read_results" ON public.quiz_results
  FOR SELECT TO anon, service_role USING (true);

-- Student answers
DROP POLICY IF EXISTS "insert_answers" ON public.student_answers;
CREATE POLICY "insert_answers" ON public.student_answers
  FOR INSERT TO anon, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "read_answers" ON public.student_answers;
CREATE POLICY "read_answers" ON public.student_answers
  FOR SELECT TO anon, service_role USING (true);

-- Student progress
DROP POLICY IF EXISTS "all_progress" ON public.student_progress;
CREATE POLICY "all_progress" ON public.student_progress
  FOR ALL TO anon, service_role USING (true) WITH CHECK (true);

-- 8. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

