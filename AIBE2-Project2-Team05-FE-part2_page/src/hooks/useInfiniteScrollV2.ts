import { useEffect, useCallback } from 'react';

interface UseInfiniteScrollV2Options {
  callback: () => void; // 스크롤이 끝에 도달했을 때 실행할 함수
  threshold?: number; // 바닥에서 얼마나 떨어진 지점에서 콜백을 실행할지 (픽셀)
  hasMore?: boolean; // 더 로드할 데이터가 있는지
  isLoading?: boolean; // 현재 로딩 중인지
}

/**
 * 스크롤 이벤트를 직접 사용하는 무한 스크롤 훅
 * IntersectionObserver 대신 스크롤 이벤트를 직접 사용하여 더 확실한 동작을 보장
 */
const useInfiniteScrollV2 = ({
  callback,
  threshold = 100, // 바닥에서 100px 떨어진 지점에서 콜백 실행
  hasMore = true,
  isLoading = false,
}: UseInfiniteScrollV2Options) => {
  
  const handleScroll = useCallback(() => {
    // 스크롤이 불가능하거나 로딩 중이면 실행하지 않음
    if (!hasMore || isLoading) {
      return;
    }

    // 현재 스크롤 위치 계산
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 바닥에서 threshold만큼 떨어진 지점에 도달했는지 확인
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;

    console.log('스크롤 감지:', {
      scrollTop,
      windowHeight,
      documentHeight,
      isNearBottom,
      hasMore,
      isLoading,
      threshold
    });

    if (isNearBottom) {
      console.log('무한 스크롤 콜백 실행!');
      callback();
    }
  }, [callback, threshold, hasMore, isLoading]);

  useEffect(() => {
    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);
    
    // 초기 로드 - 페이지가 짧아서 스크롤이 없을 경우를 대비
    const checkInitialLoad = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // 문서 높이가 윈도우 높이보다 작거나 같으면 추가 로드
      if (documentHeight <= windowHeight && hasMore && !isLoading) {
        console.log('초기 로드: 페이지가 짧아서 추가 데이터 로드');
        callback();
      }
    };

    // 컴포넌트 마운트 후 잠시 기다렸다가 초기 로드 체크
    const timer = setTimeout(checkInitialLoad, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [handleScroll, hasMore, isLoading, callback]);
};

export default useInfiniteScrollV2; 