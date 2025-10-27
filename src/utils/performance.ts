/**
 * Creates a debounced version of a function with cancel support
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunction = function (...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFunction.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

/**
 * Creates a throttled version of a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
