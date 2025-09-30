/**
 * @file TransactionFilters.tsx
 * @description Transaction filtering component
 * 
 * This component provides UI controls for filtering transactions by various criteria:
 * - Date range (start and end dates)
 * - Category selection
 * - Transaction type selection
 * - Amount range (min and max)
 * - Search by description
 * 
 * It manages its own state and calls the parent component's filter function
 * when filters are applied or reset.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  Button,
  Input,
  Badge,
} from '../../components/ui';
import { Search, Filter, X } from 'lucide-react';
import { 
  TransactionFilters as FiltersType,
  TransactionType,
  TRANSACTION_TYPE_OPTIONS,
  Category
} from '../../types/transaction';
import { getCategories } from '../../services/transactionService';

/**
 * Props for the TransactionFilters component
 * 
 * @property {Function} onFilterChange - Callback when filters are applied
 * @property {Function} onResetFilters - Callback when filters are reset
 */
interface TransactionFiltersProps {
  onFilterChange: (filters: FiltersType) => void;
  onResetFilters: () => void;
}

/**
 * @component TransactionFilters
 * @description Component for filtering transaction data
 * 
 * This component provides a comprehensive filtering interface for transactions.
 * It manages filter state internally and calls parent callbacks when filters change.
 * 
 * @param {TransactionFiltersProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onFilterChange, 
  onResetFilters 
}) => {
  // State for filter values
  const [filters, setFilters] = useState<FiltersType>({});
  
  // State for search input (separate for immediate feedback)
  const [searchInput, setSearchInput] = useState('');
  
  // State for categories (loaded from API)
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for expanded filter view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count of active filters
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof FiltersType] !== undefined && 
    filters[key as keyof FiltersType] !== ''
  ).length;
  
  /**
   * Load categories when component mounts
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories for filters:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  /**
   * @function handleFilterChange
   * @description Update a single filter value
   * 
   * @param {keyof FiltersType} key - Filter key to update
   * @param {any} value - New filter value
   */
  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    // If value is empty string or null, remove the filter
    if (value === '' || value === null) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  /**
   * @function handleSearchChange
   * @description Handle changes to the search input
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  /**
   * @function handleSearchSubmit
   * @description Apply search filter when form is submitted
   * 
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchInput);
  };
  
  /**
   * @function applyFilters
   * @description Apply all current filters
   */
  const applyFilters = () => {
    onFilterChange(filters);
  };
  
  /**
   * @function resetFilters
   * @description Reset all filters
   */
  const resetFilters = () => {
    setFilters({});
    setSearchInput('');
    onResetFilters();
  };
  
  /**
   * @function toggleExpanded
   * @description Toggle expanded filter view
   */
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search bar - always visible */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="default">Search</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={toggleExpanded}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
            )}
          </Button>
        </form>
        
        {/* Expanded filters */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date range filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Transaction type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filters.transaction_type || ''}
                  onChange={(e) => handleFilterChange('transaction_type', e.target.value as TransactionType || '')}
                >
                  <option value="">All Types</option>
                  {TRANSACTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount range filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Min amount"
                  value={filters.min_amount || ''}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Max amount"
                  value={filters.max_amount || ''}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : '')}
                />
              </div>
            </div>
            
            {/* Filter action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
              
              <Button 
                onClick={applyFilters}
                className="flex items-center gap-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
