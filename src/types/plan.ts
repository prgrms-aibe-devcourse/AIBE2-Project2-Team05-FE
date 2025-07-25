// 여행 계획 관련 타입 정의

export interface TravelEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  price: string;
  category: string;
}

export interface TravelDay {
  id: string;
  dayNumber: number;
  date: string;
  events: TravelEvent[];
}

export interface SummaryCard {
  title: string;
  value: string;
  icon?: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TravelDay[];
  summaryCards: SummaryCard[];
  likes: number;
  likedUsers: string[]; // 좋아요 누른 사용자들의 프로필 이미지 URLs
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
}

// === 여행 계획 작성을 위한 타입들 ===

// 여행 스타일 옵션
export type TravelStyle =
  | 'planned'
  | 'spontaneous'
  | 'tourism'
  | 'relaxation'
  | 'food'
  | 'nature'
  | 'culture'
  | 'shopping';

// 언어 옵션
export type Language = 'korean' | 'english' | 'japanese' | 'chinese' | 'other';

// 일정 항목 (작성용)
export interface ScheduleItem {
  id: string;
  time: string;
  place: string;
  activity: string;
  memo: string;
  cost: number;
}

// 일별 계획 (작성용)
export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  scheduleItems: ScheduleItem[];
}

// 여행 계획 작성 폼 데이터
export interface TravelPlanFormData {
  // 기본 정보
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: number;
  peopleCount: number;
  travelStyles: TravelStyle[];

  // 세부 일정
  dayPlans: DayPlan[];

  // 매칭 설정
  isMatchingEnabled: boolean;
  matchingAgeRange: string;
  matchingGender: string;
  matchingLanguage: Language;
  matchingMemo: string;

  // 추가 정보
  accommodation: string;
  transportation: string;
  extraMemo: string;
}

// 백엔드 API 요청을 위한 타입
export interface CreateTravelPlanRequest {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  peopleCount: number;
  travelStyles: string[];
  dayPlans: {
    dayNumber: number;
    date: string;
    scheduleItems: {
      time: string;
      place: string;
      activity: string;
      memo: string;
      cost: number;
    }[];
  }[];
  isMatchingEnabled: boolean;
  matchingSettings?: {
    ageRange: string;
    gender: string;
    language: string;
    memo: string;
  };
  additionalInfo: {
    accommodation: string;
    transportation: string;
    memo: string;
  };
}

// 백엔드 API 응답을 위한 타입
export interface TravelPlanResponse {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  peopleCount: number;
  travelStyles: string[];
  dayPlans: {
    id: string;
    dayNumber: number;
    date: string;
    scheduleItems: {
      id: string;
      time: string;
      place: string;
      activity: string;
      memo: string;
      cost: number;
    }[];
  }[];
  isMatchingEnabled: boolean;
  matchingSettings?: {
    ageRange: string;
    gender: string;
    language: string;
    memo: string;
  };
  additionalInfo: {
    accommodation: string;
    transportation: string;
    memo: string;
  };
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

// 폼 유효성 검증을 위한 타입
export interface ValidationErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  budget?: string;
  peopleCount?: string;
  travelStyles?: string;
  dayPlans?: string;
  [key: string]: string | undefined;
}
