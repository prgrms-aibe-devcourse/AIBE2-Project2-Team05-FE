import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useInfiniteScrollV2 from '../hooks/useInfiniteScrollV2'; // 새로운 무한 스크롤 훅 사용
import FeedList from '../components/feed/FeedList';
import HeroSection from '../components/home/HeroSection';
import FeedIntroSection from '../components/home/FeedIntroSection';
import * as S from './FeedPage.style'; // 스타일은 FeedPage의 것을 재사용합니다.

// FeedList가 기대하는 Feed 타입으로 수정합니다.
interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
}

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const HomePage = () => {
  const [items, setItems] = useState<Feed[]>([]); // 타입을 Feed[]로 변경
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 더 많은 아이템을 로드하는 함수입니다.
  const loadMoreItems = useCallback(async () => {
    // 로딩 중이거나 더 이상 로드할 데이터가 없으면 중단
    if (isLoading || !hasMore) {
      console.log('로딩 중단:', { isLoading, hasMore });
      return;
    }
    
    console.log('새 데이터 로딩 시작 - 페이지:', page);
    setIsLoading(true);

    try {
      // API 호출을 시뮬레이션합니다.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Feed 타입에 맞게 데이터를 생성합니다.
      const newItems = Array.from({ length: 5 }).map((_, i) => {
        const id = (page - 1) * 5 + i + 1;
        return {
          id,
          author: `Traveler_${id}`,
          avatar: `https://i.pravatar.cc/150?u=traveler${id}`,
          image: `https://picsum.photos/600/400?random=${id}`,
          likes: Math.floor(Math.random() * 100),
          caption: `여행 ${id}일차: 아름다운 풍경과 함께하는 하루! #여행스타그램`,
        };
      });

      console.log('생성된 새 아이템:', newItems.length);

      if (newItems.length > 0) {
        setItems((prevItems) => {
          const updatedItems = [...prevItems, ...newItems];
          console.log('전체 아이템 수:', updatedItems.length);
          
          // 최대 50개 아이템까지만 로드
          if (updatedItems.length >= 50) {
            setHasMore(false);
            console.log('최대 아이템 수 도달, 더 이상 로드하지 않음');
          }
          
          return updatedItems;
        });
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]); // items.length를 의존성에서 제거

  useEffect(() => {
    loadMoreItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 새로운 무한 스크롤 훅 사용 - targetRef는 더 이상 필요하지 않음
  useInfiniteScrollV2({
    callback: loadMoreItems,
    hasMore,
    isLoading,
    threshold: 200, // 바닥에서 200px 떨어진 지점에서 로드
  });

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <FeedIntroSection />

      <S.MainContent>
        <S.FeedContainer>
          {/* 피드 제목 추가 */}
          <div style={{ 
            textAlign: 'center', 
            margin: '40px 0 20px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            🌟 여행 피드
          </div>
          
          <FeedList
            items={items}
            hasMore={hasMore}
            targetRef={null} // targetRef는 더 이상 사용하지 않음
          />
          
          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontSize: '16px',
              color: '#666'
            }}>
              새로운 피드를 불러오는 중...
            </div>
          )}
        </S.FeedContainer>
      </S.MainContent>
    </motion.div>
  );
};

export default HomePage;
