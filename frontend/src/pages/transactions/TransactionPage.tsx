/**
 * @file TransactionPage.tsx
 * @description Main transactions page component
 * 
 * This component serves as the main page for transaction management, combining:
 * - Transaction filtering
 * - Transaction listing
 * - Transaction creation and editing
 * 
 * It manages the overall state of the transactions view and coordinates
 * between the child components.
 */

import React, { useState, useEffect } from 'react';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui';
import { Plus, RefreshCw } from 'lucide-react';
import TransactionFilters from './TransactionFilters';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import { 
  Transaction,
  TransactionFilters as FiltersType,
  PaginatedResponse
} from '../../types/transaction';
import { getTransactions } from '../../services/transactionService';

/**
 * @component TransactionPage
 * @description Main page for transaction management
 * 
 * This component orchestrates the transaction management interface:
 * - Fetches transaction data from the API
 * - Manages filtering state
 * - Handles pagination
 * - Coordinates transaction creation, editing, and deletion
 * 
 * @returns {JSX.Element} Rendered component
 */
const TransactionPage: React.FC = () => {
  // State for transactions data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // Fixed page size
  
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState<FiltersType>({});
  
  // State for transaction form
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  /**
   * @function fetchTransactions
   * @description Fetch transactions from the API with current filters and pagination
   * 
   * This function:
   * 1. Sets loading state
   * 2. Calls the API with current filters and pagination
   * 3. Updates the transactions state
   * 4. Handles errors
   * 5. Clears loading state
   */
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: PaginatedResponse<Transaction> = await getTransactions(filters, currentPage);
      setTransactions(response.results);
      setTotalCount(response.count);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Fetch transactions when component mounts or dependencies change
   */
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);
  
  /**
   * @function handleFilterChange
   * @description Update filters and reset to first page
   * 
   * @param {FiltersType} newFilters - New filter values
   */
  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  /**
   * @function handleResetFilters
   * @description Clear all filters and reset to first page
   */
  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };
  
  /**
   * @function handlePageChange
   * @description Change the current page
   * 
   * @param {number} page - New page number
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  /**
   * @function handleAddTransaction
   * @description Open the transaction form for adding a new transaction
   */
  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };
  
  /**
   * @function handleEditTransaction
   * @description Open the transaction form for editing an existing transaction
   * 
   * @param {Transaction} transaction - Transaction to edit
   */
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  /**
   * @function handleFormClose
   * @description Close the transaction form
   */
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };
  
  /**
   * @function handleTransactionSuccess
   * @description Handle successful transaction creation/update
   */
  const handleTransactionSuccess = () => {
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        
        <div className="flex gap-2">
          {/* Refresh button */}
          <Button 
            variant="outline"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* Add transaction button */}
          <Button onClick={handleAddTransaction} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>
      
      {/* Transaction filters */}
      <TransactionFilters 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
      
      {/* Transactions content */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            // Error state
            <div className="py-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchTransactions}>
                Try Again
              </Button>
            </div>
          ) : (
            // Transaction list
            <TransactionList
              transactions={transactions}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onEditTransaction={handleEditTransaction}
              onTransactionDeleted={handleTransactionSuccess}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Transaction form modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        transaction={editingTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default TransactionPage;
