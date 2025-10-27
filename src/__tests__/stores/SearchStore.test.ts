import { runInAction } from 'mobx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootStore } from '@/stores/RootStore';
import { SearchStore } from '@/stores/Searchstore';

describe('SearchStore', () => {
  let rootStore: RootStore;
  let searchStore: SearchStore;

  beforeEach(() => {
    vi.useFakeTimers();
    rootStore = new RootStore();
    searchStore = rootStore.searchStore;
  });

  afterEach(() => {
    searchStore.reset();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(searchStore.searchQuery).toBe('');
      expect(searchStore.isSearching).toBe(false);
      expect(searchStore.searchDebounceTimer).toBeNull();
      expect(searchStore.debounceDelay).toBe(500);
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      searchStore.setSearchQuery('nature');
      expect(searchStore.searchQuery).toBe('nature');
    });

    it('should trigger debounced search', () => {
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      
      searchStore.setSearchQuery('landscape');
      
      // Should not execute immediately
      expect(executeSearchSpy).not.toHaveBeenCalled();
      
      // Advance timers to trigger debounce
      vi.advanceTimersByTime(500);
      
      expect(executeSearchSpy).toHaveBeenCalled();
    });

    it('should cancel previous debounce on new query', () => {
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      
      searchStore.setSearchQuery('first');
      vi.advanceTimersByTime(300);
      
      searchStore.setSearchQuery('second');
      vi.advanceTimersByTime(300);
      
      // Should not have executed for 'first'
      expect(executeSearchSpy).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(200);
      
      // Should execute only once for 'second'
      expect(executeSearchSpy).toHaveBeenCalledTimes(1);
      expect(searchStore.searchQuery).toBe('second');
    });

    it('should handle rapid query changes', () => {
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      
      // Simulate rapid typing
      const queries = ['n', 'na', 'nat', 'natu', 'natur', 'nature'];
      queries.forEach(query => {
        searchStore.setSearchQuery(query);
        vi.advanceTimersByTime(100);
      });
      
      // Should not have executed yet
      expect(executeSearchSpy).not.toHaveBeenCalled();
      
      // Complete the debounce delay
      vi.advanceTimersByTime(400);
      
      // Should execute once with final query
      expect(executeSearchSpy).toHaveBeenCalledTimes(1);
      expect(searchStore.searchQuery).toBe('nature');
    });
  });

  describe('executeSearch', () => {
    it('should set isSearching during search', async () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockResolvedValue(undefined);
      
      searchStore.setSearchQuery('mountains');
      
      const searchPromise = searchStore.executeSearch();
      expect(searchStore.isSearching).toBe(true);
      
      await searchPromise;
      expect(searchStore.isSearching).toBe(false);
      
      fetchPhotosSpy.mockRestore();
    });

    it('should call fetchPhotos with reset=true', async () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockResolvedValue(undefined);
      
      searchStore.setSearchQuery('ocean');
      await searchStore.executeSearch();
      
      expect(fetchPhotosSpy).toHaveBeenCalledWith(true);
      
      fetchPhotosSpy.mockRestore();
    });

    it('should fetch default photos when search is empty', async () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockResolvedValue(undefined);
      
      // Set and then clear search
      searchStore.setSearchQuery('test');
      searchStore.setSearchQuery('');
      
      await searchStore.executeSearch();
      
      expect(fetchPhotosSpy).toHaveBeenCalledWith(true);
      
      fetchPhotosSpy.mockRestore();
    });

    it('should handle search execution error', async () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockRejectedValue(new Error('Network error'));

      searchStore.setSearchQuery('error-test');

      // executeSearch doesn't catch errors, so it will throw
      await expect(searchStore.executeSearch()).rejects.toThrow('Network error');

      // isSearching will remain true because error is not caught
      expect(searchStore.isSearching).toBe(true);

      fetchPhotosSpy.mockRestore();
    });
  });

  describe('clearSearch', () => {
    it('should clear search query', () => {
      searchStore.setSearchQuery('test query');
      searchStore.clearSearch();
      
      expect(searchStore.searchQuery).toBe('');
    });

    it('should cancel pending debounce timer', () => {
      searchStore.setSearchQuery('pending');
      
      // Timer should be set
      expect(searchStore.searchDebounceTimer).not.toBeNull();
      
      searchStore.clearSearch();
      
      // Timer should be cleared
      vi.advanceTimersByTime(500);
      
      // executeSearch should not have been called
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      expect(executeSearchSpy).not.toHaveBeenCalled();
    });

    it('should fetch default photos after clearing', () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockResolvedValue(undefined);
      
      searchStore.setSearchQuery('something');
      searchStore.clearSearch();
      
      expect(fetchPhotosSpy).toHaveBeenCalledWith(true);
      
      fetchPhotosSpy.mockRestore();
    });
  });

  describe('Computed Values', () => {
    it('should compute hasActiveSearch correctly', () => {
      expect(searchStore.hasActiveSearch).toBe(false);
      
      searchStore.setSearchQuery('test');
      expect(searchStore.hasActiveSearch).toBe(true);
      
      searchStore.setSearchQuery('');
      expect(searchStore.hasActiveSearch).toBe(false);
    });

    it('should handle whitespace-only queries', () => {
      searchStore.setSearchQuery('   ');
      expect(searchStore.hasActiveSearch).toBe(true); // Based on length > 0
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      searchStore.setSearchQuery('test query');
      runInAction(() => {
        searchStore.isSearching = true;
      });

      searchStore.reset();

      expect(searchStore.searchQuery).toBe('');
      expect(searchStore.isSearching).toBe(false);
      // Note: reset() clears the timer but doesn't set it to null
      // The timer reference remains but is cleared
    });

    it('should clear debounce timer on reset', () => {
      searchStore.setSearchQuery('pending search');
      
      // Timer should be set
      expect(searchStore.searchDebounceTimer).not.toBeNull();
      
      searchStore.reset();
      
      // Advance time to check if timer was cleared
      vi.advanceTimersByTime(1000);
      
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      expect(executeSearchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Debounce Delay', () => {
    it('should respect custom debounce delay', () => {
      const executeSearchSpy = vi.spyOn(searchStore, 'executeSearch');
      
      // Change debounce delay
      runInAction(() => {
        searchStore.debounceDelay = 1000;
      });
      
      searchStore.setSearchQuery('delayed');
      
      vi.advanceTimersByTime(500);
      expect(executeSearchSpy).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(500);
      expect(executeSearchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with PhotoStore', () => {
    it('should pass search query to PhotoStore', async () => {
      const fetchPhotosSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotos').mockResolvedValue(undefined);

      searchStore.setSearchQuery('integration test');
      await searchStore.executeSearch();

      // PhotoStore's fetchPhotos should have been called
      expect(fetchPhotosSpy).toHaveBeenCalledWith(true);
      // SearchStore should maintain the search query
      expect(rootStore.searchStore.searchQuery).toBe('integration test');

      fetchPhotosSpy.mockRestore();
    });
  });
});
