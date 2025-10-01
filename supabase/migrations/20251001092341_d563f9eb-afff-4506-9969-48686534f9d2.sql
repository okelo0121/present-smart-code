-- Create a function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user type is teacher
  IF NEW.raw_user_meta_data->>'userType' = 'teacher' THEN
    INSERT INTO public.app_b3583718a0_teachers (
      user_id,
      name,
      email,
      department
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Teacher'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'department', 'General')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create teacher profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created_teacher ON auth.users;
CREATE TRIGGER on_auth_user_created_teacher
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();