-- Project suggestions: citizen-proposed projects for MPs to carry out
CREATE TABLE public.project_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  constituency TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  estimated_impact TEXT,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','under_review','approved','in_progress','completed','rejected')),
  vote_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project suggestions viewable by all"
  ON public.project_suggestions FOR SELECT USING (true);

CREATE POLICY "Auth users can suggest projects"
  ON public.project_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own suggestions"
  ON public.project_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Officials can update project status"
  ON public.project_suggestions FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'mp')
    OR public.has_role(auth.uid(), 'minister')
    OR public.has_role(auth.uid(), 'dce')
    OR public.has_role(auth.uid(), 'president')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_project_suggestions_updated_at
  BEFORE UPDATE ON public.project_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- One vote per user per project
CREATE TABLE public.project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.project_suggestions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project votes viewable by all"
  ON public.project_votes FOR SELECT USING (true);

CREATE POLICY "Auth users can vote on projects"
  ON public.project_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own project vote"
  ON public.project_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_project_suggestions_constituency ON public.project_suggestions(constituency);
CREATE INDEX idx_project_suggestions_category ON public.project_suggestions(category);
CREATE INDEX idx_project_suggestions_votes ON public.project_suggestions(vote_count DESC);
CREATE INDEX idx_project_suggestions_status ON public.project_suggestions(status);
CREATE INDEX idx_project_votes_project ON public.project_votes(project_id);
CREATE INDEX idx_project_votes_user ON public.project_votes(user_id);
