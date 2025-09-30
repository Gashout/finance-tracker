/**
 * @file PasswordResetConfirm.tsx
 * @description Password reset confirmation form component
 * 
 * This component provides a form for users to set a new password after clicking
 * on a password reset link from their email. It handles form validation,
 * submission, and displays appropriate feedback messages.
 * 
 * @security_considerations
 * - Validates token and user ID from URL parameters
 * - Enforces password strength requirements
 * - Requires password confirmation to prevent typos
 * - Communicates securely with the backend API
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../components/ui';
import api, { fetchCsrfTokenAndReturn, getCsrfTokenFromHeaders } from '../services/api';

/**
 * @component PasswordResetConfirm
 * @description Form component for setting a new password after reset
 * 
 * This component renders a form with password and confirm password fields.
 * It extracts the token and UID from URL parameters and sends them to the backend
 * along with the new password to complete the reset process.
 * 
 * @returns {React.ReactNode} The password reset confirmation form component
 */
const PasswordResetConfirm: React.FC = () => {
  // Extract token and uid from URL parameters
  const { token, uid } = useParams<{ token: string; uid: string }>();
  
  // State for form values and UI feedback
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState<boolean>(true);
  
  const navigate = useNavigate();

  /**
   * @function validateToken
   * @description Validates the reset token and UID with the backend
   * 
   * This function checks if the token and UID from the URL are valid
   * by making a request to the backend API.
   * 
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets tokenValid state based on API response
   * - Shows an error message if validation fails
   * - Handles network errors gracefully
   */
  const validateToken = async () => {
    if (!token || !uid) {
      setTokenValid(false);
      setError('Invalid password reset link. Please request a new one.');
      setValidating(false);
      return;
    }

    try {
      // Check if the token is valid by making a GET request to the backend
      await api.get(`/auth/password-reset-confirm/${uid}/${token}/`);
      setTokenValid(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      setTokenValid(false);
      setError('This password reset link is invalid or has expired. Please request a new one.');
    } finally {
      setValidating(false);
    }
  };

  // Validate token when component mounts
  useEffect(() => {
    validateToken();
  }, [token, uid]);

  /**
   * @function validatePassword
   * @description Validates the password strength
   * 
   * @param {string} password - The password to validate
   * @returns {boolean} True if the password is valid, false otherwise
   * 
   * @validation_rules
   * - Must be at least 8 characters long
   * - Must contain at least one uppercase letter
   * - Must contain at least one lowercase letter
   * - Must contain at least one number
   */
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  /**
   * @function handleSubmit
   * @description Handles form submission for password reset confirmation with CSRF protection
   * 
   * This function implements a secure password reset confirmation flow:
   * 1. Prevents default form submission behavior
   * 2. Validates password strength and confirmation client-side
   * 3. Fetches CSRF token from Django backend for security
   * 4. Sends password reset confirmation with proper CSRF headers
   * 5. Shows appropriate success or error messages
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   * 
   * @csrf_flow
   * 1. Call fetchCsrfToken() to get CSRF token from Django
   * 2. Django's @ensure_csrf_cookie decorator sets csrftoken cookie
   * 3. Token is automatically added to Axios default headers
   * 4. Subsequent POST request includes X-CSRFToken header
   * 5. Django validates token against cookie for CSRF protection
   * 
   * @error_handling
   * - Validates password strength and confirmation before API calls
   * - Handles CSRF token fetch failures gracefully
   * - Catches and displays specific Django validation errors
   * - Shows generic error message for unexpected errors
   * - Logs detailed error information for debugging
   * 
   * @security_considerations
   * - CSRF token prevents cross-site request forgery attacks
   * - Password validation prevents weak passwords
   * - Confirmation matching prevents typos in new passwords
   * - Token validation ensures only valid reset links work
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Client-side validation before any API calls
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, and numbers.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[PasswordResetConfirm] Starting password reset confirmation');
      
      // Step 1: Fetch CSRF token and prepare explicit headers
      // This approach ensures the token is definitely included in the request
      console.log('[PasswordResetConfirm] Fetching CSRF token with explicit header preparation...');
      const { token: csrfToken, headers } = await fetchCsrfTokenAndReturn();
      console.log('[PasswordResetConfirm] CSRF token obtained:', csrfToken ? 'Yes' : 'No');
      console.log('[PasswordResetConfirm] Headers prepared:', headers);

      // Step 2: Verify token is also set in default headers (dual approach)
      const defaultHeaderToken = getCsrfTokenFromHeaders();
      console.log('[PasswordResetConfirm] Token in default headers:', defaultHeaderToken ? 'Yes' : 'No');

      // Step 3: Send password reset confirmation with explicit CSRF headers
      // Using both automatic (default headers) and explicit (request headers) approaches
      console.log('[PasswordResetConfirm] Sending password reset confirmation with explicit headers...');
      await api.post(`auth/password-reset-confirm/${uid}/${token}/`, {
        new_password1: password,
        new_password2: confirmPassword,
      }, {
        headers: {
          ...headers, // Explicit CSRF token and Content-Type
          // The Authorization header will be added by the request interceptor if needed
        },
        withCredentials: true // Ensure cookies are sent for additional CSRF validation
      });
      console.log('[PasswordResetConfirm] Password reset completed successfully');
      
      setSuccess(true);
    } catch (error: any) {
      console.error('[PasswordResetConfirm] Password reset confirmation failed:', error);
      
      // Handle different types of errors with appropriate user messages
      if (error.response) {
        // HTTP error response from server
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('[PasswordResetConfirm] Server error response:', {
          status,
          statusText: error.response.statusText,
          data
        });
        
        if (status === 403) {
          setError('CSRF verification failed. Please refresh the page and try again.');
        } else if (status === 400) {
          // Handle Django form validation errors
          if (data?.new_password1) {
            setError(`Password error: ${Array.isArray(data.new_password1) ? data.new_password1[0] : data.new_password1}`);
          } else if (data?.new_password2) {
            setError(`Confirmation error: ${Array.isArray(data.new_password2) ? data.new_password2[0] : data.new_password2}`);
          } else if (data?.token) {
            setError('Invalid or expired reset link. Please request a new password reset.');
          } else if (data?.uid) {
            setError('Invalid reset link. Please request a new password reset.');
          } else if (data?.detail) {
            setError(data.detail);
          } else {
            setError('Invalid password. Please check the requirements and try again.');
          }
        } else if (status === 404) {
          setError('Invalid or expired reset link. Please request a new password reset.');
        } else if (data?.detail) {
          setError(data.detail);
        } else {
          setError('Server error. Please try again later.');
        }
      } else if (error.request) {
        // Network error (no response received)
        console.error('[PasswordResetConfirm] Network error:', error.message);
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error (e.g., CSRF token fetch failed, header attachment issues)
        console.error('[PasswordResetConfirm] Unexpected error:', error.message);
        
        // Check if this might be a CSRF token issue
        if (error.message && error.message.includes('CSRF')) {
          setError('CSRF token error. Please refresh the page and try again.');
        } else if (error.message && error.message.includes('token')) {
          setError('Authentication token error. Please refresh the page and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        
        // Log additional debugging information for CSRF issues
        console.error('[PasswordResetConfirm] CSRF debugging info:', {
          hasDefaultToken: !!getCsrfTokenFromHeaders(),
          errorMessage: error.message,
          errorType: error.constructor.name,
          uid: uid,
          resetToken: token
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @function handleBackToLogin
   * @description Navigates back to the login page
   */
  const handleBackToLogin = () => {
    navigate('/login');
  };

  /**
   * @function handleRequestNewLink
   * @description Navigates to the password reset request page
   */
  const handleRequestNewLink = () => {
    navigate('/password-reset');
  };

  // Show loading state while validating token
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Reset Link</CardTitle>
            <CardDescription>
              Please wait while we verify your password reset link...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If token is invalid, show error message
  if (tokenValid === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || 'Please request a new password reset link.'}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={handleRequestNewLink} className="w-full">
              Request New Reset Link
            </Button>
            <Button onClick={handleBackToLogin} variant="outline" className="w-full">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If the password was reset successfully, show success message
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can now log in with your new password.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToLogin} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render the password reset form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Create a new password for your account.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleBackToLogin}
              disabled={isSubmitting}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordResetConfirm;
