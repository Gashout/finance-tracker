/**
 * @file TransactionList.tsx
 * @description Component for displaying and managing transactions in a table
 * 
 * This component renders a table of transactions with:
 * - Pagination
 * - Sorting
 * - Row actions (edit, delete)
 * - Visual indicators for transaction types
 * 
 * It uses the shadcn/ui Table component for consistent styling and accessibility.
 */

import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from '../../components/ui';
import { 
  Edit, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { 
  Transaction,
  TransactionType,
  formatCurrency,
  getTransactionTypeLabel
} from '../../types/transaction';
import { deleteTransaction } from '../../services/transactionService';

/**
 * Props for the TransactionList component
 * 
 * @property {Transaction[]} transactions - Array of transactions to display
 * @property {number} totalCount - Total number of transactions (for pagination)
 * @property {number} currentPage - Current page number
 * @property {number} pageSize - Number of items per page
 * @property {Function} onPageChange - Callback when page is changed
 * @property {Function} onEditTransaction - Callback when transaction edit is requested
 * @property {Function} onTransactionDeleted - Callback when transaction is deleted
 */
interface TransactionListProps {
  transactions: Transaction[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onTransactionDeleted: () => void;
}

/**
 * @component TransactionList
 * @description Displays transactions in a table with pagination and actions
 * 
 * This component renders the transaction data in a table format with:
 * - Visual indicators for transaction types (income/expense/transfer)
 * - Formatted currency values
 * - Action buttons for each row
 * - Pagination controls
 * 
 * @param {TransactionListProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onEditTransaction,
  onTransactionDeleted
}) => {
  // State for transaction being deleted (for confirmation)
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);
  
  /**
   * @function handleDelete
   * @description Handle transaction deletion with confirmation
   * 
   * @param {number} id - ID of transaction to delete
   */
  const handleDelete = async (id: number) => {
    if (deletingId === id) {
      try {
        await deleteTransaction(id);
        setDeletingId(null);
        onTransactionDeleted();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setDeletingId(null);
      }
    } else {
      // First click - show confirmation
      setDeletingId(id);
    }
  };
  
  /**
   * @function getTransactionTypeIcon
   * @description Get appropriate icon for transaction type
   * 
   * @param {TransactionType} type - Transaction type
   * @returns {React.ReactNode} Icon component
   */
  const getTransactionTypeIcon = (type: TransactionType): React.ReactNode => {
    switch (type) {
      case 'IN':
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'EX':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'TR':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <></>;
    }
  };
  
  /**
   * @function getTransactionTypeBadge
   * @description Get appropriate badge for transaction type
   * 
   * @param {TransactionType} type - Transaction type
   * @returns {React.ReactNode} Badge component
   */
  const getTransactionTypeBadge = (type: TransactionType): React.ReactNode => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    switch (type) {
      case 'IN':
        variant = "default"; // Green
        break;
      case 'EX':
        variant = "destructive"; // Red
        break;
      case 'TR':
        variant = "secondary"; // Gray
        break;
    }
    
    return (
      <Badge variant={variant}>
        {getTransactionTypeLabel(type)}
      </Badge>
    );
  };
  
  /**
   * @function formatDate
   * @description Format date string for display
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Transaction table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No transactions found. Add a new transaction to get started.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  {/* Date */}
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  
                  {/* Description with icon */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionTypeIcon(transaction.transaction_type)}
                      <span>{transaction.description}</span>
                    </div>
                  </TableCell>
                  
                  {/* Category */}
                  <TableCell>
                    {transaction.category_detail?.name || 'Uncategorized'}
                  </TableCell>
                  
                  {/* Transaction type */}
                  <TableCell>
                    {getTransactionTypeBadge(transaction.transaction_type)}
                  </TableCell>
                  
                  {/* Amount with color based on type */}
                  <TableCell className={`text-right font-medium ${
                    transaction.transaction_type === 'IN' 
                      ? 'text-green-600' 
                      : transaction.transaction_type === 'EX' 
                        ? 'text-red-600' 
                        : ''
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  
                  {/* Action buttons */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTransaction(transaction)}
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      {/* Delete button with confirmation state */}
                      <Button
                        variant={deletingId === transaction.id ? "destructive" : "ghost"}
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        title={deletingId === transaction.id ? "Click again to confirm" : "Delete transaction"}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          {deletingId === transaction.id ? "Confirm delete" : "Delete"}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          {/* Page info */}
          <p className="text-sm text-gray-500">
            Showing {startItem} to {endItem} of {totalCount} transactions
          </p>
          
          {/* Page navigation */}
          <div className="flex gap-1">
            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {/* Page number indicator */}
            <Button variant="outline" size="sm" disabled>
              Page {currentPage} of {totalPages}
            </Button>
            
            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
