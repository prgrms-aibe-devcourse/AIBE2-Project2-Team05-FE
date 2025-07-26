import { User, MonthlyUserData, REPORT_TYPE_MAP, STATUS_MAP } from '../types/dashboard.types';

/**
 * 월별 가입자 데이터를 계산하는 함수
 * @param users 사용자 배열
 * @returns 최근 12개월의 월별 가입자 데이터
 */
export const calculateMonthlyUserData = (users: User[]): MonthlyUserData[] => {
  const monthlyCount: { [key: string]: number } = {};
  
  // 최근 12개월 초기화
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthKey);
    monthlyCount[monthKey] = 0;
  }

  // 사용자 가입일별로 카운트
  users.forEach(user => {
    const createdAt = new Date(user.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyCount.hasOwnProperty(monthKey)) {
      monthlyCount[monthKey]++;
    }
  });

  // 월별 데이터 반환
  return months.map(month => ({
    month: month,
    users: monthlyCount[month]
  }));
};

/**
 * 신고 유형을 한글로 변환하는 함수
 * @param type 신고 유형 (영문)
 * @returns 한글 신고 유형
 */
export const getReportTypeText = (type: string): string => {
  return REPORT_TYPE_MAP[type] || type;
};

/**
 * 상태를 한글로 변환하는 함수
 * @param status 상태 (영문)
 * @returns 한글 상태
 */
export const getStatusText = (status: string): string => {
  return STATUS_MAP[status] || status;
};

/**
 * 숫자를 천 단위 콤마로 포맷팅하는 함수
 * @param num 숫자
 * @returns 포맷팅된 문자열
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * 차트 라벨 포맷팅 함수 (YYYY-MM → YYYY년 MM월)
 * @param monthString YYYY-MM 형식의 문자열
 * @returns 한글 형식의 월 라벨
 */
export const formatChartLabel = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  return `${year}년 ${month}월`;
};

/**
 * 증감률 계산 함수
 * @param current 현재 값
 * @param previous 이전 값
 * @returns 증감률 (소수점 1자리)
 */
export const calculateChangeRate = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  const changeRate = ((current - previous) / previous) * 100;
  return Math.round(changeRate * 10) / 10; // 소수점 1자리
};

/**
 * 날짜 범위 계산 함수
 * @param days 며칠 전까지
 * @returns Date 객체
 */
export const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * 배열에서 특정 조건을 만족하는 항목 필터링
 * @param items 배열
 * @param condition 조건 함수
 * @returns 필터링된 배열
 */
export const filterByCondition = <T>(
  items: T[], 
  condition: (item: T) => boolean
): T[] => {
  return items.filter(condition);
};

/**
 * 차트 색상 설정
 */
export const CHART_COLORS = {
  primary: 'rgb(52, 152, 219)',
  primaryBackground: 'rgba(52, 152, 219, 0.1)',
  success: 'rgb(46, 204, 113)',
  warning: 'rgb(241, 196, 15)',
  danger: 'rgb(231, 76, 60)',
  white: '#ffffff',
} as const; 