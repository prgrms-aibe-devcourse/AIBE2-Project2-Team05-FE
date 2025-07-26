import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartContainer from './ChartContainer';

// Chart.js 컴포넌트 등록 (Bar 차트에 필요한 요소들)
ChartJS.register(
  CategoryScale,    // X축 카테고리 스케일
  LinearScale,      // Y축 숫자 스케일
  BarElement,       // 막대 요소
  Title,           // 제목
  Tooltip,         // 툴팁
  Legend           // 범례
);

// 차트 데이터 타입 정의
interface ChartData {
  labels: string[];              // X축 라벨들 (예: ['상품A', '상품B', '상품C'])
  datasets: {
    label: string;               // 데이터셋 이름
    data: number[];              // 실제 데이터 값들
    backgroundColor?: string | string[];  // 막대 배경 색상
    borderColor?: string | string[];      // 막대 테두리 색상
    borderWidth?: number;        // 테두리 두께
  }[];
}

// 컴포넌트 props 타입 정의
interface BarChartProps {
  data: ChartData;              // 차트에 표시할 데이터
  title?: string;               // 차트 제목
  height?: string;              // 차트 높이
  showLegend?: boolean;         // 범례 표시 여부
  showGrid?: boolean;           // 격자 표시 여부
  horizontal?: boolean;         // 수평 막대 차트 여부
  responsive?: boolean;         // 반응형 여부
}

/**
 * BarChart 컴포넌트
 * - 카테고리별 수치 비교에 사용하는 막대 차트
 * - 매출 비교, 사용자별 활동량 비교 등에 사용
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  title = '막대 차트',
  height = '300px',
  showLegend = true,
  showGrid = true,
  horizontal = false,
  responsive = true
}) => {
  // 차트 옵션 설정
  const options = {
    responsive,                              // 반응형 설정
    maintainAspectRatio: false,             // 높이 고정
    indexAxis: horizontal ? 'y' as const : 'x' as const,  // 수평/수직 설정
    plugins: {
      legend: {
        display: showLegend,                // 범례 표시 여부
        position: 'top' as const,           // 범례 위치
        labels: {
          font: {
            family: 'Pretendard, -apple-system, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: !!title,                   // 제목이 있을 때만 표시
        text: title,
        font: {
          family: 'Pretendard, -apple-system, sans-serif',
          size: 16,
          weight: 600
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Pretendard, -apple-system, sans-serif'
        },
        bodyFont: {
          family: 'Pretendard, -apple-system, sans-serif'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: showGrid,                // X축 격자 표시 여부
          color: 'rgba(0, 0, 0, 0.1)'      // 격자 색상
        },
        ticks: {
          font: {
            family: 'Pretendard, -apple-system, sans-serif'
          }
        }
      },
      y: {
        grid: {
          display: showGrid,                // Y축 격자 표시 여부
          color: 'rgba(0, 0, 0, 0.1)'      // 격자 색상
        },
        ticks: {
          font: {
            family: 'Pretendard, -apple-system, sans-serif'
          }
        }
      }
    },
    // 막대 차트 특화 옵션
    elements: {
      bar: {
        borderRadius: 4,                    // 막대 모서리 둥글기
        borderSkipped: false               // 모든 테두리 표시
      }
    }
  };

  return (
    <ChartContainer minHeight={height}>
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};

export default BarChart; 