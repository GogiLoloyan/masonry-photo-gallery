// API Configuration
export const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Pagination
export const ITEMS_PER_PAGE = 40;

// Grid Configuration
export const MIN_COLUMN_WIDTH = 250;
export const GUTTER_SIZE = 16;
export const MOBILE_COLUMNS = 2;
export const TABLET_COLUMNS = 3;
export const DESKTOP_COLUMNS = 4;
export const LARGE_DESKTOP_COLUMNS = 5;

// Virtualization
export const VIRTUALIZATION_BUFFER = 5; // Number of items to render outside viewport
export const INTERSECTION_THRESHOLD = 0.1;
export const INTERSECTION_ROOT_MARGIN = '100px';

// desktop first approach
// Breakpoints
export const BREAKPOINTS = {
  desktop: 1440,
  tablet: 1024,
  mobile: 768,
} as const;
