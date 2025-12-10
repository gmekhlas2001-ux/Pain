/*
  # Fix Super Admin Infinite Recursion

  ## Problem
  - The "Super admins can update admin status" policy on profiles table checks the profiles table itself
  - This creates infinite recursion when super admins try to update any profile
  
  ## Solution
  - Create a security definer function to check super admin status
  - Update policies to use the function instead of subquery
  - Security definer runs with elevated privileges to break recursion
  
  ## Changes
  1. Create is_super_admin() function
  2. Drop and recreate the problematic policy
  3. Ensure all super admin checks use the function
  
  ## Security
  - Function is marked as SECURITY DEFINER to bypass RLS
  - Function only returns boolean, no data exposure
  - Policies still properly restrict access
*/

-- Create a security definer function to check if user is super admin
-- This breaks the infinite recursion by running with elevated privileges
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user has is_super_admin = true in profiles
  -- Using SECURITY DEFINER allows us to bypass RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Super admins can update admin status" ON profiles;

-- Recreate it using the function to avoid recursion
CREATE POLICY "Super admins can update admin status"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Also update the admin_users policies to check for super admin
DROP POLICY IF EXISTS "Admins can read admin list" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

CREATE POLICY "Admins can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin() OR public.is_super_admin());

CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
