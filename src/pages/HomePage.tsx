import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
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
    if (isLoading || !hasMore) return;
    setIsLoading(true);

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

    if (newItems.length > 0) {
      setItems((prevItems) => [...prevItems, ...newItems]);
      setPage((prevPage) => prevPage + 1);
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
      <FeedIntroSection />

      <S.MainContent>
        <S.FeedContainer>
          <FeedList
            items={items}
            hasMore={hasMore && !isLoading}
            targetRef={targetRef}
          />
        </S.FeedContainer>
      </S.MainContent>
    </motion.div>
  );
};

export default HomePage;
