// TypeScript type definitions for user profiles and admin views
// Defines the structure of user profile data and admin user information

// Interface defining the structure of a user profile
export interface Profile {
  id: string; // Unique identifier for the profile (matches user ID)
  username: string; // Unique username chosen by the user
  display_name: string; // Display name shown to other users
  first_name: string; // User's first name
  last_name: string; // User's last name
  hide_display_name: boolean; // Whether to hide display name from other users
  is_profile_complete: boolean; // Whether the user has completed their profile setup
  created_at: string; // Timestamp when the profile was created
  updated_at: string; // Timestamp when the profile was last updated
}

// Interface defining the structure of admin user view data
// Used for displaying user information in the admin panel
export interface AdminUserView {
  user_id: string; // Unique identifier for the user
  email: string; // User's email address
  first_name: string | null; // User's first name (nullable)
  last_name: string | null; // User's last name (nullable)
  username: string | null; // User's username (nullable if profile incomplete)
  display_name: string | null; // User's display name (nullable if profile incomplete)
  created_at: string; // Timestamp when the user account was created
  is_profile_complete: boolean; // Whether the user has completed their profile
  is_admin: boolean; // Whether the user is an admin
  is_super_admin: boolean; // Whether the user is a super admin
}