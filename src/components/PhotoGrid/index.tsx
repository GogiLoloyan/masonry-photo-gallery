import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useVirtualization } from '../../hooks/useVirtualization';
import { useStores } from '../../stores/RootStore';
import type { Photo } from '../../types/app';
import GridItem from '../GridItem';
import * as styles from './styles.css';

const PhotoGrid = () => {
  const { uiStore, photoStore } = useStores();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  /**
   * Update container width
   */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const { triggerRef } = useInfiniteScroll({
    onLoadMore: () => photoStore.fetchPhotos(false),
    hasMore: photoStore.hasMore,
    loading: photoStore.isLoadingMore,
    rootMargin: '800px',
  });

  const { visibleItems, totalHeight, handleScroll } = useVirtualization({
    photos: photoStore.photos,
    containerWidth,
  });

  /**
   * Handle scroll events
   */
  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    handleScroll(target.scrollTop);
  };

  const handlePhotoClick = (photo: Photo) => {
    uiStore.openPhotoModal(photo.id);
  };

  // --- Error case
  if (photoStore.error) {
    return (
      <div className={styles.error}>
        <h3>Oops! Something went wrong</h3>
        <p>{photoStore.error}</p>
        <button onClick={() => photoStore.fetchPhotos(true)} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={styles.scrollContainer}
      onScroll={handleScrollEvent}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <div
        ref={containerRef}
        className={styles.gridContainer}
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map((item) => (
          <GridItem
            key={item.photo.id}
            photo={item.photo}
            position={{
              x: item.left,
              y: item.top,
              width: item.width,
              height: item.height,
            }}
            onClick={() => handlePhotoClick(item.photo)}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {photoStore.hasMore && <div ref={triggerRef} style={{ height: '1px' }} />}

      {photoStore.isLoadingMore && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner} />
          <span>Loading more photos...</span>
        </div>
      )}
    </div>
  );
};

export default observer(PhotoGrid);
