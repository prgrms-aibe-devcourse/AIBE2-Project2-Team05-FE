import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import FeedIntroSection from '../components/home/FeedIntroSection';
import OptimizedFeedList from '../components/feed/OptimizedFeedList';
import * as S from './FeedPage.style'; // 스타일은 FeedPage의 것을 재사용합니다.

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const HomePage = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* 기존 페이지 상단 내용 유지 */}
      <HeroSection />
      <FeedIntroSection />

      {/* 최적화된 피드 섹션 */}
      <S.MainContent>
        <S.FeedContainer>
          <OptimizedFeedList 
            maxItemsInMemory={150} // 메모리에 최대 150개 아이템 유지
            pageSize={12} // 한 번에 12개씩 로드
            prefetchThreshold={6} // 끝에서 6개 전에 프리패치
          />
        </S.FeedContainer>
      </S.MainContent>
    </motion.div>
  );
};

export default HomePage;
