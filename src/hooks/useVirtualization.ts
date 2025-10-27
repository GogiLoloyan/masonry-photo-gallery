import { useMemo } from 'react';

import { VIRTUALIZATION_BUFFER } from '../constants/config';
import type { Photo, VirtualizedItem } from '../types/app';
import {
  calculateGridDimensions,
  calculateGridHeight,
  calculateMasonryLayout,
  getVisibleItems,
} from '../utils/grid';

interface UseVirtualizationProps {
  photos: Photo[];
  scrollTop: number;
  viewportHeight: number;
  containerWidth: number;
}

interface UseVirtualizationReturn {
  visibleItems: VirtualizedItem[];
  totalHeight: number;
}

export function useVirtualization({
  photos,
  scrollTop,
  viewportHeight,
  containerWidth,
}: UseVirtualizationProps): UseVirtualizationReturn {
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

  return {
    visibleItems,
    totalHeight,
  };
}
