/**
 * @file CategoryForm.tsx
 * @description Form component for creating and editing categories
 *
 * This component provides a dialog with a form for adding new categories
 * or editing existing ones. It includes validation and error handling.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui';
import { Loader2 } from 'lucide-react';
import { Category } from '../../types/transaction';
import { createCategory, updateCategory } from '../../services/categoryService';

/**
 * @interface CategoryFormProps
 * @description Props for the CategoryForm component
 * 
 * @property {boolean} isOpen - Whether the dialog is open
 * @property {() => void} onClose - Function to call when the dialog is closed
 * @property {() => void} onSuccess - Function to call when the form is submitted successfully
 * @property {Category | null} category - Category to edit (null for new category)
 */
interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

/**
 * @interface CategoryFormValues
 * @description Form values for the category form
 * 
 * @property {string} name - Category name
 */
interface CategoryFormValues {
  name: string;
}

/**
 * @constant categoryFormSchema
 * @description Zod schema for category form validation
 * 
 * @validation_rules
 * - Name is required
 * - Name must be at least 2 characters
 * - Name must be at most 100 characters (matches Django model constraint)
 */
const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters' })
    .max(100, { message: 'Category name must be at most 100 characters' })
    .refine(name => name.trim().length > 0, { message: 'Category name cannot be empty' }),
});

/**
 * @component CategoryForm
 * @description Dialog form for creating and editing categories
 * 
 * This component provides a modal dialog with a form for adding or editing
 * categories. It handles form validation, submission, and error display.
 * 
 * @param {CategoryFormProps} props - Component props
 * @returns {JSX.Element} The category form dialog component
 */
const CategoryForm: React.FC<CategoryFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  category 
}) => {
  // State for form submission and error handling
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Determine if we're editing an existing category or creating a new one
  const isEditing = !!category;
  
  // Initialize react-hook-form with zod validation
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  });
  
  // Update form values when editing an existing category
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [category, form]);

  /**
   * @function onSubmit
   * @description Form submission handler
   * 
   * This function is called when the form is submitted. It creates a new
   * category or updates an existing one based on the isEditing flag.
   * 
   * @param {CategoryFormValues} data - Form data
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets error state with user-friendly message on API failure
   * - Handles validation errors from the API
   * - Logs detailed error to console for debugging
   */
  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditing && category) {
        // Update existing category
        await updateCategory(category.id, data);
        console.log(`[CategoryForm] Updated category: ${data.name}`);
      } else {
        // Create new category
        await createCategory(data);
        console.log(`[CategoryForm] Created new category: ${data.name}`);
      }
      
      // Call success callback to refresh the category list
      onSuccess();
    } catch (err: any) {
      console.error('[CategoryForm] Form submission error:', err);
      
      // Handle API error responses
      if (err.response?.data?.name) {
        setError(`Name error: ${err.response.data.name[0]}`);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the category details below.' 
              : 'Enter the details for your new category.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
