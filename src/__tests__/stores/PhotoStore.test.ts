import { runInAction } from 'mobx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PhotoStore } from '@/stores/Photostore';
import { RootStore } from '@/stores/RootStore';
import type { Photo, PhotoDetails } from '@/types/app';

// Mock pexels service
vi.mock('@/services/pexels', () => ({
  pexelsService: {
    getPhotos: vi.fn(),
    getPhotoDetails: vi.fn(),
  },
}));

import { pexelsService } from '@/services/pexels';

describe('PhotoStore', () => {
  let rootStore: RootStore;
  let photoStore: PhotoStore;

  const mockPhoto: Photo = {
    id: 1,
    width: 400,
    height: 300,
    aspectRatio: 4 / 3,
    src: {
      tiny: 'tiny.jpg',
      small: 'small.jpg',
      medium: 'medium.jpg',
      large: 'large.jpg',
      original: 'original.jpg',
    },
    photographer: 'Test Photographer',
    photographerUrl: 'https://test.com',
    alt: 'Test photo',
    avgColor: '#ffffff',
  };

  const mockPhotoDetails: PhotoDetails = {
    ...mockPhoto,
    tags: ['nature', 'landscape'],
    description: 'A beautiful landscape',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    rootStore = new RootStore();
    photoStore = rootStore.photoStore;
    vi.clearAllMocks();
  });

  afterEach(() => {
    photoStore.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(photoStore.photos).toEqual([]);
      expect(photoStore.currentPhoto).toBeNull();
      expect(photoStore.page).toBe(1);
      expect(photoStore.hasMore).toBe(true);
      expect(photoStore.isLoading).toBe(false);
      expect(photoStore.isLoadingMore).toBe(false);
      expect(photoStore.error).toBeNull();
      expect(photoStore.totalResults).toBe(0);
      expect(photoStore.activeSearchQuery).toBe('');
    });
  });

  describe('fetchPhotos', () => {
    it('should fetch photos successfully', async () => {
      const mockResponse = {
        photos: [mockPhoto],
        hasMore: true,
        totalResults: 100,
      };

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      await photoStore.fetchPhotos(true);

      expect(photoStore.photos).toEqual([mockPhoto]);
      expect(photoStore.totalResults).toBe(100);
      expect(photoStore.hasMore).toBe(true);
      expect(photoStore.page).toBe(2);
      expect(photoStore.isLoading).toBe(false);
      expect(photoStore.error).toBeNull();
    });

    it('should append photos when not resetting', async () => {
      const firstPhoto = { ...mockPhoto, id: 1 };
      const secondPhoto = { ...mockPhoto, id: 2 };

      // Set initial state
      runInAction(() => {
        photoStore.photos = [firstPhoto];
        photoStore.page = 2;
      });

      const mockResponse = {
        photos: [secondPhoto],
        hasMore: true,
        totalResults: 100,
      };

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      await photoStore.fetchPhotos(false);

      expect(photoStore.photos).toEqual([firstPhoto, secondPhoto]);
      expect(photoStore.page).toBe(3);
      expect(photoStore.isLoadingMore).toBe(false);
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Network error';
      (pexelsService.getPhotos as any).mockRejectedValue(new Error(errorMessage));

      await photoStore.fetchPhotos(true);

      expect(photoStore.photos).toEqual([]);
      expect(photoStore.error).toBe(errorMessage);
      expect(photoStore.isLoading).toBe(false);
    });

    it('should not fetch when already loading', async () => {
      runInAction(() => {
        photoStore.isLoading = true;
      });

      await photoStore.fetchPhotos(true);

      expect(pexelsService.getPhotos).not.toHaveBeenCalled();
    });

    it('should cancel previous request', async () => {
      const abortSpy = vi.fn();
      (photoStore as any).abortController = {
        abort: abortSpy,
        signal: {} as AbortSignal,
      };

      const mockResponse = {
        photos: [mockPhoto],
        hasMore: true,
        totalResults: 100,
      };

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      await photoStore.fetchPhotos(true);

      expect(abortSpy).toHaveBeenCalled();
    });

    it('should update hasMore based on pagination', async () => {
      const mockResponse = {
        photos: [mockPhoto],
        hasMore: true,
        totalResults: 50,
      };

      runInAction(() => {
        photoStore.page = 2;
        photoStore.perPage = 40;
      });

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      await photoStore.fetchPhotos(false);

      // Page 2 with 40 items per page = 80 items total, which exceeds 50 total results
      expect(photoStore.hasMore).toBe(false);
    });

    it('should handle AbortError silently', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      (pexelsService.getPhotos as any).mockRejectedValue(abortError);

      await photoStore.fetchPhotos(true);

      expect(photoStore.error).toBeNull();
      expect(photoStore.isLoading).toBe(true); // Should remain true for AbortError
    });
  });

  describe('fetchPhotoDetails', () => {
    it('should fetch photo details successfully', async () => {
      (pexelsService.getPhotoDetails as any).mockResolvedValue(mockPhotoDetails);

      await photoStore.fetchPhotoDetails(1);

      expect(photoStore.currentPhoto).toEqual(mockPhotoDetails);
      expect(photoStore.isLoading).toBe(false);
      expect(photoStore.error).toBeNull();
    });

    it('should use cache when available', async () => {
      // First call - should fetch from API
      (pexelsService.getPhotoDetails as any).mockResolvedValue(mockPhotoDetails);
      await photoStore.fetchPhotoDetails(1);
      expect(pexelsService.getPhotoDetails).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await photoStore.fetchPhotoDetails(1);
      expect(pexelsService.getPhotoDetails).toHaveBeenCalledTimes(1);
      expect(photoStore.currentPhoto).toEqual(mockPhotoDetails);
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch details';
      (pexelsService.getPhotoDetails as any).mockRejectedValue(new Error(errorMessage));

      await photoStore.fetchPhotoDetails(1);

      expect(photoStore.currentPhoto).toBeNull();
      expect(photoStore.error).toBe(errorMessage);
      expect(photoStore.isLoading).toBe(false);
    });
  });

  describe('loadMore', () => {
    it('should call fetchPhotos with reset=false', async () => {
      const fetchPhotosSpy = vi.spyOn(photoStore, 'fetchPhotos');
      const mockResponse = {
        photos: [mockPhoto],
        hasMore: true,
        totalResults: 100,
      };

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      photoStore.loadMore();

      expect(fetchPhotosSpy).toHaveBeenCalledWith(false);
    });

    it('should not load more when hasMore is false', () => {
      runInAction(() => {
        photoStore.hasMore = false;
      });

      const fetchPhotosSpy = vi.spyOn(photoStore, 'fetchPhotos');
      photoStore.loadMore();

      expect(fetchPhotosSpy).not.toHaveBeenCalled();
    });

    it('should not load more when already loading', () => {
      runInAction(() => {
        photoStore.isLoadingMore = true;
      });

      const fetchPhotosSpy = vi.spyOn(photoStore, 'fetchPhotos');
      photoStore.loadMore();

      expect(fetchPhotosSpy).not.toHaveBeenCalled();
    });
  });

  describe('Action Methods', () => {
    it('should set current photo', () => {
      photoStore.setCurrentPhoto(mockPhotoDetails);
      expect(photoStore.currentPhoto).toEqual(mockPhotoDetails);
    });

    it('should clear current photo', () => {
      photoStore.setCurrentPhoto(mockPhotoDetails);
      photoStore.clearCurrentPhoto();
      expect(photoStore.currentPhoto).toBeNull();
    });

    it('should update per page and refetch', async () => {
      const fetchPhotosSpy = vi.spyOn(photoStore, 'fetchPhotos');
      const mockResponse = {
        photos: [],
        hasMore: false,
        totalResults: 0,
      };

      (pexelsService.getPhotos as any).mockResolvedValue(mockResponse);

      photoStore.updatePerPage(20);

      expect(photoStore.perPage).toBe(20);
      expect(fetchPhotosSpy).toHaveBeenCalledWith(true);
    });

    it('should cancel request', () => {
      const abortSpy = vi.fn();
      (photoStore as any).abortController = {
        abort: abortSpy,
        signal: {} as AbortSignal,
      };

      photoStore.cancelRequest();

      expect(abortSpy).toHaveBeenCalled();
      expect((photoStore as any).abortController).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      runInAction(() => {
        photoStore.photos = [mockPhoto];
        photoStore.currentPhoto = mockPhotoDetails;
        photoStore.page = 5;
        photoStore.hasMore = false;
        photoStore.isLoading = true;
        photoStore.error = 'Some error';
        photoStore.totalResults = 100;
        photoStore.activeSearchQuery = 'test';
      });

      // Add to cache
      photoStore.fetchPhotoDetails(1);

      photoStore.reset();

      expect(photoStore.photos).toEqual([]);
      expect(photoStore.currentPhoto).toBeNull();
      expect(photoStore.page).toBe(1);
      expect(photoStore.hasMore).toBe(true);
      expect(photoStore.isLoading).toBe(false);
      expect(photoStore.isLoadingMore).toBe(false);
      expect(photoStore.error).toBeNull();
      expect(photoStore.totalResults).toBe(0);
      expect(photoStore.activeSearchQuery).toBe('');
    });
  });

  describe('Computed Values', () => {
    it('should compute isInitialLoading correctly', () => {
      expect(photoStore.isInitialLoading).toBe(false);

      runInAction(() => {
        photoStore.isLoading = true;
      });
      expect(photoStore.isInitialLoading).toBe(true);

      runInAction(() => {
        photoStore.photos = [mockPhoto];
      });
      expect(photoStore.isInitialLoading).toBe(false);
    });
  });
});
