// 대시보드 관련 타입 정의

// 사용자 타입
export interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  status?: string;
  createdAt: string;
}

// 관리자 피드 DTO
export interface AdminFeedDto {
  id: number;
  imageUrl: string;
  caption: string;
  createdBy: string;
}

// 신고 타입
export interface Report {
  id: number;
  reporter: {
    id: number;
    nickname: string;
    email: string;
  };
  reportedUser: {
    id: number;
    nickname: string;
    email: string;
  };
  reportType: string;
  description: string;
  status: string;
  createdAt: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  totalFeeds: number;
  pendingReports: number;
  newUsersChange: number;
}

// 월별 사용자 데이터 타입
export interface MonthlyUserData {
  month: string;
  users: number;
}

// 통계 카드 타입
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconClass: string;
  changeText: string;
  changeType: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    fill: boolean;
    tension: number;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointBorderWidth: number;
    pointRadius: number;
    pointHoverRadius: number;
  }[];
}

// API 응답 상태 타입
export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// 신고 유형 매핑
export const REPORT_TYPE_MAP: { [key: string]: string } = {
  INAPPROPRIATE_CONTENT: '부적절한 콘텐츠',
  HARASSMENT: '괴롭힘',
  SPAM: '스팸',
  FAKE_PROFILE: '가짜 프로필',
};

// 상태 매핑
export const STATUS_MAP: { [key: string]: string } = {
  PENDING: '대기중',
  REVIEWED: '검토완료',
  RESOLVED: '해결완료',
  REJECTED: '반려',
}; 