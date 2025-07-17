import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import FeedList from '../components/feed/FeedList';
import RecommendedUsers from '../components/feed/RecommendedUsers';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import FeedIntroSection from '../components/home/FeedIntroSection';
import * as S from './FeedPage.style'; // 스타일은 FeedPage의 것을 재사용합니다.

// 피드 아이템의 데이터 타입을 정의합니다.
interface FeedItemData {
  id: number;
  author: string;
  content: string;
  imageUrl: string;
}

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const HomePage = () => {
  const [items, setItems] = useState<FeedItemData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 더 많은 아이템을 로드하는 함수입니다.
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    // API 호출을 시뮬레이션합니다.
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItems = Array.from({ length: 5 }).map((_, i) => {
      const id = (page - 1) * 5 + i + 1;
      return {
        id,
        author: `Traveler_` + id,
        content: `여행 ${id}일차: 아름다운 풍경과 함께하는 하루! #여행스타그램`,
        imageUrl: `https://picsum.photos/600/400?random=${id}`,
      };
    });

    if (newItems.length > 0) {
      setItems(prevItems => [...prevItems, ...newItems]);
      setPage(prevPage => prevPage + 1);
    } else {
      setHasMore(false);
    }
    
    if (items.length >= 45) {
      setHasMore(false);
    }

    setIsLoading(false);
  }, [isLoading, hasMore, page, items.length]);

  useEffect(() => {
    loadMoreItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const targetRef = useInfiniteScroll({
    callback: loadMoreItems,
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
      <FeaturesSection />
      <FeedIntroSection />

      <S.PageContainer>
        <S.MainContent>
          <S.FeedContainer>
            <FeedList items={items} hasMore={hasMore && !isLoading} targetRef={targetRef} />
          </S.FeedContainer>
          <S.Sidebar>
            <RecommendedUsers />
          </S.Sidebar>
        </S.MainContent>
      </S.PageContainer>
    </motion.div>
  );
};

export default HomePage; 