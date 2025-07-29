import React from 'react';
import FeedItem from './FeedItem';
import { LoadingIndicator } from '../../pages/FeedPage.style';
import { FeedItem as FeedItemType } from '../../services/feedApi';

// FeedList 컴포넌트가 받을 props 타입을 수정합니다.
interface FeedListProps {
  items: FeedItemType[]; // feedApi에서 정의한 FeedItem 타입 사용
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