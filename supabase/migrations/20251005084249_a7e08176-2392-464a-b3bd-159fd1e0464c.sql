-- Function to link student record to auth user after signup
CREATE OR REPLACE FUNCTION public.link_student_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user type is student
  IF NEW.raw_user_meta_data->>'userType' = 'student' THEN
    -- Update the student record with matching email to link to this user
    UPDATE public.app_b3583718a0_students
    SET user_id = NEW.id
    WHERE email = NEW.email 
    AND user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to link students after auth user creation
DROP TRIGGER IF EXISTS on_student_user_created ON auth.users;
CREATE TRIGGER on_student_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'userType' = 'student')
  EXECUTE FUNCTION public.link_student_to_user();