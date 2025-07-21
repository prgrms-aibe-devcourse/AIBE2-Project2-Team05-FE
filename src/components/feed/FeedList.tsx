import React from 'react';
import FeedItem from './FeedItem';
import { LoadingIndicator } from '../../pages/FeedPage.style';

// FeedItem에서 사용하는 Feed 타입을 가져와서 사용하거나 여기에 직접 정의합니다.
// 여기서는 간단하게 FeedItem에 정의된 타입을 가정하고 진행합니다.
// 실제로는 타입을 한 곳에서 관리하는 것이 좋습니다.
interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
}

// FeedList 컴포넌트가 받을 props 타입을 수정합니다.
interface FeedListProps {
  items: Feed[]; // 타입을 Feed 배열로 변경
  hasMore: boolean;
  targetRef: React.Ref<HTMLDivElement>;
}

const FeedList = ({ items, hasMore, targetRef }: FeedListProps) => {
  return (
    <div>
      {items.map((item, index) => (
        <FeedItem key={`${item.id}-${index}`} feed={item} />
      ))}
      <div ref={targetRef}>
        {hasMore && <LoadingIndicator>로딩 중...</LoadingIndicator>}
      </div>
    </div>
  );
};

export default FeedList; 