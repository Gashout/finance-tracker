/**
 * @file index.ts
 * @description Core type definitions for the finance tracker application
 */

// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Budget related types
export interface Budget {
  id: number;
  user: number;
  category: number;
  category_detail?: {
    id: number;
    name: string;
  };
  amount: number;
  month: number;
  month_name?: string;
  year: number;
  created_at: string;
}

export interface BudgetRequest {
  category: number | null;
  amount: number;
  month: number;
  year: number;
}

/**
 * @interface BudgetProgress
 * @description Represents a budget with its actual spending and progress.
 * This is used for displaying budget vs. actual spending in the UI.
 */
export interface BudgetProgress {
  budgetId: number;
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  actualSpending: number;
  remainingAmount: number;
  spendingPercentage: number;
  month: number;
  year: number;
  isOverBudget?: boolean;
}

// API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  errors?: any;
  data?: T;
}

// Form state types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

// Dashboard specific types
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: any[];
  categorySpending: CategorySpending[];
  budgetStatus: BudgetProgress[];
}

export interface CategorySpending {
  categoryId: number;
  name: string;
  amount: number;
  percentage: number;
}