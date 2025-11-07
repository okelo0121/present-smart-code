-- Fix search_path for validate_invite_expiration function
CREATE OR REPLACE FUNCTION public.validate_invite_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  RETURN NEW;
END;
$$;