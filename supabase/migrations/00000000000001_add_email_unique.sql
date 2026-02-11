-- Add UNIQUE constraint to email column
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add DELETE policy for RLS (users can delete their own profile)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);
