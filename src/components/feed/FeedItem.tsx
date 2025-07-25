import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// 피드 아이템 데이터의 타입을 정의합니다.
interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
}

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  return (
    // Link to를 상세 페이지로 수정합니다.
    <Link to={`/feed/${feed.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <FeedCard>
        <FeedHeader>
          <Avatar src={feed.avatar} alt={feed.author} />
          <Author>{feed.author}</Author>
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