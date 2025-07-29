import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import FeedIntroSection from '../components/home/FeedIntroSection';
// import OptimizedFeedList from '../components/feed/OptimizedFeedList'; // 🔧 기존 컴포넌트
import SuperOptimizedFeedList from '../components/feed/SuperOptimizedFeedList'; // 🚀 새로운 최적화 컴포넌트
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

      {/* 🚀 슈퍼 최적화된 피드 섹션 */}
      <S.MainContent>
        <S.FeedContainer>
          <SuperOptimizedFeedList 
            maxItemsInMemory={300} // 🚀 더 많은 메모리 (기존 150 → 300)
            pageSize={30} // 🚀 더 큰 페이지 크기 (기존 12 → 30)
            prefetchThreshold={12} // 🚀 더 적극적인 프리패치 (기존 6 → 12)
          />
        </S.FeedContainer>
      </S.MainContent>
    </motion.div>
  );
};

export default HomePage;
