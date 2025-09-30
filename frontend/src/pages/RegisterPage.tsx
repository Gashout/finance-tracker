// Import necessary libraries and components
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';

// Import custom components and services
// Using relative imports for UI components to avoid path alias issues
import { 
  Button,
  Input,
  Card, CardContent, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Alert, AlertDescription, AlertTitle
} from '../components/ui';
// Using relative imports for authService to avoid path alias issues
import { register } from '../services/authService';

/**
 * @name registerSchema
 * @description Defines the validation schema for the registration form using Zod.
 * This schema ensures that all fields are correctly formatted and passwords match.
 */
const registerSchema = z.object({
  /**
   * @property {string} username - The desired username for the new account.
   * @validation
   * - Must be a string.
   * - Cannot be empty.
   * - Must be between 3 and 20 characters long.
   * @whydesc We enforce a reasonable length for usernames to ensure they are unique and manageable.
   */
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be less than 20 characters.' }),

  /**
   * @property {string} email - The user's email address.
   * @validation
   * - Must be a string.
   * - Must be a valid email format.
   * @whydesc A valid email is required for account verification and communication.
   */
  email: z.string().email({ message: 'Please enter a valid email address.' }),

  /**
   * @property {string} password - The password for the new account.
   * @validation
   * - Must be a string.
   * - Must be at least 8 characters long.
   * @whydesc A longer password significantly increases account security.
   */
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),

  /**
   * @property {string} confirmPassword - A confirmation of the password.
   * @validation
   * - Must match the `password` field.
   * @whydesc This helps prevent typos in the password, ensuring the user can log in later.
   */
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  // This custom validation ensures the passwords match.
  message: "Passwords don't match",
  path: ['confirmPassword'], // The error will be displayed for the `confirmPassword` field.
});

// Define the type for the form values based on the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * @name RegisterPage
 * @description A component that renders the registration page.
 * It provides a form for new users to create an account.
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /**
   * @name form
   * @description Initializes the form using `react-hook-form`.
   * - `resolver`: Integrates Zod for schema validation.
   * - `defaultValues`: Sets initial empty values for the form fields.
   */
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * @name onSubmit
   * @description Handles the form submission for registration.
   * @param {RegisterFormValues} data - The validated form data.
   *
   * @authentication_flow
   * 1. The function is triggered on valid form submission.
   * 2. It resets any previous error messages.
   * 3. It calls the `register` function from `authService` with the user's details.
   * 4. On successful registration, the user is redirected to the login page.
   * 5. If registration fails (e.g., username already exists), an error message is displayed.
   */
  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      await register(data.username, data.email, data.password);
      // After successful registration, redirect to the login page
      navigate('/login');
    } catch (err: any) {
      // Extract and display the error message from the API response
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle different error response formats from Django
      if (err.response?.data) {
        const responseData = err.response.data;
        
        // Check for different error formats
        if (responseData.errors) {
          // If errors is an object with field-specific errors
          if (typeof responseData.errors === 'object') {
            const errorFields = Object.keys(responseData.errors);
            if (errorFields.length > 0) {
              const firstField = errorFields[0];
              const firstError = Array.isArray(responseData.errors[firstField]) 
                ? responseData.errors[firstField][0] 
                : responseData.errors[firstField];
              errorMessage = `${firstField}: ${firstError}`;
            }
          } else if (typeof responseData.errors === 'string') {
            errorMessage = responseData.errors;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display an alert if there is a registration error */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              {/* Login link */}
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
