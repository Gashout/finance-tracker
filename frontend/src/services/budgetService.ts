/**
 * @file budgetService.ts
 * @description API helpers for interacting with Budget endpoints.
 *
 * Each function encapsulates a REST call and centralises error handling,
 * so components can focus on presentation logic.
 */

import api from './api'
import { Budget, BudgetRequest } from '../types'

/**
 * @function getBudgets
 * @description Fetch paginated budgets for the authenticated user.
 * @param page - page number for pagination (defaults to 1)
 * @returns Promise resolving to a list of budgets with pagination metadata.
 */
export const getBudgets = async (page = 1) => {
  try {
    const response = await api.get(`/budgets/budgets/?page=${page}`)
    return response.data
  } catch (error) {
    console.error('[budgetService] Failed to fetch budgets:', error)
    throw error
  }
}

/**
 * Normalise the payload before sending it to the API.
 * Ensures numeric fields are numbers and optional fields are null instead of undefined.
 */
const normaliseBudgetPayload = (payload: BudgetRequest) => ({
  category: payload.category ?? null,
  amount: Number(payload.amount),
  month: Number(payload.month),
  year: Number(payload.year),
});

/**
 * Shared helper to surface Django validation errors in a readable way.
 * Logs the full response object while returning a concise error.
 */
const handleBudgetError = (context: string, error: any) => {
  if (error.response) {
    console.error(`[budgetService] ${context} failed with status`, error.response.status);
    console.error('[budgetService] Response data:', error.response.data);
    throw error.response.data;
  }

  console.error(`[budgetService] ${context} failed with network error:`, error);
  throw error;
};

/**
 * @function createBudget
 * @description Create a new budget entry for the current user.
 * @param payload - BudgetRequest containing category, amount, month, year.
 * @returns Promise resolving to the created Budget.
 *
 * @error_handling
 * - On success: Returns the created budget object from Django API response
 * - On error: Throws the Django validation error response for UI handling
 * - All error cases are handled by handleBudgetError which logs and re-throws
 */
export const createBudget = async (payload: BudgetRequest): Promise<Budget> => {
  const requestBody = normaliseBudgetPayload(payload);
  console.log('[budgetService] Creating budget with payload:', requestBody);
  try {
    const response = await api.post('/budgets/budgets/', requestBody);
    return response.data;
  } catch (error) {
    handleBudgetError('Create budget', error);
    // This line is never reached since handleBudgetError always throws
    throw new Error('Budget creation failed');
  }
};

/**
 * @function updateBudget
 * @description Update an existing budget entry.
 * @param id - Budget ID to update.
 * @param payload - BudgetRequest updates.
 * @returns Promise resolving to the updated Budget.
 *
 * @error_handling
 * - On success: Returns the updated budget object from Django API response
 * - On error: Throws the Django validation error response for UI handling
 * - All error cases are handled by handleBudgetError which logs and re-throws
 */
export const updateBudget = async (id: number, payload: BudgetRequest): Promise<Budget> => {
  const requestBody = normaliseBudgetPayload(payload);
  console.log(`[budgetService] Updating budget ${id} with payload:`, requestBody);
  try {
    const response = await api.put(`/budgets/budgets/${id}/`, requestBody);
    return response.data;
  } catch (error) {
    handleBudgetError('Update budget', error);
    // This line is never reached since handleBudgetError always throws
    throw new Error('Budget update failed');
  }
};

/**
 * @function deleteBudget
 * @description Remove an existing budget entry.
 * @param id - Budget ID to delete.
 */
export const deleteBudget = async (id: number): Promise<void> => {
  try {
    await api.delete(`/budgets/budgets/${id}/`)
  } catch (error) {
    console.error('[budgetService] Failed to delete budget:', error)
    throw error
  }
}

// Note: We intentionally omit a `getBudgetProgress` helper because the backend
// does not yet provide a dedicated progress endpoint. The frontend calculates
// spending metrics using `getBudgets` + transaction data.
