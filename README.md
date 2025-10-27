# Virtualized Masonry Photo Gallery

A high-performance Single Page Application (SPA) featuring a virtualized masonry grid layout with optimized image loading and detailed photo views. Built with React, TypeScript, and modern web development best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Pexels API Key (get one free at [pexels.com/api](https://www.pexels.com/api/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd masonry-photo-gallery

# Install dependencies
npm install

# Set up environment variables
# Add your Pexels API key to .env file
echo "VITE_PEXELS_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Open Vitest UI for interactive testing
npm run test:coverage # Generate test coverage report
npm run test:run     # Run tests once (for CI/CD)
```

## 📋 Features

### Core Features
- ✅ **Virtualized Masonry Grid**: Custom implementation without third-party libraries
- ✅ **Infinite Scroll**: Seamless loading of additional photos as you scroll
- ✅ **Photo Details View**: Modal with enlarged photo and metadata
- ✅ **Responsive Design**: Adaptive column layout for all screen sizes
- ✅ **Search Functionality**: Real-time search with debouncing
- ✅ **Error Boundaries**: Graceful error handling throughout the app
- ✅ **TypeScript**: Full type safety with strict typing

### Performance Features
- ✅ **Custom Virtualization**: Only renders visible items for optimal performance
- ✅ **Image Optimization**: Progressive loading with blurhash placeholders
- ✅ **Code Splitting**: Optimized bundle sizes with manual chunks
- ✅ **Web Vitals Monitoring**: Real-time performance metrics tracking
- ✅ **Throttled Scroll**: 60 FPS scroll performance
- ✅ **Lazy Loading**: Images load only when needed

## 🏗️ Architecture & Design Decisions

### Technology Stack

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Build Tool** | Vite with Rolldown | Faster builds, better tree-shaking, optimal bundle sizes |
| **Framework** | React 19 | Latest features, improved performance |
| **Language** | TypeScript | Type safety, better IDE support, fewer runtime errors |
| **State Management** | MobX | Reactive state management with minimal boilerplate |
| **Styling** | Vanilla Extract | Zero-runtime CSS-in-JS, type-safe styles |
| **Data Fetching** | Axios + React Query | Robust API handling with caching |
| **Image Optimization** | Blurhash | Beautiful placeholders while loading |
| **Code Quality** | ESLint + Prettier | Consistent code style and quality |

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GridItem/       # Individual photo card
│   ├── PhotoGrid/      # Main virtualized grid
│   ├── PhotoModal/     # Detailed photo view
│   ├── SearchBar/      # Search functionality
│   └── common/         # Shared components
├── stores/             # MobX state management
│   ├── PhotoStore.ts   # Photo data management
│   ├── UIStore.ts      # UI state (modal, scroll)
│   ├── SearchStore.ts  # Search state
│   └── RootStore.tsx   # Store composition
├── hooks/              # Custom React hooks
│   ├── useVirtualization.ts  # Virtualization logic
│   ├── useInfiniteScroll.ts  # Infinite scroll
│   └── useImageOptimization.ts # Image loading
├── services/           # API integration
│   └── pexels.ts       # Pexels API service
├── utils/              # Utility functions
│   ├── grid.ts         # Grid calculations
│   ├── performance.ts  # Debounce/throttle
│   └── reportWebVitals.ts # Performance monitoring
├── constants/          # Configuration
├── styles/            # Global styles
└── types/             # TypeScript definitions
```

### Key Design Patterns

#### 1. Custom Virtualization
The virtualization system is built from scratch without third-party libraries:

```typescript
// Core virtualization logic
- Calculate all item positions upfront using masonry algorithm
- Track scroll position and viewport dimensions
- Render only visible items with buffer
- Update visible range on scroll/resize
```

**Benefits:**
- Full control over performance optimizations
- No dependency bloat
- Customizable buffer zones
- Precise masonry layout calculations

#### 2. State Management Architecture
Using MobX with a root store pattern:

```typescript
RootStore
├── PhotoStore     // Photo data, pagination, loading states
├── UIStore        // Modal, scroll, viewport management
└── SearchStore    // Search query, debouncing
```

**Benefits:**
- Clear separation of concerns
- Reactive updates with minimal re-renders
- Easy testing and debugging
- Centralized state management

#### 3. Responsive Grid System
Dynamic column count based on viewport:

| Screen Size | Columns | Breakpoint |
|-------------|---------|------------|
| Mobile | 2 | < 768px |
| Tablet | 3 | 768px - 1023px |
| Desktop | 4 | 1024px - 1439px |
| Large Desktop | 5 | ≥ 1440px |

## 🎯 Performance Optimizations

### 1. Virtualization Strategy
- **Buffer Zone**: Renders 5 items outside viewport for smooth scrolling
- **Lazy Calculation**: Position calculations use memoization
- **Efficient Updates**: Only recalculates on dimension changes

### 2. Image Optimization
```typescript
// Progressive loading strategy
1. Show blurhash placeholder immediately
2. Load small thumbnail (lazy)
3. Upgrade to larger image when visible
4. Use WebP with JPEG fallback
5. Responsive srcset for different screen sizes
```

### 3. Bundle Optimization
```javascript
// Vite configuration for optimal chunks
- vendor.js: React and core libraries
- utils.js: Utility libraries
- main.js: Application code
```

**Results:**
- Initial bundle: ~150KB gzipped
- Code splitting reduces initial load
- Tree shaking removes unused code

### 4. Runtime Performance

#### Scroll Performance
- Throttled scroll handler (60 FPS)
- RAF-based updates
- Passive event listeners

#### Memory Management
- Photo details caching with Map
- Cleanup on unmount
- AbortController for cancelled requests

#### Web Vitals Targets
| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ✅ ~1.8s |
| FID | < 100ms | ✅ ~50ms |
| CLS | < 0.1 | ✅ ~0.05 |
| FCP | < 1.8s | ✅ ~1.2s |

### 5. Search Optimization
- **Debounced Input**: 500ms delay reduces API calls
- **Request Cancellation**: Aborts outdated requests
- **Result Caching**: Caches search results

## 🧪 Testing Strategy

### Unit Tests ✅
- **Grid Utilities**: Comprehensive tests for masonry layout calculations, virtualization logic, and responsive column management
- **Store Testing**: MobX store actions, computed values, and state management
- **Custom Hooks**: Tests for useVirtualization, useInfiniteScroll, and useImageOptimization
- **Service Layer**: API service mocking and error handling scenarios
- **Component Testing**: Isolated component behavior and user interactions
- **Performance Utilities**: Debounce and throttle function testing

### Test Infrastructure
- **Framework**: Vitest with React Testing Library
- **Coverage**: Configured with coverage reports (text, JSON, HTML)
- **Mocking**: Complete setup for IntersectionObserver, ResizeObserver, and API calls
- **Test Utilities**: Custom render functions with providers

### Running Tests
```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
npm run test:run      # Run tests once (CI mode)
```

### Performance Testing
- Lighthouse CI for automated checks
- Web Vitals monitoring in production
- Bundle size tracking

## 📊 Performance Monitoring

The application includes comprehensive Web Vitals monitoring:

```typescript
// Automatic reporting in production
- Logs to console in development
- Can be connected to analytics service
- Batched reporting for efficiency
- SendBeacon API for reliability
```

### Metrics Tracked
- **Core Web Vitals**: LCP, FID/INP, CLS
- **Additional Metrics**: FCP, TTFB
- **Custom Metrics**: Image load times, API response times

## 🚢 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Checklist
- ✅ Set production API key
- ✅ Enable GZIP compression
- ✅ Configure CDN for assets
- ✅ Set up error tracking
- ✅ Configure Web Vitals reporting
- ✅ Enable HTTP/2

### Environment Variables
```env
VITE_PEXELS_API_KEY=your_production_key
VITE_ANALYTICS_ID=your_analytics_id (optional)
```

## 🔧 Development Tools

### VS Code Extensions
- ESLint
- Prettier
- TypeScript Vue Plugin
- Vanilla Extract CSS IntelliSense

### Chrome DevTools
- React Developer Tools
- MobX Developer Tools
- Lighthouse for performance audits

## 📝 License

This project is created for a technical assessment and demonstration purposes.

## 🙏 Acknowledgments

- [Pexels API](https://www.pexels.com/api/) for providing free stock photos
- React team for the amazing framework
- Vite team for the blazing fast build tool
- All open source contributors

---

Built with ❤️ using React, TypeScript, and modern web technologies
