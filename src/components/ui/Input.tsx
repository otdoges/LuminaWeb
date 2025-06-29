import React, { useState } from 'react';
import { Eye, EyeOff, DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  icon: Icon,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${showPasswordToggle ? 'pr-12' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-primary-300 focus:border-accent-500 focus:ring-accent-500'
            }
            ${isFocused ? 'ring-2 ring-opacity-20' : ''}
            bg-white dark:bg-primary-800 
            text-primary-900 dark:text-primary-100
            placeholder-primary-400 dark:placeholder-primary-500
            focus:outline-none
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}