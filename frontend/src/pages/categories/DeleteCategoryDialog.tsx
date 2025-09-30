/**
 * @file DeleteCategoryDialog.tsx
 * @description Confirmation dialog for category deletion
 *
 * This component provides a dialog for confirming category deletion.
 * It shows usage information and warns about the consequences of deletion.
 */

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui';
import { Loader2, AlertTriangle } from 'lucide-react';
import { CategoryWithUsage, deleteCategory } from '../../services/categoryService';

/**
 * @interface DeleteCategoryDialogProps
 * @description Props for the DeleteCategoryDialog component
 * 
 * @property {boolean} isOpen - Whether the dialog is open
 * @property {() => void} onClose - Function to call when the dialog is closed
 * @property {() => void} onConfirm - Function to call when deletion is confirmed and completed
 * @property {CategoryWithUsage | null} category - Category to delete
 */
interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryWithUsage | null;
}

/**
 * @component DeleteCategoryDialog
 * @description Dialog for confirming category deletion
 * 
 * This component shows a confirmation dialog with information about
 * the category's usage and the consequences of deletion.
 * 
 * @param {DeleteCategoryDialogProps} props - Component props
 * @returns {JSX.Element} The delete confirmation dialog component
 */
const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  category 
}) => {
  // State for deletion process and error handling
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function handleDelete
   * @description Handles the category deletion process
   * 
   * This function is called when the user confirms deletion.
   * It sends a DELETE request to the API and handles the response.
   * 
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets error state with user-friendly message on API failure
   * - Logs detailed error to console for debugging
   */
  const handleDelete = async () => {
    if (!category) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteCategory(category.id);
      console.log(`[DeleteCategoryDialog] Deleted category: ${category.name}`);
      onConfirm();
    } catch (err: any) {
      console.error(`[DeleteCategoryDialog] Failed to delete category ${category.id}:`, err);
      
      // Handle API error responses
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred while deleting the category.');
      }
      
      setIsDeleting(false);
    }
  };

  // Don't render if no category is provided
  if (!category) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Delete Category
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the category "{category.name}"?
          </DialogDescription>
        </DialogHeader>
        
        {/* Usage warning */}
        <div className="py-4">
          {category.usage_count > 0 ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTitle className="text-amber-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning: This category is in use
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                This category is used in {category.usage_count} {category.usage_count === 1 ? 'transaction' : 'transactions'}.
                If you delete it, these transactions will be uncategorized.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              This category is not used in any transactions and can be safely deleted.
            </p>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
