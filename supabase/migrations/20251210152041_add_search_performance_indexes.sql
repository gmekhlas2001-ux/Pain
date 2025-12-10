/*
  # Add Performance Indexes for Search and Queries

  1. Indexes for Search Performance
    - Add indexes on username, display_name, first_name, last_name for user search
    - Add indexes on star_name and message for star search
    - Add composite indexes for common query patterns
  
  2. Indexes for Star Fetching
    - Add composite index on (sky_type, profile_id, created_at) for efficient filtering
    - Add index on profile_id for join performance
  
  3. Benefits
    - Dramatically improves ILIKE search queries
    - Speeds up star fetching with filters
    - Optimizes join operations between stars and profiles
*/

-- Ensure pg_trgm extension is enabled for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for profiles table (user search)
CREATE INDEX IF NOT EXISTS idx_profiles_username_search ON profiles USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_search ON profiles USING gin(display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_first_name_search ON profiles USING gin(first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name_search ON profiles USING gin(last_name gin_trgm_ops);

-- Indexes for stars table (star search)
CREATE INDEX IF NOT EXISTS idx_stars_star_name_search ON stars USING gin(star_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stars_message_search ON stars USING gin(message gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_stars_sky_profile_created ON stars (sky_type, profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stars_profile_id ON stars (profile_id);
