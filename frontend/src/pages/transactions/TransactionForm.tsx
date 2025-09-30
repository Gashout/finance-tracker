/**
 * @file TransactionForm.tsx
 * @description Form component for creating and editing transactions
 * 
 * This component provides a form for:
 * - Creating new transactions
 * - Editing existing transactions
 * 
 * It handles form validation, submission, and error display.
 * The same form is used for both create and edit operations,
 * with the form being pre-filled for edits.
 */

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui';
import { Label } from '../../components/ui/label';
import { 
  Transaction,
  TransactionType,
  TRANSACTION_TYPE_OPTIONS,
  Category
} from '../../types/transaction';
import { 
  createTransaction, 
  updateTransaction
} from '../../services/transactionService';
import { getAllCategories } from '../../services/categoryService';
import { Plus } from 'lucide-react';

/**
 * NOTE ABOUT VALIDATION APPROACH
 * --------------------------------
 * We previously relied on zod + react-hook-form for validation, but the
 * dependency chain became unstable after recent package corruption issues.
 * To keep the product usable while we stabilise the toolchain, we now perform
 * simple manual validation with HTML5 attributes and a lightweight helper.
 * Once dependencies are reliable again, we can revisit schema-based validation.
 */

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSuccess: () => void;
}

interface FormState {
  amount: string;
  description: string;
  date: string;
  transaction_type: TransactionType;
  category: string; // store as string for easier binding to select input
}

type FormErrors = Partial<Record<keyof FormState, string>>;

/**
 * @component TransactionForm
 * @description Form for creating and editing transactions
 * 
 * This component renders a modal dialog containing a form for transaction data.
 * It handles both creation of new transactions and editing of existing ones.
 * 
 * @param {TransactionFormProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  transaction,
  onSuccess
}) => {
  // Determine if we're editing or creating
  const isEditing = !!transaction;
  
  // State for categories (loaded from API)
  const [categories, setCategories] = useState<Category[]>([]);

  // State for API errors
  const [error, setError] = useState<string | null>(null);

  // State for form field-level validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // State for form values (string based for easier binding)
  const [formState, setFormState] = useState<FormState>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'EX',
    category: '',
  });

  // State for loading state during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Load categories when component mounts
   * 
   * @function fetchCategories
   * @description Fetches all categories for the dropdown
   * 
   * This function uses the categoryService to fetch all categories
   * for the current user, which are then displayed in the dropdown.
   * 
   * @error_handling
   * - Sets error state with user-friendly message on API failure
   * - Logs detailed error to console for debugging
   */
  useEffect(() => {
    // Fetch categories once when the modal is used so the dropdown has up-to-date options.
    // Data flow: API -> categoryService.getAllCategories -> setCategories -> dropdown map.
    const fetchCategories = async () => {
      try {
        console.log('[TransactionForm] Fetching categories for dropdown');
        const categoriesData = await getAllCategories();
        console.log('[TransactionForm] Categories received:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('[TransactionForm] Failed to load categories:', error);
        setError('Failed to load categories. Please try again.');
      }
    };

    fetchCategories();
  }, []);
  
  /**
   * Set form values when editing an existing transaction
   */
  useEffect(() => {
    if (isEditing && transaction) {
      setFormState({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        transaction_type: transaction.transaction_type,
        category: transaction.category ? transaction.category.toString() : '',
      });
    } else {
      setFormState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        transaction_type: 'EX',
        category: '',
      });
    }
    setFormErrors({});
  }, [isEditing, transaction, isOpen]);
  
  /**
   * @function onSubmit
   * @description Handle form submission
   * 
   * This function:
   * 1. Validates the form data
   * 2. Creates or updates the transaction via API
   * 3. Handles success and error states
   * 4. Closes the dialog on success
   * 
   * @param {any} data - Validated form data
   */
  // Handle change events for any input/select control and clear related inline errors.
  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    console.log(`[TransactionForm] Field change detected: ${field} ->`, value);
    setFormState(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Manual validation mirrors the old schema rules using simple conditions and HTML5 required attrs.
  // This keeps UX acceptable while the schema tooling is unavailable.
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Amount validation
    const amountValue = parseFloat(formState.amount);
    if (!formState.amount) {
      errors.amount = 'Amount is required';
    } else if (Number.isNaN(amountValue) || amountValue <= 0) {
      errors.amount = 'Please enter a positive amount';
    }

    // Description validation
    if (!formState.description.trim()) {
      errors.description = 'Description is required';
    }

    // Date validation
    if (!formState.date) {
      errors.date = 'Date is required';
    }

    // Transaction type validation
    if (!formState.transaction_type || !['IN', 'EX', 'TR'].includes(formState.transaction_type)) {
      errors.transaction_type = 'Please select a valid transaction type';
    }

    setFormErrors(errors);
    console.log('[TransactionForm] Validation errors:', errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler performs validation, assembles the payload, and calls the API.
  // We keep the payload typed to match the Django serializer expectations.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      console.warn('[TransactionForm] Manual validation failed:', formErrors);
      return;
    }

    setIsSubmitting(true);

    // Construct the payload in the shape expected by the Django API.
    const payload = {
      amount: parseFloat(formState.amount),
      description: formState.description.trim(),
      date: formState.date,
      transaction_type: formState.transaction_type,
      category: formState.category ? Number(formState.category) : null,
    };

    try {
      if (isEditing && transaction) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }

      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('Transaction submission error:', err);
      // Error handling informs the user and keeps the modal open for corrections.
      setError(err.response?.data?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Transaction form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Amount field */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formState.amount}
              onChange={handleInputChange('amount')}
              required
              aria-invalid={!!formErrors.amount}
              aria-describedby={formErrors.amount ? 'amount-error' : undefined}
            />
            {formErrors.amount && (
              <p id="amount-error" className="text-sm text-destructive">
                {formErrors.amount}
              </p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Transaction description"
              value={formState.description}
              onChange={handleInputChange('description')}
              required
              aria-invalid={!!formErrors.description}
              aria-describedby={formErrors.description ? 'description-error' : undefined}
            />
            {formErrors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formState.date}
              onChange={handleInputChange('date')}
              required
              aria-invalid={!!formErrors.date}
              aria-describedby={formErrors.date ? 'date-error' : undefined}
            />
            {formErrors.date && (
              <p id="date-error" className="text-sm text-destructive">
                {formErrors.date}
              </p>
            )}
          </div>

          {/* Transaction type field */}
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type</Label>
            <select
              id="transaction_type"
              name="transaction_type"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formState.transaction_type}
              onChange={handleInputChange('transaction_type')}
              required
              aria-invalid={!!formErrors.transaction_type}
              aria-describedby={formErrors.transaction_type ? 'transaction-type-error' : undefined}
            >
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.transaction_type && (
              <p id="transaction-type-error" className="text-sm text-destructive">
                {formErrors.transaction_type}
              </p>
            )}
          </div>

          {/* Category dropdown populated from API results */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formState.category}
              onChange={handleInputChange('category')}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Form actions */}
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
              className="flex items-center gap-1"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
              {!isEditing && !isSubmitting && <Plus className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
