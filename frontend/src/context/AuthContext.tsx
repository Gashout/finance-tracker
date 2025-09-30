/**
 * @file AuthContext.tsx
 * @description Authentication context provider for managing user authentication state
 * 
 * This context provides:
 * - Authentication state (user, isAuthenticated)
 * - Authentication methods (login, logout)
 * - Loading state for async operations
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as loginService, logout as logoutService, getProfile, isAuthenticated } from '../services/authService';

/**
 * User interface representing the authenticated user
 * 
 * This matches the fields returned by Django's UserProfileSerializer:
 * - id: User's unique identifier
 * - username: User's login name
 * - email: User's email address
 * - first_name: User's first name (optional)
 * - last_name: User's last name (optional)
 * - date_joined: When the user account was created
 */
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
}

/**
 * Authentication context interface defining the shape of the context
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Create the authentication context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * This component:
 * 1. Manages authentication state
 * 2. Provides login and logout methods
 * 3. Checks for existing authentication on mount
 * 4. Provides the auth context to its children
 * 
 * @param props - Component props
 * @returns AuthProvider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Check if the user is already authenticated on component mount and fetch complete profile data
   * 
   * @dataflow
   * 1. Check for token in localStorage via isAuthenticated()
   * 2. If token exists, fetch complete user profile from Django (/api/auth/profile/)
   * 3. Update context state with complete user data
   * 4. If profile fetch fails, clear token (likely expired/invalid)
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] Checking authentication state on mount');
        
        if (isAuthenticated()) {
          console.log('[AuthContext] Token found, fetching user profile');
          
          // Fetch complete user profile data
          const profile = await getProfile();
          
          console.log('[AuthContext] Profile data received:', {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            has_first_name: !!profile.first_name,
            has_last_name: !!profile.last_name,
            date_joined: profile.date_joined
          });
          
          // Update context with complete user data
          setUser(profile);
        } else {
          console.log('[AuthContext] No authentication token found');
        }
      } catch (error) {
        console.error('[AuthContext] Error fetching profile, clearing token:', error);
        // If there's an error fetching the profile, clear the token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function that authenticates a user and updates the context with complete profile data
   * 
   * @param username - User's username
   * @param password - User's password
   * 
   * @dataflow
   * 1. Call Django login endpoint (/api/auth/login/) via loginService
   * 2. Store authentication token in localStorage
   * 3. Fetch complete user profile (/api/auth/profile/) via getProfile
   * 4. Update context state with complete user data
   * 
   * This ensures we get the complete user profile including:
   * - id: User's unique identifier
   * - username: User's login name
   * - email: User's email address
   * - first_name: User's first name
   * - last_name: User's last name
   * - date_joined: When the user account was created
   */
  const login = async (username: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('[AuthContext] Login attempt for:', username);
      
      // Step 1: Authenticate user and get token
      const response = await loginService(username, password);
      console.log('[AuthContext] Login successful, token received');
      
      // Step 2: Fetch complete user profile data
      console.log('[AuthContext] Fetching complete user profile');
      const profile = await getProfile();
      console.log('[AuthContext] Profile data received:', {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        has_first_name: !!profile.first_name,
        has_last_name: !!profile.last_name
      });
      
      // Step 3: Update context with complete user data
      setUser(profile);
    } catch (error) {
      console.error('[AuthContext] Login process failed:', error);
      throw error; // Re-throw to allow login form to handle the error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function that clears the authentication state
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * The value object provided to the context consumers
   */
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook for using the authentication context
 * 
 * @returns The authentication context
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```typescript
 * const { user, login, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};