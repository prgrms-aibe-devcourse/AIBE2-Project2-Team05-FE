import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import FeedList from '../components/feed/FeedList';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

// 피드 아이템 데이터 타입 정의
interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
}

// 더미 데이터 생성 함수
const generateDummyFeeds = (page: number, count: number): Feed[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = page * count + i + 1;
    return {
      id,
      author: `User_${id}`,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      image: `https://picsum.photos/600/600?random=${id}`,
      likes: Math.floor(Math.random() * 200),
      caption: `이것은 피드 아이템 #${id}에 대한 멋진 캡션입니다. 아름다운 풍경이죠!`,
    };
  });
};

const FeedListPage = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeeds = async () => {
    // 실제 API 호출 대신 더미 데이터 사용
    const newFeeds = generateDummyFeeds(page, 5);
    if (newFeeds.length > 0) {
      setFeeds(prevFeeds => [...prevFeeds, ...newFeeds]);
      setPage(prevPage => prevPage + 1);
    } else {
      setHasMore(false);
    }
  };

  // useInfiniteScroll 훅 사용법을 수정합니다.
  const targetRef = useInfiniteScroll({
    callback: () => {
      if (hasMore) {
        fetchFeeds();
      }
    },
  });

  useEffect(() => {
    // 초기 데이터 로드는 useEffect에서 한 번만 호출합니다.
    fetchFeeds();
  }, []); // 의존성 배열을 비워 최초 렌더링 시에만 실행되도록 합니다.

  return (
    <Container>
      <Header>피드</Header>
      <FeedList items={feeds} hasMore={hasMore} targetRef={targetRef} />
    </Container>
  );
};

export default FeedListPage;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background-color: #fafafa;
`;

const Header = styled.h1`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #dbdbdb;
  background-color: #fff;
`; 