/**
 * @file BudgetForm.tsx
 * @description Modal form for creating or editing monthly budgets.
 */

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Alert, AlertTitle, AlertDescription } from '../../components/ui'
import { Label } from '../../components/ui/label'
import { Category } from '../../types/transaction'
import { Budget, BudgetRequest } from '../../types'
import { getAllCategories } from '../../services/categoryService'

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: BudgetRequest, budgetId?: number) => Promise<void>
  initialBudget?: Budget | null
}

interface FormValues {
  category: string
  amount: string
  month: string
  year: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

export const BudgetForm: React.FC<BudgetFormProps> = ({ isOpen, onClose, onSubmit, initialBudget }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [values, setValues] = useState<FormValues>({ category: '', amount: '', month: '', year: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // When the modal opens we fetch categories so the dropdown mirrors the user's Django data.
    // This mirrors the transaction form behaviour and ensures the auth token is applied via axios interceptor.
    /**
     * @function loadCategories
     * @description Fetches all categories for the dropdown
     * 
     * This function uses the categoryService to fetch all categories
     * for the current user, which are then displayed in the dropdown.
     * 
     * @error_handling
     * - Sets error state with user-friendly message on API failure
     * - Logs detailed error to console for debugging
     */
    const loadCategories = async () => {
      if (!isOpen) return
      try {
        console.log('[BudgetForm] Fetching categories for budget dropdown')
        const data = await getAllCategories()
        console.log('[BudgetForm] Categories loaded:', data)
        setCategories(data)
      } catch (error) {
        console.error('[BudgetForm] Failed to load categories:', error)
        setErrorMessage('Unable to load categories. Please try again later.')
      }
    }
    loadCategories()
  }, [isOpen])

  useEffect(() => {
    if (initialBudget) {
      setValues({
        category: initialBudget.category.toString(),
        amount: initialBudget.amount.toString(),
        month: initialBudget.month.toString(),
        year: initialBudget.year.toString(),
      })
    } else {
      const now = new Date()
      setValues({ category: '', amount: '', month: (now.getMonth() + 1).toString(), year: now.getFullYear().toString() })
    }
    setErrors({})
    setErrorMessage(null)
  }, [initialBudget, isOpen])

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!values.category) nextErrors.category = 'Please choose a category'
    if (!values.amount || Number(values.amount) <= 0) nextErrors.amount = 'Enter a positive amount'
    if (!values.month || Number(values.month) < 1 || Number(values.month) > 12) nextErrors.month = 'Month must be between 1 and 12'
    if (!values.year || Number(values.year) < 2000) nextErrors.year = 'Year must be 2000 or later'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload: BudgetRequest = {
        category: Number(values.category),
        amount: Number(values.amount),
        month: Number(values.month),
        year: Number(values.year),
      }
      await onSubmit(payload, initialBudget?.id)
    } catch (error: any) {
      console.error('[BudgetForm] Submission failed:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to save budget. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialBudget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={values.category}
              onChange={handleChange('category')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={handleChange('amount')}
              placeholder="e.g. 500"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="number" min="1" max="12" value={values.month} onChange={handleChange('month')} />
              {errors.month && <p className="text-sm text-destructive">{errors.month}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" min="2000" value={values.year} onChange={handleChange('year')} />
              {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialBudget ? 'Update Budget' : 'Add Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BudgetForm

