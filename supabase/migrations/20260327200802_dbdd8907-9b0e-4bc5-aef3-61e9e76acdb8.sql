
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('citizen', 'mp', 'minister', 'dce', 'president', 'admin');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  constituency TEXT,
  region TEXT,
  district TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles viewable by all" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins insert roles" ON public.user_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile and citizen role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  constituency TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in-progress','resolved')),
  image_urls TEXT[] DEFAULT '{}',
  upvotes_count INT NOT NULL DEFAULT 0,
  me_too_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  magnitude_score INT NOT NULL DEFAULT 0,
  has_official_response BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Issues viewable by all" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Auth users can create issues" ON public.issues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own issues" ON public.issues FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Upvotes
CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, issue_id)
);
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Upvotes viewable by all" ON public.upvotes FOR SELECT USING (true);
CREATE POLICY "Auth users can upvote" ON public.upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own upvote" ON public.upvotes FOR DELETE USING (auth.uid() = user_id);

-- Me Too reports
CREATE TABLE public.me_too_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, issue_id)
);
ALTER TABLE public.me_too_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MeToo viewable by all" ON public.me_too_reports FOR SELECT USING (true);
CREATE POLICY "Auth users can me-too" ON public.me_too_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own me-too" ON public.me_too_reports FOR DELETE USING (auth.uid() = user_id);

-- Comments with threading
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Leader ratings (one per leader per month)
CREATE TABLE public.leader_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leader_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, leader_user_id, month_year)
);
ALTER TABLE public.leader_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings viewable by all" ON public.leader_ratings FOR SELECT USING (true);
CREATE POLICY "Auth users can rate" ON public.leader_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Priority votes (3 per month per citizen per constituency)
CREATE TABLE public.priority_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, issue_id, month_year)
);
ALTER TABLE public.priority_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable by all" ON public.priority_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.priority_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket for issue photos
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);
CREATE POLICY "Anyone can view issue photos" ON storage.objects FOR SELECT USING (bucket_id = 'issue-photos');
CREATE POLICY "Auth users can upload issue photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'issue-photos' AND auth.uid() IS NOT NULL);

-- Magnitude score calculation function
CREATE OR REPLACE FUNCTION public.calculate_magnitude(
  _me_too INT, _upvotes INT, _comments INT, _days_open INT, _urgency TEXT
)
RETURNS INT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT (
    (_me_too * 3) + (_upvotes * 2) + _comments +
    GREATEST(_days_open / 7, 1) * 5 +
    CASE _urgency WHEN 'critical' THEN 100 WHEN 'high' THEN 50 WHEN 'medium' THEN 20 ELSE 0 END
  )::INT
$$;

-- Indexes for performance
CREATE INDEX idx_issues_constituency ON public.issues(constituency);
CREATE INDEX idx_issues_category ON public.issues(category);
CREATE INDEX idx_issues_magnitude ON public.issues(magnitude_score DESC);
CREATE INDEX idx_comments_issue ON public.comments(issue_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
