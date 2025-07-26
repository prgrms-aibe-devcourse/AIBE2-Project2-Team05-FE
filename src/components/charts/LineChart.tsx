import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartContainer from './ChartContainer';

// Chart.js 컴포넌트 등록 (필수)
// 이걸 안하면 차트가 렌더링되지 않습니다!
ChartJS.register(
  CategoryScale,    // X축 카테고리 스케일
  LinearScale,      // Y축 숫자 스케일
  PointElement,     // 점 요소
  LineElement,      // 선 요소
  Title,           // 제목
  Tooltip,         // 툴팁 (마우스 호버 시 표시)
  Legend,          // 범례
  Filler           // 영역 채우기
);

// 차트 데이터 타입 정의
interface ChartData {
  labels: string[];              // X축 라벨들 (예: ['1월', '2월', '3월'])
  datasets: {
    label: string;               // 데이터셋 이름
    data: number[];              // 실제 데이터 값들
    borderColor?: string;        // 선 색상
    backgroundColor?: string;    // 배경 색상 (영역 채우기용)
    tension?: number;           // 선의 곡률 (0: 직선, 0.4: 부드러운 곡선)
    fill?: boolean;             // 영역 채우기 여부
  }[];
}

// 컴포넌트 props 타입 정의
interface LineChartProps {
  data: ChartData;              // 차트에 표시할 데이터
  title?: string;               // 차트 제목
  height?: string;              // 차트 높이
  showLegend?: boolean;         // 범례 표시 여부
  showGrid?: boolean;           // 격자 표시 여부
  responsive?: boolean;         // 반응형 여부
}

/**
 * LineChart 컴포넌트
 * - 시간별 데이터 변화를 보여주는 선 차트
 * - 가입자 수 변화, 매출 추이 등에 사용
 */
const LineChart: React.FC<LineChartProps> = ({
  data,
  title = '데이터 차트',
  height = '300px',
  showLegend = true,
  showGrid = true,
  responsive = true
}) => {
  // 차트 옵션 설정
  const options = {
    responsive,                              // 반응형 설정
    maintainAspectRatio: false,             // 높이 고정
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
    interaction: {
      intersect: false,                     // 마우스가 선 위에 없어도 툴팁 표시
      mode: 'index' as const               // 같은 X축 값의 모든 데이터 표시
    }
  };

  return (
    <ChartContainer minHeight={height}>
      <Line data={data} options={options} />
    </ChartContainer>
  );
};

export default LineChart; 