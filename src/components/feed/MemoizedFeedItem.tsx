import React, { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FeedItem as FeedItemType } from '../../services/feedApi';
import ImageModal from '../profile/ImageModal';
import LazyImage from '../common/LazyImage';
import PlanPage from '../../pages/PlanPage';

interface MemoizedFeedItemProps {
  feed: FeedItemType;
  onView?: (index: number) => void; // 프리패치용 콜백
  index?: number;
}

// 🔧 스타일 컴포넌트들 (기존과 동일하지만 메모이제이션 최적화)
const FeedItemContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  margin-right: 12px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const LocationText = styled.div`
  color: #64748b;
  font-size: 12px;
  margin-top: 2px;
`;

const FeedImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  cursor: pointer;
  overflow: hidden;
`;

const FeedCaption = styled.div`
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
`;

const FeedFooter = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
`;

const LikeInfo = styled.div`
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 13px;
`;

const TravelInfo = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
`;

const InfoChip = styled.span`
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

// 🚀 성능 최적화: Modal 컴포넌트들도 메모이제이션
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PlanPageModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  z-index: 10;
  
  &:hover {
    color: #374151;
  }
`;

const ModalScrollContainer = styled.div`
  overflow-y: auto;
  max-height: calc(90vh - 60px);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

/**
 * 🚀 메모이제이션된 FeedItem 컴포넌트
 * React.memo로 불필요한 리렌더링 방지
 */
const MemoizedFeedItem: React.FC<MemoizedFeedItemProps> = memo(({ 
  feed, 
  onView, 
  index 
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // 🚀 useMemo로 계산된 값들 캐싱
  const profileImageSrc = useMemo(() => {
    return feed.avatar?.startsWith('/api/') 
      ? `http://localhost:8080${feed.avatar}`
      : feed.avatar || '/api/profile/image/default';
  }, [feed.avatar]);

  const feedImageSrc = useMemo(() => {
    return feed.image?.startsWith('/api/') 
      ? `http://localhost:8080${feed.image}`
      : feed.image || '/default-place-image.jpg';
  }, [feed.image]);

  const travelDates = useMemo(() => {
    if (feed.startDate && feed.endDate) {
      const start = new Date(feed.startDate).toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
      const end = new Date(feed.endDate).toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${start} - ${end}`;
    }
    return null;
  }, [feed.startDate, feed.endDate]);

  // 🚀 useCallback으로 이벤트 핸들러 최적화
  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileModal(true);
  }, []);

  const handleImageClick = useCallback(() => {
    setShowPlanModal(true);
    // 프리패치 트리거
    if (onView && typeof index === 'number') {
      onView(index);
    }
  }, [onView, index]);

  const closeProfileModal = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  const closePlanModal = useCallback(() => {
    setShowPlanModal(false);
  }, []);

  return (
    <>
      <FeedItemContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 헤더 */}
        <FeedHeader>
          <ProfileImageContainer>
            <ProfileImage
              src={profileImageSrc}
              alt={feed.author}
              onClick={handleProfileClick}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/profile/image/default';
              }}
            />
          </ProfileImageContainer>
          <AuthorInfo>
            <AuthorName>{feed.author}</AuthorName>
            <LocationText>{feed.location}</LocationText>
          </AuthorInfo>
        </FeedHeader>

        {/* 피드 이미지 */}
        <FeedImageContainer onClick={handleImageClick}>
                     <LazyImage
             src={feedImageSrc}
             alt={feed.caption || `${feed.author}의 여행`}
             style={{
               width: '100%',
               height: '100%',
               objectFit: 'cover',
             }}
             placeholder="/default-place-image.jpg"
           />
        </FeedImageContainer>

        {/* 캡션 */}
        {feed.caption && (
          <FeedCaption>
            {feed.caption}
          </FeedCaption>
        )}

        {/* 푸터 */}
        <FeedFooter>
          <LikeInfo>
            ❤️ {feed.likes}개의 후기
          </LikeInfo>
          <TravelInfo>
            {feed.numberOfPeople && (
              <InfoChip>👥 {feed.numberOfPeople}명</InfoChip>
            )}
            {feed.budget && (
              <InfoChip>💰 {feed.budget.toLocaleString()}원</InfoChip>
            )}
            {travelDates && (
              <InfoChip>📅 {travelDates}</InfoChip>
            )}
          </TravelInfo>
        </FeedFooter>
      </FeedItemContainer>

            {/* 프로필 이미지 모달 */}
      <AnimatePresence>
        {showProfileModal && (
          <ImageModal
            imageUrl={profileImageSrc}
            onClose={closeProfileModal}
          />
        )}
      </AnimatePresence>

      {/* 여행 계획 모달 */}
      <AnimatePresence>
        {showPlanModal && createPortal(
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePlanModal}
          >
            <PlanPageModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalCloseButton onClick={closePlanModal}>
                ✕
              </ModalCloseButton>
              <ModalScrollContainer>
                <PlanPage planId={String(feed.id)} isModal={true} />
              </ModalScrollContainer>
            </PlanPageModalContent>
          </ModalOverlay>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
});

// 🚀 displayName 설정 (디버깅용)
MemoizedFeedItem.displayName = 'MemoizedFeedItem';

export default MemoizedFeedItem; 