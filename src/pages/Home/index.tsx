import { useEffect, useState } from 'react';

import { SearchBar } from '../../components/common/SearchBar';
import { ITEMS_PER_PAGE } from '../../constants/config';
import { pexelsService } from '../../services/pexels';
import type { Photo } from '../../types/app';
import * as styles from './styles.css';

const Home: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState('');

  useEffect(() => {
    loadPhotos(1, '', true);
  }, []);

  const loadPhotos = async (pageNum: number, query: string, reset: boolean = false) => {
    if (isLoading && !reset) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await pexelsService.getPhotos(pageNum, ITEMS_PER_PAGE, query);

      if (reset) {
        setPhotos(result.photos);
      } else {
        setPhotos((prev) => [...prev, ...result.photos]);
      }

      setHasMore(result.hasMore);
      setPage(pageNum + 1);
      setCurrentQuery(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('Error loading photos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPhotos(page, currentQuery, false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pexels Gallery</h1>
        <p className={styles.subtitle}>
          Discover beautiful, free photos from talented photographers
        </p>
        <SearchBar
          value=""
          onChange={(query) => {
            loadPhotos(1, query, true);
          }}
          onClear={() => {}}
          placeholder="Search for photos..."
        />
      </header>

      {/* Error case */}
      {error && <div>{error.toString()}</div>}
      {/* Photos */}
      <div>
        {photos?.map((photo) => (
          <img src={photo.src.original} />
        ))}
      </div>
      {/* No Photos */}
      {/* Loading */}
      <button onClick={handleLoadMore}>load more</button>
    </div>
  );
};

export default Home;
