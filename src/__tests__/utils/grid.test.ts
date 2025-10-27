import { describe, expect, it } from 'vitest';

import {
  DESKTOP_COLUMNS,
  GUTTER_SIZE,
  LARGE_DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  TABLET_COLUMNS,
} from '@/constants/config';
import type { Photo, VirtualizedItem } from '@/types/app';
import {
  calculateGridDimensions,
  calculateGridHeight,
  calculateMasonryLayout,
  getVisibleItems,
  groupItemsByColumn,
} from '@/utils/grid';

describe('Grid Utilities', () => {
  describe('calculateGridDimensions', () => {
    it('should return correct dimensions for mobile screens', () => {
      const containerWidth = 400;
      const dimensions = calculateGridDimensions(containerWidth);

      expect(dimensions.columnCount).toBe(MOBILE_COLUMNS);
      expect(dimensions.containerWidth).toBe(containerWidth);
      expect(dimensions.gutterSize).toBe(GUTTER_SIZE);

      const expectedColumnWidth =
        (containerWidth - GUTTER_SIZE * (MOBILE_COLUMNS - 1)) / MOBILE_COLUMNS;
      expect(dimensions.columnWidth).toBe(expectedColumnWidth);
    });

    it('should return correct dimensions for tablet screens', () => {
      const containerWidth = 800;
      const dimensions = calculateGridDimensions(containerWidth);

      expect(dimensions.columnCount).toBe(TABLET_COLUMNS);
      const expectedColumnWidth =
        (containerWidth - GUTTER_SIZE * (TABLET_COLUMNS - 1)) / TABLET_COLUMNS;
      expect(dimensions.columnWidth).toBe(expectedColumnWidth);
    });

    it('should return correct dimensions for desktop screens', () => {
      const containerWidth = 1200;
      const dimensions = calculateGridDimensions(containerWidth);

      expect(dimensions.columnCount).toBe(DESKTOP_COLUMNS);
      const expectedColumnWidth =
        (containerWidth - GUTTER_SIZE * (DESKTOP_COLUMNS - 1)) / DESKTOP_COLUMNS;
      expect(dimensions.columnWidth).toBe(expectedColumnWidth);
    });

    it('should return correct dimensions for large desktop screens', () => {
      const containerWidth = 1600;
      const dimensions = calculateGridDimensions(containerWidth);

      expect(dimensions.columnCount).toBe(LARGE_DESKTOP_COLUMNS);
      const expectedColumnWidth =
        (containerWidth - GUTTER_SIZE * (LARGE_DESKTOP_COLUMNS - 1)) / LARGE_DESKTOP_COLUMNS;
      expect(dimensions.columnWidth).toBe(expectedColumnWidth);
    });

    it('should handle edge case of very small containers', () => {
      const containerWidth = 200;
      const dimensions = calculateGridDimensions(containerWidth);

      expect(dimensions.columnCount).toBe(MOBILE_COLUMNS);
      expect(dimensions.columnWidth).toBeGreaterThan(0);
    });
  });

  describe('calculateMasonryLayout', () => {
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
        photographer: 'Test User 1',
        photographerUrl: 'https://test1.com',
        alt: 'Test photo 1',
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
        photographer: 'Test User 2',
        photographerUrl: 'https://test2.com',
        alt: 'Test photo 2',
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
        photographer: 'Test User 3',
        photographerUrl: 'https://test3.com',
        alt: 'Test photo 3',
        avgColor: '#888888',
      },
    ];

    it('should calculate correct positions for masonry layout', () => {
      const dimensions = {
        containerWidth: 800,
        columnWidth: 250,
        columnCount: 3,
        gutterSize: GUTTER_SIZE,
      };

      const items = calculateMasonryLayout(mockPhotos, dimensions);

      expect(items).toHaveLength(mockPhotos.length);

      // First item should be at top-left
      expect(items[0].top).toBe(0);
      expect(items[0].left).toBe(0);
      expect(items[0].width).toBe(250);
      expect(items[0].height).toBe(250 / mockPhotos[0].aspectRatio);
      expect(items[0].column).toBe(0);

      // Second item should be in second column
      expect(items[1].top).toBe(0);
      expect(items[1].left).toBe(250 + GUTTER_SIZE);
      expect(items[1].column).toBe(1);

      // Third item should be in third column
      expect(items[2].top).toBe(0);
      expect(items[2].left).toBe((250 + GUTTER_SIZE) * 2);
      expect(items[2].column).toBe(2);
    });

    it('should place items in shortest column', () => {
      const tallPhoto: Photo = {
        ...mockPhotos[0],
        id: 4,
        aspectRatio: 1 / 3, // Very tall
      };

      const photos = [tallPhoto, ...mockPhotos];
      const dimensions = {
        containerWidth: 800,
        columnWidth: 250,
        columnCount: 2,
        gutterSize: GUTTER_SIZE,
      };

      const items = calculateMasonryLayout(photos, dimensions);

      // First photo goes to column 0 (tall)
      expect(items[0].column).toBe(0);

      // Second photo goes to column 1 (empty)
      expect(items[1].column).toBe(1);

      // Third photo should go to column 1 (shorter)
      expect(items[2].column).toBe(1);

      // Fourth photo position should depend on column heights
      const col0Height = items[0].height + GUTTER_SIZE;
      const col1Height = items[1].height + GUTTER_SIZE + items[2].height + GUTTER_SIZE;

      expect(items[3].column).toBe(col0Height <= col1Height ? 0 : 1);
    });

    it('should handle empty photo array', () => {
      const dimensions = {
        containerWidth: 800,
        columnWidth: 250,
        columnCount: 3,
        gutterSize: GUTTER_SIZE,
      };

      const items = calculateMasonryLayout([], dimensions);
      expect(items).toEqual([]);
    });

    it('should handle single column layout', () => {
      const dimensions = {
        containerWidth: 200,
        columnWidth: 200,
        columnCount: 1,
        gutterSize: 0,
      };

      const items = calculateMasonryLayout(mockPhotos, dimensions);

      // All items should be in column 0
      items.forEach((item) => {
        expect(item.column).toBe(0);
        expect(item.left).toBe(0);
      });

      // Items should stack vertically
      expect(items[1].top).toBe(items[0].height);
      expect(items[2].top).toBe(items[0].height + items[1].height);
    });
  });

  describe('getVisibleItems', () => {
    const mockItems: VirtualizedItem[] = [
      {
        index: 0,
        photo: {} as Photo,
        top: 0,
        left: 0,
        width: 200,
        height: 200,
        column: 0,
      },
      {
        index: 1,
        photo: {} as Photo,
        top: 300,
        left: 0,
        width: 200,
        height: 200,
        column: 0,
      },
      {
        index: 2,
        photo: {} as Photo,
        top: 600,
        left: 0,
        width: 200,
        height: 200,
        column: 0,
      },
      {
        index: 3,
        photo: {} as Photo,
        top: 900,
        left: 0,
        width: 200,
        height: 200,
        column: 0,
      },
    ];

    it('should return visible items within viewport', () => {
      const scrollTop = 400;
      const viewportHeight = 300;
      const buffer = 0;

      const visibleItems = getVisibleItems(mockItems, scrollTop, viewportHeight, buffer);

      // Items at 300-500 and 600-800 should be visible
      expect(visibleItems).toHaveLength(2);
      expect(visibleItems[0].index).toBe(1);
      expect(visibleItems[1].index).toBe(2);
    });

    it('should include buffer items', () => {
      const scrollTop = 400;
      const viewportHeight = 300;
      const buffer = 2; // 200px buffer

      const visibleItems = getVisibleItems(mockItems, scrollTop, viewportHeight, buffer);

      // With 200px buffer, items from 200 to 900 should be visible
      expect(visibleItems).toHaveLength(3);
      expect(visibleItems[0].index).toBe(1);
      expect(visibleItems[1].index).toBe(2);
      expect(visibleItems[2].index).toBe(3);
    });

    it('should handle scroll at top', () => {
      const scrollTop = 0;
      const viewportHeight = 500;
      const buffer = 0;

      const visibleItems = getVisibleItems(mockItems, scrollTop, viewportHeight, buffer);

      // Items at 0-200 and 300-500 should be visible
      expect(visibleItems).toHaveLength(2);
      expect(visibleItems[0].index).toBe(0);
      expect(visibleItems[1].index).toBe(1);
    });

    it('should handle scroll at bottom', () => {
      const scrollTop = 800;
      const viewportHeight = 400;
      const buffer = 0;

      const visibleItems = getVisibleItems(mockItems, scrollTop, viewportHeight, buffer);

      // Item at 900-1100 should be visible
      expect(visibleItems).toHaveLength(1);
      expect(visibleItems[0].index).toBe(3);
    });

    it('should return empty array when no items are visible', () => {
      const scrollTop = 2000;
      const viewportHeight = 100;
      const buffer = 0;

      const visibleItems = getVisibleItems(mockItems, scrollTop, viewportHeight, buffer);

      expect(visibleItems).toEqual([]);
    });

    it('should handle empty items array', () => {
      const visibleItems = getVisibleItems([], 0, 100, 0);
      expect(visibleItems).toEqual([]);
    });
  });

  describe('calculateGridHeight', () => {
    it('should return correct grid height', () => {
      const items: VirtualizedItem[] = [
        { index: 0, photo: {} as Photo, top: 0, left: 0, width: 200, height: 200, column: 0 },
        { index: 1, photo: {} as Photo, top: 0, left: 220, width: 200, height: 300, column: 1 },
        { index: 2, photo: {} as Photo, top: 220, left: 0, width: 200, height: 150, column: 0 },
      ];

      const height = calculateGridHeight(items);
      expect(height).toBe(370); // Max of (200+150) and (300)
    });

    it('should return 0 for empty items', () => {
      const height = calculateGridHeight([]);
      expect(height).toBe(0);
    });

    it('should handle single item', () => {
      const items: VirtualizedItem[] = [
        { index: 0, photo: {} as Photo, top: 100, left: 0, width: 200, height: 300, column: 0 },
      ];

      const height = calculateGridHeight(items);
      expect(height).toBe(400);
    });
  });

  describe('groupItemsByColumn', () => {
    it('should group items by column correctly', () => {
      const items: VirtualizedItem[] = [
        { index: 0, photo: {} as Photo, top: 0, left: 0, width: 200, height: 200, column: 0 },
        { index: 1, photo: {} as Photo, top: 0, left: 220, width: 200, height: 300, column: 1 },
        { index: 2, photo: {} as Photo, top: 220, left: 0, width: 200, height: 150, column: 0 },
        { index: 3, photo: {} as Photo, top: 320, left: 220, width: 200, height: 200, column: 1 },
      ];

      const grouped = groupItemsByColumn(items);

      expect(grouped.size).toBe(2);
      expect(grouped.get(0)).toHaveLength(2);
      expect(grouped.get(1)).toHaveLength(2);
      expect(grouped.get(0)?.[0].index).toBe(0);
      expect(grouped.get(0)?.[1].index).toBe(2);
      expect(grouped.get(1)?.[0].index).toBe(1);
      expect(grouped.get(1)?.[1].index).toBe(3);
    });

    it('should handle empty items', () => {
      const grouped = groupItemsByColumn([]);
      expect(grouped.size).toBe(0);
    });

    it('should handle single column', () => {
      const items: VirtualizedItem[] = [
        { index: 0, photo: {} as Photo, top: 0, left: 0, width: 200, height: 200, column: 0 },
        { index: 1, photo: {} as Photo, top: 220, left: 0, width: 200, height: 200, column: 0 },
      ];

      const grouped = groupItemsByColumn(items);
      expect(grouped.size).toBe(1);
      expect(grouped.get(0)).toHaveLength(2);
    });
  });
});
