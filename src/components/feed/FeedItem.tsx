import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FeedItem as FeedItemType } from '../../services/feedApi';
import ImageModal from '../profile/ImageModal';
import LazyImage from '../common/LazyImage';
import PlanPage from '../../pages/PlanPage';

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
  authorInfo?: {
    author: string;
    avatar: string;
    age: number;
  };
  onClose: () => void;
}> = ({ planId, authorInfo, onClose }) => {
  
  // ✅ 프로필 정보 전달 확인
  console.log('🔄 TravelPlanModal에서 받은 작성자 정보:', {
    planId,
    authorInfo,
    '전달할 정보': authorInfo ? `${authorInfo.author} (${authorInfo.age}세)` : '없음'
  });
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
          <PlanPage planId={planId} isModal={true} authorInfo={authorInfo} />
        </PlanPageWrapper>
      </PlanPageModalContent>
    </ModalOverlay>
  );

  // ✅ Portal을 사용하여 body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

const FeedItem: React.FC<FeedItemProps> = memo(({ feed }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTravelPlanModalOpen, setIsTravelPlanModalOpen] = useState(false);

  // ✅ 피드 ID 기반으로 일관된 나이 생성 (20-39세)
  const userAge = useMemo(() => {
    // feed.id를 문자열로 변환하여 처리
    const idString = String(feed.id);
    const seedFromId = idString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return 20 + (seedFromId % 20);
  }, [feed.id]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    setIsImageModalOpen(true);
  };

  const handleFeedClick = () => {
    const authorInfoData = {
      author: feed.author,
      avatar: feed.avatar,
      age: userAge,
    };
    
    console.log('🔍 피드 클릭 - 여행 계획 모달 열기:', {
      feedId: feed.id,
      authorInfo: authorInfoData
    });
    
    console.log('📋 작성자 정보 상세:', {
      '작성자 이름': authorInfoData.author,
      '프로필 이미지': authorInfoData.avatar,
      '나이': authorInfoData.age,
      '모든 피드 데이터': feed
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
      {/* ✅ 새로운 레이아웃 구조 */}
      <FeedCard onClick={handleFeedClick}>
        {/* ✅ 1. 프로필 섹션 - 중앙 정렬된 큰 프로필사진 */}
        <ProfileSection>
          <LargeAvatar src={feed.avatar} alt={feed.author} />
        </ProfileSection>

        {/* ✅ 2. 사용자 정보 - 닉네임과 나이 */}
        <UserInfoSection>
          <UserName>{feed.author}</UserName>
          <UserAge>{userAge}세</UserAge> {/* 임시 나이 */}
        </UserInfoSection>

        {/* ✅ 3. 여행 소개란 */}
        <TravelIntroSection>
          <TravelIntroTitle>✈️ 여행 소개</TravelIntroTitle>
          <TravelIntroContent>
            {feed.caption || `${feed.location}에서의 특별한 여행을 소개합니다!`}
          </TravelIntroContent>
        </TravelIntroSection>

        {/* ✅ 4. 기존 게시물 내용들 */}
        <LazyImage
          src={feed.image}
          alt="Feed"
          onClick={handleImageClick}
          placeholder="여행 이미지"
          style={{
            width: '100%',
            borderTop: '1px solid #efefef',
            borderBottom: '1px solid #efefef',
            cursor: 'pointer',
          }}
        />

        <FeedActions>
          <ActionButton>
            ❤️ {feed.likes}
          </ActionButton>
        </FeedActions>

        {/* 여행 상세 정보 */}
        <TravelInfoSection>
          <LocationTag>📍 {feed.location}</LocationTag>
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
            authorInfo={{
              author: feed.author,
              avatar: feed.avatar,
              age: userAge,
            }}
            onClose={closeTravelPlanModal}
          />
        )}
      </AnimatePresence>
    </>
  );
});

// 🚀 displayName 설정 (디버깅용)
FeedItem.displayName = 'FeedItem';

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

const ProfileSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const LargeAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  object-fit: cover;
`;

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #efefef;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 4px;
`;

const UserAge = styled.span`
  font-size: 14px;
  color: #666;
`;

const TravelIntroSection = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #efefef;
`;

const TravelIntroTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TravelIntroContent = styled.p`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const TravelInfoSection = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #efefef;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LocationTag = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 400;
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