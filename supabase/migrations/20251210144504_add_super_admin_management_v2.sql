/*
  # Add Super Admin Management Functions

  ## Overview
  Adds functions for managing admin and super admin status

  ## Changes
  1. Update get_admin_users function to include admin status
  2. Add function to promote user to admin
  3. Add function to promote user to super admin
  4. Add function to remove admin status
  
  ## Security
  - Only super admins can promote/demote users
  - Regular admins can only view, not modify
*/

-- Drop and recreate get_admin_users to include admin status
DROP FUNCTION IF EXISTS get_admin_users();

CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  username text,
  display_name text,
  created_at timestamptz,
  is_profile_complete boolean,
  is_admin boolean,
  is_super_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    p.first_name,
    p.last_name,
    p.username,
    p.display_name,
    au.created_at,
    COALESCE(p.is_profile_complete, false),
    COALESCE(p.is_admin, false),
    COALESCE(p.is_super_admin, false)
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to toggle admin status (only super admins can call)
CREATE OR REPLACE FUNCTION toggle_admin_status(target_user_id uuid, make_admin boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_super_admin boolean;
BEGIN
  SELECT is_super_admin INTO caller_is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT caller_is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can modify admin status';
  END IF;

  UPDATE profiles
  SET is_admin = make_admin,
      updated_at = now()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$;

-- Function to toggle super admin status (only super admins can call)
CREATE OR REPLACE FUNCTION toggle_super_admin_status(target_user_id uuid, make_super_admin boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_super_admin boolean;
BEGIN
  SELECT is_super_admin INTO caller_is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT caller_is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can modify super admin status';
  END IF;

  UPDATE profiles
  SET is_super_admin = make_super_admin,
      is_admin = CASE WHEN make_super_admin THEN true ELSE is_admin END,
      updated_at = now()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$;