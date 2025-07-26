import React from 'react';
import styled from 'styled-components';
import { DashboardStats } from './types/dashboard.types';
import { formatNumber } from './utils/dashboardUtils';

interface DashboardStatisticsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <StatisticsContainer>
        {[1, 2, 3, 4].map((_, index) => (
          <StatCard key={index}>
            <StatCardSkeleton />
          </StatCard>
        ))}
      </StatisticsContainer>
    );
  }

  if (!stats) {
    return (
      <StatisticsContainer>
        <ErrorMessage>통계 데이터를 불러올 수 없습니다</ErrorMessage>
      </StatisticsContainer>
    );
  }

  const statisticsData = [
    {
      title: '총 회원수',
      value: stats.totalUsers,
      icon: '👥',
      color: '#4285F4',
      change: null
    },
    {
      title: '신규 가입자',
      value: stats.newUsers,
      icon: '🆕',
      color: '#34A853',
      change: stats.newUsersChange
    },
    {
      title: '총 피드 수',
      value: stats.totalFeeds,
      icon: '📸',
      color: '#FBBC05',
      change: null
    },
    {
      title: '대기중 신고',
      value: stats.pendingReports,
      icon: '⚠️',
      color: '#EA4335',
      change: null
    }
  ];

  return (
    <StatisticsContainer>
      {statisticsData.map((stat, index) => (
        <StatCard key={index} color={stat.color}>
          <StatHeader>
            <StatIcon>{stat.icon}</StatIcon>
            <StatTitle>{stat.title}</StatTitle>
          </StatHeader>
          <StatValue>{formatNumber(stat.value)}</StatValue>
          {stat.change !== null && (
            <StatChange $positive={stat.change >= 0}>
              {stat.change >= 0 ? '↗' : '↘'} {Math.abs(stat.change)}%
            </StatChange>
          )}
        </StatCard>
      ))}
    </StatisticsContainer>
  );
};

const StatisticsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#ddd'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const StatCardSkeleton = styled.div`
  height: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const StatIcon = styled.span`
  font-size: 24px;
  margin-right: 12px;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$positive ? '#34A853' : '#EA4335'};
`;

const ErrorMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

export default DashboardStatistics; 