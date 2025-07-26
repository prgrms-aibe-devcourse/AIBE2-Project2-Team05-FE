/**
 * 대시보드 컴포넌트 통합 export
 * 사용법:
 * import { Dashboard, DashboardStatistics, useDashboardData } from '@/components/dashboard';
 */

// 메인 대시보드 컴포넌트
export { default as Dashboard } from './Dashboard';

// 개별 컴포넌트들
export { default as DashboardStatistics } from './DashboardStatistics';
export { default as DashboardChart } from './DashboardChart';
export { default as DashboardRecentReports } from './DashboardRecentReports';

// 커스텀 hooks
export { useDashboardData } from './hooks';

// 타입 정의들
export type {
  User,
  AdminFeedDto,
  Report,
  DashboardStats,
  MonthlyUserData,
  StatCardProps,
} from './types/dashboard.types';

// 유틸리티 함수들
export {
  calculateMonthlyUserData,
  formatChartLabel,
  getReportTypeText,
  getStatusText,
  formatNumber,
} from './utils/dashboardUtils'; 