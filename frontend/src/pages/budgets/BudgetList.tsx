/**
 * @file BudgetList.tsx
 * @description Display component for monthly budgets with progress indicators.
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Alert, AlertTitle, AlertDescription } from '../../components/ui'
import { BudgetProgress } from '../../types'
import { formatCurrency } from '../../types/transaction'

interface BudgetListProps {
  budgets: BudgetProgress[]
  /**
   * @property onEdit - Callback when user initiates editing a budget.
   * @param budgetId - numeric identifier for the budget record.
   */
  onEdit: (budgetId: number) => void
  /**
   * @property onDelete - Callback when user requests deletion.
   * @param budgetId - numeric identifier for the budget record.
   */
  onDelete: (budgetId: number) => void
}

/**
 * @component BudgetList
 * @description Renders cards summarising each budget and associated spending progress.
 */
export const BudgetList: React.FC<BudgetListProps> = ({ budgets, onEdit, onDelete }) => {
  if (!budgets.length) {
    return (
      <Alert>
        <AlertTitle>No budgets configured</AlertTitle>
        <AlertDescription>
          Create a budget to track monthly spending limits and receive alerts when thresholds are reached.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {budgets.map((item) => {
        const isOverBudget = item.spendingPercentage >= 100
        const isApproachingLimit = item.spendingPercentage >= 80 && !isOverBudget

        return (
          <Card key={item.budgetId} className="border shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{item.categoryName}</span>
                {isOverBudget && <Badge variant="destructive">Over budget</Badge>}
                {!isOverBudget && isApproachingLimit && <Badge variant="secondary">Approaching</Badge>}
              </CardTitle>
              <CardDescription>
                {item.month}/{item.year} · Budget: {formatCurrency(item.budgetAmount)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Spent</span>
                <span>{formatCurrency(item.actualSpending)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'} transition-all duration-300`}
                  style={{ width: `${Math.min(item.spendingPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Remaining</span>
                <span>{formatCurrency(item.remainingAmount)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <button className="text-primary" onClick={() => onEdit(item.budgetId)}>Edit</button>
                <button className="text-destructive" onClick={() => onDelete(item.budgetId)}>Delete</button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default BudgetList

