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
      id,
      user_id,
      name,
      email,
      department,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Teacher'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
      now()
    );
  -- Check if user type is student
  ELSIF NEW.raw_user_meta_data->>'userType' = 'student' THEN
    INSERT INTO public.app_b3583718a0_students (
      id,
      user_id,
      name,
      email,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Student'),
      NEW.email,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically create teacher/student profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();