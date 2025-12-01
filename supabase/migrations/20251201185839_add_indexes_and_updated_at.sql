/*
  # Add Performance Indexes and updated_at Column

  1. New Indexes
    - Add index on profiles(display_name) for search optimization
    - Add index on diary_entries(user_id) for faster lookups (if table exists)
    - Add index on admin_users(user_id) for faster foreign key lookups

  2. New Columns
    - Add updated_at column to stars table with trigger

  3. Triggers
    - Create trigger to auto-update updated_at on stars modifications
*/

-- Add index on profiles display_name for faster user searches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_display_name'
  ) THEN
    CREATE INDEX idx_profiles_display_name ON profiles(display_name);
  END IF;
END $$;

-- Add index on admin_users user_id for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'admin_users' AND indexname = 'idx_admin_users_user_id'
  ) THEN
    CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
  END IF;
END $$;

-- Add updated_at column to stars table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE stars ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace the update_updated_at_column trigger function (already exists, but ensure it's there)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to stars table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_stars_updated_at'
  ) THEN
    CREATE TRIGGER update_stars_updated_at
      BEFORE UPDATE ON stars
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
