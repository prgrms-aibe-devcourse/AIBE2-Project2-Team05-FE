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
  targetRef: React.Ref<HTMLDivElement> | null; // null 허용
}

const FeedList = ({ items, hasMore, targetRef }: FeedListProps) => {
  // 개발 중 디버깅용 로그 (필요시 주석 처리)
  console.log('FeedList 렌더링:', { 
    itemsCount: items.length, 
    hasMore, 
    targetRefExists: !!targetRef 
  });

  return (
    <div>
      {items.map((item, index) => (
        <FeedItem key={`${item.id}-${index}`} feed={item} />
      ))}
      
      {/* 상태 표시 영역 */}
      <div 
        ref={targetRef} // targetRef가 null이어도 괜찮음
        style={{
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0'
        }}
      >
        {hasMore ? (
          <LoadingIndicator>
            {targetRef ? '더 많은 게시물을 불러오는 중...' : '스크롤하여 더 많은 게시물 보기'}
          </LoadingIndicator>
        ) : (
          items.length > 0 && (
            <div style={{ color: '#666', fontSize: '14px' }}>
              모든 게시물을 불러왔습니다.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FeedList; 