/**
 * @file BudgetPage.tsx
 * @description Top-level page component that wires together budget data fetching,
 *              add/edit forms, and the list view with progress indicators.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { Button, Alert, AlertTitle, AlertDescription } from '../../components/ui'
import { Budget, BudgetProgress, BudgetRequest } from '../../types'
import { Transaction } from '../../types/transaction'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../services/budgetService'
import { getTransactions } from '../../services/transactionService'
import { BudgetList } from './BudgetList'
import { BudgetForm } from './BudgetForm'

/**
 * Helper to construct YYYY-MM-DD strings with zero-padded month/day values.
 */
const formatDatePart = (value: number): string => value.toString().padStart(2, '0')

/**
 * Determine the first date of a budgeting period.
 */
const getPeriodStart = (month: number, year: number): string => `${year}-${formatDatePart(month)}-01`

/**
 * Determine the final date of a budgeting period.
 */
const getPeriodEnd = (month: number, year: number): string => {
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${formatDatePart(month)}-${formatDatePart(lastDay)}`
}

/**
 * Fetch all transaction records for a given month/year combination.
 * Returns only expense (EX) transactions because budgets typically track spending.
 */
const fetchTransactionsForPeriod = async (month: number, year: number): Promise<Transaction[]> => {
  const startDate = getPeriodStart(month, year)
  const endDate = getPeriodEnd(month, year)

  const results: Transaction[] = []
  let page = 1
  let hasNext = true

  while (hasNext) {
    const response = await getTransactions({ start_date: startDate, end_date: endDate, transaction_type: 'EX' }, page)
    const pageResults = response?.results ?? []
    results.push(...pageResults)
    hasNext = Boolean(response?.next)
    page += 1
  }

  return results
}

/**
 * Merge raw budgets with actual spending amounts to produce progress metrics.
 */
const computeBudgetProgress = async (budgets: Budget[]): Promise<BudgetProgress[]> => {
  if (!budgets.length) return []

  const periods = new Map<string, { month: number; year: number }>()
  budgets.forEach((budget) => {
    periods.set(`${budget.month}-${budget.year}`, { month: budget.month, year: budget.year })
  })

  const periodTransactions = new Map<string, Transaction[]>()
  for (const period of Array.from(periods.values())) {
    const transactions = await fetchTransactionsForPeriod(period.month, period.year)
    periodTransactions.set(`${period.month}-${period.year}`, transactions)
  }

  return budgets.map((budget) => {
    const key = `${budget.month}-${budget.year}`
    const transactions = periodTransactions.get(key) ?? []

    const categoryTransactions = transactions.filter((txn) => {
      const categoryId = txn.category ?? txn.category_detail?.id
      return categoryId === budget.category
    })

    const actualSpending = categoryTransactions.reduce((sum, txn) => {
      const amount = typeof txn.amount === 'string' ? parseFloat(txn.amount) : txn.amount
      return sum + Math.abs(amount)
    }, 0)

    const budgetAmount = typeof budget.amount === 'string' ? parseFloat(budget.amount as unknown as string) : Number(budget.amount)
    const remainingAmount = budgetAmount - actualSpending
    const spendingPercentage = budgetAmount > 0 ? (actualSpending / budgetAmount) * 100 : 0

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
    }
  })
}

/**
 * @component BudgetPage
 * @description Route-driven component responsible for budget management.
 *              It connects to services, handles forms, and renders progress UI.
 */
export const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [progress, setProgress] = useState<BudgetProgress[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  /**
   * Retrieve all budget records for the authenticated user.
   * Includes pagination handling because the API returns chunks of data.
   */
  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    setError(null)

    const collected: Budget[] = []
    let page = 1
    let hasNext = true

    try {
      while (hasNext) {
        const response = await getBudgets(page)
        const items = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
        collected.push(...items)
        hasNext = Boolean(response?.next)
        page += 1
        if (!hasNext) break
      }

      setBudgets(collected)
      const computedProgress = await computeBudgetProgress(collected)
      setProgress(computedProgress)
    } catch (err) {
      console.error('[BudgetPage] Failed to load budgets:', err)
      setError('Unable to load budgets. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleAddClick = () => {
    setEditingBudget(null)
    setIsFormOpen(true)
  }

  const handleEditBudget = (budgetId: number) => {
    const match = budgets.find((budget) => budget.id === budgetId) ?? null
    setEditingBudget(match)
    setIsFormOpen(true)
  }

  const handleDeleteBudget = async (budgetId: number) => {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return
    try {
      await deleteBudget(budgetId)
      await fetchBudgets()
    } catch (err) {
      console.error('[BudgetPage] Failed to delete budget:', err)
      setError('Unable to delete budget. Please try again.')
    }
  }

  /**
   * When the form submits successfully we refresh the budgets and close the modal.
   * Errors are rethrown so the form component can present feedback inside the dialog.
   */
  const handleSubmitBudget = async (payload: BudgetRequest, budgetId?: number) => {
    if (budgetId) {
      await updateBudget(budgetId, payload)
    } else {
      await createBudget(payload)
    }
    await fetchBudgets()
    setIsFormOpen(false)
    setEditingBudget(null)
  }

  return (
    <section className="space-y-6">
      {/* Header explains route integration and provides an action button. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Configure monthly spending targets by category and monitor actual expenses in real time.
          </p>
        </div>
        <Button onClick={handleAddClick}>Add Budget</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Budget load failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">Loading budgets…</div>
      ) : (
        <BudgetList budgets={progress} onEdit={handleEditBudget} onDelete={handleDeleteBudget} />
      )}

      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitBudget}
        initialBudget={editingBudget ?? undefined}
      />
    </section>
  )
}

export default BudgetPage

