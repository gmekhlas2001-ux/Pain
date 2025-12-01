/*
  # Add Character Customization

  ## Overview
  Adds character customization fields to the profiles table so users can personalize their avatar.

  ## Changes
  1. New Columns in `profiles` table
    - `character_body_type` (text) - Body type: 'cat', 'human', 'bear', 'fox'
    - `character_gender` (text) - Gender presentation: 'masculine', 'feminine', 'neutral'
    - `character_color` (text) - Primary color as hex code (e.g., '#5dade2')
    - `updated_at` trigger to auto-update timestamp

  ## Notes
  - Default values provide a starting character
  - Users can change these in settings
  - Character renders based on these preferences
*/

-- Add character customization columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'character_body_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN character_body_type text DEFAULT 'cat' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'character_gender'
  ) THEN
    ALTER TABLE profiles ADD COLUMN character_gender text DEFAULT 'neutral' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'character_color'
  ) THEN
    ALTER TABLE profiles ADD COLUMN character_color text DEFAULT '#5dade2' NOT NULL;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_character_body_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_character_body_type_check 
    CHECK (character_body_type IN ('cat', 'human', 'bear', 'fox'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_character_gender_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_character_gender_check 
    CHECK (character_gender IN ('masculine', 'feminine', 'neutral'));
  END IF;
END $$;