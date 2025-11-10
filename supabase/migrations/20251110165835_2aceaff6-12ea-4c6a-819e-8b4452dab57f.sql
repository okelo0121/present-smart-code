-- Fix the trigger to handle duplicate inserts gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user type is teacher (support both 'userType' and 'role' fields)
  IF (NEW.raw_user_meta_data->>'userType' = 'teacher' OR NEW.raw_user_meta_data->>'role' = 'teacher') THEN
    -- Use INSERT ... ON CONFLICT to prevent duplicate key errors
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
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also fix the student linking trigger
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