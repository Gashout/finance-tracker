/**
 * @file transactionService.ts
 * @description API service for transaction-related operations
 * 
 * This service handles all API communication related to transactions and categories.
 * It provides functions to perform CRUD operations on transactions and categories,
 * as well as filtering and searching functionality.
 * 
 * All functions communicate with the Django backend via the shared API client.
 */

import api from './api';
import { 
  Transaction, 
  TransactionFormData, 
  TransactionFilters,
  Category,
  PaginatedResponse
} from '../types/transaction';

/**
 * @namespace TransactionService
 * @description Collection of functions for transaction-related API operations
 */

/**
 * @function getTransactions
 * @description Fetch transactions with optional filtering
 * 
 * This function retrieves transactions from the backend with support for:
 * - Pagination
 * - Filtering by various criteria
 * - Sorting
 * 
 * @param {TransactionFilters} filters - Optional filter criteria
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<PaginatedResponse<Transaction>>} Paginated transaction results
 * 
 * @example
 * // Get all transactions
 * const response = await getTransactions();
 * 
 * @example
 * // Get filtered transactions
 * const response = await getTransactions({
 *   category: 5,
 *   transaction_type: 'EX',
 *   start_date: '2023-01-01'
 * });
 */
export const getTransactions = async (
  filters: TransactionFilters = {},
  page: number = 1
): Promise<PaginatedResponse<Transaction>> => {
  try {
    // Build query parameters from filters
    const params = new URLSearchParams();
    
    // Add pagination parameter
    params.append('page', page.toString());
    
    // Add filter parameters if they exist
    if (filters.category) params.append('category', filters.category.toString());
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
    if (filters.max_amount) params.append('max_amount', filters.max_amount.toString());
    if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
    if (filters.search) params.append('search', filters.search);
    
    // Make the API request with query parameters
    const response = await api.get<PaginatedResponse<Transaction>>(
      'transactions/transactions/',
      { params }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * @function getTransaction
 * @description Fetch a single transaction by ID
 * 
 * @param {number} id - Transaction ID
 * @returns {Promise<Transaction>} Transaction details
 */
export const getTransaction = async (id: number): Promise<Transaction> => {
  try {
    const response = await api.get<Transaction>(`transactions/transactions/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    throw error;
  }
};

/**
 * @function createTransaction
 * @description Create a new transaction
 * 
 * This function sends a POST request to create a new transaction.
 * The user field is automatically set by the backend based on the authenticated user.
 * 
 * @param {TransactionFormData} transactionData - Transaction data
 * @returns {Promise<Transaction>} Created transaction
 */
export const createTransaction = async (
  transactionData: TransactionFormData
): Promise<Transaction> => {
  try {
    // Handle null category - Django expects null, not undefined
    const data = {
      ...transactionData,
      category: transactionData.category || null
    };
    
    const response = await api.post<Transaction>('transactions/transactions/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * @function updateTransaction
 * @description Update an existing transaction
 * 
 * @param {number} id - Transaction ID
 * @param {TransactionFormData} transactionData - Updated transaction data
 * @returns {Promise<Transaction>} Updated transaction
 */
export const updateTransaction = async (
  id: number,
  transactionData: TransactionFormData
): Promise<Transaction> => {
  try {
    // Handle null category - Django expects null, not undefined
    const data = {
      ...transactionData,
      category: transactionData.category || null
    };
    
    const response = await api.put<Transaction>(`transactions/transactions/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    throw error;
  }
};

/**
 * @function deleteTransaction
 * @description Delete a transaction
 * 
 * @param {number} id - Transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  try {
    await api.delete(`transactions/transactions/${id}/`);
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    throw error;
  }
};

/**
 * @function getCategories
 * @description Fetch all categories for the current user
 * 
 * @returns {Promise<Category[]>} List of categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[] | PaginatedResponse<Category>>('transactions/categories/');

    // Log the raw response from the backend to help diagnose mapping issues
    console.log('[TransactionService] Raw category response:', response.data);

    // Some APIs may wrap the categories inside a "data" property
    const data = (response as any).data?.data ?? response.data;

    if (Array.isArray(data)) {
      return data as Category[];
    }

    // Some DRF endpoints return paginated data shaped as { count, next, previous, results }
    if ('results' in data && Array.isArray((data as PaginatedResponse<Category>).results)) {
      return (data as PaginatedResponse<Category>).results;
    }

    // Other endpoints may return a plain array of categories
    console.warn('[TransactionService] Unexpected category payload shape:', data);
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * @function createCategory
 * @description Create a new category
 * 
 * @param {string} name - Category name
 * @returns {Promise<Category>} Created category
 */
export const createCategory = async (name: string): Promise<Category> => {
  try {
    const response = await api.post<Category>('transactions/categories/', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * @function deleteCategory
 * @description Delete a category
 * 
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`transactions/categories/${id}/`);
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};
