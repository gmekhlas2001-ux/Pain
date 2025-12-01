/*
  # Add Payment System for Stars and Music

  ## Overview
  This migration adds support for a payment system where users can purchase:
  - Star creation credits (3 stars for €5)
  - Sky music (€5 per track)

  ## New Tables
  
  ### `user_credits`
  Tracks each user's available star creation credits
  - `user_id` (uuid, references auth.users) - The user who owns the credits
  - `star_credits` (integer) - Number of stars the user can create (default: 0)
  - `created_at` (timestamptz) - When the record was created
  - `updated_at` (timestamptz) - When the record was last updated

  ### `purchases`
  Records all purchases made by users
  - `id` (uuid, primary key) - Unique purchase ID
  - `user_id` (uuid, references auth.users) - User who made the purchase
  - `purchase_type` (text) - Type: 'star_credits' or 'music'
  - `amount` (numeric) - Amount paid in euros
  - `quantity` (integer) - Number of items purchased
  - `paypal_order_id` (text) - PayPal order ID
  - `paypal_transaction_id` (text) - PayPal transaction ID
  - `status` (text) - Payment status: 'pending', 'completed', 'failed', 'refunded'
  - `created_at` (timestamptz) - When the purchase was made
  - `completed_at` (timestamptz) - When the payment was completed

  ### `sky_music`
  Stores music tracks uploaded for user skies
  - `id` (uuid, primary key) - Unique music ID
  - `user_id` (uuid, references auth.users) - User who owns the music
  - `title` (text) - Music title
  - `file_url` (text) - URL to the music file in storage
  - `duration` (integer) - Duration in seconds
  - `file_size` (bigint) - File size in bytes
  - `is_active` (boolean) - Whether this music is currently active on the sky
  - `created_at` (timestamptz) - When uploaded
  - `updated_at` (timestamptz) - When last updated

  ## Security
  - RLS enabled on all tables
  - Users can only access their own credits and purchases
  - Music can only be uploaded by authenticated users
  - Public can view active music metadata

  ## Indexes
  - Index on user_id for all tables for faster lookups
  - Index on purchase status for admin queries
*/

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  star_credits integer DEFAULT 0 NOT NULL CHECK (star_credits >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_type text NOT NULL CHECK (purchase_type IN ('star_credits', 'music')),
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  paypal_order_id text,
  paypal_transaction_id text,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

-- Create sky_music table
CREATE TABLE IF NOT EXISTS sky_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  file_url text NOT NULL,
  duration integer,
  file_size bigint,
  is_active boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_sky_music_user_id ON sky_music(user_id);
CREATE INDEX IF NOT EXISTS idx_sky_music_active ON sky_music(user_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sky_music ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON user_credits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sky_music
CREATE POLICY "Users can view own music"
  ON sky_music FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active music"
  ON sky_music FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Users can insert own music"
  ON sky_music FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own music"
  ON sky_music FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own music"
  ON sky_music FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sky_music_updated_at
  BEFORE UPDATE ON sky_music
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();