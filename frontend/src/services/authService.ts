/**
 * @file authService.ts
 * @description Authentication service for handling user authentication operations
 *
 * This service provides functions for user authentication operations like:
 * - Login
 * - Registration
 * - Logout
 * - Password change
 * - Profile management
 *
 * Each function communicates with the Django backend via the shared Axios instance.
 */

import api from './api'

/**
 * Interface for login response from Django backend
 */
interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    email: string
  }
}

// RegistrationData interface moved inline where it's used

/**
 * Interface for user profile structure returned by the backend
 * 
 * This matches the fields returned by Django's UserProfileSerializer:
 * - id: User's unique identifier
 * - username: User's login name
 * - email: User's email address
 * - first_name: User's first name (optional)
 * - last_name: User's last name (optional)
 * - date_joined: When the user account was created
 */
interface UserProfile {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  date_joined?: string
}

/**
 * Login a user with username and password.
 * Sends POST request to Django's `/api/auth/login/` endpoint.
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('[authService] Attempting login for:', username)
    const response = await api.post<LoginResponse>('auth/login/', { username, password })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      console.log('[authService] Token stored, user authenticated')
    }

    return response.data
  } catch (error) {
    console.error('[authService] Login failed:', error)
    throw error
  }
}

/**
 * Register a new user via Django's `/api/auth/register/` endpoint.
 * 
 * The Django backend expects both 'password' and 'password_confirm' fields
 * to match the UserRegistrationSerializer requirements.
 */
export const register = async (username: string, email: string, password: string): Promise<any> => {
  // Define registration data structure inline
  interface RegistrationData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
  }
  
  // Include password_confirm field to match Django's serializer expectations
  const data: RegistrationData = { 
    username, 
    email, 
    password,
    password_confirm: password // Adding the confirmation field
  }
  
  try {
    // Log the request data for debugging
    console.log('Sending registration data:', { ...data, password: '[REDACTED]' })
    
    const response = await api.post('auth/register/', data)
    console.log('Registration successful:', response.data)
    return response.data
  } catch (error: any) {
    // Enhanced error logging to see what's coming back from the server
    console.error('Registration failed:', error)
    if (error.response) {
      console.error('Server response:', error.response.data)
    }
    throw error
  }
}

/**
 * Logout the current user by calling `/api/auth/logout/`.
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('auth/logout/')
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  } finally {
    // Always clear the token, even if the API call fails
    localStorage.removeItem('token')
  }
}

/**
 * @function getProfile
 * @description Fetch the complete user profile data from Django backend
 * 
 * This function retrieves the authenticated user's complete profile information
 * from the Django backend's `/api/auth/profile/` endpoint.
 * 
 * @returns {Promise<UserProfile>} Promise resolving to the user profile object
 * 
 * @dataflow
 * 1. Request sent to Django's UserProfileView.get endpoint
 * 2. Django serializes the User model using UserProfileSerializer
 * 3. Response includes all fields from UserProfileSerializer:
 *    - id: User's unique identifier
 *    - username: User's login name
 *    - email: User's email address
 *    - first_name: User's first name
 *    - last_name: User's last name
 *    - date_joined: When the user account was created
 * 
 * @error_handling
 * - Logs detailed error information
 * - Re-throws error for the caller to handle
 */
export const getProfile = async (): Promise<UserProfile> => {
  try {
    console.log('[authService] Fetching user profile data');
    
    // The Django endpoint returns data in { status, user } format
    const response = await api.get<{ status: string, user: UserProfile }>('auth/profile/');
    
    // Extract the user object from the response
    const userData = response.data.user;
    
    console.log('[authService] Profile data received:', {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      has_first_name: !!userData.first_name,
      has_last_name: !!userData.last_name,
      date_joined: userData.date_joined
    });
    
    return userData;
  } catch (error: any) {
    console.error('[authService] Fetching profile failed:', error);
    
    // Log more detailed error information if available
    if (error.response?.data) {
      console.error('[authService] Server response:', error.response.data);
    }
    
    throw error;
  }
}

/**
 * @function updateProfile
 * @description Update user profile information via PUT `/api/auth/profile/`.
 * 
 * This function sends a request to update the user's profile information
 * including first name, last name, and email address.
 * 
 * @param {Partial<UserProfile>} profileData - The profile data to update
 * @returns {Promise<UserProfile>} The updated user profile
 * 
 * @security_considerations
 * - Only allows updating of non-sensitive fields (first_name, last_name, email)
 * - Username changes are not supported for security reasons
 * - Password changes require a separate endpoint with current password verification
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    console.log('[authService] Updating profile:', { 
      ...profileData,
      // Redact sensitive information in logs
      email: profileData.email ? '[EMAIL PROVIDED]' : undefined 
    });
    
    const response = await api.put<{ status: string; user: UserProfile; message: string }>('auth/profile/', profileData);
    
    console.log('[authService] Profile updated successfully');
    return response.data.user;
  } catch (error: any) {
    console.error('[authService] Updating profile failed:', error);
    
    // Log more detailed error information if available
    if (error.response?.data) {
      console.error('[authService] Server response:', error.response.data);
    }
    
    throw error;
  }
}

/**
 * @function changePassword
 * @description Change the user's password through `/api/auth/change-password/`.
 * 
 * This function sends a request to change the user's password, requiring
 * both the current password (for verification) and the new password.
 * 
 * @param {string} oldPassword - The user's current password
 * @param {string} newPassword - The new password to set
 * @param {string} newPasswordConfirm - Confirmation of the new password
 * @returns {Promise<{ token: string }>} Object containing the new authentication token
 * 
 * @security_considerations
 * - Requires current password verification to prevent unauthorized changes
 * - Returns a new authentication token since the password change invalidates the old one
 * - Never logs passwords, even in error cases
 * 
 * @error_handling
 * - Logs errors to console for debugging (without sensitive data)
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const changePassword = async (
  oldPassword: string, 
  newPassword: string,
  newPasswordConfirm: string = newPassword // Default to newPassword if not provided
): Promise<{ token: string }> => {
  try {
    console.log('[authService] Attempting to change password');
    
    const response = await api.post<{ status: string; message: string; token: string }>('auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    
    // Store the new token since the old one is invalidated
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('[authService] New token stored after password change');
    }
    
    console.log('[authService] Password changed successfully');
    return { token: response.data.token };
  } catch (error: any) {
    console.error('[authService] Password change failed');
    
    // Log error details without sensitive information
    if (error.response?.data) {
      const { old_password, new_password, ...safeErrorData } = error.response.data;
      console.error('[authService] Server response:', {
        ...safeErrorData,
        old_password: old_password ? '[ERROR WITH OLD PASSWORD]' : undefined,
        new_password: new_password ? '[ERROR WITH NEW PASSWORD]' : undefined,
      });
    }
    
    throw error;
  }
}

/**
 * Helper to check if a token exists in localStorage (basic authentication check).
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}