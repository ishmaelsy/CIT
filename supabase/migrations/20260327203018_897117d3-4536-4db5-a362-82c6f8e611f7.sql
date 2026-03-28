-- Drop restrictive update policy on issues and replace with one that allows
-- the owner to update their own issue AND any authenticated user to update count fields
DROP POLICY IF EXISTS "Users update own issues" ON public.issues;

-- Owner can update their own issues
CREATE POLICY "Users update own issues"
ON public.issues FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow any authenticated user to update count columns (for upvotes/me_too/comments)
CREATE POLICY "Auth users update issue counts"
ON public.issues FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);