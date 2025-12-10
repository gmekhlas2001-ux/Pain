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

// Helper function to check Supabase connection with better error handling and retry
export const checkSupabaseConnection = async (retries = 3): Promise<{ success: boolean; error?: string }> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const { data, error } = await supabase.auth.getSession();

      clearTimeout(timeoutId);

      if (error) {
        console.error(`Supabase connection error (attempt ${attempt}/${retries}):`, error);

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return {
          success: false,
          error: getConnectionErrorMessage(error)
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error(`Supabase connection error (attempt ${attempt}/${retries}):`, err);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      return {
        success: false,
        error: getConnectionErrorMessage(err)
      };
    }
  }

  return {
    success: false,
    error: getConnectionErrorMessage(new Error('Connection failed after retries'))
  };
};

// Additional helper to test basic network connectivity
export const testNetworkConnectivity = async (retries = 2): Promise<{ success: boolean; error?: string }> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${normalizedUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Network test failed (attempt ${attempt}/${retries}):`, response.status);

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return {
          success: false,
          error: `Server responded with status ${response.status}. Please check your Supabase project status.`
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error(`Network connectivity test failed (attempt ${attempt}/${retries}):`, err);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      return {
        success: false,
        error: getConnectionErrorMessage(err)
      };
    }
  }

  return {
    success: false,
    error: getConnectionErrorMessage(new Error('Network test failed after retries'))
  };
};

let connectionCache: { success: boolean; timestamp: number; error?: string } | null = null;
const CACHE_DURATION = 30000;

export const checkSupabaseConnectionCached = async (): Promise<{ success: boolean; error?: string }> => {
  const now = Date.now();

  if (connectionCache && (now - connectionCache.timestamp) < CACHE_DURATION) {
    return { success: connectionCache.success, error: connectionCache.error };
  }

  const result = await checkSupabaseConnection();

  connectionCache = {
    success: result.success,
    error: result.error,
    timestamp: now
  };

  return result;
};

export const clearConnectionCache = () => {
  connectionCache = null;
};

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  const httpStatus = error?.status || error?.statusCode;

  return (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('aborted') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('upstream connect error') ||
    errorMessage.includes('connection timeout') ||
    errorMessage.includes('reset before headers') ||
    errorCode === 'network_error' ||
    errorCode === 'fetch_error' ||
    error?.name === 'AbortError' ||
    error?.name === 'TypeError' ||
    httpStatus === 503 ||
    httpStatus === 502 ||
    httpStatus === 504
  );
};