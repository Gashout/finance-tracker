/**
 * @file transaction.ts
 * @description Type definitions for transaction-related data structures
 * 
 * This file defines TypeScript interfaces for transaction data used throughout the application.
 * These types ensure consistent data structure and provide type safety when working with
 * transaction objects from the Django backend.
 */

/**
 * @interface Category
 * @description Represents a transaction category
 * 
 * Categories are used to organize transactions and are associated with a specific user.
 * They are created and managed by users to categorize their financial activities.
 */
export interface Category {
  id: number;
  name: string;
  user?: number; // Optional as it may not be included in some API responses
}

/**
 * @interface CategoryDetail
 * @description Extended category information with nested data
 * 
 * This is used when the API returns detailed category information,
 * particularly in nested transaction responses.
 */
export interface CategoryDetail extends Category {
  // Additional fields that might be included in detailed responses
}

/**
 * @type TransactionType
 * @description Enumeration of possible transaction types
 * 
 * These values must match the backend's transaction type choices:
 * - 'IN': Income transactions (money coming in)
 * - 'EX': Expense transactions (money going out)
 * - 'TR': Transfer transactions (moving money between accounts)
 */
export type TransactionType = 'IN' | 'EX' | 'TR';

/**
 * @interface Transaction
 * @description Core transaction data structure
 * 
 * This interface maps directly to the Django Transaction model fields.
 * It represents a financial transaction with all its attributes.
 */
export interface Transaction {
  id: number;
  user?: number;           // User ID who owns this transaction
  category?: number;       // Category ID (optional as some transactions may not have a category)
  category_detail?: CategoryDetail; // Nested category data (included in GET responses)
  amount: number;          // Transaction amount
  description: string;     // Transaction description
  date: string;            // Transaction date in ISO format (YYYY-MM-DD)
  transaction_type: TransactionType; // Type of transaction (income, expense, transfer)
  created_at: string;      // Creation timestamp in ISO format
}

/**
 * @interface TransactionFormData
 * @description Data structure for transaction creation/editing forms
 * 
 * This interface defines the shape of data used in forms when creating
 * or editing transactions. It excludes server-generated fields like id and created_at.
 */
export interface TransactionFormData {
  category: number | null;
  amount: number;
  description: string;
  date: string;
  transaction_type: TransactionType;
}

/**
 * @interface TransactionFilters
 * @description Filter criteria for transaction queries
 * 
 * This interface defines the possible filter parameters that can be
 * sent to the backend API when querying transactions.
 */
export interface TransactionFilters {
  category?: number;       // Filter by category ID
  start_date?: string;     // Filter transactions on or after this date
  end_date?: string;       // Filter transactions on or before this date
  min_amount?: number;     // Filter transactions with amount >= this value
  max_amount?: number;     // Filter transactions with amount <= this value
  transaction_type?: TransactionType; // Filter by transaction type
  search?: string;         // Search in transaction descriptions
}

/**
 * @interface PaginatedResponse
 * @description Generic paginated response structure from Django REST Framework
 * 
 * This interface represents the structure of paginated responses from the Django
 * backend, which includes metadata about the pagination state along with results.
 */
export interface PaginatedResponse<T> {
  count: number;           // Total number of items across all pages
  next: string | null;     // URL to the next page (null if on last page)
  previous: string | null; // URL to the previous page (null if on first page)
  results: T[];            // Array of items for the current page
}

/**
 * @interface TransactionTypeOption
 * @description Option for transaction type selection in UI components
 * 
 * Used to display human-readable labels for transaction types in dropdowns
 * and other UI elements.
 */
export interface TransactionTypeOption {
  value: TransactionType;
  label: string;
}

/**
 * @constant TRANSACTION_TYPE_OPTIONS
 * @description Array of transaction type options for UI selection
 * 
 * These options are used in dropdowns and filters throughout the UI.
 * The labels should match what users expect to see for each transaction type.
 */
export const TRANSACTION_TYPE_OPTIONS: TransactionTypeOption[] = [
  { value: 'IN', label: 'Income' },
  { value: 'EX', label: 'Expense' },
  { value: 'TR', label: 'Transfer' },
];

/**
 * @function getTransactionTypeLabel
 * @description Get human-readable label for a transaction type
 * 
 * @param {TransactionType} type - The transaction type code
 * @returns {string} The human-readable label
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const option = TRANSACTION_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : 'Unknown';
};

/**
 * @function formatCurrency
 * @description Format a number as currency
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
