// Application-specific types

export interface Photo {
  id: number;
  width: number;
  height: number;
  aspectRatio: number;
  src: {
    tiny: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  photographer: string;
  photographerUrl: string;
  alt: string;
  avgColor: string;
  blurHash?: string;
}
