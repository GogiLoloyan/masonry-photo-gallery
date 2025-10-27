import type { Photo, PhotoDetails } from '@/types/app';

export const mockPhoto: Photo = {
  id: 1,
  width: 1920,
  height: 1080,
  aspectRatio: 1.78,
  src: {
    tiny: 'https://example.com/tiny.jpg',
    small: 'https://example.com/small.jpg',
    medium: 'https://example.com/medium.jpg',
    large: 'https://example.com/large.jpg',
    original: 'https://example.com/original.jpg',
  },
  photographer: 'John Doe',
  photographerUrl: 'https://example.com/photographer',
  alt: 'Test photo',
  avgColor: '#123456',
};

export const mockPhotoDetails: PhotoDetails = {
  ...mockPhoto,
  tags: ['nature', 'landscape'],
  description: 'A beautiful landscape photo',
  createdAt: '2024-01-01T00:00:00Z',
};

export const createMockPhotos = (count: number): Photo[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockPhoto,
    id: index + 1,
    height: 1080 + (index % 3) * 200,
    aspectRatio: 1920 / (1080 + (index % 3) * 200),
    alt: `Test photo ${index + 1}`,
  }));
};

export const mockPexelsResponse = {
  photos: createMockPhotos(20),
  page: 1,
  per_page: 20,
  total_results: 100,
  next_page: 'https://api.pexels.com/v1/curated?page=2',
};
