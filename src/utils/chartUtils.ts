/**
 * 차트 유틸리티 함수들
 * - 차트 데이터 포맷팅
 * - 색상 팔레트 생성
 * - 데이터 변환 함수들
 */

// 프로젝트 메인 색상
export const CHART_COLORS = {
  primary: '#3682F8',      // 메인 블루
  secondary: '#10B981',    // 녹색
  warning: '#F59E0B',      // 주황색
  danger: '#EF4444',       // 빨간색
  info: '#06B6D4',         // 하늘색
  purple: '#8B5CF6',       // 보라색
  pink: '#EC4899',         // 핑크색
  indigo: '#6366F1'        // 인디고
};

// 미리 정의된 색상 팔레트 (순서대로 사용)
export const COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.indigo
];

/**
 * 투명도가 적용된 색상을 생성하는 함수
 * @param color - 기본 색상 (예: '#3682F8')
 * @param alpha - 투명도 (0~1, 예: 0.2 = 20% 투명)
 * @returns rgba 색상 문자열
 */
export const getColorWithAlpha = (color: string, alpha: number): string => {
  // #을 제거하고 RGB 값 추출
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 데이터 개수에 맞는 색상 배열을 생성하는 함수
 * @param count - 필요한 색상 개수
 * @param alpha - 투명도 (선택사항)
 * @returns 색상 배열
 */
export const generateColors = (count: number, alpha?: number): string[] => {
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 색상 팔레트를 순환하며 사용
    const baseColor = COLOR_PALETTE[i % COLOR_PALETTE.length];
    const color = alpha ? getColorWithAlpha(baseColor, alpha) : baseColor;
    colors.push(color);
  }
  
  return colors;
};

/**
 * 라인 차트 데이터를 포맷팅하는 함수
 * @param labels - X축 라벨들
 * @param datasets - 데이터셋 배열
 * @returns 포맷된 차트 데이터
 */
export const formatLineChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }>
) => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
      backgroundColor: dataset.fill 
        ? getColorWithAlpha(dataset.color || COLOR_PALETTE[index % COLOR_PALETTE.length], 0.2)
        : 'transparent',
      tension: 0.4,  // 부드러운 곡선
      fill: dataset.fill || false,
      pointBackgroundColor: dataset.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }))
  };
};

/**
 * 막대 차트 데이터를 포맷팅하는 함수
 * @param labels - X축 라벨들
 * @param datasets - 데이터셋 배열
 * @returns 포맷된 차트 데이터
 */
export const formatBarChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    colors?: string[];
  }>
) => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.colors || generateColors(dataset.data.length, 0.8),
      borderColor: dataset.colors || generateColors(dataset.data.length),
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }))
  };
};

/**
 * 파이/도넛 차트 데이터를 포맷팅하는 함수
 * @param labels - 라벨들
 * @param data - 데이터 값들
 * @param colors - 색상 배열 (선택사항)
 * @returns 포맷된 차트 데이터
 */
export const formatPieChartData = (
  labels: string[],
  data: number[],
  colors?: string[]
) => {
  return {
    labels,
    datasets: [{
      label: '데이터',
      data,
      backgroundColor: colors || generateColors(data.length, 0.8),
      borderColor: colors || generateColors(data.length),
      borderWidth: 2,
      hoverBackgroundColor: colors || generateColors(data.length, 0.9),
      hoverBorderWidth: 3
    }]
  };
};

/**
 * 숫자를 천 단위로 포맷팅하는 함수
 * @param num - 포맷할 숫자
 * @returns 포맷된 문자열 (예: 1000 → "1,000")
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * 월별 데이터를 위한 라벨 생성 함수
 * @param year - 연도
 * @param monthCount - 월 개수 (기본: 12개월)
 * @returns 월 라벨 배열
 */
export const generateMonthLabels = (year?: number, monthCount: number = 12): string[] => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', 
                  '7월', '8월', '9월', '10월', '11월', '12월'];
  
  if (year) {
    return months.slice(0, monthCount).map(month => `${year}년 ${month}`);
  }
  
  return months.slice(0, monthCount);
};

/**
 * 주간 데이터를 위한 라벨 생성 함수
 * @returns 요일 라벨 배열
 */
export const generateWeekLabels = (): string[] => {
  return ['월', '화', '수', '목', '금', '토', '일'];
};

/**
 * 더미 데이터 생성 함수 (개발/테스트용)
 * @param count - 데이터 개수
 * @param min - 최소값
 * @param max - 최대값
 * @returns 랜덤 데이터 배열
 */
export const generateDummyData = (count: number, min: number = 0, max: number = 100): number[] => {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}; 