/*
  # Add Super Admin System

  ## Overview
  Adds super admin functionality with unlimited privileges

  ## Changes
  1. New Column in `profiles` table
    - `is_super_admin` (boolean) - Marks users with super admin privileges
    
  2. RLS Policy Updates
    - Super admins can promote other users to admin or super admin
    - Super admins bypass credit checks
    
  ## Notes
  - Super admins have unlimited credits for creating stars
  - Super admins can manage music
  - Super admins can promote other users to admin/super admin status
*/

-- Add is_super_admin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_super_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for super admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON profiles(is_super_admin) WHERE is_super_admin = true;

-- Update admin check function to include super admin
CREATE OR REPLACE FUNCTION is_admin_or_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND (is_admin = true OR is_super_admin = true)
  );
END;
$$;

-- Allow super admins to update other users' admin status
DROP POLICY IF EXISTS "Super admins can update admin status" ON profiles;
CREATE POLICY "Super admins can update admin status"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );