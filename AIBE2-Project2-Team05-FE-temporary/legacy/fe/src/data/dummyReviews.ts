// src/data/dummyReviews.ts

// 리뷰 대상자 데이터 타입 정의
export interface ReviewTarget {
  id: number;
  name: string;
  trip: string;
  avatar: string; // 이미지 URL을 사용할 수 있으므로 string으로 정의
}

// 리뷰 데이터 타입 정의
export interface Review {
  id: number;
  reviewer?: {
    name: string;
    avatar: string;
  };
  reviewee?: {
    name: string;
    avatar: string;
  };
  date: string;
  rating: number;
  title: string;
  content: string;
  photos: string[]; // 사진 URL 배열
}

// 리뷰 통계 데이터 타입 정의
export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  categoryStats: {
    kindness: number;
    timeliness: number;
    styleMatch: number;
    communication: number;
  };
}

// 리뷰 작성 대상자 더미 데이터
export const dummyReviewTargets: ReviewTarget[] = [
  { id: 1, name: '김민준', trip: '제주도 · 2023.06.15-06.20', avatar: '' },
  { id: 2, name: '이서연', trip: '오사카 · 2023.07.10-07.15', avatar: '' },
  { id: 3, name: '박지훈', trip: '방콕 · 2023.08.05-08.10', avatar: '' },
  { id: 4, name: '최수아', trip: '파리 · 2023.09.20-09.27', avatar: '' },
  { id: 5, name: '정도현', trip: '싱가포르 · 2023.10.03-10.08', avatar: '' },
];

// 받은 리뷰 더미 데이터
export const dummyReceivedReviews: Review[] = [
  {
    id: 1,
    reviewer: { name: '김민준', avatar: '' },
    date: '2023.06.22',
    rating: 5.0,
    title: '최고의 여행 파트너였습니다!',
    content:
      '제주도 여행에서 만난 최고의 여행 메이트였습니다. 시간 약속을 잘 지키고 배려심이 넘쳐서 함께 여행하는 내내 즐거웠어요. 특히 맛집을 많이 알고 계셔서 제주도의 숨은 맛집들을 많이 경험할 수 있었습니다. 다음에도 기회가 된다면 꼭 다시 여행하고 싶은 파트너입니다!',
    photos: ['', ''],
  },
  {
    id: 2,
    reviewer: { name: '박지훈', avatar: '' },
    date: '2023.08.12',
    rating: 4.0,
    title: '좋은 여행 경험이었습니다',
    content:
      '방콕 여행에서 만난 여행 메이트였는데, 전반적으로 좋은 경험이었습니다. 친절하고 배려심이 많았으며, 영어를 잘해서 의사소통에 큰 도움이 되었어요. 다만 가끔 일정 변경이 잦아서 계획대로 진행되지 않은 부분이 아쉬웠습니다. 그래도 즐거운 여행이었고 좋은 추억을 만들 수 있어 감사합니다.',
    photos: [],
  },
];

// 작성한 리뷰 더미 데이터
export const dummyWrittenReviews: Review[] = [
  {
    id: 1,
    reviewee: { name: '이서연', avatar: '' },
    date: '2023.07.17',
    rating: 4.0,
    title: '오사카에서의 즐거운 추억',
    content:
      '오사카 여행에서 만난 이서연님은 일본어를 잘하셔서 현지에서 많은 도움이 되었습니다. 특히 맛집 탐방을 좋아하셔서 오사카의 다양한 음식을 경험할 수 있었어요. 다만 쇼핑을 좋아하셔서 쇼핑 시간이 조금 길었던 점이 아쉬웠지만, 전반적으로 즐거운 여행이었습니다. 다음에 기회가 된다면 또 함께 여행하고 싶어요!',
    photos: [''],
  },
];

// 리뷰 통계 더미 데이터
export const dummyReviewStats: ReviewStats = {
  averageRating: 4.7,
  totalCount: 23,
  categoryStats: {
    kindness: 4.8,
    timeliness: 4.7,
    styleMatch: 4.6,
    communication: 4.5,
  },
}; 