// 피드 여행 상태 관리를 위한 타입 정의

export type TravelStatus = 'recruiting' | 'traveling' | 'completed';

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
    statusLabel: '여행중',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: '✈️',
    description: '현재 여행을 즐기고 있어요',
  },
  completed: {
    status: 'completed',
    statusLabel: '여행완료',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: '✅',
    description: '여행이 완료되었어요',
  },
};
