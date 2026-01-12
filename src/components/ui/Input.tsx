'use client';

import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-(--foreground) mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-(--secondary) border border-(--border)',
            'text-(--foreground) placeholder:text-(--muted)',
            'focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent',
            'transition-colors',
            error && 'border-(--error) focus:ring-(--error)',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-(--error)">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
