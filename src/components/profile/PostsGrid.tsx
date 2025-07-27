import React, { memo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../common/LazyImage'; // ✅ LazyImage 컴포넌트 import

// 타입 정의
interface UserFeed {
  id: string | number;
  author: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  type: 'travel-plan' | 'photo';
  planId?: string;
  createdAt: string;
  travelType: 'created' | 'participated';
}

interface PostsGridProps {
  feeds: UserFeed[];
  activeTab: 'created' | 'participated';
  isCurrentUser?: boolean;
  onFeedClick: (feed: UserFeed) => void;
  onDeleteFeed: (feedId: string | number, event: React.MouseEvent) => void;
}

// 컴포넌트를 memo로 감싸서 불필요한 리렌더링 방지
const PostsGrid = memo<PostsGridProps>(({
  feeds,
  activeTab,
  isCurrentUser,
  onFeedClick,
  onDeleteFeed,
}) => {
  const navigate = useNavigate();
  
  // 현재 탭에 해당하는 피드들만 필터링
  const filteredFeeds = feeds.filter((feed) => feed.travelType === activeTab);

  if (filteredFeeds.length === 0) {
    return (
      <EmptyState>
        <i className="ri-camera-3-line" />
        <div>
          {activeTab === 'created'
            ? '아직 만든 여행이 없습니다'
            : '아직 참여한 여행이 없습니다'}
        </div>
        {activeTab === 'created' && (
          <CreateTripButton onClick={() => navigate('/plan/write')}>
            첫 번째 여행 플랜 만들기
          </CreateTripButton>
        )}
      </EmptyState>
    );
  }

  return (
    <Container>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Grid>
            {filteredFeeds.map((feed, index) => {
              console.log(`🖼️ 렌더링 피드 ${index + 1}:`, feed.id, feed.caption);
              return (
                <PostItem
                  key={feed.id}
                  onClick={() => onFeedClick(feed)}
                >
                  <LazyImage
                    src={feed.image}
                    alt="여행 사진"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedClick(feed);
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    placeholder="여행 이미지"
                  />
                  <PostOverlay>
                    <PostBadge>✈️ 여행계획</PostBadge>
                    <OverlayStats>
                      <span>❤️ {feed.likes}</span>
                      <span>💬 0</span>
                    </OverlayStats>
                    {/* 현재 사용자의 피드에만 삭제 버튼 표시 */}
                    {isCurrentUser && (
                      <DeleteButton
                        onClick={(e: React.MouseEvent) => onDeleteFeed(feed.id, e)}
                        title="게시물 삭제"
                      >
                        🗑️
                      </DeleteButton>
                    )}
                  </PostOverlay>
                </PostItem>
              );
            })}
          </Grid>
        </motion.div>
      </AnimatePresence>
    </Container>
  );
});

PostsGrid.displayName = 'PostsGrid';

// 스타일 컴포넌트들
const Container = styled.div`
  padding: 20px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 10px 0 0;

  @media (max-width: 768px) {
    gap: 4px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    gap: 2px;
    padding: 0 5px;
  }
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const PostOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;

  ${PostItem}:hover & {
    opacity: 1;
  }
`;

const PostBadge = styled.div`
  background: rgba(54, 130, 248, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
  backdrop-filter: blur(10px);
`;

const OverlayStats = styled.div`
  display: flex;
  gap: 12px;
  align-self: flex-end;

  span {
    color: white;
    font-size: 14px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
  }
`;

// 빈 상태 컴포넌트
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;

  i {
    font-size: 64px;
    margin-bottom: 20px;
    color: #d1d5db;
  }

  div {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #6b7280;
  }
`;

const CreateTripButton = styled.button`
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(54, 130, 248, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(54, 130, 248, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default PostsGrid; 