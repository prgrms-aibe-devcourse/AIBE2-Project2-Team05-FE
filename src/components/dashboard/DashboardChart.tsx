import React from 'react';
import styled from 'styled-components';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MonthlyUserData } from './types/dashboard.types';
import { formatChartLabel } from './utils/dashboardUtils';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 차트 섹션 스타일
const ChartSection = styled.div`
  margin-bottom: 30px;
`;

// 차트 카드 스타일
const ChartCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ChartHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: "📈";
    font-size: 24px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    
    &::before {
      font-size: 20px;
    }
  }
`;

const ChartContainer = styled.div`
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  
  &::before {
    content: "⏳";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  
  &::before {
    content: "⚠️";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  
  &::before {
    content: "📊";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const ChartStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const StatItem = styled.div`
  text-align: center;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

// 대시보드 차트 컴포넌트
interface DashboardChartProps {
  monthlyData: MonthlyUserData[];
  isLoading?: boolean;
  error?: string | null;
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  monthlyData,
  isLoading = false,
  error = null,
}) => {
  // Chart.js 고급 데이터 설정
  const chartData = {
    labels: monthlyData.map(data => formatChartLabel(data.month)),
    datasets: [
      {
        label: '월별 가입자 수',
        data: monthlyData.map(data => data.users),
        borderColor: 'rgb(52, 152, 219)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(52, 152, 219)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Chart.js 고급 옵션 설정
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#2c3e50',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(44, 62, 80, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(52, 152, 219)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y}명 가입`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + '명';
          }
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(52, 152, 219)',
        hoverBorderColor: '#ffffff',
      }
    }
  };

  // 차트 데이터 계산
  const calculateStats = () => {
    if (monthlyData.length === 0) {
      return {
        total: 0,
        average: 0,
        peak: 0,
        growth: 0
      };
    }

    const total = monthlyData.reduce((sum, data) => sum + data.users, 0);
    const average = Math.round(total / monthlyData.length);
    const peak = Math.max(...monthlyData.map(data => data.users));
    
    // 최근 3개월 평균과 이전 3개월 평균을 비교해서 성장률 계산
    const recentData = monthlyData.slice(-3);
    const previousData = monthlyData.slice(-6, -3);
    
    const recentAvg = recentData.reduce((sum, data) => sum + data.users, 0) / recentData.length;
    const previousAvg = previousData.reduce((sum, data) => sum + data.users, 0) / previousData.length;
    
    const growth = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;

    return {
      total,
      average,
      peak,
      growth
    };
  };

  const renderChart = () => {
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (isLoading) {
      return <LoadingMessage>차트 데이터를 불러오는 중...</LoadingMessage>;
    }

    if (monthlyData.length === 0) {
      return <EmptyMessage>가입자 데이터가 없습니다</EmptyMessage>;
    }

    // Chart.js 직접 사용으로 고급 기능 활용
    return <Line data={chartData} options={chartOptions} />;
  };

  const stats = calculateStats();

  return (
    <ChartSection>
      <ChartCard>
        <ChartHeader>월별 가입자 추이</ChartHeader>
        <ChartContainer>
          {renderChart()}
        </ChartContainer>
        
        {/* 차트 통계 정보 */}
        {!isLoading && !error && monthlyData.length > 0 && (
          <ChartStats>
            <StatItem>
              <StatValue>{stats.total.toLocaleString()}</StatValue>
              <StatLabel>총 가입자</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.average.toLocaleString()}</StatValue>
              <StatLabel>월평균</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.peak.toLocaleString()}</StatValue>
              <StatLabel>최고 기록</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue style={{ color: stats.growth >= 0 ? '#2ecc71' : '#e74c3c' }}>
                {stats.growth >= 0 ? '+' : ''}{stats.growth}%
              </StatValue>
              <StatLabel>최근 성장률</StatLabel>
            </StatItem>
          </ChartStats>
        )}
      </ChartCard>
    </ChartSection>
  );
};

export default DashboardChart; 