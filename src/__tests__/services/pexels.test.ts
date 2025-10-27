import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ITEMS_PER_PAGE } from '@/constants/config';
import { mockPexelsResponse } from '@/test/mocks';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
    isCancel: vi.fn(),
  },
}));

// Import after mock is set up
const { pexelsService } = await import('@/services/pexels');

describe('PexelsService', () => {
  const mockedAxios = axios as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPhotos', () => {
    it('should fetch curated photos when no query is provided', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockPexelsResponse }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotos(1, ITEMS_PER_PAGE);

      expect(mockApi.get).toHaveBeenCalledWith('/curated', {
        params: { page: 1, per_page: ITEMS_PER_PAGE },
        signal: undefined,
      });

      expect(result.photos).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.totalResults).toBe(100);
    });

    it('should search photos when query is provided', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockPexelsResponse }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotos(1, ITEMS_PER_PAGE, 'nature');

      expect(mockApi.get).toHaveBeenCalledWith('/search', {
        params: { query: 'nature', page: 1, per_page: ITEMS_PER_PAGE },
        signal: undefined,
      });

      expect(result.photos).toHaveLength(20);
    });

    it('should handle pagination correctly', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: {
            ...mockPexelsResponse,
            page: 2,
            next_page: 'https://api.pexels.com/v1/curated?page=3',
          },
        }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotos(2, ITEMS_PER_PAGE);

      expect(mockApi.get).toHaveBeenCalledWith('/curated', {
        params: { page: 2, per_page: ITEMS_PER_PAGE },
        signal: undefined,
      });

      expect(result.hasMore).toBe(true);
    });

    it('should handle last page correctly', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: {
            ...mockPexelsResponse,
            next_page: null,
          },
        }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotos(5, ITEMS_PER_PAGE);

      expect(result.hasMore).toBe(false);
    });

    it('should pass abort signal when provided', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockPexelsResponse }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const abortController = new AbortController();
      const service = new (pexelsService as any).constructor();
      await service.getPhotos(1, ITEMS_PER_PAGE, undefined, abortController.signal);

      expect(mockApi.get).toHaveBeenCalledWith('/curated', {
        params: { page: 1, per_page: ITEMS_PER_PAGE },
        signal: abortController.signal,
      });
    });

    it('should handle axios cancel errors', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('Aborted')),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);
      mockedAxios.isCancel = vi.fn().mockReturnValue(true);

      const service = new (pexelsService as any).constructor();

      await expect(service.getPhotos(1, ITEMS_PER_PAGE)).rejects.toThrow('Aborted');
    });

    it('should transform photo data correctly', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockPexelsResponse }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotos(1, ITEMS_PER_PAGE);

      const photo = result.photos[0];
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('aspectRatio');
      expect(photo).toHaveProperty('src');
      expect(photo).toHaveProperty('photographer');
      expect(photo).toHaveProperty('alt');
    });
  });

  describe('getPhotoDetails', () => {
    it('should fetch photo details by ID', async () => {
      // Mock data in Pexels API format (snake_case)
      const mockPexelsApiResponse = {
        id: 1,
        width: 1920,
        height: 1080,
        src: {
          tiny: 'https://example.com/tiny.jpg',
          small: 'https://example.com/small.jpg',
          medium: 'https://example.com/medium.jpg',
          large: 'https://example.com/large.jpg',
          original: 'https://example.com/original.jpg',
        },
        photographer: 'John Doe',
        photographer_url: 'https://example.com/photographer',
        alt: 'Test photo',
        avg_color: '#123456',
        tags: ['nature', 'landscape'],
        description: 'A beautiful landscape photo',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: mockPexelsApiResponse }),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();
      const result = await service.getPhotoDetails(1);

      expect(mockApi.get).toHaveBeenCalledWith('/photos/1');

      // Verify transformed response
      expect(result).toMatchObject({
        id: 1,
        photographer: 'John Doe',
        photographerUrl: 'https://example.com/photographer',
        alt: 'Test photo',
        avgColor: '#123456',
        tags: ['nature', 'landscape'],
        description: 'A beautiful landscape photo',
        createdAt: '2024-01-01T00:00:00Z',
      });
      expect(result.aspectRatio).toBeCloseTo(1.78, 2);
    });

    it('should handle errors when fetching photo details', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('Network error')),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const service = new (pexelsService as any).constructor();

      await expect(service.getPhotoDetails(1)).rejects.toThrow('Network error');
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      const mockInterceptor = vi.fn((_config, errorHandler) => {
        const error = {
          response: { status: 429, statusText: 'Too Many Requests' },
        };
        errorHandler(error);
      });

      const mockApi = {
        get: vi.fn(),
        interceptors: {
          response: {
            use: mockInterceptor,
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      expect(() => new (pexelsService as any).constructor()).toThrow(
        'Rate limit exceeded. Please try again later.'
      );
    });

    it('should handle unauthorized errors', async () => {
      const mockInterceptor = vi.fn((_config, errorHandler) => {
        const error = {
          response: { status: 401, statusText: 'Unauthorized' },
        };
        errorHandler(error);
      });

      const mockApi = {
        get: vi.fn(),
        interceptors: {
          response: {
            use: mockInterceptor,
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      expect(() => new (pexelsService as any).constructor()).toThrow(
        'Invalid API key. Please check your configuration.'
      );
    });

    it('should handle 404 errors', async () => {
      const mockInterceptor = vi.fn((_config, errorHandler) => {
        const error = {
          response: { status: 404, statusText: 'Not Found' },
        };
        errorHandler(error);
      });

      const mockApi = {
        get: vi.fn(),
        interceptors: {
          response: {
            use: mockInterceptor,
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      expect(() => new (pexelsService as any).constructor()).toThrow('Resource not found.');
    });

    it('should handle network errors', async () => {
      const mockInterceptor = vi.fn((_config, errorHandler) => {
        const error = {
          request: {},
        };
        errorHandler(error);
      });

      const mockApi = {
        get: vi.fn(),
        interceptors: {
          response: {
            use: mockInterceptor,
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      expect(() => new (pexelsService as any).constructor()).toThrow(
        'Network error. Please check your connection.'
      );
    });

    it('should handle generic API errors', async () => {
      const mockInterceptor = vi.fn((_config, errorHandler) => {
        const error = {
          response: { status: 500, statusText: 'Internal Server Error' },
        };
        errorHandler(error);
      });

      const mockApi = {
        get: vi.fn(),
        interceptors: {
          response: {
            use: mockInterceptor,
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApi);

      expect(() => new (pexelsService as any).constructor()).toThrow(
        'API error: Internal Server Error'
      );
    });
  });
});
