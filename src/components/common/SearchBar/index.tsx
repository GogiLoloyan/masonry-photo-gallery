import { memo, useEffect, useRef, useState } from 'react';

import { debounce } from '../../../utils/performance';
import * as styles from './styles.css';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  debounceMs?: number;
}

export const SearchBar = memo(
  ({
    value = '',
    onChange: onParentChange,
    onClear: onParentClear,
    placeholder = 'Search...',
    isLoading = false,
    debounceMs = 500,
  }: SearchBarProps) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedSearchRef = useRef<(value: string) => void>(null);

    // Create debounced search handler
    useEffect(() => {
      debouncedSearchRef.current = debounce((searchValue: string) => {
        onParentChange(searchValue);
      }, debounceMs);

      // Cleanup on unmount
      return () => {
        if (debouncedSearchRef.current) {
          // Cancel any pending debounced calls
          (debouncedSearchRef.current as any).cancel?.();
        }
      };
    }, [onParentChange, debounceMs]);

    // Update local value when prop changes (controled from outside, mainly for clearing)
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // If empty, immediately clear (don't debounce clearing)
      if (newValue.trim() === '') {
        onParentClear?.();
      } else {
        // Debounce non-empty searches
        debouncedSearchRef.current?.(newValue);
      }
    };

    const handleClear = () => {
      setLocalValue('');
      onParentClear?.();
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        // Immediately trigger search on Enter
        e.preventDefault();
        onParentChange(localValue);
      }
    };

    return (
      <div className={styles.container}>
        <div className={styles.inputWrapper}>
          {/* Search Icon */}
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M19 19L14.65 14.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.input}
            aria-label="Search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Clear button or loading indicator */}
          {localValue && (
            <button
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear search"
              type="button"
            >
              {isLoading ? (
                <div className={styles.loadingSpinner} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
