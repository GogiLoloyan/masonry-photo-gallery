import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce, throttle } from '@/utils/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);

      debouncedFn('second');
      vi.advanceTimersByTime(50);

      debouncedFn('third');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should handle multiple arguments', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 123);
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should provide cancel method', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should handle rapid sequential calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      for (let i = 0; i < 10; i++) {
        debouncedFn(i);
        vi.advanceTimersByTime(10);
      }

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(9);
    });

    it('should allow multiple independent debounced functions', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const debouncedFn1 = debounce(mockFn1, 100);
      const debouncedFn2 = debounce(mockFn2, 200);

      debouncedFn1('fn1');
      debouncedFn2('fn2');

      vi.advanceTimersByTime(100);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn1).toHaveBeenCalledWith('fn1');
      expect(mockFn2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledWith('fn2');
    });
  });

  describe('throttle', () => {
    it('should limit function execution rate', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      throttledFn('second');
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      throttledFn('third');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should ignore calls during throttle period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      
      // Multiple calls during throttle period
      for (let i = 0; i < 5; i++) {
        throttledFn(`ignored-${i}`);
      }

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      vi.advanceTimersByTime(100);

      throttledFn('second');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('should handle multiple arguments', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1', 'arg2', 123);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should allow multiple independent throttled functions', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const throttledFn1 = throttle(mockFn1, 100);
      const throttledFn2 = throttle(mockFn2, 200);

      throttledFn1('fn1-call1');
      throttledFn2('fn2-call1');

      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      throttledFn1('fn1-call2'); // Should be ignored
      throttledFn2('fn2-call2'); // Should be ignored

      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50); // Total 100ms
      throttledFn1('fn1-call3'); // Should work
      throttledFn2('fn2-call3'); // Should still be throttled

      expect(mockFn1).toHaveBeenCalledTimes(2);
      expect(mockFn2).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100); // Total 200ms
      throttledFn2('fn2-call4'); // Should work

      expect(mockFn2).toHaveBeenCalledTimes(2);
    });

    it('should work correctly with rapid calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 50);

      // Simulate rapid scrolling
      for (let i = 0; i < 10; i++) {
        throttledFn(i);
        vi.advanceTimersByTime(10);
      }

      // Should be called at 0ms, 50ms
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 0);
      expect(mockFn).toHaveBeenNthCalledWith(2, 5);
    });

    it('should execute immediately on first call', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn('immediate');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('immediate');
    });
  });

  describe('debounce vs throttle comparison', () => {
    it('should show different behavior patterns', () => {
      const debouncedFn = vi.fn();
      const throttledFn = vi.fn();
      
      const debounced = debounce(debouncedFn, 100);
      const throttled = throttle(throttledFn, 100);

      // Simulate 5 rapid calls
      for (let i = 0; i < 5; i++) {
        debounced(i);
        throttled(i);
        vi.advanceTimersByTime(20);
      }

      // Throttle should have executed twice (at 0ms and 100ms)
      expect(throttledFn).toHaveBeenCalledTimes(1);

      // Debounce should not have executed yet
      expect(debouncedFn).toHaveBeenCalledTimes(0);

      // Wait for debounce to fire
      vi.advanceTimersByTime(100);

      // Debounce should execute once with the last value
      expect(debouncedFn).toHaveBeenCalledTimes(1);
      expect(debouncedFn).toHaveBeenCalledWith(4);
    });
  });
});
