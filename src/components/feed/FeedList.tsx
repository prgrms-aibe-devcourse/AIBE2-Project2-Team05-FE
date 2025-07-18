import React from 'react';
import FeedItem from './FeedItem';
import { LoadingIndicator } from '../../pages/FeedPage.style';

// FeedList 컴포넌트가 받을 props 타입을 정의합니다.
interface FeedListProps {
  items: Array<{
    id: number;
    author: string;
    content: string;
    imageUrl: string;
  }>;
  hasMore: boolean;
  // DOM 요소를 참조하기 위한 ref를 전달받습니다.
  targetRef: React.Ref<HTMLDivElement>;
}

const FeedList = ({ items, hasMore, targetRef }: FeedListProps) => {
  return (
    <div>
      {items.map((item, index) => (
        // 마지막 아이템에만 ref를 연결하지 않고, 별도의 div를 감지 대상으로 사용합니다.
        <FeedItem key={`${item.id}-${index}`} item={item} />
      ))}
      {/* 이 div가 뷰포트에 들어오면 추가 데이터를 로드합니다. */}
      <div ref={targetRef}>
        {hasMore && <LoadingIndicator>로딩 중...</LoadingIndicator>}
      </div>
    </div>
  );
};

export default FeedList; 