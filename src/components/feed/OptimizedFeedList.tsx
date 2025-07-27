import React, { memo, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import FeedItem from './FeedItem';
import { FeedItem as FeedItemType } from '../../services/feedApi';
import { useOptimizedInfiniteScroll } from '../../hooks/useOptimizedInfiniteScroll';

interface OptimizedFeedListProps {
  maxItemsInMemory?: number;
  pageSize?: number;
  prefetchThreshold?: number;
  className?: string;
}

// 개별 피드 아이템을 메모이제이션으로 최적화
const MemoizedFeedItem = memo<{ feed: FeedItemType; index: number; onView?: (index: number) => void }>(
  ({ feed, index, onView }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    // Intersection Observer로 아이템이 보이는 시점 감지
    useEffect(() => {
      if (!itemRef.current || !onView) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            onView(index);
          }
        },
        {
          threshold: 0.5, // 50% 보일 때 트리거
          rootMargin: '100px', // 100px 전에 미리 트리거
        }
      );

      observer.observe(itemRef.current);

      return () => observer.disconnect();
    }, [index, onView]);

    return (
      <FeedItemWrapper ref={itemRef}>
        <FeedItem feed={feed} />
      </FeedItemWrapper>
    );
  },
  (prevProps, nextProps) => {
    // props가 변경되지 않으면 리렌더링 방지
    return (
      prevProps.feed.id === nextProps.feed.id &&
      prevProps.index === nextProps.index
    );
  }
);

MemoizedFeedItem.displayName = 'MemoizedFeedItem';

const OptimizedFeedList: React.FC<OptimizedFeedListProps> = ({
  maxItemsInMemory = 200, // 기본값을 더 여유롭게 설정
  pageSize = 15, // 한 번에 더 많이 로드하여 네트워크 요청 최소화
  prefetchThreshold = 8, // 프리패치를 더 일찍 시작
  className,
}) => {
  const {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    retry,
    totalLoaded,
    currentPage,
    prefetchIfNeeded,
  } = useOptimizedInfiniteScroll({
    maxItemsInMemory,
    pageSize,
    prefetchThreshold,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  // 스크롤 기반 무한 로딩 (Intersection Observer 사용)
  useEffect(() => {
    if (!loadingTriggerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          console.log('🎯 로딩 트리거 감지됨');
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // 스크롤 끝에서 200px 전에 로딩 시작
      }
    );

    observer.observe(loadingTriggerRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // 아이템이 보일 때 프리패치 로직 트리거
  const handleItemView = useCallback((index: number) => {
    if (typeof prefetchIfNeeded === 'function') {
      prefetchIfNeeded(index);
    }
  }, [prefetchIfNeeded]);

  // 초기 로드
  useEffect(() => {
    if (items.length === 0 && !isLoading && !error) {
      loadMore();
    }
  }, [items.length, isLoading, error, loadMore]);

  return (
    <Container ref={containerRef} className={className}>
      {/* 상태 정보 표시 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugInfo>
          📊 로드됨: {totalLoaded}개 | 메모리: {items.length}개 | 페이지: {currentPage}
        </DebugInfo>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={retry}>
            다시 시도
          </RetryButton>
        </ErrorContainer>
      )}

      {/* 피드 목록 */}
      <FeedGrid>
        {items.map((feed, index) => (
          <MemoizedFeedItem
            key={`${feed.id}-${index}`} // 안정적인 키 생성
            feed={feed}
            index={index}
            onView={handleItemView}
          />
        ))}
      </FeedGrid>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>
            {items.length === 0 ? '피드를 불러오는 중...' : '더 많은 피드를 불러오는 중...'}
          </LoadingText>
        </LoadingContainer>
      )}

      {/* 더 이상 로드할 피드가 없는 경우 */}
      {!hasMore && items.length > 0 && (
        <EndMessage>
          🎉 모든 피드를 확인했습니다! (총 {totalLoaded}개)
        </EndMessage>
      )}

      {/* 빈 상태 */}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyMessage>아직 피드가 없습니다</EmptyMessage>
          <EmptySubtext>첫 번째 여행 계획을 작성해보세요!</EmptySubtext>
        </EmptyState>
      )}

      {/* 무한 스크롤 트리거 (화면에 보이지 않음) */}
      {hasMore && !isLoading && (
        <LoadingTrigger ref={loadingTriggerRef} />
      )}
    </Container>
  );
};

export default OptimizedFeedList;

// 스타일드 컴포넌트들
const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
`;

const DebugInfo = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #b6d7ff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-family: monospace;
  font-size: 12px;
  color: #0066cc;
  text-align: center;
`;

const FeedGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FeedItemWrapper = styled.div`
  width: 100%;
  
  /* 스크롤 성능 최적화 */
  contain: layout style paint;
  will-change: transform;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0;
  text-align: center;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 16px;
  margin: 0 0 16px 0;
  text-align: center;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background-color: #3682f8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }

  &:active {
    background-color: #1d4ed8;
    transform: translateY(0);
  }
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #666;
  font-size: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 24px 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyMessage = styled.h3`
  color: #333;
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 600;
`;

const EmptySubtext = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const LoadingTrigger = styled.div`
  height: 1px;
  width: 100%;
  /* 화면에 보이지 않지만 Intersection Observer가 감지할 수 있는 요소 */
`; 