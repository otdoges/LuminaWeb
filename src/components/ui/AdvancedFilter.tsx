import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Plus,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  ChevronDown,
  Save,
  Download,
  RotateCcw,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './Input';
import { cn } from '../../lib/utils';

// Filter types and operators
type FilterType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'range';
type FilterOperator = 
  | 'equals' | 'not_equals' | 'contains' | 'not_contains' 
  | 'starts_with' | 'ends_with' | 'regex'
  | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'between'
  | 'is_empty' | 'is_not_empty' | 'in' | 'not_in';

interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  type: FilterType;
  enabled: boolean;
}

interface FilterField {
  key: string;
  label: string;
  type: FilterType;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  format?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  favorite?: boolean;
}

interface AdvancedFilterProps {
  data: any[];
  fields: FilterField[];
  onFilter: (filteredData: any[]) => void;
  onConditionsChange?: (conditions: FilterCondition[]) => void;
  initialConditions?: FilterCondition[];
  presets?: FilterPreset[];
  showSearch?: boolean;
  showPresets?: boolean;
  showExport?: boolean;
  placeholder?: string;
  className?: string;
}

// Operator configurations
const OPERATORS_BY_TYPE: Record<FilterType, FilterOperator[]> = {
  text: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_empty', 'is_not_empty'],
  date: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between'],
  boolean: ['equals', 'not_equals'],
  select: ['equals', 'not_equals', 'in', 'not_in'],
  range: ['between', 'greater_than', 'less_than']
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  not_equals: 'Not equals',
  contains: 'Contains',
  not_contains: 'Does not contain',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  regex: 'Matches regex',
  greater_than: 'Greater than',
  less_than: 'Less than',
  greater_equal: 'Greater than or equal',
  less_equal: 'Less than or equal',
  between: 'Between',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
  in: 'In list',
  not_in: 'Not in list'
};

// Value input component for different types
const FilterValueInput = React.memo(({ 
  condition, 
  field, 
  onChange 
}: {
  condition: FilterCondition;
  field: FilterField;
  onChange: (value: any) => void;
}) => {
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);

  if (!needsValue) {
    return null;
  }

  const handleChange = (value: any) => {
    onChange(value);
  };

  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={condition.value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter value..."
          className="w-full"
        />
      );

    case 'number':
      if (condition.operator === 'between') {
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={condition.value?.[0] || ''}
              onChange={(e) => handleChange([Number(e.target.value), condition.value?.[1] || 0])}
              placeholder="Min"
              min={field.min}
              max={field.max}
            />
            <Input
              type="number"
              value={condition.value?.[1] || ''}
              onChange={(e) => handleChange([condition.value?.[0] || 0, Number(e.target.value)])}
              placeholder="Max"
              min={field.min}
              max={field.max}
            />
          </div>
        );
      }
      return (
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          placeholder="Enter number..."
          min={field.min}
          max={field.max}
        />
      );

    case 'date':
      if (condition.operator === 'between') {
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              value={condition.value?.[0] || ''}
              onChange={(e) => handleChange([e.target.value, condition.value?.[1] || ''])}
            />
            <Input
              type="date"
              value={condition.value?.[1] || ''}
              onChange={(e) => handleChange([condition.value?.[0] || '', e.target.value])}
            />
          </div>
        );
      }
      return (
        <Input
          type="date"
          value={condition.value || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      );

    case 'boolean':
      return (
        <select
          value={condition.value || ''}
          onChange={(e) => handleChange(e.target.value === 'true')}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );

    case 'select':
      if (['in', 'not_in'].includes(condition.operator)) {
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={condition.value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValue = condition.value || [];
                    if (e.target.checked) {
                      handleChange([...currentValue, option.value]);
                    } else {
                      handleChange(currentValue.filter((v: any) => v !== option.value));
                    }
                  }}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <select
          value={condition.value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="">Select...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    default:
      return (
        <Input
          type="text"
          value={condition.value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter value..."
        />
      );
  }
});

FilterValueInput.displayName = 'FilterValueInput';

// Individual filter condition component
const FilterConditionRow = React.memo(({
  condition,
  fields,
  onChange,
  onRemove,
  showRemove = true
}: {
  condition: FilterCondition;
  fields: FilterField[];
  onChange: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
  showRemove?: boolean;
}) => {
  const field = fields.find(f => f.key === condition.field);
  const availableOperators = field ? OPERATORS_BY_TYPE[field.type] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/30"
    >
      {/* Enable/disable toggle */}
      <button
        onClick={() => onChange({ enabled: !condition.enabled })}
        className={cn(
          "mt-2 transition-colors",
          condition.enabled ? "text-primary" : "text-muted-foreground"
        )}
      >
        <ToggleLeft className={cn("w-5 h-5", condition.enabled && "rotate-180")} />
      </button>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Field selector */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Field</label>
          <select
            value={condition.field}
            onChange={(e) => {
              const newField = fields.find(f => f.key === e.target.value);
              const newOperator = newField ? OPERATORS_BY_TYPE[newField.type][0] : condition.operator;
              onChange({ 
                field: e.target.value, 
                type: newField?.type || 'text',
                operator: newOperator,
                value: undefined
              });
            }}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="">Select field...</option>
            {fields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operator selector */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
          <select
            value={condition.operator}
            onChange={(e) => onChange({ operator: e.target.value as FilterOperator, value: undefined })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            disabled={!condition.field}
          >
            {availableOperators.map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
        </div>

        {/* Value input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
          {field ? (
            <FilterValueInput
              condition={condition}
              field={field}
              onChange={(value) => onChange({ value })}
            />
          ) : (
            <Input disabled placeholder="Select a field first..." />
          )}
        </div>
      </div>

      {/* Remove button */}
      {showRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="mt-6 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
});

FilterConditionRow.displayName = 'FilterConditionRow';

// Search input component
const SearchInput = React.memo(({
  value,
  onChange,
  placeholder = "Search...",
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-8"
      />
      {localValue && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

// Filter evaluation function
function evaluateCondition(item: any, condition: FilterCondition): boolean {
  if (!condition.enabled || !condition.field) return true;
  
  const value = item[condition.field];
  const filterValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return value === filterValue;
    case 'not_equals':
      return value !== filterValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'not_contains':
      return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'starts_with':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'ends_with':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'regex':
      try {
        return new RegExp(filterValue, 'i').test(String(value));
      } catch {
        return false;
      }
    case 'greater_than':
      return Number(value) > Number(filterValue);
    case 'less_than':
      return Number(value) < Number(filterValue);
    case 'greater_equal':
      return Number(value) >= Number(filterValue);
    case 'less_equal':
      return Number(value) <= Number(filterValue);
    case 'between':
      const [min, max] = filterValue || [0, 0];
      return Number(value) >= Number(min) && Number(value) <= Number(max);
    case 'is_empty':
      return !value || value === '' || value === null || value === undefined;
    case 'is_not_empty':
      return !!value && value !== '' && value !== null && value !== undefined;
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value);
    case 'not_in':
      return Array.isArray(filterValue) && !filterValue.includes(value);
    default:
      return true;
  }
}

// Main advanced filter component
export const AdvancedFilter = React.memo<AdvancedFilterProps>(({
  data,
  fields,
  onFilter,
  onConditionsChange,
  initialConditions = [],
  presets = [],
  showSearch = true,
  showPresets = true,
  showExport = true,
  placeholder = "Search across all fields...",
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conditions, setConditions] = useState<FilterCondition[]>(initialConditions);
  const [showFilters, setShowFilters] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(presets);

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search query across all text fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        fields.some(field => {
          const value = item[field.key];
          if (field.type === 'text' || field.type === 'select') {
            return String(value).toLowerCase().includes(query);
          }
          return false;
        })
      );
    }

    // Apply filter conditions
    if (conditions.length > 0) {
      result = result.filter(item =>
        conditions.every(condition => evaluateCondition(item, condition))
      );
    }

    return result;
  }, [data, searchQuery, conditions, fields]);

  // Notify parent of changes
  useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  useEffect(() => {
    onConditionsChange?.(conditions);
  }, [conditions, onConditionsChange]);

  // Add new condition
  const addCondition = useCallback(() => {
    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: undefined,
      type: 'text',
      enabled: true
    };
    setConditions(prev => [...prev, newCondition]);
    setShowFilters(true);
  }, []);

  // Update condition
  const updateCondition = useCallback((id: string, updates: Partial<FilterCondition>) => {
    setConditions(prev =>
      prev.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
    setActivePreset(null);
  }, []);

  // Remove condition
  const removeCondition = useCallback((id: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== id));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setConditions([]);
    setSearchQuery('');
    setActivePreset(null);
  }, []);

  // Apply preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    setConditions(preset.conditions);
    setActivePreset(preset.id);
    setShowFilters(true);
  }, []);

  // Save current filters as preset
  const saveAsPreset = useCallback(() => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      conditions: [...conditions],
      favorite: false
    };

    setSavedPresets(prev => [...prev, newPreset]);
    setActivePreset(newPreset.id);
  }, [conditions]);

  // Export filtered data
  const exportData = useCallback(() => {
    const csv = [
      fields.map(f => f.label).join(','),
      ...filteredData.map(item =>
        fields.map(f => item[f.key]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filtered_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredData, fields]);

  const activeConditionsCount = conditions.filter(c => c.enabled && c.field).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {showSearch && (
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={placeholder}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2",
              activeConditionsCount > 0 && "bg-primary/10 border-primary/20"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeConditionsCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {activeConditionsCount}
              </span>
            )}
          </Button>

          {/* Presets dropdown */}
          {showPresets && savedPresets.length > 0 && (
            <div className="relative">
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}

          {/* Export button */}
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={filteredData.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          {/* Clear filters */}
          {(searchQuery || activeConditionsCount > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter conditions */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Filter Conditions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCondition}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                    {conditions.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveAsPreset}
                        className="flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <AnimatePresence>
                  {conditions.map((condition) => (
                    <FilterConditionRow
                      key={condition.id}
                      condition={condition}
                      fields={fields}
                      onChange={(updates) => updateCondition(condition.id, updates)}
                      onRemove={() => removeCondition(condition.id)}
                      showRemove={conditions.length > 1}
                    />
                  ))}
                </AnimatePresence>

                {conditions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No filter conditions</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addCondition}
                      className="mt-2"
                    >
                      Add your first filter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} results
          {searchQuery && (
            <span> for "{searchQuery}"</span>
          )}
        </div>
        
        {activeConditionsCount > 0 && (
          <div className="flex items-center gap-2">
            <span>{activeConditionsCount} filter{activeConditionsCount !== 1 ? 's' : ''} active</span>
          </div>
        )}
      </div>
    </div>
  );
});

AdvancedFilter.displayName = 'AdvancedFilter';

export default AdvancedFilter; 