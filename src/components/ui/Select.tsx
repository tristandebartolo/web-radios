'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || 'Sélectionner...';

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' && isOpen && options.length > 0) {
      event.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      const nextOption = options[nextIndex];
      if (nextOption) onChange(nextOption.value);
    } else if (event.key === 'ArrowUp' && isOpen && options.length > 0) {
      event.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      const prevOption = options[prevIndex];
      if (prevOption) onChange(prevOption.value);
    }
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full px-3 py-2 rounded-lg text-left',
          'bg-(--secondary) border border-(--border) text-(--foreground)',
          'focus:outline-none focus:ring-2 focus:ring-(--primary)',
          'flex items-center justify-between gap-2',
          'transition-colors hover:bg-(--card-hover)'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn(!selectedOption && 'text-(--muted)')}>
          {displayValue}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-(--muted) transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className={cn(
            'absolute z-50 w-full mt-1 py-1 rounded-lg',
            'bg-(--secondary) border border-(--border)',
            'shadow-lg max-h-60 overflow-auto',
            'animate-slide-up'
          )}
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'px-3 py-2 cursor-pointer transition-colors',
                'hover:bg-(--card-hover)',
                option.value === value && 'bg-(--primary)/20 text-(--primary)'
              )}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
