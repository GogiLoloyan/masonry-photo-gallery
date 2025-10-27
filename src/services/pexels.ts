import axios, { type AxiosInstance } from 'axios';

import { ITEMS_PER_PAGE, PEXELS_API_KEY, PEXELS_BASE_URL } from '@/constants/config';
import type { Photo, PhotoDetails } from '@/types/app';
import type { PexelsPhoto, PexelsResponse } from '@/types/pexels';

class PexelsService {
  private api: AxiosInstance;
  private readonly API_KEY =
    import.meta.env.VITE_PEXELS_API_KEY || PEXELS_API_KEY || 'YOUR_API_KEY_HERE';

  constructor() {
    this.api = axios.create({
      baseURL: PEXELS_BASE_URL,
      headers: {
        Authorization: this.API_KEY,
      },
      timeout: 10000,
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 429:
              throw new Error('Rate limit exceeded. Please try again later.');
            case 401:
              throw new Error('Invalid API key. Please check your configuration.');
            case 404:
              throw new Error('Resource not found.');
            default:
              throw new Error(`API error: ${error.response.statusText}`);
          }
        } else if (error.request) {
          throw new Error('Network error. Please check your connection.');
        }
        throw error;
      }
    );
  }

  // --- Get photos
  async getPhotos(
    page: number = 1,
    perPage: number = ITEMS_PER_PAGE,
    query?: string,
    signal?: AbortSignal
  ): Promise<{
    photos: Photo[];
    hasMore: boolean;
    totalResults: number;
  }> {
    try {
      const endpoint = query ? '/search' : '/curated';
      const params = query ? { query, page, per_page: perPage } : { page, per_page: perPage };

      const response = await this.api.get<PexelsResponse>(endpoint, {
        params,
        signal,
      });

      return {
        photos: response.data.photos.map(this.transformPhoto),
        hasMore: !!response.data.next_page,
        totalResults: response.data.total_results,
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  // -- Get single photo detals
  async getPhotoDetails(id: number): Promise<PhotoDetails> {
    try {
      const response = await this.api.get<PhotoDetails>(`/photos/${id}`);
      return this.transformPhotoDetails(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private transformPhoto(photo: PexelsPhoto): Photo {
    return {
      id: photo.id,
      width: photo.width,
      height: photo.height,
      aspectRatio: photo.width / photo.height,
      src: {
        tiny: photo.src.tiny,
        small: photo.src.small,
        medium: photo.src.medium,
        large: photo.src.large,
        original: photo.src.original,
      },
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || `Photo by ${photo.photographer}`,
      avgColor: photo.avg_color,
    };
  }

  private transformPhotoDetails(photo: any): PhotoDetails {
    return {
      ...this.transformPhoto(photo),
      // Additional details that might be available
      tags: photo.tags || [],
      description: photo.description || photo.alt || '',
      createdAt: photo.created_at || new Date().toISOString(),
    };
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const pexelsService = new PexelsService();
