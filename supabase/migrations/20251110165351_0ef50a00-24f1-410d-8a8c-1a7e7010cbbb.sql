-- Create trigger to automatically create teacher records on signup
-- First, ensure the function handles the correct metadata field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user type is teacher (support both 'userType' and 'role' fields)
  IF (NEW.raw_user_meta_data->>'userType' = 'teacher' OR NEW.raw_user_meta_data->>'role' = 'teacher') THEN
    INSERT INTO public.app_b3583718a0_teachers (
      user_id,
      name,
      email,
      department
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'department', 'General')
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to call handle_new_user after a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also ensure the student linking trigger exists
CREATE OR REPLACE FUNCTION public.link_student_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user type is student
  IF (NEW.raw_user_meta_data->>'userType' = 'student' OR NEW.raw_user_meta_data->>'role' = 'student') THEN
    -- Update the student record with matching email to link to this user
    UPDATE public.app_b3583718a0_students
    SET user_id = NEW.id
    WHERE email = NEW.email 
    AND user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop the student trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_link_student ON auth.users;

-- Create trigger for student linking
CREATE TRIGGER on_auth_user_created_link_student
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_student_to_user();