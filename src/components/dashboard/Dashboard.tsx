import React from 'react';
import styled from 'styled-components';
import { useDashboardData } from './hooks';
import DashboardStatistics from './DashboardStatistics';
import DashboardChart from './DashboardChart';
import DashboardRecentReports from './DashboardRecentReports';

// 대시보드 메인 컨테이너
const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// 대시보드 헤더
const DashboardHeader = styled.div`
  margin-bottom: 30px;
`;

const DashboardTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const DashboardSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// 차트와 신고 섹션 그리드
const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

// 에러 메시지 스타일
const ErrorContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #e74c3c;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:active {
    transform: translateY(1px);
  }
`;

// 로딩 스피너 스타일
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  margin: 0;
`;

/**
 * 관리자 대시보드 메인 컴포넌트
 * - 통계 카드 섹션
 * - 월별 가입자 차트
 * - 최근 신고 이력
 */
const Dashboard: React.FC = () => {
  // 커스텀 hook으로 모든 데이터 관리
  const { 
    stats, 
    monthlyData, 
    recentReports, 
    isLoading, 
    error, 
    refetch 
  } = useDashboardData();

  // 현재 날짜 정보
  const getCurrentDateInfo = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return now.toLocaleDateString('ko-KR', options);
  };

  // 에러 상태 렌더링
  if (error && !isLoading) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>관리자 대시보드</DashboardTitle>
          <DashboardSubtitle>시스템 현황을 한눈에 확인하세요</DashboardSubtitle>
        </DashboardHeader>
        
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>데이터를 불러올 수 없습니다</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={refetch}>
            다시 시도
          </RetryButton>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* 대시보드 헤더 */}
      <DashboardHeader>
        <DashboardTitle>관리자 대시보드</DashboardTitle>
        <DashboardSubtitle>
          {getCurrentDateInfo()} • 실시간 시스템 현황
        </DashboardSubtitle>
      </DashboardHeader>

      {/* 로딩 상태일 때 스피너 표시 */}
      {isLoading && stats.totalUsers === 0 && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>대시보드 데이터를 불러오는 중...</LoadingText>
        </LoadingContainer>
      )}

      {/* 메인 컨텐츠 */}
      {(!isLoading || stats.totalUsers > 0) && (
        <>
          {/* 통계 카드 섹션 */}
          <DashboardStatistics 
            stats={stats}
            loading={isLoading}
          />

          {/* 차트와 신고 섹션 */}
          <BottomSection>
            {/* 월별 가입자 차트 */}
            <DashboardChart
              monthlyData={monthlyData}
              isLoading={isLoading}
              error={error}
            />

            {/* 최근 신고 이력 */}
            <DashboardRecentReports
              reports={recentReports}
              isLoading={isLoading}
              error={error}
            />
          </BottomSection>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard; 