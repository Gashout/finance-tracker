# Finance Tracker - Testing and Feature Demonstration Guide

This guide provides comprehensive instructions for testing the Finance Tracker application and demonstrating its key features.

## Table of Contents

1. [Testing Instructions](#testing-instructions)
   - [Backend Testing](#backend-testing)
   - [Frontend Testing](#frontend-testing)
   - [End-to-End Testing](#end-to-end-testing)
   - [Manual Testing Checklist](#manual-testing-checklist)

2. [Feature Demonstration Guide](#feature-demonstration-guide)
   - [User Authentication](#user-authentication)
   - [Transaction Management](#transaction-management)
   - [Budget Management](#budget-management)
   - [Dashboard and Analytics](#dashboard-and-analytics)
   - [Category Management](#category-management)
   - [User Profile Management](#user-profile-management)

## Testing Instructions

### Backend Testing

#### Setting Up the Test Environment

1. Activate the virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install test dependencies:
   ```bash
   pip install coverage pytest pytest-django
   ```

3. Configure test settings:
   - Ensure `DEBUG=True` in your `.env` file for detailed error messages
   - The tests will use an in-memory SQLite database by default

#### Running Django Tests

1. Run the full test suite:
   ```bash
   python manage.py test
   ```

2. Run tests for a specific app:
   ```bash
   python manage.py test accounts
   python manage.py test transactions
   python manage.py test budgets
   ```

3. Run a specific test case or method:
   ```bash
   python manage.py test transactions.tests.TransactionModelTests
   python manage.py test transactions.tests.TransactionModelTests.test_create_transaction
   ```

#### Measuring Test Coverage

1. Run tests with coverage:
   ```bash
   coverage run --source='.' manage.py test
   ```

2. Generate a coverage report:
   ```bash
   coverage report
   ```

3. Generate an HTML coverage report:
   ```bash
   coverage html
   ```
   Then open `htmlcov/index.html` in your browser to view the detailed report.

#### API Testing with curl

Test the login endpoint:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "adminpassword"}'
```

Test retrieving transactions (replace `<token>` with your actual token):
```bash
curl http://localhost:8000/api/transactions/ \
  -H "Authorization: Token <token>"
```

### Frontend Testing

#### Setting Up the Frontend Test Environment

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install test dependencies (these should already be included in package.json):
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

#### Running React Tests

1. Run all tests:
   ```bash
   npm test
   ```

2. Run tests in watch mode:
   ```bash
   npm test -- --watch
   ```

3. Run a specific test file:
   ```bash
   npm test -- src/components/TransactionForm.test.tsx
   ```

4. Generate a test coverage report:
   ```bash
   npm test -- --coverage
   ```

#### Component Testing Examples

Test a component renders correctly:
```javascript
import { render, screen } from '@testing-library/react';
import TransactionList from './TransactionList';

test('renders transaction list', () => {
  render(<TransactionList transactions={[]} />);
  const listElement = screen.getByText(/No transactions found/i);
  expect(listElement).toBeInTheDocument();
});
```

Test user interaction:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionForm from './TransactionForm';

test('submits form with correct values', () => {
  const mockSubmit = jest.fn();
  render(<TransactionForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test transaction' } });
  fireEvent.click(screen.getByText(/submit/i));
  
  expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
    amount: '100',
    description: 'Test transaction'
  }));
});
```

### End-to-End Testing

For end-to-end testing, we use Cypress to simulate real user interactions with the application.

#### Setting Up Cypress

1. Install Cypress:
   ```bash
   cd frontend
   npm install --save-dev cypress
   ```

2. Open Cypress:
   ```bash
   npx cypress open
   ```

3. Create a test file at `cypress/integration/login_spec.js`:
   ```javascript
   describe('Login', () => {
     it('should login successfully with correct credentials', () => {
       cy.visit('/login');
       cy.get('input[name="username"]').type('testuser');
       cy.get('input[name="password"]').type('password123');
       cy.get('button[type="submit"]').click();
       cy.url().should('include', '/dashboard');
       cy.contains('Welcome, testuser');
     });
   });
   ```

4. Run the test:
   ```bash
   npx cypress run
   ```

### Manual Testing Checklist

Use this checklist to manually verify key functionality:

#### Authentication
- [ ] User can register with valid information
- [ ] User cannot register with duplicate username/email
- [ ] User can log in with valid credentials
- [ ] User cannot log in with invalid credentials
- [ ] User can log out
- [ ] User can reset password via email
- [ ] User can change password when logged in

#### Transactions
- [ ] User can view list of transactions
- [ ] User can add a new transaction
- [ ] User can edit an existing transaction
- [ ] User can delete a transaction
- [ ] User can filter transactions by date range
- [ ] User can filter transactions by category
- [ ] User can filter transactions by transaction type
- [ ] User can search transactions by description

#### Budgets
- [ ] User can view list of budgets
- [ ] User can add a new budget
- [ ] User can edit an existing budget
- [ ] User can delete a budget
- [ ] Budget progress is calculated correctly
- [ ] Budget alerts appear when thresholds are reached

#### Categories
- [ ] User can view list of categories
- [ ] User can add a new category
- [ ] User can edit an existing category
- [ ] User can delete a category
- [ ] Categories appear in transaction and budget forms

#### Dashboard
- [ ] Dashboard displays correct financial summary
- [ ] Dashboard shows recent transactions
- [ ] Dashboard displays budget status
- [ ] Dashboard data refreshes when transactions/budgets change

#### User Profile
- [ ] User can view profile information
- [ ] User can update profile information
- [ ] User can change password

#### General
- [ ] Application is responsive on mobile devices
- [ ] Form validation works correctly
- [ ] Error messages are displayed appropriately
- [ ] Success messages are displayed appropriately
- [ ] Navigation works correctly
- [ ] Data persists after page refresh

## Feature Demonstration Guide

This section provides step-by-step instructions for demonstrating the key features of the Finance Tracker application.

### User Authentication

#### 1. User Registration

1. Open the application at http://localhost:3000/
2. Click "Register" in the navigation or go to http://localhost:3000/register
3. Fill in the registration form:
   - Username: `demouser`
   - Email: `demo@example.com`
   - Password: `Password123`
   - Confirm Password: `Password123`
4. Click "Create Account"
5. You should be redirected to the dashboard

**Expected Result**: Account is created and user is logged in automatically.

#### 2. User Login

1. Log out by clicking the profile icon in the top right and selecting "Logout"
2. Go to http://localhost:3000/login
3. Enter the credentials:
   - Username: `demouser`
   - Password: `Password123`
4. Click "Login"

**Expected Result**: User is logged in and redirected to the dashboard.

#### 3. Password Reset

1. Log out if you're logged in
2. Go to http://localhost:3000/login
3. Click "Forgot your password?"
4. Enter your email address: `demo@example.com`
5. Click "Send Reset Instructions"
6. Check the console output for the password reset email (in development mode)
7. Copy the password reset link from the console
8. Open the link in a new tab
9. Enter a new password and confirm it
10. Click "Set Password"
11. Log in with the new password

**Expected Result**: Password is reset and user can log in with the new password.

### Transaction Management

#### 1. Adding a Transaction

1. Ensure you're logged in
2. Go to http://localhost:3000/transactions
3. Click "Add Transaction"
4. Fill in the transaction form:
   - Amount: `50.00`
   - Description: `Grocery shopping`
   - Date: Today's date
   - Category: Select "Groceries" (or create it if it doesn't exist)
   - Transaction Type: "Expense"
5. Click "Save"

**Expected Result**: The transaction appears in the transaction list.

#### 2. Filtering Transactions

1. Go to http://localhost:3000/transactions
2. Use the filter controls:
   - Select a date range
   - Select a category
   - Select a transaction type
   - Enter a search term
3. Click "Apply Filters"

**Expected Result**: The transaction list updates to show only transactions matching the filters.

#### 3. Editing a Transaction

1. Go to http://localhost:3000/transactions
2. Find the transaction you created earlier
3. Click the edit icon
4. Change the amount to `75.00`
5. Click "Save"

**Expected Result**: The transaction is updated with the new amount.

#### 4. Deleting a Transaction

1. Go to http://localhost:3000/transactions
2. Find the transaction you edited
3. Click the delete icon
4. Confirm the deletion

**Expected Result**: The transaction is removed from the list.

### Budget Management

#### 1. Creating a Budget

1. Go to http://localhost:3000/budgets
2. Click "Add Budget"
3. Fill in the budget form:
   - Category: Select "Groceries" (or create it if it doesn't exist)
   - Amount: `300.00`
   - Month: Current month
   - Year: Current year
4. Click "Save"

**Expected Result**: The budget appears in the budget list with a progress bar.

#### 2. Adding Transactions to Test Budget Progress

1. Go to http://localhost:3000/transactions
2. Add a new transaction:
   - Amount: `150.00`
   - Description: `Mid-month grocery shopping`
   - Date: Today's date
   - Category: "Groceries"
   - Transaction Type: "Expense"
3. Click "Save"
4. Go back to http://localhost:3000/budgets

**Expected Result**: The budget progress bar should show 50% progress.

#### 3. Testing Budget Alerts

1. Go to http://localhost:3000/transactions
2. Add another transaction:
   - Amount: `120.00`
   - Description: `End-of-month grocery shopping`
   - Date: Today's date
   - Category: "Groceries"
   - Transaction Type: "Expense"
3. Click "Save"
4. Go to http://localhost:3000/budgets
5. Go to http://localhost:3000/ (Dashboard)

**Expected Result**: 
- The budget progress bar should show 90% progress (yellow warning color)
- A budget alert should appear on the dashboard

#### 4. Testing Budget Overrun

1. Go to http://localhost:3000/transactions
2. Add another transaction:
   - Amount: `50.00`
   - Description: `Extra grocery items`
   - Date: Today's date
   - Category: "Groceries"
   - Transaction Type: "Expense"
3. Click "Save"
4. Go to http://localhost:3000/budgets
5. Go to http://localhost:3000/ (Dashboard)

**Expected Result**: 
- The budget progress bar should show 106.67% progress (red color)
- A budget overrun alert should appear on the dashboard

### Dashboard and Analytics

#### 1. Exploring the Dashboard

1. Go to http://localhost:3000/ (Dashboard)
2. Observe the following sections:
   - Total Balance
   - Monthly Income
   - Monthly Expenses
   - Recent Transactions
   - Budget Status

**Expected Result**: The dashboard shows an overview of your financial status.

#### 2. Testing Dashboard Refresh

1. Go to http://localhost:3000/transactions
2. Add a new income transaction:
   - Amount: `1000.00`
   - Description: `Salary`
   - Date: Today's date
   - Category: "Income"
   - Transaction Type: "Income"
3. Click "Save"
4. Go to http://localhost:3000/ (Dashboard)
5. Click the "Refresh" button

**Expected Result**: The dashboard updates to reflect the new transaction, showing increased income and balance.

### Category Management

#### 1. Creating Categories

1. Go to http://localhost:3000/categories
2. Click "Add Category"
3. Enter "Entertainment" as the category name
4. Click "Save"
5. Repeat to add more categories (e.g., "Utilities", "Transportation")

**Expected Result**: The categories appear in the category list.

#### 2. Using Categories in Transactions

1. Go to http://localhost:3000/transactions
2. Click "Add Transaction"
3. Fill in the transaction form:
   - Amount: `25.00`
   - Description: `Movie tickets`
   - Date: Today's date
   - Category: Select "Entertainment"
   - Transaction Type: "Expense"
4. Click "Save"

**Expected Result**: The transaction appears in the list with the selected category.

#### 3. Creating a Budget for a Category

1. Go to http://localhost:3000/budgets
2. Click "Add Budget"
3. Fill in the budget form:
   - Category: Select "Entertainment"
   - Amount: `100.00`
   - Month: Current month
   - Year: Current year
4. Click "Save"

**Expected Result**: The budget appears in the budget list for the selected category.

### User Profile Management

#### 1. Viewing and Updating Profile

1. Click the profile icon in the top right
2. Select "Profile"
3. Update your profile information:
   - First Name: `Demo`
   - Last Name: `User`
   - Email: Keep the same or update
4. Click "Save Changes"

**Expected Result**: Profile information is updated.

#### 2. Changing Password

1. Go to the Profile page
2. Scroll to the Password section
3. Enter your current password
4. Enter a new password and confirm it
5. Click "Change Password"

**Expected Result**: Password is changed and you remain logged in.

## Troubleshooting Common Issues

### Backend Issues

1. **Database Migrations Error**:
   - Solution: Run `python manage.py migrate --fake-initial` and then `python manage.py migrate`

2. **CSRF Token Error**:
   - Solution: Ensure CORS and CSRF settings are correct in `settings.py`
   - Check that the frontend is including the CSRF token in requests

3. **Authentication Failure**:
   - Solution: Verify token is being included in the Authorization header
   - Check that the token hasn't expired

### Frontend Issues

1. **API Connection Error**:
   - Solution: Verify the backend server is running
   - Check that the API base URL is correct in `api.ts`

2. **Component Rendering Error**:
   - Solution: Check the browser console for specific error messages
   - Verify that required props are being passed to components

3. **Form Submission Error**:
   - Solution: Check form validation rules
   - Verify API endpoint and request format

## Conclusion

This guide provides comprehensive instructions for testing the Finance Tracker application and demonstrating its key features. By following these instructions, you can verify that the application is functioning correctly and showcase its capabilities to users or stakeholders.
