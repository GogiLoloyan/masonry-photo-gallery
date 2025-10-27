import { useCallback, useEffect, useState } from 'react';

import { INTERSECTION_ROOT_MARGIN, INTERSECTION_THRESHOLD } from '@/constants/config';
import { useIntersectionObserver } from './useIntersectionObserver';

interface UseInfiniteScrollProps {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  rootMargin = INTERSECTION_ROOT_MARGIN,
}: UseInfiniteScrollProps) {
  const [triggerRef, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
    threshold: INTERSECTION_THRESHOLD,
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
