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

export interface PhotoDetails extends Photo {
  tags?: string[];
  description?: string;
  createdAt?: string;
}

export interface VirtualizedItem {
  index: number;
  photo: Photo;
  top: number;
  left: number;
  width: number;
  height: number;
  column: number;
}

export interface GridDimensions {
  containerWidth: number;
  columnWidth: number;
  columnCount: number;
  gutterSize: number;
}
