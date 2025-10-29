import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export class SearchStore {
  rootStore: RootStore;

  // --- Observable state
  searchQuery = '';
  isSearching = false;
  searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  debounceDelay = 500;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      // --- Observable state
      searchQuery: observable,
      isSearching: observable,
      debounceDelay: observable,

      // --- Computed values
      hasActiveSearch: computed,

      // --- Actions
      setSearchQuery: action,
      executeSearch: action,
      clearSearch: action,
      reset: action,
    });
  }

  // --- Computed values
  get hasActiveSearch() {
    return this.searchQuery.length > 0;
  }

  // --- Actions
  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.debouncedSearch();
  }

  private debouncedSearch() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.executeSearch();
    }, this.debounceDelay);
  }

  async executeSearch() {
    const trimmedQuery = this.searchQuery.trim();

    if (!trimmedQuery) {
      // --- If search is empty or only whitespace, fetch default photos
      await this.rootStore.photoStore.fetchPhotos(true);
      return;
    }

    runInAction(() => {
      this.isSearching = true;
    });

    await this.rootStore.photoStore.fetchPhotos(true);

    runInAction(() => {
      this.isSearching = false;
    });
  }

  clearSearch() {
    this.searchQuery = '';

    // Clear search debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Fetch default photos
    this.rootStore.photoStore.fetchPhotos(true);
  }

  reset() {
    this.searchQuery = '';
    this.isSearching = false;

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }
}
