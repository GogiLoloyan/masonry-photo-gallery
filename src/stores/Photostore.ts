import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ITEMS_PER_PAGE } from '@/constants/config';
import { pexelsService } from '@/services/pexels';
import type { Photo, PhotoDetails } from '@/types/app';
import type { RootStore } from './RootStore';

export class PhotoStore {
  rootStore: RootStore;

  // --- Observable state
  photos: Photo[] = [];
  currentPhoto: PhotoDetails | null = null;
  page = 1;
  perPage = ITEMS_PER_PAGE;
  hasMore = true;
  isLoading = false;
  isLoadingMore = false;
  error: string | null = null;
  totalResults = 0;
  activeSearchQuery = ''; // The query that these results are for

  private photoDetailsCache: Map<number, PhotoDetails> = new Map();
  private abortController: AbortController | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      // --- Observable state
      photos: observable,
      currentPhoto: observable,
      page: observable,
      perPage: observable,
      hasMore: observable,
      isLoading: observable,
      isLoadingMore: observable,
      error: observable,
      totalResults: observable,
      activeSearchQuery: observable,

      // --- Computed values
      isInitialLoading: computed,

      // --- Actions
      fetchPhotos: action,
      fetchPhotoDetails: action,
      loadMore: action,
      setCurrentPhoto: action,
      clearCurrentPhoto: action,
      updatePerPage: action,
      cancelRequest: action,
      reset: action,
    });
  }

  // --- Computed
  get isInitialLoading() {
    return this.isLoading && this.photos.length === 0;
  }

  // --- Actions
  async fetchPhotos(reset = false) {
    if (this.isLoading || this.isLoadingMore) return;

    // --- Cancel previous request if exists
    this.cancelRequest();

    runInAction(() => {
      if (reset) {
        this.photos = [];
        this.page = 1;
        this.hasMore = true;
        this.isLoading = true;
        this.totalResults = 0; // Reset total results on new search
      } else {
        this.isLoadingMore = true;
      }
      this.error = null;
    });

    try {
      this.abortController = new AbortController();

      const searchQuery = this.rootStore.searchStore.searchQuery.trim();
      const response = await pexelsService.getPhotos(
        this.page,
        this.perPage,
        searchQuery,
        this.abortController.signal
      );

      runInAction(() => {
        if (reset) {
          this.photos = response.photos;
        } else {
          this.photos = [...this.photos, ...response.photos];
        }

        this.totalResults = response.totalResults;
        this.activeSearchQuery = searchQuery; // Update active query when results arrive
        this.hasMore = this.page * this.perPage < response.totalResults;
        this.page += 1;
        this.isLoading = false;
        this.isLoadingMore = false;
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        runInAction(() => {
          this.error = error.message || 'Failed to fetch photos';
          this.isLoading = false;
          this.isLoadingMore = false;
        });
      }
    }
  }

  async fetchPhotoDetails(id: number) {
    // --- Check cache first
    if (this.photoDetailsCache.has(id)) {
      runInAction(() => {
        this.currentPhoto = this.photoDetailsCache.get(id)!;
      });
      return;
    }

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const details = await pexelsService.getPhotoDetails(id);

      runInAction(() => {
        this.currentPhoto = details;
        this.photoDetailsCache.set(id, details);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch photo details';
        this.isLoading = false;
      });
    }
  }

  loadMore() {
    if (!this.hasMore || this.isLoadingMore) return;
    this.fetchPhotos(false);
  }

  setCurrentPhoto(photo: PhotoDetails | null) {
    this.currentPhoto = photo;
  }

  clearCurrentPhoto() {
    this.currentPhoto = null;
  }

  updatePerPage(perPage: number) {
    this.perPage = perPage;
    this.fetchPhotos(true);
  }

  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  reset() {
    this.cancelRequest();
    this.photos = [];
    this.currentPhoto = null;
    this.page = 1;
    this.hasMore = true;
    this.isLoading = false;
    this.isLoadingMore = false;
    this.error = null;
    this.totalResults = 0;
    this.activeSearchQuery = '';
    this.photoDetailsCache.clear();
  }
}
