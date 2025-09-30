/**
 * @file CategoryPage.tsx
 * @description Main category management page component
 *
 * This component provides a comprehensive category management interface with:
 * 1. List view of all categories with usage statistics
 * 2. Search and pagination functionality
 * 3. Add/Edit/Delete operations with proper validation
 * 4. Confirmation dialogs for destructive operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { Category } from '../../types/transaction';
import { CategoryWithUsage, getCategories, getCategoryUsage } from '../../services/categoryService';
import CategoryForm from './CategoryForm';
import DeleteCategoryDialog from './DeleteCategoryDialog';

/**
 * @component CategoryPage
 * @description Main category management page component
 * 
 * This component serves as the container for the category management interface.
 * It handles:
 * - Fetching and displaying categories
 * - Search functionality
 * - Pagination
 * - Opening add/edit/delete dialogs
 * 
 * @returns {JSX.Element} The category page component
 */
const CategoryPage: React.FC = () => {
  // State for categories data and pagination
  const [categories, setCategories] = useState<CategoryWithUsage[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  
  // State for loading and error handling
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for category form dialog
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithUsage | null>(null);

  /**
   * @function fetchCategories
   * @description Fetches categories from the API with optional search and pagination
   * 
   * This function retrieves categories and their usage statistics.
   * 
   * @param {number} page - Page number for pagination
   * @param {string} search - Optional search term
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets error state with user-friendly message on API failure
   * - Logs detailed error to console for debugging
   */
  const fetchCategories = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the paginated categories
      const categoriesResponse = await getCategories(page, search);
      
      // Then get usage statistics for all categories
      // This is more efficient than making separate API calls for each category
      const categoriesWithUsage = await getCategoryUsage();
      
      // Merge the paginated results with usage statistics
      const enhancedCategories = categoriesResponse.results.map(category => {
        const withUsage = categoriesWithUsage.find(c => c.id === category.id);
        return {
          ...category,
          usage_count: withUsage?.usage_count || 0
        };
      });
      
      // Update state with the enhanced categories and pagination info
      setCategories(enhancedCategories);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(categoriesResponse.count / 10), // Assuming page size of 10
        totalItems: categoriesResponse.count,
      });
      
      console.log(`[CategoryPage] Loaded ${enhancedCategories.length} categories`);
    } catch (err: any) {
      console.error('[CategoryPage] Failed to fetch categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories on component mount and when search/page changes
  useEffect(() => {
    fetchCategories(pagination.currentPage, debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, debouncedSearchTerm]);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search changes
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.currentPage]);

  /**
   * @function handleSearchChange
   * @description Handles changes to the search input
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   * @returns {void}
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  /**
   * @function handlePageChange
   * @description Handles pagination navigation
   * 
   * @param {number} newPage - The page number to navigate to
   * @returns {void}
   */
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  /**
   * @function handleAddCategory
   * @description Opens the category form dialog for adding a new category
   * 
   * @returns {void}
   */
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  /**
   * @function handleEditCategory
   * @description Opens the category form dialog for editing an existing category
   * 
   * @param {Category} category - The category to edit
   * @returns {void}
   */
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  /**
   * @function handleDeleteClick
   * @description Opens the delete confirmation dialog
   * 
   * @param {CategoryWithUsage} category - The category to delete
   * @returns {void}
   */
  const handleDeleteClick = (category: CategoryWithUsage) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  /**
   * @function handleFormClose
   * @description Closes the category form dialog
   * 
   * @returns {void}
   */
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  /**
   * @function handleFormSubmitSuccess
   * @description Handles successful form submission (create or update)
   * 
   * Refreshes the category list to show the latest data.
   * 
   * @returns {void}
   */
  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    fetchCategories(pagination.currentPage, debouncedSearchTerm);
  };

  /**
   * @function handleDeleteSuccess
   * @description Handles successful category deletion
   * 
   * Refreshes the category list to show the latest data.
   * 
   * @returns {void}
   */
  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    fetchCategories(pagination.currentPage, debouncedSearchTerm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <Button 
          onClick={handleAddCategory} 
          className="mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>
            {pagination.totalItems} {pagination.totalItems === 1 ? 'category' : 'categories'} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No categories match your search' : 'No categories found. Create your first category!'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        {category.usage_count} {category.usage_count === 1 ? 'transaction' : 'transactions'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="py-2 px-3">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSubmitSuccess}
        category={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteSuccess}
        category={categoryToDelete}
      />
    </div>
  );
};

export default CategoryPage;
