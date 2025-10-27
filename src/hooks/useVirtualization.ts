import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { VIRTUALIZATION_BUFFER } from '../constants/config';
import type { Photo, VirtualizedItem } from '../types/app';
import {
  calculateGridDimensions,
  calculateGridHeight,
  calculateMasonryLayout,
  getVisibleItems,
} from '../utils/grid';
import { throttle } from '../utils/performance';

interface UseVirtualizationProps {
  photos: Photo[];
  containerWidth: number;
}

interface UseVirtualizationReturn {
  visibleItems: VirtualizedItem[];
  totalHeight: number;
  handleScroll: (scrollTop: number) => void;
}

export function useVirtualization({
  photos,
  containerWidth,
}: UseVirtualizationProps): UseVirtualizationReturn {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const scrollHandlerRef = useRef<(scrollTop: number) => void>(null);

  // --- Calculate grid dimensions
  const dimensions = useMemo(() => calculateGridDimensions(containerWidth), [containerWidth]);

  // --- Calculate all item positions
  const allItems = useMemo(() => calculateMasonryLayout(photos, dimensions), [photos, dimensions]);

  // --- Calculate visible items
  const visibleItems = useMemo(
    () => getVisibleItems(allItems, scrollTop, viewportHeight, VIRTUALIZATION_BUFFER),
    [allItems, scrollTop, viewportHeight]
  );

  // --- Calculate total height
  const totalHeight = useMemo(() => calculateGridHeight(allItems), [allItems]);

  // --- Throttled scroll handler
  useEffect(() => {
    scrollHandlerRef.current = throttle((newScrollTop: number) => {
      setScrollTop(newScrollTop);
    }, 16); // ~60fps
  }, []);

  const handleScroll = useCallback((newScrollTop: number) => {
    scrollHandlerRef.current?.(newScrollTop);
  }, []);

  // --- Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  };
}
