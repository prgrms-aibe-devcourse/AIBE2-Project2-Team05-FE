import React from 'react';
import styled from 'styled-components';
import { Report } from './types/dashboard.types';
import { getReportTypeText, getStatusText } from './utils/dashboardUtils';

// 최근 신고 카드 스타일
const RecentCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const RecentHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: "🚨";
    font-size: 24px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    
    &::before {
      font-size: 20px;
    }
  }
`;

const RecentList = styled.ul`
  list-style: none;
  max-height: 400px;
  overflow-y: auto;
  
  /* 커스텀 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const RecentItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 0 -8px;
    padding-left: 20px;
    padding-right: 20px;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const RecentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  font-size: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
`;

const RecentInfo = styled.div`
  flex: 1;
  min-width: 0; /* flexbox에서 text-overflow가 작동하도록 */
`;

const RecentName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 3px;
  color: #2c3e50;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const RecentDetail = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const RecentTimestamp = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 2px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  
  background: ${({ status }) => {
    switch (status) {
      case 'PENDING': return 'rgba(241, 196, 15, 0.1)';
      case 'RESOLVED': return 'rgba(46, 204, 113, 0.1)';
      case 'REJECTED': return 'rgba(231, 76, 60, 0.1)';
      case 'REVIEWED': return 'rgba(52, 152, 219, 0.1)';
      default: return 'rgba(108, 117, 125, 0.1)';
    }
  }};
  
  color: ${({ status }) => {
    switch (status) {
      case 'PENDING': return '#f1c40f';
      case 'RESOLVED': return '#2ecc71';
      case 'REJECTED': return '#e74c3c';
      case 'REVIEWED': return '#3498db';
      default: return '#6c757d';
    }
  }};

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;
  
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
  padding: 40px 20px;
  
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
  padding: 40px 20px;
  font-style: italic;
  
  &::before {
    content: "🎉";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

// 최근 신고 이력 컴포넌트
interface DashboardRecentReportsProps {
  reports: Report[];
  isLoading?: boolean;
  error?: string | null;
}

const DashboardRecentReports: React.FC<DashboardRecentReportsProps> = ({
  reports,
  isLoading = false,
  error = null,
}) => {
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (isLoading) {
      return <LoadingMessage>신고 이력을 불러오는 중...</LoadingMessage>;
    }

    if (reports.length === 0) {
      return (
        <EmptyMessage>
          최근 신고가 없습니다.<br />
          <small>모든 사용자들이 건전하게 이용하고 있습니다!</small>
        </EmptyMessage>
      );
    }

    return (
      <RecentList>
        {reports.map((report) => (
          <RecentItem key={report.id}>
            <RecentAvatar>
              <i className="ri-alert-line"></i>
            </RecentAvatar>
            <RecentInfo>
              <RecentName>{getReportTypeText(report.reportType)}</RecentName>
              <RecentDetail>
                신고자: {report.reporter?.nickname || '알 수 없음'} → 대상: {report.reportedUser?.nickname || '알 수 없음'}
              </RecentDetail>
              <RecentTimestamp>
                {formatDate(report.createdAt)}
              </RecentTimestamp>
            </RecentInfo>
            <StatusBadge status={report.status}>
              {getStatusText(report.status)}
            </StatusBadge>
          </RecentItem>
        ))}
      </RecentList>
    );
  };

  return (
    <RecentCard>
      <RecentHeader>최근 신고 이력</RecentHeader>
      {renderContent()}
    </RecentCard>
  );
};

export default DashboardRecentReports; 