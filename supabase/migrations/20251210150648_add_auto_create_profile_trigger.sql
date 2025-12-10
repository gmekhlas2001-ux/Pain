/*
  # Add automatic profile creation on user signup

  1. Changes
    - Creates a trigger function that automatically creates a profile entry when a new user signs up
    - Adds a trigger on auth.users table to call this function
    
  2. Benefits
    - Ensures every user always has a profile
    - Prevents foreign key constraint violations
    - Simplifies client-side code by removing the need to manually create profiles
    
  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profiles with safe default values
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    hide_display_name,
    is_profile_complete,
    character_body_type,
    character_gender,
    character_color
  )
  VALUES (
    NEW.id,
    'user' || substr(NEW.id::text, 1, 8),
    'New User',
    false,
    false,
    'cat',
    'neutral',
    '#5dade2'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
