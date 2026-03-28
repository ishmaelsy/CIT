
-- Fix: set search_path on calculate_magnitude
CREATE OR REPLACE FUNCTION public.calculate_magnitude(
  _me_too INT, _upvotes INT, _comments INT, _days_open INT, _urgency TEXT
)
RETURNS INT
LANGUAGE sql IMMUTABLE SET search_path = public
AS $$
  SELECT (
    (_me_too * 3) + (_upvotes * 2) + _comments +
    GREATEST(_days_open / 7, 1) * 5 +
    CASE _urgency WHEN 'critical' THEN 100 WHEN 'high' THEN 50 WHEN 'medium' THEN 20 ELSE 0 END
  )::INT
$$;

-- Fix: notifications insert policy - restrict to authenticated users only
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Auth users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
