-- Create student invites table to track invitation tokens
CREATE TABLE IF NOT EXISTS public.app_b3583718a0_student_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.app_b3583718a0_student_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Only the service role can manage invites (handled by edge function)
CREATE POLICY "Service role can manage invites"
  ON public.app_b3583718a0_student_invites
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add trigger to validate expiration
CREATE OR REPLACE FUNCTION public.validate_invite_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_invite_expiration
  BEFORE INSERT OR UPDATE ON public.app_b3583718a0_student_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invite_expiration();