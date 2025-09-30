/**
 * @file PasswordResetRequest.tsx
 * @description Password reset request form component
 * 
 * This component provides a form for users to request a password reset by entering their email.
 * It handles form validation, submission, and displays appropriate feedback messages.
 * 
 * @security_considerations
 * - Does not reveal whether an email exists in the system to prevent user enumeration
 * - Always shows a success message regardless of whether the email exists
 * - Rate limiting should be implemented on the backend to prevent abuse
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 * @component PasswordResetRequest
 * @description Form component for requesting a password reset
 * 
 * This component renders a form with an email input field and a submit button.
 * On submission, it sends a request to the backend to initiate the password reset process.
 * 
 * @returns {React.ReactNode} The password reset request form component
 */
const PasswordResetRequest: React.FC = () => {
  // State for form values and UI feedback
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  /**
   * @function validateEmail
   * @description Validates the email format
   * 
   * @param {string} email - The email to validate
   * @returns {boolean} True if the email is valid, false otherwise
   * 
   * @validation_rule
   * - Must be a non-empty string
   * - Must match a basic email format (contains @ and a domain)
   */
  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * @function handleSubmit
   * @description Handles form submission for password reset request with CSRF protection
   * 
   * This function implements a comprehensive password reset request flow:
   * 1. Prevents default form submission behavior
   * 2. Validates the email format client-side
   * 3. Fetches CSRF token from Django backend
   * 4. Sends password reset request with proper CSRF headers
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
   * - Validates email format before any API calls
   * - Handles CSRF token fetch failures gracefully
   * - Catches and displays specific API error messages
   * - Shows generic error message for unexpected errors
   * - Logs detailed error information for debugging
   * 
   * @security_considerations
   * - CSRF token prevents cross-site request forgery attacks
   * - Always shows success message regardless of email existence (prevents enumeration)
   * - Email validation prevents obviously invalid requests
   * - withCredentials ensures proper cookie handling for CSRF
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Client-side email validation before any API calls
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[PasswordResetRequest] Starting password reset request for email');
      
      // Step 1: Fetch CSRF token and prepare explicit headers
      // This approach ensures the token is definitely included in the request
      console.log('[PasswordResetRequest] Fetching CSRF token with explicit header preparation...');
      const { token, headers } = await fetchCsrfTokenAndReturn();
      console.log('[PasswordResetRequest] CSRF token obtained:', token ? 'Yes' : 'No');
      console.log('[PasswordResetRequest] Headers prepared:', headers);

      // Step 2: Verify token is also set in default headers (dual approach)
      const defaultHeaderToken = getCsrfTokenFromHeaders();
      console.log('[PasswordResetRequest] Token in default headers:', defaultHeaderToken ? 'Yes' : 'No');

      // Step 3: Send password reset request with explicit CSRF headers
      // Using both automatic (default headers) and explicit (request headers) approaches
      console.log('[PasswordResetRequest] Sending password reset request with explicit headers...');
      await api.post('auth/password-reset/', { email }, {
        headers: {
          ...headers, // Explicit CSRF token and Content-Type
          // The Authorization header will be added by the request interceptor if needed
        },
        withCredentials: true // Ensure cookies are sent for additional CSRF validation
      });
      console.log('[PasswordResetRequest] Password reset request sent successfully');
      
      // Step 4: Show success message (always, for security)
      // This prevents user enumeration attacks by not revealing if email exists
      setSuccess(true);
      
      // Clear form data
      setEmail('');
    } catch (error: any) {
      console.error('[PasswordResetRequest] Password reset request failed:', error);
      
      // Handle different types of errors with appropriate user messages
      if (error.response) {
        // HTTP error response from server
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('[PasswordResetRequest] Server error response:', {
          status,
          statusText: error.response.statusText,
          data
        });
        
        if (status === 403) {
          setError('CSRF verification failed. Please refresh the page and try again.');
        } else if (data?.detail) {
          setError(data.detail);
        } else if (data?.email) {
          setError(`Email error: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
        } else {
          setError('Server error. Please try again later.');
        }
      } else if (error.request) {
        // Network error (no response received)
        console.error('[PasswordResetRequest] Network error:', error.message);
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error (e.g., CSRF token fetch failed, header attachment issues)
        console.error('[PasswordResetRequest] Unexpected error:', error.message);
        
        // Check if this might be a CSRF token issue
        if (error.message && error.message.includes('CSRF')) {
          setError('CSRF token error. Please refresh the page and try again.');
        } else if (error.message && error.message.includes('token')) {
          setError('Authentication token error. Please refresh the page and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        
        // Log additional debugging information for CSRF issues
        console.error('[PasswordResetRequest] CSRF debugging info:', {
          hasDefaultToken: !!getCsrfTokenFromHeaders(),
          errorMessage: error.message,
          errorType: error.constructor.name
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

  // If the request was successful, show a success message
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with the email you provided, you will receive password reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your email inbox and spam folder. The reset link will expire after 24 hours.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render the password reset request form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you instructions to reset your password.
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
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
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

export default PasswordResetRequest;
