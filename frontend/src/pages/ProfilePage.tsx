/**
 * @file ProfilePage.tsx
 * @description User profile management page component
 *
 * This component provides a comprehensive user profile management interface with:
 * 1. Profile information editing (name, email)
 * 2. Password changing with current password verification
 * 3. Form validation for all fields
 * 4. Success and error notifications
 * 5. Security measures for profile updates
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../components/ui';
import { getProfile, updateProfile, changePassword } from '../services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

/**
 * @interface ProfileFormValues
 * @description Type definition for profile form values
 * 
 * @security_considerations
 * - We separate profile update and password change into different forms
 *   to prevent accidental submission of password fields with profile updates
 */
interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * @interface PasswordFormValues
 * @description Type definition for password change form values
 */
interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * @constant profileFormSchema
 * @description Zod schema for profile form validation
 * 
 * @validation_rules
 * - Email must be valid format
 * - First and last name are optional but must be strings
 */
const profileFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

/**
 * @constant passwordFormSchema
 * @description Zod schema for password form validation
 * 
 * @validation_rules
 * - Current password is required
 * - New password must be at least 8 characters
 * - New password must contain at least one number
 * - New password must contain at least one uppercase letter
 * - Confirm password must match new password
 * 
 * @security_considerations
 * - Strong password requirements reduce the risk of brute force attacks
 * - Current password verification prevents unauthorized password changes
 */
const passwordFormSchema = z.object({
  current_password: z.string().min(1, { message: 'Current password is required' }),
  new_password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' }),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

/**
 * @component ProfilePage
 * @description User profile management page component
 * 
 * This component provides a user interface for:
 * 1. Viewing and updating profile information
 * 2. Changing password with current password verification
 * 
 * @returns {JSX.Element} The profile page component
 */
const ProfilePage: React.FC = () => {
  // State for API operation status and feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Initialize react-hook-form for profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  // Initialize react-hook-form for password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  /**
   * @function fetchUserProfile
   * @description Fetches the user's profile data from the API
   * 
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets error state with user-friendly message on API failure
   * - Logs detailed error to console for debugging
   */
  const fetchUserProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile from API
      const profileData = await getProfile();
      
      // Update form with fetched data
      profileForm.reset({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
      });
      
      console.log('[ProfilePage] Profile data loaded successfully');
    } catch (err: any) {
      console.error('[ProfilePage] Failed to fetch profile:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @function handleProfileSubmit
   * @description Handles profile form submission
   * 
   * @param {ProfileFormValues} data - Form data from react-hook-form
   * @returns {Promise<void>}
   * 
   * @security_considerations
   * - Only sends necessary profile fields to the API
   * - Validates data before submission
   * - Handles errors gracefully without exposing sensitive information
   * 
   * @error_handling
   * - Shows specific error messages for different API errors
   * - Logs detailed errors to console for debugging
   */
  const handleProfileSubmit = async (data: ProfileFormValues): Promise<void> => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      // Send profile update request to API
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });
      
      // Show success message
      setSuccess('Profile updated successfully');
      console.log('[ProfilePage] Profile updated successfully');
    } catch (err: any) {
      console.error('[ProfilePage] Failed to update profile:', err);
      
      // Handle specific API error responses
      if (err.response?.data?.errors?.email) {
        setError(`Email error: ${err.response.data.errors.email[0]}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile. Please try again later.');
      }
    } finally {
      setUpdating(false);
    }
  };

  /**
   * @function handlePasswordSubmit
   * @description Handles password change form submission
   * 
   * @param {PasswordFormValues} data - Form data from react-hook-form
   * @returns {Promise<void>}
   * 
   * @security_considerations
   * - Requires current password verification
   * - Validates password strength requirements
   * - Confirms new password match
   * 
   * @error_handling
   * - Shows specific error messages for different API errors
   * - Handles invalid current password errors specifically
   * - Logs errors to console for debugging
   */
  const handlePasswordSubmit = async (data: PasswordFormValues): Promise<void> => {
    try {
      setChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      
      // Send password change request to API
      await changePassword(
        data.current_password,
        data.new_password,
        data.confirm_password
      );
      
      // Reset form and show success message
      passwordForm.reset();
      setPasswordSuccess('Password changed successfully. A new authentication token has been generated.');
      console.log('[ProfilePage] Password changed successfully');
    } catch (err: any) {
      console.error('[ProfilePage] Failed to change password:', err);
      
      // Handle specific API error responses
      if (err.response?.data?.errors?.old_password) {
        setPasswordError(`Current password error: ${err.response.data.errors.old_password[0]}`);
      } else if (err.response?.data?.errors?.new_password) {
        setPasswordError(`New password error: ${err.response.data.errors.new_password[0]}`);
      } else if (err.response?.data?.errors?.new_password_confirm) {
        setPasswordError(`Password confirmation error: ${err.response.data.errors.new_password_confirm[0]}`);
      } else if (err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError('Failed to change password. Please try again later.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and change your password
      </p>

      {/* Profile Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and email address
          </CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <CardContent className="space-y-4">
              {/* Success message */}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              {/* Error message */}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading state */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* First Name Field */}
                  <FormField
                    control={profileForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name Field */}
                  <FormField
                    control={profileForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={loading || updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Password Change Form */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password with a new, secure one
          </CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <CardContent className="space-y-4">
              {/* Success message */}
              {passwordSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              
              {/* Error message */}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {/* Current Password Field */}
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your current password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password Field */}
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters and include numbers and uppercase letters.
                    </p>
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : 'Change Password'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
