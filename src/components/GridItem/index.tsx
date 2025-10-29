import { useEffect, useState } from 'react';

import { BREAKPOINTS } from '@/constants/config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { Photo } from '@/types/app';
import * as styles from './styles.css';

interface GridItemProps {
  photo: Photo;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onClick: () => void;
  isPriority?: boolean; // First few images should load eagerly for LCP
}

const GridItem = ({ photo, position, onClick, isPriority = false }: GridItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(isPriority); // Load immediately if priority
  const [itemRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    rootMargin: '50px',
  });

  // --- Load image when visible (only if not already loading as priority)
  useEffect(() => {
    if (isVisible && !shouldLoad && !isPriority) {
      setShouldLoad(true);
    }
  }, [isVisible, shouldLoad, isPriority]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      ref={itemRef}
      className={styles.gridItem}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
      aria-label={photo.alt || `Photo by ${photo.photographer}`}
    >
      {/* Always show placeholder as background */}
      <div className={styles.placeholder} style={{ backgroundColor: photo.avgColor || '#f0f0f0' }}>
        <div
          className={styles.shimmerEffect}
          style={{
            opacity: imageLoaded ? 0 : 1,
          }}
        />
      </div>

      {/* Image fades in on top of placeholder */}
      {shouldLoad && (
        <picture>
          <source
            srcSet={`${photo.src.large} 1280w, ${photo.src.original} 1920w`}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            media={`(min-width: ${BREAKPOINTS.tablet}px)`}
          />
          <source
            srcSet={`${photo.src.small} 350w, ${photo.src.medium} 650w`}
            sizes="(min-width: 640px) 50vw, 100vw"
            media={`(max-width: ${BREAKPOINTS.tablet - 1}px)`}
          />
          <img
            src={photo.src.medium}
            alt={photo.alt || `Photo by ${photo.photographer}`}
            className={styles.image}
            onLoad={handleImageLoad}
            loading={isPriority ? 'eager' : 'lazy'}
            fetchPriority={isPriority ? 'high' : 'auto'}
            decoding="async"
            style={{
              opacity: imageLoaded ? 1 : 0,
            }}
          />
        </picture>
      )}

      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <p className={styles.photographer}>{photo.photographer}</p>
          {photo.alt && <p className={styles.description}>{photo.alt}</p>}
        </div>
      </div>
    </div>
  );
};

export default GridItem;
