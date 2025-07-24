import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import mockUsers from '../../data/mockUsers.json';

// 좋아요 누른 사람들을 보여주는 모달 컴포넌트 인터페이스
interface LikesModalProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 함수
  title?: string; // 피드 제목 (선택사항)
  likesCount?: number; // 좋아요 수 (선택사항)
}

/**
 * 좋아요 누른 사람들을 모달로 보여주는 컴포넌트
 * 기존 LikePage의 내용을 모달 형태로 변환
 */
const LikesModal: React.FC<LikesModalProps> = ({
  isOpen,
  onClose,
  title = "게시물",
  likesCount = 24
}) => {
  // ESC 키로 모달 닫기 기능
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // 모달이 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록
          >
            {/* 모달 헤더 */}
            <ModalHeader>
              <ModalTitle>좋아요를 누른 사람들</ModalTitle>
              <CloseButton onClick={onClose}>×</CloseButton>
            </ModalHeader>

            {/* 피드 정보 */}
            <FeedInfo>
              <FeedTitle>{title}</FeedTitle>
              <StatsContainer>
                <StatCard>
                  <StatNumber>{likesCount}</StatNumber>
                  <StatLabel>좋아요</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>12</StatNumber>
                  <StatLabel>댓글</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>8</StatNumber>
                  <StatLabel>저장</StatLabel>
                </StatCard>
              </StatsContainer>
            </FeedInfo>

            {/* 사용자 목록 */}
            <UsersSection>
              <SectionHeader>
                <SectionTitle>좋아요를 누른 사람들</SectionTitle>
                <HeartIcon className="ri-heart-fill" />
                <CountBadge>{likesCount}명</CountBadge>
              </SectionHeader>

              <UsersGrid>
                {mockUsers.map((user) => (
                  <UserCard key={user.id}>
                    <ProfileImage>{user.initial}</ProfileImage>
                    <UserInfo>
                      <UserName>{user.name}</UserName>
                      <UserDescription>{user.description}</UserDescription>
                      <UserMeta>
                        {user.location} · 팔로워 {user.followers}
                      </UserMeta>
                    </UserInfo>
                    <FollowButton $isFollowing={user.isFollowing}>
                      {user.isFollowing ? '팔로잉' : '팔로우'}
                    </FollowButton>
                  </UserCard>
                ))}
              </UsersGrid>
            </UsersSection>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default LikesModal;

// 스타일드 컴포넌트들

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

const FeedInfo = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const FeedTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const UsersSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 16px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const HeartIcon = styled.i`
  color: #ef4444;
  font-size: 18px;
`;

const CountBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
`;

const UsersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

const ProfileImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const UserDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const UserMeta = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const FollowButton = styled.button<{ $isFollowing: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;
  flex-shrink: 0;

  ${({ $isFollowing }) =>
    $isFollowing
      ? `
    background: #f3f4f6;
    color: #374151;
    border-color: #d1d5db;
    
    &:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }
  `
      : `
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  `}
`; 