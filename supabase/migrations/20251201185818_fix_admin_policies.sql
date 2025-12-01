/*
  # Fix Admin Policies and Security

  1. Changes
    - Remove hardcoded admin email from background_music policies
    - Update policy to use admin_users table lookup instead
    - Restrict admin_users table access to authenticated admins only
    - Remove unused 'user' table
    - Remove unused 'diary_entries' table and related function

  2. Security
    - Improves security by using proper admin lookups
    - Restricts public access to admin_users table
    - Cleans up unused tables that could pose security risks
*/

-- Drop old background_music policies
DROP POLICY IF EXISTS "Admin can manage background music" ON background_music;
DROP POLICY IF EXISTS "Anyone can read background music" ON background_music;

-- Create new background_music policies that check admin_users table
CREATE POLICY "Admins can manage background music"
  ON background_music
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Anyone can read background music"
  ON background_music
  FOR SELECT
  TO public
  USING (true);

-- Drop old admin_users policy that allows public access
DROP POLICY IF EXISTS "Anyone can check admin status" ON admin_users;

-- Create restrictive admin_users policies
CREATE POLICY "Admins can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (auth.jwt() ->> 'email')
    )
  );

-- Drop unused user table if it exists
DROP TABLE IF EXISTS "user" CASCADE;

-- Drop unused diary_entries table if it exists
DROP TABLE IF EXISTS diary_entries CASCADE;
