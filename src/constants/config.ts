// API Configuration
export const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Pagination
export const ITEMS_PER_PAGE = 40;

// Breakpoints (desktop-first approach)
export const BREAKPOINTS = {
  desktop: 1440,  // Large desktop screens
  tablet: 1024,   // Tablets and small desktops
  mobile: 768,    // Tablets in portrait mode
  // Below 768px = Mobile phones
} as const;

// Grid Configuration - Column counts per breakpoint
export const MOBILE_COLUMNS = 2;           // < 768px (phones)
export const TABLET_COLUMNS = 3;           // 768px - 1023px
export const DESKTOP_COLUMNS = 4;          // 1024px - 1439px
export const LARGE_DESKTOP_COLUMNS = 5;    // >= 1440px
export const GUTTER_SIZE = 16;             // Space between columns

// Virtualization
export const VIRTUALIZATION_BUFFER = 5; // Number of items to render outside viewport
export const INTERSECTION_THRESHOLD = 0.1;
export const INTERSECTION_ROOT_MARGIN = '100px';
