import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useStores } from '../../stores/RootStore';
import * as styles from './styles.css';

const PhotoGrid = () => {
  const { uiStore, photoStore } = useStores();

  const { triggerRef } = useInfiniteScroll({
    onLoadMore: () => photoStore.fetchPhotos(false),
    hasMore: photoStore.hasMore,
    loading: photoStore.isLoadingMore,
    threshold: '800px',
  });

  /**
   * Load initial photos
   */
  useEffect(() => {
    if (photoStore.photos.length === 0) {
      photoStore.fetchPhotos(true);
    }
  }, [photoStore]);

  const handlePhotoClick = (photoId: number) => {
    uiStore.openPhotoModal(photoId);
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
    <div>
      {photoStore.photos.map((photo) => (
        <img key={photo.id} src={photo.src.medium} onClick={() => handlePhotoClick(photo.id)} />
      ))}

      {/* Infinite scroll trigger */}
      {photoStore.hasMore && <div ref={triggerRef} style={{ height: '1px' }} />}
    </div>
  );
};

export default observer(PhotoGrid);
