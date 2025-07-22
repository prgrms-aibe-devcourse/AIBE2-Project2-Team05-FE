// 피드 상태 타입 정의
export type FeedStatus = 'recruiting' | 'matched' | 'traveling' | 'completed';

// 피드 상태별 한국어 라벨
export const FEED_STATUS_LABELS: Record<FeedStatus, string> = {
  recruiting: '모집중',
  matched: '매칭완료',
  traveling: '여행중',
  completed: '여행완료', // '후기완료'에서 '여행완료'로 변경
};

// 피드 상태별 색상 (UI에서 사용)
export const FEED_STATUS_COLORS: Record<FeedStatus, string> = {
  recruiting: '#3682F8', // 파란색
  matched: '#FFA500', // 주황색
  traveling: '#32CD32', // 초록색
  completed: '#9B59B6', // 보라색
};

// 후기 데이터 인터페이스 (확장)
export interface TravelReview {
  id: string;
  feedId: number;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  images: string[];
  rating?: number; // 1-5 별점
  highlights: string[]; // 여행 하이라이트
  recommendations: string[]; // 추천 사항
  expenses?: {
    // 실제 지출 내역
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    shopping: number;
    etc: number;
    total: number;
  };
  createdAt: string;
  updatedAt?: string;
}

// 피드 타입 정의 (기존 인터페이스 확장)
export interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  type?: string;
  planId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: FeedStatus; // 새로 추가된 상태 필드
  participants?: string[]; // 여행 참여자 목록
  maxParticipants?: number; // 최대 참여자 수
  review?: TravelReview; // 후기 데이터 (상태가 completed일 때)
}

// 상태 변경 요청 인터페이스
export interface StatusChangeRequest {
  feedId: number;
  newStatus: FeedStatus;
  userId: string;
}

// 후기 작성 요청 인터페이스
export interface ReviewCreateRequest {
  feedId: number;
  title: string;
  content: string;
  images: string[];
  rating?: number;
  highlights: string[];
  recommendations: string[];
  expenses?: TravelReview['expenses'];
}

// 후기 작성 폼 데이터
export interface ReviewFormData {
  title: string;
  content: string;
  images: File[];
  imageUrls: string[]; // 미리보기용 URL
  rating: number;
  highlights: string[];
  recommendations: string[];
  expenses: {
    accommodation: string;
    food: string;
    transportation: string;
    activities: string;
    shopping: string;
    etc: string;
  };
}

// 후기 작성 인터페이스 (기존)
export interface ReviewData {
  feedId: number;
  reviewText: string;
  reviewImages: string[];
  rating?: number;
}
