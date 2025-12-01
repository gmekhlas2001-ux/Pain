// Supabase client configuration and connection utilities
// Handles database connection, error handling, and connection testing
import { createClient } from '@supabase/supabase-js';
// Import the Supabase client creation function

// Get Supabase URL from environment variables and trim whitespace
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
// Get Supabase anonymous key from environment variables and trim whitespace
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();


// Check if required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  // Log error for debugging
  console.error('Missing Supabase credentials:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  
  // Don't throw error immediately, let the app handle it gracefully
  console.warn('Supabase credentials missing - app will show connection error');
}

// Ensure URL doesn't end with a trailing slash for consistency
const normalizedUrl = supabaseUrl?.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

// Create and export the Supabase client with configuration (only if credentials exist)
export const supabase = normalizedUrl && supabaseAnonKey ? createClient(normalizedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keep user session across browser refreshes
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true // Detect auth tokens in URL (for email confirmations)
  },
  global: {
    headers: {
      'x-application-name': 'star-letter' // Custom header to identify our app
    }
  },
  db: {
    schema: 'public' // Use the public schema
  }
}) : null as any; // Fallback to null if no credentials

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(normalizedUrl && supabaseAnonKey && supabase);
};

// Helper function to get configuration status
export const getSupabaseStatus = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not configured'
  };
};

// Helper function to determine if error is CORS-related
const isCorsError = (error: any): boolean => {
  // Get error message in lowercase for case-insensitive checking
  const errorMessage = error?.message?.toLowerCase() || '';
  // Get error string representation in lowercase
  const errorString = error?.toString?.()?.toLowerCase() || '';
  
  // Check for common CORS-related error indicators
  return (
    errorMessage.includes('cors') ||
    errorMessage.includes('cross-origin') ||
    errorMessage.includes('failed to fetch') ||
    errorString.includes('cors') ||
    errorString.includes('cross-origin') ||
    errorString.includes('failed to fetch') ||
    // Check for TypeError with fetch-related message (common CORS symptom)
    error?.name === 'TypeError' && errorMessage.includes('fetch')
  );
};

// Helper function to get user-friendly error message
const getConnectionErrorMessage = (error: any): string => {
  // Check if error is CORS-related
  if (isCorsError(error)) {
    // Return detailed CORS setup instructions
    return `CORS Configuration Required

Your Supabase project needs to allow requests from this local development server.

To fix this:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings (gear icon)
4. Click on "API" in the settings menu
5. In the "CORS (Origins)" section, add: http://localhost:5173
6. Save the changes and refresh this page

This is a one-time setup required for local development.`;
  }

  // Check if error is timeout-related
  if (error?.message?.includes('timeout') || error?.name === 'AbortError') {
    // Return timeout-specific error message
    return `Connection Timeout

Unable to reach your Supabase project. This could be due to:
• Network connectivity issues
• Supabase project being paused or unavailable
• Firewall or proxy blocking the connection

Please check your internet connection and Supabase project status.`;
  }

  // Return generic error message for other types of errors
  return `Database Connection Error

Unable to connect to your Supabase project. Please check:
• Your internet connection
• Supabase project status at https://supabase.com/dashboard
• Project credentials in your environment variables

Error details: ${error?.message || 'Unknown error'}`;
};

// Helper function to check Supabase connection with better error handling
export const checkSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, try a simple health check with a timeout
    const controller = new AbortController(); // Create abort controller for timeout
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Try to check if we can connect to Supabase at all
    const { data, error } = await supabase.auth.getSession();

    clearTimeout(timeoutId); // Clear the timeout since request completed

    if (error) {
      // Log error for debugging
      console.error('Supabase connection error:', error);
      // Return failure with user-friendly error message
      return {
        success: false,
        error: getConnectionErrorMessage(error)
      };
    }

    // If we can get session info, connection is working
    return { success: true };
  } catch (err: any) {
    // Log error for debugging
    console.error('Supabase connection error:', err);
    // Return failure with user-friendly error message
    return {
      success: false,
      error: getConnectionErrorMessage(err)
    };
  }
};

// Additional helper to test basic network connectivity
export const testNetworkConnectivity = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try to make a HEAD request to Supabase REST API endpoint
    const response = await fetch(`${normalizedUrl}/rest/v1/`, {
      method: 'HEAD', // HEAD request to minimize data transfer
      headers: {
        'apikey': supabaseAnonKey, // Include API key in headers
        'Authorization': `Bearer ${supabaseAnonKey}` // Include authorization header
      },
      signal: controller.signal // Include abort signal for timeout
    });

    clearTimeout(timeoutId); // Clear timeout since request completed
    
    // Check if response is not OK
    if (!response.ok) {
      // Return failure with status code information
      return {
        success: false,
        error: `Server responded with status ${response.status}. Please check your Supabase project status.`
      };
    }
    
    // Return success if everything is OK
    return { success: true };
  } catch (err: any) {
    // Log error for debugging
    console.error('Network connectivity test failed:', err);
    // Return failure with user-friendly error message
    return {
      success: false,
      error: getConnectionErrorMessage(err)
    };
  }
};