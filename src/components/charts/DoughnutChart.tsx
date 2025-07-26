import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styled from 'styled-components';
import ChartContainer from './ChartContainer';

// Chart.js 컴포넌트 등록 (Doughnut 차트에 필요한 요소들)
ChartJS.register(
  ArcElement,       // 원호 요소 (도넛 조각)
  Title,           // 제목
  Tooltip,         // 툴팁
  Legend           // 범례
);

// 가운데 텍스트를 위한 컨테이너
const DoughnutWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-family: 'Pretendard', -apple-system, sans-serif;
  pointer-events: none; /* 마우스 이벤트 방지 */
`;

const CenterValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 1;
`;

const CenterLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

// 차트 데이터 타입 정의
interface ChartData {
  labels: string[];              // 각 조각의 라벨들 (예: ['완료', '진행중', '대기'])
  datasets: {
    label: string;               // 데이터셋 이름
    data: number[];              // 실제 데이터 값들
    backgroundColor?: string[];   // 각 조각의 배경 색상
    borderColor?: string[];       // 각 조각의 테두리 색상
    borderWidth?: number;        // 테두리 두께
  }[];
}

// 컴포넌트 props 타입 정의
interface DoughnutChartProps {
  data: ChartData;              // 차트에 표시할 데이터
  title?: string;               // 차트 제목
  height?: string;              // 차트 높이
  showLegend?: boolean;         // 범례 표시 여부
  showPercentage?: boolean;     // 퍼센트 표시 여부
  centerText?: string;          // 가운데 표시할 텍스트
  centerLabel?: string;         // 가운데 라벨
  responsive?: boolean;         // 반응형 여부
  cutout?: string;              // 가운데 구멍 크기 (기본: '50%')
}

/**
 * DoughnutChart 컴포넌트
 * - 파이 차트와 비슷하지만 가운데가 비어있는 도넛 모양 차트
 * - 진행률, 완료율, 카테고리별 비율 등에 사용
 * - 가운데 공간에 중요한 수치나 텍스트를 표시할 수 있음
 */
const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  title = '도넛 차트',
  height = '400px',
  showLegend = true,
  showPercentage = true,
  centerText,
  centerLabel,
  responsive = true,
  cutout = '50%'
}) => {
  // 가운데 텍스트가 없으면 전체 합계를 계산해서 표시
  const totalValue = centerText || data.datasets[0]?.data.reduce((a, b) => a + b, 0).toString();

  // 차트 옵션 설정
  const options = {
    responsive,                              // 반응형 설정
    maintainAspectRatio: false,             // 높이 고정
    cutout,                                 // 가운데 구멍 크기
    plugins: {
      legend: {
        display: showLegend,                // 범례 표시 여부
        position: 'bottom' as const,        // 범례 위치 (도넛 차트는 아래쪽이 일반적)
        labels: {
          font: {
            family: 'Pretendard, -apple-system, sans-serif',
            size: 12
          },
          padding: 20,                      // 범례 항목 간 간격
          usePointStyle: true               // 사각형 대신 원형 포인트 사용
        }
      },
      title: {
        display: !!title,                   // 제목이 있을 때만 표시
        text: title,
        font: {
          family: 'Pretendard, -apple-system, sans-serif',
          size: 16,
          weight: 600
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Pretendard, -apple-system, sans-serif'
        },
        bodyFont: {
          family: 'Pretendard, -apple-system, sans-serif'
        },
        // 퍼센트 표시 커스텀 함수
        callbacks: showPercentage ? {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        } : undefined
      }
    },
    // 도넛 차트 특화 옵션
    elements: {
      arc: {
        borderWidth: 2,                     // 조각 테두리 두께
        borderColor: '#ffffff',             // 조각 테두리 색상 (흰색으로 구분)
        hoverBorderWidth: 3                 // 호버 시 테두리 두께
      }
    }
  };

  return (
    <ChartContainer minHeight={height}>
      <DoughnutWrapper>
        <Doughnut data={data} options={options} />
        {/* 가운데 텍스트 표시 */}
        <CenterText>
          <CenterValue>{totalValue}</CenterValue>
          {centerLabel && <CenterLabel>{centerLabel}</CenterLabel>}
        </CenterText>
      </DoughnutWrapper>
    </ChartContainer>
  );
};

export default DoughnutChart; 