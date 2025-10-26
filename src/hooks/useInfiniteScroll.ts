import { useCallback, useEffect, useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface UseInfiniteScrollProps {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  threshold = '100px',
}: UseInfiniteScrollProps) {
  const [triggerRef, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: threshold,
    threshold: 0.1,
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || loading || !hasMore) return;

    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, hasMore, loading, isLoading]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loading, isLoading, loadMore]);

  return {
    triggerRef,
    isLoading: isLoading || loading,
  };
}
