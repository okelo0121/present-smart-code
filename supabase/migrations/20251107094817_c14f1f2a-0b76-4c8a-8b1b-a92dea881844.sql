-- Add RLS policy for students to view attendance codes for their class
CREATE POLICY "students_view_class_codes" 
ON app_b3583718a0_attendance_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM app_b3583718a0_students
    WHERE user_id = auth.uid() 
    AND class = app_b3583718a0_attendance_codes.class
  )
  AND expires_at > now()
);

-- Add RLS policy for students to view their own attendance records
CREATE POLICY "students_view_own_attendance" 
ON app_b3583718a0_attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM app_b3583718a0_students
    WHERE user_id = auth.uid() 
    AND id = app_b3583718a0_attendance_records.student_id
  )
);

-- Add RLS policy for teachers to update attendance records
CREATE POLICY "teachers_update_attendance" 
ON app_b3583718a0_attendance_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM app_b3583718a0_students s
    JOIN app_b3583718a0_teachers t ON s.teacher_id = t.id
    WHERE t.user_id = auth.uid() AND s.id = app_b3583718a0_attendance_records.student_id
  )
);

-- Add RLS policy for teachers to delete attendance records
CREATE POLICY "teachers_delete_attendance" 
ON app_b3583718a0_attendance_records
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM app_b3583718a0_students s
    JOIN app_b3583718a0_teachers t ON s.teacher_id = t.id
    WHERE t.user_id = auth.uid() AND s.id = app_b3583718a0_attendance_records.student_id
  )
);