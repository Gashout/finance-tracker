# Finance Tracker - Challenges and Solutions

This document outlines the significant challenges encountered during the development of the Finance Tracker application and the solutions implemented to address them.

## 1. Cross-Origin Resource Sharing (CORS) and CSRF Protection

### Challenge
One of the most significant challenges was configuring proper CORS and CSRF protection for the separated frontend and backend architecture. Since the React frontend runs on a different domain (localhost:3000) than the Django backend (localhost:8000), this created several security challenges:

1. Browser security policies blocked cross-origin requests
2. Django's CSRF protection mechanism rejected form submissions from the React application
3. Authentication cookies couldn't be shared between domains
4. Password reset functionality required special CSRF handling

### Solution
I implemented a comprehensive CORS and CSRF strategy:

1. **Configured Django CORS Settings**:
   ```python
   CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
   CORS_ALLOW_CREDENTIALS = True
   ```

2. **Added CSRF Trusted Origins**:
   ```python
   CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
   ```

3. **Created a Dedicated CSRF Token Endpoint**:
   ```python
   @ensure_csrf_cookie
   @api_view(['GET'])
   @permission_classes([AllowAny])
   def get_csrf_token(request):
       csrf_token = get_token(request)
       return Response({
           'csrfToken': csrf_token,
           'message': 'CSRF token generated successfully'
       })
   ```

4. **Implemented Token-Based Authentication** to avoid cookie-based session issues across domains

5. **Enhanced Axios Configuration** in the frontend:
   ```typescript
   const api = axios.create({
     baseURL: 'http://localhost:8000/api/',
     withCredentials: true,
     xsrfCookieName: 'csrftoken',
     xsrfHeaderName: 'X-CSRFToken'
   })
   ```

6. **Created a Dual Header Setting Strategy** to ensure CSRF tokens were properly included in all requests

This comprehensive approach resolved the cross-origin issues while maintaining security, allowing the frontend and backend to communicate securely despite running on different domains.

## 2. CSRF Token Header Attachment for Password Reset

### Challenge
A particularly difficult issue arose with the password reset functionality. The frontend was successfully fetching CSRF tokens, but they weren't being properly attached to POST requests for password reset operations. This caused Django to reject the requests with CSRF verification failures.

The root cause was that the token was being set in `axios.defaults.headers.common['X-CSRFToken']`, but our API calls used a custom Axios instance created with `axios.create()`, which doesn't inherit global default headers.

### Solution
We implemented a robust solution with multiple layers of protection:

1. **Dual Header Setting Strategy**:
   ```javascript
   // Set token in both global axios defaults and our custom api instance
   axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
   api.defaults.headers.common['X-CSRFToken'] = csrfToken;
   ```

2. **Explicit Header Management Functions**:
   ```javascript
   export const getCsrfTokenFromHeaders = (): string | null => {
     const apiInstanceToken = api.defaults.headers.common['X-CSRFToken'] as string;
     if (apiInstanceToken) {
       return apiInstanceToken;
     }
     
     const globalToken = axios.defaults.headers.common['X-CSRFToken'] as string;
     return globalToken || null;
   }
   ```

3. **Request-Level Header Setting**:
   ```javascript
   await api.post('auth/password-reset/', { email }, {
     headers: {
       'X-CSRFToken': token,
       'Content-Type': 'application/json'
     },
     withCredentials: true
   });
   ```

4. **Enhanced Error Handling**:
   ```javascript
   if (error.message && error.message.includes('CSRF')) {
     setError('CSRF token error. Please refresh the page and try again.');
   }
   ```

This comprehensive approach ensured that CSRF tokens were properly included in all requests, regardless of which Axios instance was used.

## 3. Template Syntax Error in Password Reset Email

### Challenge
The password reset email template had a syntax error related to apostrophes (`'`) in the text, which was causing template parsing to fail. Additionally, there were issues with the URL tag and template comments being included in the rendered output.

### Solution
We implemented several fixes:

1. **Fixed Apostrophe Handling**:
   - Replaced contractions like "you've" with "you have" to avoid apostrophe-related syntax errors
   - Used straight apostrophes (') instead of curly ones (')

2. **Fixed URL Generation**:
   - Changed from using the Django URL tag to a manually constructed URL path
   - Updated the format to match the actual URL structure in the application

3. **Improved Template Documentation**:
   - Used proper `{% comment %}` tags instead of `{# #}` for multi-line comments
   - Ensured comments don't appear in the rendered output

4. **Added Testing Infrastructure**:
   - Created test scripts to verify template rendering
   - Validated that the template compiles without errors

These changes ensured that the password reset email template rendered correctly without any syntax errors.

## 4. React Component Nesting and Organization

### Challenge
The initial frontend structure had nested component directories, particularly with the shadcn/ui components, which led to confusing import paths and made the codebase harder to maintain.

### Solution
We restructured the frontend codebase to follow a more logical organization:

1. **Flattened Component Structure**:
   - Moved components from `frontend/frontend/` up to `frontend/`
   - Organized components by feature area (`transactions`, `budgets`, etc.)

2. **Implemented Path Aliases**:
   - Updated `tsconfig.json` to support path aliases
   - Simplified imports with consistent patterns

3. **Standardized Component Organization**:
   - Each feature area has consistent file structure
   - Components follow a logical hierarchy

This reorganization significantly improved code maintainability and developer experience.

## 5. Budget Progress Calculation and Display

### Challenge
Calculating and displaying budget progress was complex because:
1. Budget data and transaction data needed to be combined
2. Calculations needed to be performed for specific time periods
3. Progress indicators needed to update in real-time
4. Visual indicators needed to show different states (under budget, approaching limit, over budget)

### Solution
I implemented a comprehensive solution:

1. **Created a Budget Progress Type**:
   ```typescript
   interface BudgetProgress {
     budgetId: number;
     categoryId: number;
     categoryName: string;
     budgetAmount: number;
     actualSpending: number;
     remainingAmount: number;
     spendingPercentage: number;
     month: number;
     year: number;
     isOverBudget: boolean;
   }
   ```

2. **Implemented Budget Progress Calculation**:
   ```typescript
   const calculateBudgetProgress = (
     budgetList: Budget[],
     monthlyTransactions: Transaction[]
   ): BudgetProgress[] => {
     // Filter transactions to match budget categories
     // Calculate actual spending per category
     // Compute remaining amounts and percentages
     // Determine budget status
   };
   ```

3. **Added Visual Progress Indicators**:
   ```typescript
   const renderProgressBar = (percentage: number): React.ReactNode => {
     const cappedPercentage = Math.min(100, percentage);
     return (
       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
         <div
           className={`h-2.5 rounded-full ${
             percentage >= 100 ? 'bg-red-600' : 
             percentage >= 80 ? 'bg-amber-600' : 
             'bg-green-600'
           }`}
           style={{ width: `${cappedPercentage}%` }}
         ></div>
       </div>
     );
   };
   ```

4. **Implemented Budget Alerts**:
   ```typescript
   const calculateBudgetAlerts = (budgets: BudgetProgress[]): BudgetAlert[] => {
     const alerts: BudgetAlert[] = [];
     
     budgets.forEach(budget => {
       if (budget.spendingPercentage >= 100) {
         alerts.push({
           level: 'danger',
           message: `You have exceeded your budget for ${budget.categoryName}.`
         });
       } else if (budget.spendingPercentage >= 90) {
         alerts.push({
           level: 'warning',
           message: `You are at ${budget.spendingPercentage.toFixed(1)}% of your budget for ${budget.categoryName}.`
         });
       }
     });
     
     return alerts;
   };
   ```

This solution provided users with clear visual feedback about their budget status and timely alerts when approaching or exceeding budget limits.

## 6. Form Validation and Error Handling

### Challenge
Implementing consistent form validation across multiple forms with different requirements was challenging. We needed to:
1. Validate data on both client and server sides
2. Provide clear error messages to users
3. Handle different types of validation (required fields, numeric values, date formats)
4. Maintain a consistent user experience across all forms

### Solution
We implemented a comprehensive form validation strategy:

1. **Used React Hook Form with Zod Schema Validation**:
   ```typescript
   const formSchema = z.object({
     amount: z.string().min(1, "Amount is required"),
     description: z.string().min(1, "Description is required"),
     date: z.string().min(1, "Date is required"),
     category: z.string().optional(),
     transaction_type: z.enum(["IN", "EX", "TR"])
   });
   
   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
     defaultValues: {
       amount: "",
       description: "",
       date: new Date().toISOString().split("T")[0],
       category: "",
       transaction_type: "EX"
     }
   });
   ```

2. **Created Reusable Form Components**:
   ```typescript
   <FormField
     control={form.control}
     name="amount"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Amount</FormLabel>
         <FormControl>
           <Input type="number" step="0.01" min="0.01" {...field} />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

3. **Implemented Server-Side Validation**:
   ```python
   def validate(self, data):
       """Validate transaction data"""
       amount = data.get('amount')
       if amount and Decimal(str(amount)) <= 0:
           raise serializers.ValidationError(
               {'amount': 'Amount must be greater than zero.'}
           )
       return data
   ```

4. **Enhanced Error Handling in API Services**:
   ```typescript
   try {
     // API call
   } catch (error: any) {
     if (error.response?.data?.detail) {
       setError(error.response.data.detail);
     } else if (error.response?.data) {
       // Extract field-specific errors
       const fieldErrors = Object.entries(error.response.data)
         .map(([field, errors]) => `${field}: ${errors}`)
         .join(', ');
       setError(`Validation error: ${fieldErrors}`);
     } else {
       setError('An error occurred. Please try again.');
     }
   }
   ```

This comprehensive approach ensured consistent validation across all forms while providing clear feedback to users.

## 7. Authentication State Management

### Challenge
Managing authentication state across the application presented several challenges:
1. Ensuring authenticated state persists across page refreshes
2. Securing protected routes
3. Handling token expiration
4. Managing user profile information

### Solution
We implemented a comprehensive authentication context:

1. **Created an Authentication Context**:
   ```typescript
   export const AuthContext = createContext<AuthContextType>({
     isAuthenticated: false,
     user: null,
     loading: true,
     login: () => Promise.resolve(),
     logout: () => Promise.resolve(),
     register: () => Promise.resolve(),
     updateProfile: () => Promise.resolve()
   });
   ```

2. **Implemented Token Storage and Retrieval**:
   ```typescript
   const login = async (username: string, password: string) => {
     try {
       const response = await api.post('auth/login/', { username, password });
       const { token, user } = response.data;
       
       // Store token in localStorage
       localStorage.setItem('token', token);
       
       // Update auth state
       setIsAuthenticated(true);
       setUser(user);
       
       return user;
     } catch (error) {
       // Handle error
       throw error;
     }
   };
   ```

3. **Added Token Verification on App Load**:
   ```typescript
   useEffect(() => {
     const verifyToken = async () => {
       const token = localStorage.getItem('token');
       
       if (!token) {
         setIsAuthenticated(false);
         setUser(null);
         setLoading(false);
         return;
       }
       
       try {
         const response = await api.get('auth/me/');
         setIsAuthenticated(true);
         setUser(response.data.user);
       } catch (error) {
         localStorage.removeItem('token');
         setIsAuthenticated(false);
         setUser(null);
       } finally {
         setLoading(false);
       }
     };
     
     verifyToken();
   }, []);
   ```

4. **Created Protected Route Components**:
   ```typescript
   const Layout: React.FC<LayoutProps> = ({ children }) => {
     const { isAuthenticated, loading } = useAuth();
     const navigate = useNavigate();
     
     useEffect(() => {
       if (!loading && !isAuthenticated) {
         navigate('/login');
       }
     }, [isAuthenticated, loading, navigate]);
     
     if (loading) {
       return <div>Loading...</div>;
     }
     
     return (
       <div className="flex h-screen">
         <Sidebar />
         <div className="flex-1 overflow-auto">
           <Header />
           <main className="p-6">{children}</main>
         </div>
       </div>
     );
   };
   ```

This solution provided a robust authentication system that secured routes while maintaining a good user experience.

These challenges and their solutions demonstrate the technical depth and complexity of the Finance Tracker application, showcasing our problem-solving approach and commitment to best practices in software development.
