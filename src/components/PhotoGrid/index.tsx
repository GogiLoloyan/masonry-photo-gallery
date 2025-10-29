import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import GridItem from '@/components/GridItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useVirtualization } from '@/hooks/useVirtualization';
import { useStores } from '@/stores/RootStore';
import type { Photo } from '@/types/app';

import * as styles from './styles.css';

const PhotoGrid = () => {
  const { uiStore, photoStore } = useStores();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Set container element in uiStore
   */
  useEffect(() => {
    uiStore.setContainerElement(containerRef.current);

    return () => {
      uiStore.setContainerElement(null);
    };
  }, []);

  const { triggerRef } = useInfiniteScroll({
    onLoadMore: () => photoStore.fetchPhotos(false),
    hasMore: photoStore.hasMore,
    loading: photoStore.isLoadingMore,
    rootMargin: '800px',
  });

  const { visibleItems, totalHeight } = useVirtualization({
    photos: photoStore.photos,
    scrollTop: uiStore.scrollTop,
    viewportHeight: uiStore.viewportHeight,
    containerWidth: uiStore.containerWidth,
  });

  /**
   * Handle scroll events
   */
  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    uiStore.handleScroll(e.currentTarget.scrollTop);
  };

  /**
   * Open modal on photo click
   */
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
      role="region"
      aria-label="Photo grid"
    >
      <div
        ref={containerRef}
        className={styles.gridContainer}
        style={{ height: totalHeight, position: 'relative' }}
        data-testid="grid-container"
      >
        {visibleItems.map((item, index) => (
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
            isPriority={index < 3} // First 3 images are priority for LCP
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {photoStore.hasMore && <div ref={triggerRef} style={{ height: '1px' }} data-testid="infinite-scroll-trigger" />}

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
