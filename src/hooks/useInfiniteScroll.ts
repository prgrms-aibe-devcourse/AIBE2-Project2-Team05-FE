
import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  callback: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * 무한 스크롤을 위한 커스텀 훅
 * @param {Function} callback - 감시 대상 요소가 화면에 보일 때 실행될 콜백 함수
 * @param {number} [threshold=0.5] - 콜백 실행을 위한 교차 영역 비율
 * @param {string} [rootMargin='0px'] - 교차 영역 계산 시 사용할 루트 요소의 여백
 * @returns {React.RefObject<HTMLDivElement>} - 감시할 요소를 참조하기 위한 ref 객체
 */
const useInfiniteScroll = ({
  callback,
  threshold = 0.5,
  rootMargin = '0px',
}: UseInfiniteScrollOptions) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // entries는 여러 개의 감시 대상 요소를 배열로 포함할 수 있습니다.
        // 우리는 하나의 대상만 감시하므로 첫 번째 요소만 확인합니다.
        const entry = entries[0];
        if (entry.isIntersecting) {
          // 대상 요소가 뷰포트와 교차하면 콜백 함수를 실행합니다.
          callback();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // targetRef.current가 유효한 DOM 요소일 때만 관찰을 시작합니다.
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // 컴포넌트가 언마운트될 때 IntersectionObserver를 정리합니다.
    // 이는 메모리 누수를 방지하는 중요한 과정입니다.
    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback, threshold, rootMargin, targetRef]);

  return targetRef;
};

export default useInfiniteScroll; 