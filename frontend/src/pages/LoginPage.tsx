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
// Using relative imports for context to avoid path alias issues
import { useAuth } from '../context/AuthContext';

/**
 * @name loginSchema
 * @description Defines the validation schema for the login form using Zod.
 * This schema ensures that the user provides a valid username and password.
 */
const loginSchema = z.object({
  /**
   * @property {string} username - The username for login.
   * @validation
   * - Must be a string.
   * - Cannot be empty.
   * - Must be at least 3 characters long.
   * @whydesc We require a username to identify the user. A minimum length prevents overly short or accidental usernames.
   */
  username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }),

  /**
   * @property {string} password - The password for the user account.
   * @validation
   * - Must be a string.
   * - Cannot be empty.
   * - Must be at least 6 characters long.
   * @whydesc A password is essential for security. A minimum length increases the password's strength against brute-force attacks.
   */
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

// Define the type for the form values based on the schema
type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * @name LoginPage
 * @description A component that renders the login page.
 * It includes a form for users to enter their credentials and handles the authentication process.
 */
const LoginPage: React.FC = () => {
  // Access the login function from the authentication context
  const { login } = useAuth();
  
  // React Router's hook for navigation
  const navigate = useNavigate();

  // State to manage and display login errors
  const [error, setError] = useState<string | null>(null);

  /**
   * @name form
   * @description Initializes the form using `react-hook-form`.
   * - `resolver`: Integrates Zod for validation.
   * - `defaultValues`: Sets initial values for the form fields.
   */
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  /**
   * @name onSubmit
   * @description Handles the form submission event.
   * @param {LoginFormValues} data - The validated form data.
   *
   * @authentication_flow
   * 1. The function is called when the user submits the form with valid data.
   * 2. It resets any previous error messages.
   * 3. It calls the `login` function from `AuthContext` with the user's credentials.
   * 4. If login is successful, the `AuthContext` will update the user state and the user will be redirected to the dashboard.
   * 5. If login fails, an error message is caught and displayed in the Alert component.
   */
  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data.username, data.password);
      // On successful login, AuthContext will handle redirection via its state change,
      // but we can also navigate programmatically if needed.
      navigate('/'); 
    } catch (err: any) {
      // Handle and display errors from the API (e.g., invalid credentials)
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display an alert if there is a login error */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* 
            The Form component from shadcn/ui wraps react-hook-form's FormProvider.
            It passes down all the form handling logic to its children.
          */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 
                Submit Button:
                - `type="submit"` triggers the form's `onSubmit` handler.
                - `disabled={form.formState.isSubmitting}` prevents multiple submissions
                  while the login request is in progress.
              */}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              
              {/* Additional links section */}
              <div className="space-y-3 mt-4">
                {/* Password reset link */}
                <div className="text-center">
                  <Link 
                    to="/password-reset" 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                
                {/* Registration section with divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to Finance Tracker?</span>
                  </div>
                </div>
                
                {/* Registration button with accent color */}
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => navigate('/register')}
                >
                  Create an Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
