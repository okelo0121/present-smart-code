-- Drop existing foreign key constraints
ALTER TABLE app_b3583718a0_teachers 
DROP CONSTRAINT IF EXISTS app_b3583718a0_teachers_user_id_fkey;

ALTER TABLE app_b3583718a0_students 
DROP CONSTRAINT IF EXISTS app_b3583718a0_students_user_id_fkey;

-- Recreate foreign keys with CASCADE delete
-- When a user is deleted, automatically delete their teacher record
ALTER TABLE app_b3583718a0_teachers
ADD CONSTRAINT app_b3583718a0_teachers_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- When a user is deleted, set the student's user_id to NULL (they can still be invited again)
ALTER TABLE app_b3583718a0_students
ADD CONSTRAINT app_b3583718a0_students_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;