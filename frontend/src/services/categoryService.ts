/**
 * @file categoryService.ts
 * @description Service for managing category-related API operations
 *
 * This service provides functions for CRUD operations on categories:
 * - Fetching categories (with pagination and filtering)
 * - Creating new categories
 * - Updating existing categories
 * - Deleting categories
 * - Getting category usage statistics
 */

import api from './api';
import { Category, PaginatedResponse } from '../types/transaction';

/**
 * @interface CategoryWithUsage
 * @description Extended Category interface that includes usage statistics
 * 
 * This interface adds a count of how many transactions are associated with each category,
 * which is useful for showing usage information and warning before deletion.
 * 
 * @extends Category
 * @property {number} usage_count - Number of transactions using this category
 */
export interface CategoryWithUsage extends Category {
  usage_count: number;
}

/**
 * @interface CategoryFormData
 * @description Data structure for category creation/editing forms
 * 
 * This interface defines the shape of data used in forms when creating
 * or editing categories. It excludes server-generated fields like id and user.
 */
export interface CategoryFormData {
  name: string;
}

/**
 * @function getCategories
 * @description Fetch paginated list of categories
 * 
 * This function retrieves categories with optional pagination and filtering.
 * 
 * @param {number} [page=1] - Page number for pagination
 * @param {string} [search] - Optional search term to filter categories by name
 * @returns {Promise<PaginatedResponse<Category>>} Paginated list of categories
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const getCategories = async (
  page: number = 1,
  search?: string
): Promise<PaginatedResponse<Category>> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (search) {
      params.append('search', search);
    }
    
    console.log(`[categoryService] Fetching categories: page=${page}, search=${search || 'none'}`);
    
    const response = await api.get<PaginatedResponse<Category>>(
      `/transactions/categories/?${params.toString()}`
    );
    
    console.log(`[categoryService] Fetched ${response.data.results.length} categories`);
    return response.data;
  } catch (error: any) {
    console.error('[categoryService] Error fetching categories:', error);
    
    // Log more detailed error information if available
    if (error.response?.data) {
      console.error('[categoryService] Server response:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * @function getAllCategories
 * @description Fetch all categories (unpaginated)
 * 
 * This function is useful for populating dropdowns and other UI elements
 * that need the complete list of categories.
 * 
 * @returns {Promise<Category[]>} Complete list of categories
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    console.log('[categoryService] Fetching all categories');
    
    // Request a large page size to get all categories in one request
    const response = await api.get<PaginatedResponse<Category>>(
      '/transactions/categories/?page_size=1000'
    );
    
    console.log(`[categoryService] Fetched ${response.data.results.length} categories`);
    return response.data.results;
  } catch (error: any) {
    console.error('[categoryService] Error fetching all categories:', error);
    throw error;
  }
};

/**
 * @function getCategoryWithUsage
 * @description Fetch a single category with its usage count
 * 
 * This function retrieves a specific category by ID and calculates
 * how many transactions are associated with it.
 * 
 * @param {number} id - Category ID
 * @returns {Promise<CategoryWithUsage>} Category with usage statistics
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const getCategoryWithUsage = async (id: number): Promise<CategoryWithUsage> => {
  try {
    console.log(`[categoryService] Fetching category with ID: ${id}`);
    
    // First, get the category details
    const categoryResponse = await api.get<Category>(`/transactions/categories/${id}/`);
    
    // Then, get transactions that use this category to count them
    const transactionsResponse = await api.get(
      `/transactions/transactions/?category=${id}&page_size=1`
    );
    
    // Create the enhanced category object with usage count
    const categoryWithUsage: CategoryWithUsage = {
      ...categoryResponse.data,
      usage_count: transactionsResponse.data.count || 0
    };
    
    console.log(`[categoryService] Category "${categoryWithUsage.name}" has ${categoryWithUsage.usage_count} transactions`);
    return categoryWithUsage;
  } catch (error: any) {
    console.error(`[categoryService] Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * @function createCategory
 * @description Create a new category
 * 
 * This function sends a POST request to create a new category.
 * The user field is automatically assigned by the backend.
 * 
 * @param {CategoryFormData} categoryData - Category data (name)
 * @returns {Promise<Category>} The created category
 * 
 * @error_handling
 * - Validates input before submission
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  try {
    // Basic client-side validation
    if (!categoryData.name || categoryData.name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters long');
    }
    
    console.log(`[categoryService] Creating new category: ${categoryData.name}`);
    
    const response = await api.post<Category>('/transactions/categories/', categoryData);
    
    console.log(`[categoryService] Category created with ID: ${response.data.id}`);
    return response.data;
  } catch (error: any) {
    console.error('[categoryService] Error creating category:', error);
    
    // Handle validation errors from the server
    if (error.response?.data?.name) {
      console.error(`[categoryService] Name validation error: ${error.response.data.name}`);
    }
    
    throw error;
  }
};

/**
 * @function updateCategory
 * @description Update an existing category
 * 
 * This function sends a PUT request to update a category's properties.
 * 
 * @param {number} id - Category ID to update
 * @param {CategoryFormData} categoryData - Updated category data
 * @returns {Promise<Category>} The updated category
 * 
 * @error_handling
 * - Validates input before submission
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const updateCategory = async (
  id: number,
  categoryData: CategoryFormData
): Promise<Category> => {
  try {
    // Basic client-side validation
    if (!categoryData.name || categoryData.name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters long');
    }
    
    console.log(`[categoryService] Updating category ${id}: ${categoryData.name}`);
    
    const response = await api.put<Category>(
      `/transactions/categories/${id}/`,
      categoryData
    );
    
    console.log(`[categoryService] Category ${id} updated successfully`);
    return response.data;
  } catch (error: any) {
    console.error(`[categoryService] Error updating category ${id}:`, error);
    
    // Handle validation errors from the server
    if (error.response?.data?.name) {
      console.error(`[categoryService] Name validation error: ${error.response.data.name}`);
    }
    
    throw error;
  }
};

/**
 * @function deleteCategory
 * @description Delete a category
 * 
 * This function sends a DELETE request to remove a category.
 * Note that this will set the category field to null for all associated transactions.
 * 
 * @param {number} id - Category ID to delete
 * @returns {Promise<void>}
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    console.log(`[categoryService] Deleting category ${id}`);
    
    await api.delete(`/transactions/categories/${id}/`);
    
    console.log(`[categoryService] Category ${id} deleted successfully`);
  } catch (error: any) {
    console.error(`[categoryService] Error deleting category ${id}:`, error);
    
    // Log detailed error information
    if (error.response?.data) {
      console.error('[categoryService] Server response:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * @function getCategoryUsage
 * @description Get usage statistics for all categories
 * 
 * This function retrieves all categories and calculates usage statistics
 * for each one by counting associated transactions.
 * 
 * @returns {Promise<CategoryWithUsage[]>} List of categories with usage statistics
 * 
 * @error_handling
 * - Logs errors to console for debugging
 * - Throws the error for the caller to handle and display appropriate messages
 */
export const getCategoryUsage = async (): Promise<CategoryWithUsage[]> => {
  try {
    console.log('[categoryService] Fetching category usage statistics');
    
    // Get all categories
    const categories = await getAllCategories();
    
    // For each category, get the count of transactions
    const categoriesWithUsage = await Promise.all(
      categories.map(async (category) => {
        // Get transaction count for this category
        const transactionsResponse = await api.get(
          `/transactions/transactions/?category=${category.id}&page_size=1`
        );
        
        // Return enhanced category object
        return {
          ...category,
          usage_count: transactionsResponse.data.count || 0
        };
      })
    );
    
    console.log(`[categoryService] Fetched usage statistics for ${categoriesWithUsage.length} categories`);
    return categoriesWithUsage;
  } catch (error: any) {
    console.error('[categoryService] Error fetching category usage:', error);
    throw error;
  }
};
