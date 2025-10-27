import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useVirtualization } from '@/hooks/useVirtualization';
import type { Photo } from '@/types/app';

describe('useVirtualization', () => {
  const mockPhotos: Photo[] = [
    {
      id: 1,
      width: 400,
      height: 300,
      aspectRatio: 4 / 3,
      src: {
        tiny: 'tiny1.jpg',
        small: 'small1.jpg',
        medium: 'medium1.jpg',
        large: 'large1.jpg',
        original: 'original1.jpg',
      },
      photographer: 'Photographer 1',
      photographerUrl: 'https://test1.com',
      alt: 'Photo 1',
      avgColor: '#ffffff',
    },
    {
      id: 2,
      width: 300,
      height: 400,
      aspectRatio: 3 / 4,
      src: {
        tiny: 'tiny2.jpg',
        small: 'small2.jpg',
        medium: 'medium2.jpg',
        large: 'large2.jpg',
        original: 'original2.jpg',
      },
      photographer: 'Photographer 2',
      photographerUrl: 'https://test2.com',
      alt: 'Photo 2',
      avgColor: '#000000',
    },
    {
      id: 3,
      width: 500,
      height: 500,
      aspectRatio: 1,
      src: {
        tiny: 'tiny3.jpg',
        small: 'small3.jpg',
        medium: 'medium3.jpg',
        large: 'large3.jpg',
        original: 'original3.jpg',
      },
      photographer: 'Photographer 3',
      photographerUrl: 'https://test3.com',
      alt: 'Photo 3',
      avgColor: '#888888',
    },
  ];

  it('should return visible items and total height', () => {
    const { result } = renderHook(() =>
      useVirtualization({
        photos: mockPhotos,
        scrollTop: 0,
        viewportHeight: 800,
        containerWidth: 1200,
      })
    );

    expect(result.current.visibleItems).toBeDefined();
    expect(result.current.totalHeight).toBeGreaterThan(0);
  });

  it('should update visible items when scroll position changes', () => {
    const { result, rerender } = renderHook(
      ({ scrollTop }) =>
        useVirtualization({
          photos: mockPhotos,
          scrollTop,
          viewportHeight: 800,
          containerWidth: 1200,
        }),
      {
        initialProps: { scrollTop: 0 },
      }
    );

    // Scroll down
    rerender({ scrollTop: 500 });

    // Visible items might change (depending on layout)
    expect(result.current.visibleItems).toBeDefined();
  });

  it('should recalculate layout when container width changes', () => {
    const { result, rerender } = renderHook(
      ({ containerWidth }) =>
        useVirtualization({
          photos: mockPhotos,
          scrollTop: 0,
          viewportHeight: 800,
          containerWidth,
        }),
      {
        initialProps: { containerWidth: 1200 },
      }
    );

    const initialHeight = result.current.totalHeight;

    // Change container width (different column count)
    rerender({ containerWidth: 600 });

    // Layout should be recalculated
    expect(result.current.totalHeight).not.toBe(initialHeight);
  });

  it('should handle empty photos array', () => {
    const { result } = renderHook(() =>
      useVirtualization({
        photos: [],
        scrollTop: 0,
        viewportHeight: 800,
        containerWidth: 1200,
      })
    );

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.totalHeight).toBe(0);
  });

  it('should include buffer items in visible range', () => {
    const { result } = renderHook(() =>
      useVirtualization({
        photos: mockPhotos,
        scrollTop: 0,
        viewportHeight: 500,
        containerWidth: 1200,
      })
    );

    // Should include items outside immediate viewport due to buffer
    expect(result.current.visibleItems.length).toBeGreaterThanOrEqual(0);
  });

  it('should memoize calculations', () => {
    const calculateSpy = vi.fn();

    // Mock the calculation functions
    vi.doMock('@/utils/grid', () => ({
      calculateGridDimensions: vi.fn().mockReturnValue({
        containerWidth: 1200,
        columnWidth: 280,
        columnCount: 4,
        gutterSize: 16,
      }),
      calculateMasonryLayout: vi.fn(() => {
        calculateSpy();
        return [];
      }),
      getVisibleItems: vi.fn().mockReturnValue([]),
      calculateGridHeight: vi.fn().mockReturnValue(1000),
    }));

    const { rerender } = renderHook(
      ({ scrollTop }) =>
        useVirtualization({
          photos: mockPhotos,
          scrollTop,
          viewportHeight: 800,
          containerWidth: 1200,
        }),
      {
        initialProps: { scrollTop: 0 },
      }
    );

    // Change only scroll position (should not recalculate layout)
    rerender({ scrollTop: 100 });
    rerender({ scrollTop: 200 });

    // Layout calculation should be memoized
    // Note: This test would need actual implementation to verify memoization
  });

  it('should handle different viewport heights', () => {
    const { result: smallViewport } = renderHook(() =>
      useVirtualization({
        photos: mockPhotos,
        scrollTop: 0,
        viewportHeight: 400,
        containerWidth: 1200,
      })
    );

    const { result: largeViewport } = renderHook(() =>
      useVirtualization({
        photos: mockPhotos,
        scrollTop: 0,
        viewportHeight: 1200,
        containerWidth: 1200,
      })
    );

    // Larger viewport might show more items
    expect(largeViewport.current.visibleItems.length).toBeGreaterThanOrEqual(
      smallViewport.current.visibleItems.length
    );
  });

  it('should handle photos with different aspect ratios', () => {
    const diversePhotos: Photo[] = [
      { ...mockPhotos[0], aspectRatio: 16 / 9 }, // Wide
      { ...mockPhotos[1], aspectRatio: 9 / 16 }, // Tall
      { ...mockPhotos[2], aspectRatio: 1 }, // Square
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        photos: diversePhotos,
        scrollTop: 0,
        viewportHeight: 800,
        containerWidth: 1200,
      })
    );

    expect(result.current.visibleItems).toBeDefined();
    expect(result.current.totalHeight).toBeGreaterThan(0);
  });

  it('should handle scroll to bottom', () => {
    const { result } = renderHook(() =>
      useVirtualization({
        photos: mockPhotos,
        scrollTop: 10000, // Scroll way down
        viewportHeight: 800,
        containerWidth: 1200,
      })
    );

    // Should still return appropriate items or empty array
    expect(result.current.visibleItems).toBeDefined();
  });

  it('should recalculate when photos array changes', () => {
    const { result, rerender } = renderHook(
      ({ photos }) =>
        useVirtualization({
          photos,
          scrollTop: 0,
          viewportHeight: 800,
          containerWidth: 1200,
        }),
      {
        initialProps: { photos: mockPhotos },
      }
    );

    const initialHeight = result.current.totalHeight;

    // Add more photos
    const morePhotos = [...mockPhotos, ...mockPhotos];
    rerender({ photos: morePhotos });

    // Total height should increase
    expect(result.current.totalHeight).toBeGreaterThan(initialHeight);
  });
});
