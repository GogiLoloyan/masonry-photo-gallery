import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PhotoGrid from '@/components/PhotoGrid';
import { useVirtualization } from '@/hooks/useVirtualization';
import { useStores } from '@/stores/RootStore';
import { createMockPhotos } from '@/test/mocks';
import { render } from '@/test/test-utils';

// Mock the hooks
vi.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({
    triggerRef: { current: null },
  })),
}));

vi.mock('@/hooks/useVirtualization', () => ({
  useVirtualization: vi.fn(() => ({
    visibleItems: [],
    totalHeight: 0,
  })),
}));

vi.mock('@/stores/RootStore', () => ({
  useStores: vi.fn(),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PhotoGrid Component', () => {
  const mockPhotoStore = {
    photos: createMockPhotos(10),
    hasMore: true,
    isLoadingMore: false,
    error: null,
    fetchPhotos: vi.fn(),
  };

  const mockUiStore = {
    scrollTop: 0,
    viewportHeight: 800,
    containerWidth: 1200,
    setContainerElement: vi.fn(),
    handleScroll: vi.fn(),
    openPhotoModal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStores as any).mockReturnValue({
      photoStore: mockPhotoStore,
      uiStore: mockUiStore,
    });
  });

  it('should render grid container', () => {
    render(<PhotoGrid />);

    const gridContainer = screen.getByRole('region', { name: /photo grid/i });
    expect(gridContainer).toBeInTheDocument();
  });

  it('should set container element on mount', () => {
    render(<PhotoGrid />);

    expect(mockUiStore.setContainerElement).toHaveBeenCalled();
  });

  it('should clean up container element on unmount', () => {
    const { unmount } = render(<PhotoGrid />);

    unmount();

    expect(mockUiStore.setContainerElement).toHaveBeenCalledWith(null);
  });

  it('should handle scroll events', () => {
    render(<PhotoGrid />);

    const scrollContainer = screen.getByRole('region', { name: /photo grid/i });
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 100 } });

    expect(mockUiStore.handleScroll).toHaveBeenCalledWith(100);
  });

  it('should render visible items from virtualization', () => {
    const visibleItems = [
      {
        index: 0,
        photo: createMockPhotos(1)[0],
        top: 0,
        left: 0,
        width: 300,
        height: 200,
        column: 0,
      },
      {
        index: 1,
        photo: createMockPhotos(2)[1],
        top: 0,
        left: 320,
        width: 300,
        height: 250,
        column: 1,
      },
    ];

    (useVirtualization as any).mockReturnValueOnce({
      visibleItems,
      totalHeight: 1000,
    });

    render(<PhotoGrid />);

    const items = screen.getAllByRole('article');
    expect(items).toHaveLength(2);
  });

  it('should open photo modal when item is clicked', async () => {
    const visibleItems = [
      {
        index: 0,
        photo: createMockPhotos(1)[0],
        top: 0,
        left: 0,
        width: 300,
        height: 200,
        column: 0,
      },
    ];

    (useVirtualization as any).mockReturnValueOnce({
      visibleItems,
      totalHeight: 1000,
    });

    render(<PhotoGrid />);

    const gridItem = screen.getByRole('article');
    fireEvent.click(gridItem);

    await waitFor(() => {
      expect(mockUiStore.openPhotoModal).toHaveBeenCalledWith(1);
    });
  });

  it('should display error state when error occurs', () => {
    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        error: 'Failed to fetch photos',
      },
      uiStore: mockUiStore,
    });

    render(<PhotoGrid />);

    expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch photos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should retry fetching photos when retry button is clicked', () => {
    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        error: 'Failed to fetch photos',
      },
      uiStore: mockUiStore,
    });

    render(<PhotoGrid />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockPhotoStore.fetchPhotos).toHaveBeenCalledWith(true);
  });

  it('should show loading indicator when loading more photos', () => {
    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        isLoadingMore: true,
      },
      uiStore: mockUiStore,
    });

    render(<PhotoGrid />);

    expect(screen.getByText(/loading more photos/i)).toBeInTheDocument();
  });

  it('should render infinite scroll trigger when hasMore is true', () => {
    render(<PhotoGrid />);

    const trigger = screen.getByTestId('infinite-scroll-trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('should not render infinite scroll trigger when hasMore is false', () => {
    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        hasMore: false,
      },
      uiStore: mockUiStore,
    });

    render(<PhotoGrid />);

    const trigger = screen.queryByTestId('infinite-scroll-trigger');
    expect(trigger).not.toBeInTheDocument();
  });

  it('should set correct height on grid container', () => {
    (useVirtualization as any).mockReturnValueOnce({
      visibleItems: [],
      totalHeight: 2000,
    });

    render(<PhotoGrid />);

    const gridContainer = screen.getByTestId('grid-container');
    expect(gridContainer).toHaveStyle({ height: '2000px' });
  });

  it('should handle empty photo list', () => {
    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        photos: [],
        hasMore: false,
      },
      uiStore: mockUiStore,
    });

    render(<PhotoGrid />);

    const items = screen.queryAllByRole('article');
    expect(items).toHaveLength(0);
  });

  it('should update when photos change', () => {
    const { rerender } = render(<PhotoGrid />);

    (useStores as any).mockReturnValue({
      photoStore: {
        ...mockPhotoStore,
        photos: createMockPhotos(20),
      },
      uiStore: mockUiStore,
    });

    rerender(<PhotoGrid />);

    // Virtualization hook should be called with new photos
    expect(useStores).toHaveBeenCalled();
  });
});
