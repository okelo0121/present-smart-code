-- Create teacher profile for existing user
INSERT INTO public.app_b3583718a0_teachers (user_id, email, name, department)
VALUES (
  'd380d461-0c76-4341-b291-e11e4d735360',
  'okelloulak2004@gmail.com',
  'Teacher',
  'Computer Science'
)
ON CONFLICT (user_id) DO NOTHING;