import axios, { type AxiosInstance, AxiosError } from 'axios';
import { ITEMS_PER_PAGE, PEXELS_API_KEY, PEXELS_BASE_URL } from '../constants/config';
import type { Photo } from '../types/app';
import type {
  PexelsCuratedResponse,
  PexelsError,
  PexelsPhoto,
  PexelsSearchResponse,
} from '../types/pexels';

class PexelsService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: PEXELS_BASE_URL,
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<PexelsError>) => {
        if (error.response) {
          const pexelsError: PexelsError = {
            error: error.response.data?.error || 'Unknown error occurred',
            status: error.response.status,
          };
          return Promise.reject(pexelsError);
        }
        return Promise.reject(error);
      }
    );
  }

  // Transform Pexels photo to our Photo type
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

  // Get curated photos
  async getCuratedPhotos(
    page: number = 1,
    perPage: number = ITEMS_PER_PAGE
  ): Promise<{
    photos: Photo[];
    hasMore: boolean;
    totalResults?: number;
  }> {
    const response = await this.api.get<PexelsCuratedResponse>('/curated', {
      params: { page, per_page: perPage },
    });

    return {
      photos: response.data.photos.map(this.transformPhoto),
      hasMore: !!response.data.next_page,
      totalResults: response.data.total_results,
    };
  }

  // Search photos
  async searchPhotos(
    query: string,
    page: number = 1,
    perPage: number = ITEMS_PER_PAGE
  ): Promise<{
    photos: Photo[];
    hasMore: boolean;
    totalResults: number;
  }> {
    const response = await this.api.get<PexelsSearchResponse>('/search', {
      params: { query, page, per_page: perPage },
    });

    return {
      photos: response.data.photos.map(this.transformPhoto),
      hasMore: !!response.data.next_page,
      totalResults: response.data.total_results,
    };
  }

  // Get single photo
  async getPhoto(id: number): Promise<Photo> {
    const response = await this.api.get<PexelsPhoto>(`/photos/${id}`);
    return this.transformPhoto(response.data);
  }
}

export const pexelsService = new PexelsService();
