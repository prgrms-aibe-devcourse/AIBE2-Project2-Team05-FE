import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

// 피드 아이템 데이터의 타입을 정의합니다.
interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  authorName?: string; // ✅ 여행 계획 작성자 이름 추가
}

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  const { user } = useAuth(); // 현재 로그인한 사용자 정보 가져오기
  
  // 🐛 디버깅을 위한 로그 추가 (Lotusrious 사용자에게만 표시)
  if (user?.nickname === 'Lotusrious') {
    console.log('🔍 Lotusrious 피드 디버깅:', {
      'user.nickname': user?.nickname,
      'feed.authorName': feed.authorName,
      'feed.author': feed.author,
      'feed.id': feed.id,
      '비교결과': user?.nickname === feed.authorName,
      'isLeader 최종값': user?.nickname && feed.authorName && user.nickname === feed.authorName
    });
  }
  
  // 여행리더인지 판단 (현재 사용자 닉네임과 여행 계획 작성자 이름 비교)
  const isLeader = user?.nickname && feed.authorName && user.nickname === feed.authorName;
  
  // 역할 표시 텍스트 결정
  const roleText = isLeader ? '여행리더' : '여행참여자';
  
  return (
    // Link to를 상세 페이지로 수정합니다.
    <Link to={`/feed/${feed.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <FeedCard>
        <FeedHeader>
          <Avatar src={feed.avatar} alt={feed.author} />
          <AuthorContainer>
            <Author>{feed.author}</Author>
            <RoleBadge isLeader={isLeader || false}>{roleText}</RoleBadge>
          </AuthorContainer>
        </FeedHeader>
        <FeedImage src={feed.image} alt="Feed" />
        <FeedActions>
          <span>❤️ {feed.likes}</span>
          <span>💬</span>
        </FeedActions>
        <Caption>{feed.caption}</Caption>
      </FeedCard>
    </Link>
  );
};

export default FeedItem;

const FeedCard = styled.article`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
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

const Author = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

// ✅ 작성자 정보 컨테이너 (이름 + 역할 뱃지)
const AuthorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// ✅ 역할 뱃지 (여행리더/여행참여자)
const RoleBadge = styled.span<{ isLeader: boolean }>`
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  background-color: ${props => props.isLeader ? '#3682F8' : '#8e8e8e'};
  color: white;
  width: fit-content;
  line-height: 1.2;
`;

const FeedImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-top: 1px solid #dbdbdb;
  border-bottom: 1px solid #dbdbdb;
`;

const FeedActions = styled.div`
  display: flex;
  padding: 8px 16px;
  border-top: 1px solid #efefef;
`;

const Caption = styled.p`
  padding: 12px 16px;
  font-size: 14px;
`; 