import { GUTTER_SIZE, MIN_COLUMN_WIDTH } from '../constants/config';
import type { GridDimensions, Photo, VirtualizedItem } from '../types/app';

/**
 * Calculates grid dimensions based on container width
 */
export function calculateGridDimensions(containerWidth: number): GridDimensions {
  const columnCount = Math.max(1, Math.floor(containerWidth / MIN_COLUMN_WIDTH));
  const totalGutterWidth = GUTTER_SIZE * (columnCount - 1);
  const columnWidth = (containerWidth - totalGutterWidth) / columnCount;

  return {
    containerWidth,
    columnWidth,
    columnCount,
    gutterSize: GUTTER_SIZE,
  };
}

/**
 * Calculates positions for masonry layout items
 */
export function calculateMasonryLayout(
  photos: Photo[],
  dimensions: GridDimensions
): VirtualizedItem[] {
  const { columnWidth, columnCount, gutterSize } = dimensions;
  const columnHeights = new Array(columnCount).fill(0);
  const items: VirtualizedItem[] = [];

  photos.forEach((photo, index) => {
    // Find shortest column
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

    // Calculate position
    const left = shortestColumn * (columnWidth + gutterSize);
    const top = columnHeights[shortestColumn];

    // Calculate height based on aspect ratio
    const height = columnWidth / photo.aspectRatio;

    // Update column height
    columnHeights[shortestColumn] += height + gutterSize;

    items.push({
      index,
      photo,
      top,
      left,
      width: columnWidth,
      height,
      column: shortestColumn,
    });
  });

  return items;
}

/**
 * Gets visible items based on scroll position
 */
export function getVisibleItems(
  items: VirtualizedItem[],
  scrollTop: number,
  viewportHeight: number,
  buffer: number = 5
): VirtualizedItem[] {
  const bufferPx = buffer * 100; // Convert buffer items to pixels
  const viewportTop = scrollTop - bufferPx;
  const viewportBottom = scrollTop + viewportHeight + bufferPx;

  return items.filter((item) => {
    const itemBottom = item.top + item.height;
    return itemBottom >= viewportTop && item.top <= viewportBottom;
  });
}

/**
 * Calculates total grid height
 */
export function calculateGridHeight(items: VirtualizedItem[]): number {
  if (items.length === 0) return 0;

  const maxBottom = Math.max(...items.map((item) => item.top + item.height));
  return maxBottom;
}

/**
 * Groups items by column for optimization
 */
export function groupItemsByColumn(items: VirtualizedItem[]): Map<number, VirtualizedItem[]> {
  const columnMap = new Map<number, VirtualizedItem[]>();

  items.forEach((item) => {
    if (!columnMap.has(item.column)) {
      columnMap.set(item.column, []);
    }
    columnMap.get(item.column)!.push(item);
  });

  return columnMap;
}
