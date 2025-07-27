import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FeedItem as FeedItemType } from '../../services/feedApi';
import ImageModal from '../profile/ImageModal';
import LazyImage from '../common/LazyImage';
import PlanPage from '../../pages/PlanPage';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';

interface FeedItemProps {
  feed: FeedItemType;
}

// ✅ 프로필 페이지와 동일한 모달 스타일 컴포넌트들
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
  z-index: 9999; /* ✅ z-index를 더 높게 설정 */
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
  position: relative; /* ✅ 닫기 버튼 위치 기준점 */
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
  z-index: 10; /* ✅ 모달 내에서도 최상위 */

  &:hover {
    color: #374151;
  }
`;

const PlanPageWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

// ✅ TravelPlan 모달 컴포넌트 (Portal 사용)
const TravelPlanModal: React.FC<{
  planId: string;
  onClose: () => void;
}> = ({ planId, onClose }) => {
  const modalContent = (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <PlanPageModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <PlanPageWrapper>
          <PlanPage planId={planId} isModal={true} />
        </PlanPageWrapper>
      </PlanPageModalContent>
    </ModalOverlay>
  );

  // ✅ Portal을 사용하여 body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTravelPlanModalOpen, setIsTravelPlanModalOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    setIsImageModalOpen(true);
  };

  const handleFeedClick = () => {
    console.log('🔍 피드 클릭 - 여행 계획 모달 열기:', {
      feedId: feed.id,
    });
    setIsTravelPlanModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const closeTravelPlanModal = () => {
    setIsTravelPlanModalOpen(false);
  };

  return (
    <>
      {/* ✅ Link 제거하고 직접 클릭 이벤트 처리 */}
      <FeedCard onClick={handleFeedClick}>
        <FeedHeader>
          <Avatar 
            src={feed.avatar} 
            alt={feed.author}
            onError={(e) => handleImageError(e, 32)}
          />
          <AuthorInfo>
            <AuthorName>{feed.author}</AuthorName>
            <LocationInfo>{feed.location}</LocationInfo>
          </AuthorInfo>
        </FeedHeader>

        <LazyImage
          src={feed.image}
          alt="Feed"
          onClick={handleImageClick}
          placeholder="여행 이미지"
          style={{
            width: '100%',
            borderTop: '1px solid #dbdbdb',
            borderBottom: '1px solid #dbdbdb',
            cursor: 'pointer',
          }}
        />

        <FeedActions>
          <ActionButton>
            ❤️ {feed.likes}
          </ActionButton>
        </FeedActions>

        <Caption>{feed.caption}</Caption>

        {/* 여행 정보 표시 */}
        <TravelInfoSection>
          <DateInfo>
            📅 {feed.startDate} ~ {feed.endDate}
          </DateInfo>
          <TravelInfo>
            👥 {feed.numberOfPeople}명 • 💰 {feed.budget?.toLocaleString()}원
          </TravelInfo>
        </TravelInfoSection>
      </FeedCard>

      {/* ✅ 모달들 */}
      <AnimatePresence>
        {isImageModalOpen && (
          <ImageModal imageUrl={feed.image} onClose={closeImageModal} />
        )}
        {isTravelPlanModalOpen && (
          <TravelPlanModal
            planId={feed.id.toString()}
            onClose={closeTravelPlanModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedItem;

const FeedCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  cursor: pointer; /* ✅ 클릭 가능함을 표시 */

  &:hover {
    transform: translateY(-2px); /* ✅ 호버 시 살짝 올라가는 효과 */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  /* 성능 최적화를 위한 contain 속성 */
  contain: layout;
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 12px;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AuthorName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const LocationInfo = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 400;
`;

const TravelInfoSection = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateInfo = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 400;
`;

const TravelInfo = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 400;
`;

const FeedActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #efefef;
`;

const ActionButton = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const Caption = styled.p`
  padding: 12px 16px;
  font-size: 14px;
`; 