CREATE TABLE public.diploma_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 level_id text NOT NULL CHECK (level_id IN ('beginner','intermediate','advanced','expert')),
 part_index integer CHECK (part_index BETWEEN 0 AND 3),
 score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
 total integer NOT NULL,
 correct integer NOT NULL,
 learner_name text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.diploma_attempts TO authenticated;
GRANT ALL ON public.diploma_attempts TO service_role;
ALTER TABLE public.diploma_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Learners read own attempts" ON public.diploma_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX diploma_attempts_user_idx ON public.diploma_attempts(user_id, level_id, created_at DESC);