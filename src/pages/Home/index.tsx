import { lazy, Suspense, useEffect } from 'react';

import PhotoGrid from '@/components/PhotoGrid';
import SearchBar from '@/components/SearchBar';
import { useStores } from '@/stores/RootStore';

import * as styles from './styles.css';

// Lazy load PhotoModal since it's only needed when user clicks a photo
const PhotoModal = lazy(() => import('@/components/PhotoModal'));

const Home: React.FC = () => {
  const { photoStore } = useStores();

  /**
   * Load initial photos
   */
  useEffect(() => {
    if (photoStore.photos.length === 0) {
      photoStore.fetchPhotos(true);
    }
  }, [photoStore]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pexels Gallery</h1>
        <p className={styles.subtitle}>
          Discover beautiful, free photos from talented photographers
        </p>
        <SearchBar />
      </header>

      <PhotoGrid />
      {/* No Photos */}
      {/* Loading */}
      <Suspense fallback={null}>
        <PhotoModal />
      </Suspense>
    </div>
  );
};

export default Home;
