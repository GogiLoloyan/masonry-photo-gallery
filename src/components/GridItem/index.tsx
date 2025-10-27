import { useEffect, useState } from 'react';

import { BREAKPOINTS } from '../../constants/config';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Photo } from '../../types/app';
import { getOptimalImageSrc } from '../../utils/image';
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
}

const GridItem = ({ photo, position, onClick }: GridItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [itemRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    rootMargin: '50px',
  });

  // --- Load image when visible
  useEffect(() => {
    if (isVisible && !imageSrc) {
      const optimizedUrl = getOptimalImageSrc(photo.src, itemRef.current?.clientWidth ?? 500);
      setImageSrc(optimizedUrl);
    }
  }, [isVisible, photo.src, imageSrc]);

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
      role="button"
      tabIndex={0}
      aria-label={photo.alt || `Photo by ${photo.photographer}`}
    >
      {!imageLoaded && (
        <div
          className={styles.placeholder}
          style={{ backgroundColor: photo.avgColor || '#f0f0f0' }}
        >
          <div className={styles.shimmerEffect} />
        </div>
      )}

      {imageSrc && (
        <picture>
          <source
            srcSet={`${photo.src.original} 2x, ${photo.src.large} 1x`}
            media={`(min-width: ${BREAKPOINTS.tablet}px)`}
          />
          <source
            srcSet={`${photo.src.medium} 1x`}
            media={`(max-width: ${BREAKPOINTS.tablet - 1}px)`}
          />
          <img
            src={imageSrc}
            alt={photo.alt || `Photo by ${photo.photographer}`}
            className={styles.image}
            onLoad={handleImageLoad}
            loading="lazy"
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
