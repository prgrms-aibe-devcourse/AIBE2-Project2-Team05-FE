import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { User, AdminFeedDto, Report, DashboardStats, MonthlyUserData } from '../types/dashboard.types';
import { calculateMonthlyUserData } from '../utils/dashboardUtils';

// 커스텀 hook의 반환 타입 정의
interface UseDashboardDataReturn {
  // 통계 데이터
  stats: DashboardStats;
  monthlyData: MonthlyUserData[];
  recentReports: Report[];
  
  // 상태 관리
  isLoading: boolean;
  error: string | null;
  
  // 새로고침 함수
  refetch: () => Promise<void>;
}

/**
 * 대시보드 데이터를 페칭하고 관리하는 커스텀 hook
 * @returns 대시보드에 필요한 모든 데이터와 상태
 */
const useDashboardData = (): UseDashboardDataReturn => {
  // 상태 관리
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsers: 0,
    totalFeeds: 0,
    pendingReports: 0,
    newUsersChange: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyUserData[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 인증 헤더 생성 함수
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : ''
    };
  };

  /**
   * 대시보드 데이터 페칭 함수 - useCallback으로 감싸서 의존성 문제 해결
   */
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();

      // 병렬로 모든 데이터 요청 (팀원 프로젝트와 동일한 방식)
      const [usersResponse, feedsResponse, reportsResponse] = await Promise.all([
        api.get('/api/admin/manage/users', { headers }),
        api.get('/api/admin/manage/feeds', { headers }),
        api.get('/api/admin/manage/reports', { headers })
      ]);

      console.log('Dashboard API Responses:', {
        users: usersResponse,
        feeds: feedsResponse,
        reports: reportsResponse
      });

      // 데이터 타입 검증 및 기본값 설정
      const users: User[] = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const feeds: AdminFeedDto[] = Array.isArray(feedsResponse.data) ? feedsResponse.data : [];
      const reports: Report[] = Array.isArray(reportsResponse.data) ? reportsResponse.data : [];

      // 최근 30일 기준 계산
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // 신규 사용자 계산 (최근 30일)
      const newUsers = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= thirtyDaysAgo;
      }).length;

      // 이전 30일 신규 사용자 (30-60일 전)
      const previousNewUsers = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
      }).length;

      // 신규 사용자 증감률 계산
      const newUsersChange = previousNewUsers > 0 
        ? Math.round(((newUsers - previousNewUsers) / previousNewUsers) * 100)
        : newUsers > 0 ? 100 : 0;

      // 대기중인 신고 수
      const pendingReports = reports.filter(report => report.status === 'PENDING').length;

      // 통계 데이터 업데이트
      setStats({
        totalUsers: users.length,
        newUsers,
        totalFeeds: feeds.length,
        pendingReports,
        newUsersChange,
      });

      // 월별 가입자 데이터 계산
      const monthlyUserData = calculateMonthlyUserData(users);
      setMonthlyData(monthlyUserData);

      // 최근 신고 데이터 (최대 10개, 최신순)
      const sortedReports = reports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentReports(sortedReports);

    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      
      // 에러 메시지 설정
      let errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해 주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '접근 권한이 없습니다.';
      } else if (err.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback 의존성 배열 - 외부 의존성 없음

  // 컴포넌트 마운트 시 데이터 페칭
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // dependency 추가

  return {
    stats,
    monthlyData,
    recentReports,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};

export default useDashboardData; 