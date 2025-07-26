import { useState, useCallback, useRef, useEffect } from 'react';
import { getFeeds, FeedItem } from '../services/feedApi';

interface UseOptimizedInfiniteScrollProps {
  pageSize?: number;
  maxItemsInMemory?: number; // 메모리에 유지할 최대 아이템 수
  prefetchThreshold?: number; // 다음 페이지를 미리 로드할 임계값
}

interface UseOptimizedInfiniteScrollReturn {
  items: FeedItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  totalLoaded: number;
  currentPage: number;
  prefetchIfNeeded: (index: number) => void; // ✅ 추가
}

export const useOptimizedInfiniteScroll = ({
  pageSize = 10,
  maxItemsInMemory = 100, // 최대 100개 아이템만 메모리에 유지
  prefetchThreshold = 5, // 끝에서 5개 전에 미리 로드
}: UseOptimizedInfiniteScrollProps = {}): UseOptimizedInfiniteScrollReturn => {
  
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalLoaded, setTotalLoaded] = useState(0);
  
  const pageRef = useRef(0);
  const lastRequestRef = useRef<Promise<{ feeds: FeedItem[]; hasMore: boolean; }> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 메모리 관리: 오래된 아이템 제거
  const manageMemory = useCallback((newItems: FeedItem[]) => {
    setItems(currentItems => {
      const allItems = [...currentItems, ...newItems];
      
      // 최대 개수를 초과하면 앞의 아이템들 제거
      if (allItems.length > maxItemsInMemory) {
        const itemsToKeep = allItems.slice(-maxItemsInMemory);
        console.log(`🧹 메모리 관리: ${allItems.length}개 → ${itemsToKeep.length}개 유지`);
        return itemsToKeep;
      }
      
      return allItems;
    });
  }, [maxItemsInMemory]);

  // 캐시된 데이터 임시 저장 (간단한 LRU 구현)
  const cacheRef = useRef<Map<number, FeedItem[]>>(new Map());
  const cacheAccessOrder = useRef<number[]>([]);
  const MAX_CACHE_SIZE = 10; // 최대 10페이지 캐시

  // 캐시에서 데이터 조회
  const getCachedPage = useCallback((page: number): FeedItem[] | null => {
    const cached = cacheRef.current.get(page);
    if (cached) {
      // 접근 순서 업데이트 (LRU)
      const index = cacheAccessOrder.current.indexOf(page);
      if (index > -1) {
        cacheAccessOrder.current.splice(index, 1);
      }
      cacheAccessOrder.current.push(page);
      console.log(`💾 캐시 히트: 페이지 ${page}`);
      return cached;
    }
    return null;
  }, []);

  // 캐시에 데이터 저장
  const setCachedPage = useCallback((page: number, data: FeedItem[]) => {
    // 캐시가 가득 찬 경우 가장 오래된 항목 제거
    if (cacheRef.current.size >= MAX_CACHE_SIZE) {
      const oldestPage = cacheAccessOrder.current.shift();
      if (oldestPage !== undefined) {
        cacheRef.current.delete(oldestPage);
        console.log(`🗑️ 오래된 캐시 제거: 페이지 ${oldestPage}`);
      }
    }
    
    cacheRef.current.set(page, data);
    cacheAccessOrder.current.push(page);
    console.log(`💾 캐시 저장: 페이지 ${page}`);
  }, []);

  // 피드 로드 함수
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoading || !hasMore) return;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentPage = pageRef.current;
    console.log(`🔄 피드 로딩 시작: 페이지 ${currentPage} (${pageSize}개씩)`);

    // 캐시 확인
    const cachedData = getCachedPage(currentPage);
    if (cachedData) {
      manageMemory(cachedData);
      pageRef.current = currentPage + 1;
      setTotalLoaded(prev => prev + cachedData.length);
      setHasMore(cachedData.length === pageSize);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const loadPromise = getFeeds(currentPage, pageSize);
      lastRequestRef.current = loadPromise;

      const response = await loadPromise;
      
      console.log(`✅ 피드 로딩 성공: ${response.feeds.length}개 로드됨`);
      
      if (response.feeds.length > 0) {
        // 캐시에 저장
        setCachedPage(currentPage, response.feeds);
        
        // 메모리 관리하며 아이템 추가
        manageMemory(response.feeds);
        
        pageRef.current = currentPage + 1;
        setTotalLoaded(prev => prev + response.feeds.length);
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🚫 요청이 취소되었습니다');
        return;
      }
      
      console.error('❌ 피드 로딩 실패:', err);
      setError('피드를 불러오는데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, hasMore, pageSize, getCachedPage, setCachedPage, manageMemory]);

  // 재시도 함수
  const retry = useCallback(async (): Promise<void> => {
    setError(null);
    await loadMore();
  }, [loadMore]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 프리패치 로직: 현재 보고 있는 위치가 끝에 가까우면 미리 로드
  const prefetchIfNeeded = useCallback((currentIndex: number) => {
    const shouldPrefetch = 
      hasMore && 
      !isLoading && 
      currentIndex >= items.length - prefetchThreshold;
    
    if (shouldPrefetch) {
      console.log(`🚀 프리패치 트리거: ${currentIndex}/${items.length}`);
      loadMore();
    }
  }, [items.length, hasMore, isLoading, prefetchThreshold, loadMore]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    retry,
    totalLoaded,
    currentPage: pageRef.current,
    prefetchIfNeeded,
  };
}; 