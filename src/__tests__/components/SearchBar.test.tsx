import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import SearchBar from '@/components/SearchBar';
import { useStores } from '@/stores/RootStore';
import { render } from '@/test/test-utils';

vi.mock('@/stores/RootStore', () => ({
  useStores: vi.fn(),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('SearchBar Component', () => {
  const mockSearchStore = {
    searchQuery: '',
    isSearching: false,
    hasActiveSearch: false,
    setSearchQuery: vi.fn(),
    clearSearch: vi.fn(),
    executeSearch: vi.fn(),
  };

  const mockPhotoStore = {
    totalResults: 0,
    activeSearchQuery: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStores as any).mockReturnValue({
      searchStore: mockSearchStore,
      photoStore: mockPhotoStore,
    });
  });

  it('should render search input', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should update search query on input change', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    fireEvent.change(searchInput, { target: { value: 'nature' } });

    await waitFor(() => {
      expect(mockSearchStore.setSearchQuery).toHaveBeenCalledWith('nature');
    });
  });

  it('should show clear button when search query exists', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        searchQuery: 'test',
        hasActiveSearch: true,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when search query is empty', () => {
    render(<SearchBar />);

    const clearButton = screen.queryByRole('button', { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        searchQuery: 'test',
        hasActiveSearch: true,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockSearchStore.clearSearch).toHaveBeenCalled();
  });

  it('should show loading state when searching', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        isSearching: true,
        searchQuery: 'test', // Need a query for the clear button area to show
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const loadingIndicator = screen.getByTestId('search-loading');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('should display search results count', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        hasActiveSearch: true,
        searchQuery: 'flowers',
      },
      photoStore: {
        ...mockPhotoStore,
        totalResults: 150,
        activeSearchQuery: 'flowers',
      },
    });

    render(<SearchBar />);

    expect(screen.getByText(/150 results for "flowers"/i)).toBeInTheDocument();
  });

  it('should handle Enter key to trigger search', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    fireEvent.change(searchInput, { target: { value: 'landscape' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(mockSearchStore.executeSearch).toHaveBeenCalled();
  });

  it('should handle form submission', () => {
    render(<SearchBar />);

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    expect(mockSearchStore.executeSearch).toHaveBeenCalled();
  });

  it('should disable input while searching', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        isSearching: true,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    expect(searchInput).toBeDisabled();
  });

  it('should show search icon', () => {
    render(<SearchBar />);

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should handle empty search submission', () => {
    render(<SearchBar />);

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    // Should clear search if empty
    expect(mockSearchStore.executeSearch).toHaveBeenCalled();
  });

  it('should trim whitespace from search query', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    fireEvent.change(searchInput, { target: { value: '  nature  ' } });

    expect(mockSearchStore.setSearchQuery).toHaveBeenCalledWith('nature');
  });

  it('should show no results message', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        hasActiveSearch: true,
        searchQuery: 'xyz123',
      },
      photoStore: {
        ...mockPhotoStore,
        totalResults: 0,
        activeSearchQuery: 'xyz123',
      },
    });

    render(<SearchBar />);

    expect(screen.getByText(/no results found for "xyz123"/i)).toBeInTheDocument();
  });

  it('should maintain focus after clearing search', () => {
    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        searchQuery: 'test',
        hasActiveSearch: true,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i) as HTMLInputElement;
    const clearButton = screen.getByRole('button', { name: /clear/i });

    searchInput.focus();
    fireEvent.click(clearButton);

    expect(document.activeElement).toBe(searchInput);
  });

  it('should handle special characters in search', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for photos/i);
    const specialQuery = 'test & photos @ #nature!';
    fireEvent.change(searchInput, { target: { value: specialQuery } });

    expect(mockSearchStore.setSearchQuery).toHaveBeenCalledWith(specialQuery);
  });

  // TODO: Implement search suggestions feature
  it.skip('should show search suggestions dropdown', () => {
    const suggestions = ['nature', 'landscape', 'ocean'];

    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        searchQuery: 'n',
        suggestions,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    suggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  // TODO: Implement search suggestions feature
  it.skip('should select suggestion on click', () => {
    const suggestions = ['nature', 'landscape'];

    (useStores as any).mockReturnValue({
      searchStore: {
        ...mockSearchStore,
        searchQuery: 'n',
        suggestions,
      },
      photoStore: mockPhotoStore,
    });

    render(<SearchBar />);

    const natureSuggestion = screen.getByText('nature');
    fireEvent.click(natureSuggestion);

    expect(mockSearchStore.setSearchQuery).toHaveBeenCalledWith('nature');
    expect(mockSearchStore.executeSearch).toHaveBeenCalled();
  });
});
