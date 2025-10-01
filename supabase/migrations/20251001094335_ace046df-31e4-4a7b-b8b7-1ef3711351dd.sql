-- Make user_id nullable in students table so we can invite students before they sign up
ALTER TABLE public.app_b3583718a0_students 
ALTER COLUMN user_id DROP NOT NULL;

-- Also, first delete any test records that were created with invalid user_ids
DELETE FROM public.app_b3583718a0_students 
WHERE email = 'josephineulak@gmail.com';