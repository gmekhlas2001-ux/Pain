/*
  # Set Super Admin for 1st.mekhlas@gmail.com

  ## Overview
  Adds is_admin column and sets 1st.mekhlas@gmail.com as super admin

  ## Changes
  1. Add is_admin column to profiles if not exists
  2. Set 1st.mekhlas@gmail.com as super admin with unlimited privileges
  
  ## Notes
  - This is a one-time data setup for the super admin user
  - User: 1st.mekhlas@gmail.com (pain01)
*/

-- Add is_admin column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;

-- Set 1st.mekhlas@gmail.com as super admin
UPDATE profiles
SET 
  is_super_admin = true,
  is_admin = true,
  updated_at = now()
WHERE id = (
  SELECT id FROM auth.users WHERE email = '1st.mekhlas@gmail.com'
);
