// utils/auth-util.ts
import { supabase } from '../lib/supabase';

/**
 * Utility functions for authentication
 */
export const AuthUtil = {
  /**
   * Get the current auth token
   */
  getAuthToken: async (): Promise<string | null> => {
    try {
      // Try to get from session first (most reliable)
      const { data } = await supabase.auth.getSession();
      const sessionToken = data.session?.access_token;
      
      if (sessionToken) {
        return sessionToken;
      }
      
      // Fallback to localStorage
      const supabaseAuth = localStorage.getItem('supabase.auth.token');
      if (supabaseAuth) {
        const parsedAuth = JSON.parse(supabaseAuth);
        return parsedAuth?.currentSession?.access_token || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },
  
  /**
   * Get auth headers for API requests
   */
  getAuthHeaders: async (): Promise<Record<string, string>> => {
    const token = await AuthUtil.getAuthToken();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    
    return {};
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
};

export default AuthUtil;