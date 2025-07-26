// 피드 여행 상태 관리를 위한 타입 정의

export type TravelStatus = 'recruiting' | 'traveling' | 'completed';

// 여행 리뷰 타입 (Feed 타입보다 먼저 정의)
export interface TravelReview {
  id: number;
  feedId: number;
  planId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  destination: string;
}

// 기본 Feed 타입 (다른 컴포넌트들에서 사용)
export interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  travelType?: 'created' | 'joined';
  planId?: string;
  travelStatus?: TravelStatus;
  status?: FeedStatus; // 피드 상태 추가
  statusUpdatedAt?: string;
  completedDate?: string;
  reviewWritten?: boolean;
  startDate?: string;
  endDate?: string;
  review?: TravelReview; // 리뷰 정보 추가
  participants?: string[]; // 참여자 목록 추가
  maxParticipants?: number; // 최대 참여자 수 추가
  authorName?: string; // ✅ 여행 계획 작성자 이름 (여행리더 구분용)
}

// Feed 상태 타입 ('matched' 추가)
export type FeedStatus = 'recruiting' | 'matched' | 'traveling' | 'completed' | 'cancelled';

// Feed 상태 라벨 매핑
export const FEED_STATUS_LABELS: Record<FeedStatus, string> = {
  recruiting: '모집중',
  matched: '매칭완료',
  traveling: '여행중',
  completed: '완료',
  cancelled: '취소',
};

// 상태 변경 요청 타입 (userId 추가)
export interface StatusChangeRequest {
  feedId: number;
  status: FeedStatus;
  userId: string; // 사용자 ID 추가
  note?: string;
}

// 리뷰 생성 요청 타입
export interface ReviewCreateRequest {
  feedId: number;
  planId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
}

export interface TravelStatusInfo {
  status: TravelStatus;
  statusLabel: string;
  color: string;
  backgroundColor: string;
  icon: string;
  description: string;
}

export interface FeedWithTravelStatus {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  type: string;
  createdAt: string;
  travelType: 'created' | 'joined';
  planId?: string;
  travelStatus: TravelStatus;
  statusUpdatedAt?: string;
  completedDate?: string;
  reviewWritten?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TravelStatusHistory {
  feedId: number;
  status: TravelStatus;
  updatedAt: string;
  note?: string;
}

export interface ReviewData {
  feedId: number;
  planId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  createdAt: string;
  destination: string;
}

// 여행 상태별 정보 맵
export const TRAVEL_STATUS_MAP: Record<TravelStatus, TravelStatusInfo> = {
  recruiting: {
    status: 'recruiting',
    statusLabel: '모집중',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    icon: '👥',
    description: '여행 메이트를 모집하고 있어요',
  },
  traveling: {
    status: 'traveling',
    statusLabel: '여행을 시작합니다',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: '✈️',
    description: '현재 여행을 즐기고 있어요',
  },
  completed: {
    status: 'completed',
    statusLabel: '여행을 완료합니다',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: '✅',
    description: '여행이 완료되었어요',
  },
};
