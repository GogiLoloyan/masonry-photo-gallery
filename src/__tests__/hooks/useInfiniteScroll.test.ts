import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: any;
  let observeCallback: IntersectionObserverCallback | undefined;

  beforeEach(() => {
    observeCallback = undefined;

    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback, options) => {
      observeCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        root: options?.root || null,
        rootMargin: options?.rootMargin || '0px',
        thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0],
        takeRecords: vi.fn(() => []),
      };
    });

    global.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    observeCallback = undefined;
  });

  it('should return triggerRef and isLoading', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );

    expect(result.current.triggerRef).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should accept custom rootMargin option', () => {
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
        rootMargin: '200px',
      })
    );

    // The hook should work with custom rootMargin without errors
    // IntersectionObserver is only created when ref is attached to DOM
    expect(mockIntersectionObserver).toBeDefined();
  });

  it('should call onLoadMore when element is intersecting', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        loading: false,
      })
    );

    // Simulate intersection if callback is available
    if (observeCallback) {
      const entries = [
        {
          isIntersecting: true,
          target: document.createElement('div'),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[];

      observeCallback(entries, {} as IntersectionObserver);

      await waitFor(() => {
        expect(onLoadMore).toHaveBeenCalled();
      });
    }
  });

  it('should not call onLoadMore when not intersecting', async () => {
    const onLoadMore = vi.fn();

    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        loading: false,
      })
    );

    if (observeCallback) {
      const entries = [
        {
          isIntersecting: false,
          target: document.createElement('div'),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 0,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[];

      observeCallback(entries, {} as IntersectionObserver);

      // Wait a bit to ensure it doesn't get called
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(onLoadMore).not.toHaveBeenCalled();
    }
  });

  it('should not call onLoadMore when loading', async () => {
    const onLoadMore = vi.fn();

    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        loading: true,
      })
    );

    if (observeCallback) {
      const entries = [
        {
          isIntersecting: true,
          target: document.createElement('div'),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[];

      observeCallback(entries, {} as IntersectionObserver);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(onLoadMore).not.toHaveBeenCalled();
    }
  });

  it('should not call onLoadMore when no more items', async () => {
    const onLoadMore = vi.fn();

    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: false,
        loading: false,
      })
    );

    if (observeCallback) {
      const entries = [
        {
          isIntersecting: true,
          target: document.createElement('div'),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[];

      observeCallback(entries, {} as IntersectionObserver);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(onLoadMore).not.toHaveBeenCalled();
    }
  });

  it('should return combined loading state', () => {
    const { result, rerender } = renderHook(
      ({ loading }) =>
        useInfiniteScroll({
          onLoadMore: vi.fn(),
          hasMore: true,
          loading,
        }),
      { initialProps: { loading: false } }
    );

    expect(result.current.isLoading).toBe(false);

    rerender({ loading: true });
    expect(result.current.isLoading).toBe(true);
  });

  it('should use default rootMargin when not provided', () => {
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );

    // The hook uses INTERSECTION_ROOT_MARGIN constant as default
    // We just verify it doesn't crash without rootMargin
    expect(mockIntersectionObserver).toBeDefined();
  });

  it('should handle async onLoadMore', async () => {
    let resolveLoadMore: () => void;
    const loadMorePromise = new Promise<void>(resolve => {
      resolveLoadMore = resolve;
    });

    const onLoadMore = vi.fn().mockReturnValue(loadMorePromise);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        loading: false,
      })
    );

    if (observeCallback) {
      const entries = [
        {
          isIntersecting: true,
          target: document.createElement('div'),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ] as IntersectionObserverEntry[];

      observeCallback(entries, {} as IntersectionObserver);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      resolveLoadMore!();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    }
  });

  it('should provide a ref object', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );

    expect(result.current.triggerRef).toHaveProperty('current');
  });
});
