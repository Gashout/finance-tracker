import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertTitle,
  AlertDescription
} from '../components/ui';
import { Transaction, formatCurrency } from '../types/transaction';
import { Budget, BudgetProgress } from '../types';
import { getTransactions } from '../services/transactionService';
import { getBudgets } from '../services/budgetService';

/**
 * @interface FinancialSummary
 * @description Summary of financial metrics calculated from transactions
 * 
 * @property {number} totalBalance - Net balance (income - expenses)
 * @property {number} monthlyIncome - Total income for the current month
 * @property {number} monthlyExpenses - Total expenses for the current month
 */
interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

/**
 * @interface CategorySpending
 * @description Spending amount for a specific category
 * 
 * @property {number} categoryId - Category identifier
 * @property {string} name - Category name
 * @property {number} amount - Total spending amount
 * @property {number} percentage - Percentage of total spending
 */
interface CategorySpending {
  categoryId: number;
  name: string;
  amount: number;
  percentage: number;
}



/**
 * @function getFirstDayOfMonth
 * @description Returns the first day of the current month in YYYY-MM-DD format
 * 
 * @returns {string} First day of current month (YYYY-MM-DD)
 */
const getFirstDayOfMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * @function getLastDayOfMonth
 * @description Returns the last day of the current month in YYYY-MM-DD format
 * 
 * @returns {string} Last day of current month (YYYY-MM-DD)
 */
const getLastDayOfMonth = (): string => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
};

/**
 * @function getCurrentMonth
 * @description Returns the current month as a number (1-12)
 * 
 * @returns {number} Current month (1-12)
 */
const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

/**
 * @function getCurrentYear
 * @description Returns the current year as a number
 * 
 * @returns {number} Current year
 */
const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * @component Dashboard
 * @description Main dashboard component showing financial overview
 * 
 * This component fetches and calculates:
 * - Financial summary metrics (balance, income, expenses)
 * - Recent transactions
 * - Budget status with progress indicators
 * - Spending breakdown by category
 * - Income vs expenses comparison
 * 
 * It also provides a refresh button to update all data on demand.
 * 
 * @returns {JSX.Element} The dashboard component
 */
const Dashboard: React.FC = () => {
  // State for financial data
  const [summary, setSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * @function fetchAllTransactions
   * @description Fetches all transactions from the API, handling pagination
   * 
   * This function retrieves all transactions by making multiple API calls
   * if necessary to handle pagination. It returns a complete array of transactions.
   * 
   * @param {Object} filters - Optional filters to apply to the transaction query
   * @returns {Promise<Transaction[]>} Array of all transactions
   * 
   * @error_handling
   * - Logs any API errors to the console
   * - Throws the error for the caller to handle
   */
  const fetchAllTransactions = async (filters = {}): Promise<Transaction[]> => {
    try {
      console.log('[Dashboard] Fetching all transactions with filters:', filters);
      const results: Transaction[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await getTransactions(filters, page);
        results.push(...response.results);
        hasNext = !!response.next;
        page++;
      }

      console.log(`[Dashboard] Fetched ${results.length} transactions`);
      return results;
    } catch (error) {
      console.error('[Dashboard] Error fetching all transactions:', error);
      throw error;
    }
  };

  /**
   * @function fetchAllBudgets
   * @description Fetches every budget record available via the existing paginated list API.
   *
   * We intentionally reuse the standard `getBudgets` endpoint rather than creating a new
   * "progress" API on the backend. This keeps the frontend aligned with the currently
   * supported Django views and avoids 404 errors from non-existent routes.
   *
   * @returns {Promise<Budget[]>} Array of all budgets for the authenticated user
   *
   * @error_handling
   * - Logs API errors for debugging
   * - Re-throws so callers can surface friendly UI messages
   */
  const fetchAllBudgets = async (): Promise<Budget[]> => {
    try {
      console.log('[Dashboard] Fetching all budgets using paginated API');
      const results: Budget[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await getBudgets(page);
        const items = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response)
            ? response
            : [];

        results.push(...items);
        hasNext = Boolean(response?.next);
        page += 1;
      }

      console.log(`[Dashboard] Fetched ${results.length} budgets`);
      return results;
    } catch (error) {
      console.error('[Dashboard] Error fetching budgets:', error);
      throw error;
    }
  };

  /**
   * @function calculateFinancialSummary
   * @description Calculates financial summary metrics from transactions
   * 
   * This function processes all transactions to calculate:
   * - Total balance (net of all income and expenses)
   * - Monthly income (sum of income transactions for current month)
   * - Monthly expenses (sum of expense transactions for current month)
   * 
   * @param {Transaction[]} allTransactions - All transactions to analyze
   * @param {Transaction[]} monthlyTransactions - Transactions for the current month
   * @returns {FinancialSummary} Calculated financial metrics
   * 
   * @data_aggregation
   * - Processes each transaction based on its type (income, expense, transfer)
   * - Calculates running totals for different metrics
   * - Handles edge cases like transfers which shouldn't affect the total balance
   */
  const calculateFinancialSummary = (
    allTransactions: Transaction[],
    monthlyTransactions: Transaction[]
  ): FinancialSummary => {
    console.log('[Dashboard] Calculating financial summary');
    
    // Calculate total balance from all transactions
    const totalBalance = allTransactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.transaction_type === 'IN') {
        return sum + amount;
      } else if (transaction.transaction_type === 'EX') {
        return sum - amount;
      }
      // Transfers don't affect total balance
      return sum;
    }, 0);

    // Calculate monthly income and expenses
    const { income, expenses } = monthlyTransactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.transaction_type === 'IN') {
          acc.income += amount;
        } else if (transaction.transaction_type === 'EX') {
          acc.expenses += amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    console.log('[Dashboard] Financial summary calculated:', {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses
    });

    return {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses
    };
  };

  /**
   * @function calculateCategorySpending
   * @description Calculates spending by category for the current month
   * 
   * This function processes monthly expense transactions to calculate:
   * - Total spending per category
   * - Percentage of total spending per category
   * 
   * @param {Transaction[]} monthlyTransactions - Transactions for the current month
   * @returns {CategorySpending[]} Spending breakdown by category
   * 
   * @data_aggregation
   * - Groups transactions by category
   * - Calculates total spending per category
   * - Calculates percentage of total spending
   * - Sorts categories by spending amount (descending)
   */
  const calculateCategorySpending = (monthlyTransactions: Transaction[]): CategorySpending[] => {
    console.log('[Dashboard] Calculating category spending');
    
    // Filter for expense transactions only
    const expenseTransactions = monthlyTransactions.filter(
      transaction => transaction.transaction_type === 'EX'
    );
    
    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
    
    // Group by category and calculate totals
    const categoryMap = new Map<number | string, { name: string; amount: number }>();
    
    expenseTransactions.forEach(transaction => {
      const categoryId = transaction.category || 'uncategorized';
      const categoryName = transaction.category_detail?.name || 'Uncategorized';
      const amount = Number(transaction.amount);
      
      if (categoryMap.has(categoryId)) {
        const category = categoryMap.get(categoryId)!;
        categoryMap.set(categoryId, {
          name: category.name,
          amount: category.amount + amount
        });
      } else {
        categoryMap.set(categoryId, { name: categoryName, amount });
      }
    });
    
    // Convert to array and calculate percentages
    const result: CategorySpending[] = Array.from(categoryMap.entries()).map(([categoryId, { name, amount }]) => ({
      categoryId: typeof categoryId === 'number' ? categoryId : 0,
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
    
    // Sort by amount (descending)
    result.sort((a, b) => b.amount - a.amount);
    
    console.log(`[Dashboard] Category spending calculated: ${result.length} categories`);
    return result;
  };

  /**
   * @function calculateBudgetProgress
   * @description Calculates budget utilisation using the monthly transaction dataset.
   *
   * @param {Budget[]} budgetList - Budgets to evaluate (typically current month/year)
   * @param {Transaction[]} monthlyTransactions - Transactions within the active month
   * @returns {BudgetProgress[]} Progress records combining budget targets and actual spend
   *
   * @data_aggregation
   * - Filters transactions to match each budget's category (including uncategorised entries)
   * - Sums expense amounts and compares against the planned budget amount
   * - Computes remaining value and percentage utilisation for UI display
   */
  const calculateBudgetProgress = (
    budgetList: Budget[],
    monthlyTransactions: Transaction[]
  ): BudgetProgress[] => {
    console.log('[Dashboard] Calculating budget progress from existing APIs');

    const expenseTransactions = monthlyTransactions.filter(
      (transaction) => transaction.transaction_type === 'EX'
    );

    return budgetList.map((budget) => {
      const budgetCategoryId = budget.category ?? null;
      const relevantTransactions = expenseTransactions.filter((transaction) => {
        const transactionCategoryId = transaction.category ?? null;
        return transactionCategoryId === budgetCategoryId;
      });

      const actualSpending = relevantTransactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount);
      }, 0);

      const budgetAmount = Number(budget.amount);
      const remainingAmount = budgetAmount - actualSpending;
      const spendingPercentage = budgetAmount > 0 ? (actualSpending / budgetAmount) * 100 : 0;

      return {
        budgetId: budget.id,
        categoryId: budget.category,
        categoryName: budget.category_detail?.name ?? 'Uncategorized',
        budgetAmount,
        actualSpending,
        remainingAmount,
        spendingPercentage,
        month: budget.month,
        year: budget.year,
        isOverBudget: spendingPercentage > 100,
      };
    });
  };

  /**
   * @function fetchDashboardData
   * @description Fetches and calculates all dashboard data
   * 
   * This is the main data fetching function that:
   * 1. Fetches all transactions
   * 2. Fetches monthly transactions
   * 3. Calculates financial summary
   * 4. Gets recent transactions
   * 5. Calculates category spending
   * 6. Fetches budget progress
   * 
   * @returns {Promise<void>}
   * 
   * @error_handling
   * - Sets loading state during fetch
   * - Catches and displays user-friendly error messages
   * - Logs detailed errors to console for debugging
   */
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Dashboard] Fetching dashboard data');
      
      // Get current month date range
      const startDate = getFirstDayOfMonth();
      const endDate = getLastDayOfMonth();
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      
      // Fetch all transactions and monthly transactions in parallel
      const [allTransactions, monthlyTransactions, allBudgets] = await Promise.all([
        fetchAllTransactions(),
        fetchAllTransactions({ start_date: startDate, end_date: endDate }),
        fetchAllBudgets(),
      ]);
      
      // Calculate financial summary
      const financialSummary = calculateFinancialSummary(allTransactions, monthlyTransactions);
      setSummary(financialSummary);
      
      // Get recent transactions (latest 5)
      const sortedTransactions = [...allTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(sortedTransactions.slice(0, 5));
      
      // Calculate category spending
      const spending = calculateCategorySpending(monthlyTransactions);
      setCategorySpending(spending);
      
      // Fetch budget progress
      const currentMonthBudgets = allBudgets.filter(
        (budget) => budget.month === currentMonth && budget.year === currentYear
      );
      const budgetProgress = calculateBudgetProgress(currentMonthBudgets, monthlyTransactions);
      setBudgets(budgetProgress);
      
      console.log('[Dashboard] All dashboard data fetched successfully');
    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * @function handleRefresh
   * @description Handles manual refresh of dashboard data
   * 
   * This function is called when the user clicks the refresh button.
   * It sets the refreshing state and triggers a data fetch.
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  /**
   * @function getStatusColor
   * @description Returns the appropriate color class based on budget progress
   * 
   * @param {number} percentage - Budget progress percentage
   * @returns {string} Tailwind CSS color class
   */
  const getStatusColor = (percentage: number): string => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-amber-600';
    return 'text-green-600';
  };

  /**
   * @function renderProgressBar
   * @description Renders a progress bar for budget status
   * 
   * @param {number} percentage - Progress percentage (0-100+)
 * @returns {React.ReactNode} Progress bar component
   */
  const renderProgressBar = (percentage: number): React.ReactNode => {
    const cappedPercentage = Math.min(100, percentage); // Cap at 100% for the bar width
    // Color class is determined directly in the div className below
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full ${percentage >= 100 ? 'bg-red-600' : percentage >= 80 ? 'bg-amber-600' : 'bg-green-600'}`}
          style={{ width: `${cappedPercentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and recent activity
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={loading || refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Financial summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net balance across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total income this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total expenses this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard content - 2 columns on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Recent transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your 5 most recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading transactions...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center pb-2 border-b">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{transaction.category_detail?.name || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.transaction_type === 'IN' 
                          ? 'text-green-600' 
                          : transaction.transaction_type === 'EX' 
                            ? 'text-red-600' 
                            : 'text-blue-600'
                      }`}>
                        {transaction.transaction_type === 'IN' ? '+' : transaction.transaction_type === 'EX' ? '-' : ''}
                        {formatCurrency(Number(transaction.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spending by category */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>This month's expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading categories...</div>
              ) : categorySpending.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No spending data found</div>
              ) : (
                <div className="space-y-4">
                  {categorySpending.map(category => (
                    <div key={category.categoryId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-red-600">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {category.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Budget status */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Current month's budget progress</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading budgets...</div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No budgets found</div>
              ) : (
                <div className="space-y-4">
                  {budgets.map(budget => (
                    <div key={budget.budgetId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.categoryName}</span>
                        <span className={getStatusColor(budget.spendingPercentage)}>
                          {formatCurrency(budget.actualSpending)} / {formatCurrency(budget.budgetAmount)}
                        </span>
                      </div>
                      {renderProgressBar(budget.spendingPercentage)}
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {budget.spendingPercentage > 100 
                            ? 'Over budget' 
                            : `${budget.spendingPercentage.toFixed(1)}% used`}
                        </span>
                        <span>
                          {budget.remainingAmount >= 0 
                            ? `${formatCurrency(budget.remainingAmount)} remaining` 
                            : `${formatCurrency(Math.abs(budget.remainingAmount))} over`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>This month's financial balance</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading data...</div>
              ) : (
                <div className="space-y-4">
                  {/* Income bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Income</span>
                      <span className="text-green-600">{formatCurrency(summary.monthlyIncome)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full" 
                        style={{ 
                          width: `${summary.monthlyIncome + summary.monthlyExpenses > 0 
                            ? (summary.monthlyIncome / (summary.monthlyIncome + summary.monthlyExpenses)) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Expenses bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Expenses</span>
                      <span className="text-red-600">{formatCurrency(summary.monthlyExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-red-600 h-4 rounded-full" 
                        style={{ 
                          width: `${summary.monthlyIncome + summary.monthlyExpenses > 0 
                            ? (summary.monthlyExpenses / (summary.monthlyIncome + summary.monthlyExpenses)) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Net balance */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Balance</span>
                      <span className={summary.monthlyIncome - summary.monthlyExpenses >= 0 
                        ? 'text-green-600 font-bold' 
                        : 'text-red-600 font-bold'
                      }>
                        {formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {summary.monthlyIncome - summary.monthlyExpenses >= 0 
                        ? 'You\'re saving money this month!' 
                        : 'You\'re spending more than you earn this month.'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
