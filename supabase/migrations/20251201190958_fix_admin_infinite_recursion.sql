/*
  # Fix Admin Users Infinite Recursion

  1. Problem
    - Admin_users policies were checking the admin_users table itself
    - This creates infinite recursion when trying to read the table
    
  2. Solution
    - Create a security definer function to check admin status
    - Update policies to use the function instead of subquery
    - Security definer runs with elevated privileges to break recursion
    
  3. Security
    - Function is marked as SECURITY DEFINER to bypass RLS
    - Function only returns boolean, no data exposure
    - Policies still properly restrict access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can read admin list" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Create a security definer function to check if user is admin
-- This breaks the infinite recursion by running with elevated privileges
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user's email exists in admin_users table
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_admin() TO authenticated;

-- Create new policies using the function
CREATE POLICY "Admins can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin());

CREATE POLICY "Admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (public.is_user_admin())
  WITH CHECK (public.is_user_admin());

-- Update background_music policies to use the function too
DROP POLICY IF EXISTS "Admins can manage background music" ON background_music;

CREATE POLICY "Admins can manage background music"
  ON background_music
  FOR ALL
  TO authenticated
  USING (public.is_user_admin())
  WITH CHECK (public.is_user_admin());

-- Update stars policies to use the function
DROP POLICY IF EXISTS "Admins can manage all stars" ON stars;

CREATE POLICY "Admins can manage all stars"
  ON stars
  FOR ALL
  TO authenticated
  USING (public.is_user_admin())
  WITH CHECK (public.is_user_admin());
