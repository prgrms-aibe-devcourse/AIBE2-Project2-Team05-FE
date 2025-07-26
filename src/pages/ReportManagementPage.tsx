import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api';

// 백엔드 Report 엔티티와 타입을 맞춥니다.
interface Report {
  id: number;
  reporter: {
    id: number;
    nickname: string;
    email: string;
  };
  reportedUser: {
    id: number;
    nickname: string;
    email: string;
  };
  reportType: string; // INAPPROPRIATE_CONTENT, HARASSMENT, SPAM, FAKE_PROFILE 등
  description: string;
  status: string; // PENDING, REVIEWED, RESOLVED, REJECTED
  reviewedByAdminId?: number;
  reviewedAt?: string;
  actionTaken?: string;
  createdAt: string;
}

const ReportManagementPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // 전체 신고 조회
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/reports', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Reports API Response:', response);
      
      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        console.error('Reports response is not an array:', response.data);
        setReports([]);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setReports([]);
    }
  };

  // 신고 상세 조회
  const fetchReportDetail = async (reportId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/admin/manage/reports/${reportId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Report Detail API Response:', response);
      setSelectedReport(response.data);
      setShowDetail(true);
    } catch (err: any) {
      console.error('Error fetching report detail:', err);
      alert('신고 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchReports();
      } catch (err: any) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 신고 처리 함수
  const handleReport = async (reportId: number, newStatus: string, actionTaken: string) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('=== 신고 처리 요청 ===');
      console.log('Report ID:', reportId);
      console.log('New Status:', newStatus);
      console.log('Action Taken:', actionTaken);
      
      const requestData = {
        reportId: reportId,
        status: newStatus,
        actionTaken: actionTaken
      };
      
      const response = await api.post('/api/admin/manage/report', requestData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log('Report processing response:', response);

      // 성공하면 데이터 다시 로드
      await fetchReports();
      setShowDetail(false); // 상세창 닫기
      
      alert('신고가 처리되었습니다.');
    } catch (err: any) {
      console.error('신고 처리 실패:', err);
      
      if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
      } else {
        alert(`신고 처리에 실패했습니다. (${err.response?.status || 'Network Error'})`);
      }
    }
  };

  // 빠른 처리 버튼들
  const handleQuickAction = (report: Report, status: string, defaultAction: string) => {
    const actionTaken = prompt(`신고 ID ${report.id}를 ${status} 처리하는 조치 내용을 입력하세요:`, defaultAction);
    if (actionTaken) {
      handleReport(report.id, status, actionTaken);
    }
  };

  // 신고 유형 한글 변환
  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'INAPPROPRIATE_CONTENT': return '부적절한 콘텐츠';
      case 'HARASSMENT': return '괴롭힘';
      case 'SPAM': return '스팸';
      case 'FAKE_PROFILE': return '가짜 프로필';
      default: return type;
    }
  };

  // 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'REVIEWED': return '검토완료';
      case 'RESOLVED': return '해결완료';
      case 'REJECTED': return '반려';
      default: return status;
    }
  };

  const renderReportDetail = () => {
    if (!selectedReport) return null;

    return (
      <DetailModal>
        <DetailContent>
          <DetailHeader>
            <h2>신고 상세 정보 (ID: {selectedReport.id})</h2>
            <CloseButton onClick={() => setShowDetail(false)}>✕</CloseButton>
          </DetailHeader>
          
          <DetailBody>
            <DetailSection>
              <h3>신고 정보</h3>
              <DetailItem>
                <strong>신고 유형:</strong> {getReportTypeText(selectedReport.reportType)}
              </DetailItem>
              <DetailItem>
                <strong>신고 내용:</strong><br />
                <DescriptionBox>{selectedReport.description}</DescriptionBox>
              </DetailItem>
              <DetailItem>
                <strong>신고일:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
              </DetailItem>
            </DetailSection>

            <DetailSection>
              <h3>관련자 정보</h3>
              <DetailItem>
                <strong>신고자:</strong> {selectedReport.reporter.nickname} ({selectedReport.reporter.email})
              </DetailItem>
              <DetailItem>
                <strong>신고된 사용자:</strong> {selectedReport.reportedUser.nickname} ({selectedReport.reportedUser.email})
              </DetailItem>
            </DetailSection>

            <DetailSection>
              <h3>처리 정보</h3>
              <DetailItem>
                <strong>현재 상태:</strong> 
                <StatusBadge $status={selectedReport.status}>
                  {getStatusText(selectedReport.status)}
                </StatusBadge>
              </DetailItem>
              {selectedReport.reviewedAt && (
                <DetailItem>
                  <strong>처리일:</strong> {new Date(selectedReport.reviewedAt).toLocaleString()}
                </DetailItem>
              )}
              {selectedReport.actionTaken && (
                <DetailItem>
                  <strong>조치 내용:</strong><br />
                  <DescriptionBox>{selectedReport.actionTaken}</DescriptionBox>
                </DetailItem>
              )}
            </DetailSection>

            <ActionSection>
              <h3>신고 처리</h3>
              <ActionButtons>
                <ActionButton 
                  onClick={() => handleQuickAction(selectedReport, 'REVIEWED', '검토 완료 - 추가 조치 불필요')}
                >
                  검토완료
                </ActionButton>
                <ActionButton 
                  onClick={() => handleQuickAction(selectedReport, 'RESOLVED', '사용자 경고 처리')}
                >
                  해결완료
                </ActionButton>
                <ActionButton 
                  $danger 
                  onClick={() => handleQuickAction(selectedReport, 'REJECTED', '신고 내용 부적절 - 반려')}
                >
                  반려
                </ActionButton>
              </ActionButtons>
            </ActionSection>
          </DetailBody>
        </DetailContent>
      </DetailModal>
    );
  };

  return (
    <AdminLayout>
      <Title>신고 관리</Title>
      
      <StatsContainer>
        <StatCard>
          <StatNumber>{reports.filter(r => r.status === 'PENDING').length}</StatNumber>
          <StatLabel>대기중인 신고</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{reports.filter(r => r.status === 'RESOLVED').length}</StatNumber>
          <StatLabel>해결완료</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{reports.length}</StatNumber>
          <StatLabel>전체 신고</StatLabel>
        </StatCard>
      </StatsContainer>

      {isLoading ? (
        <LoadingMessage>
          <p>신고 데이터를 불러오는 중입니다...</p>
        </LoadingMessage>
      ) : error ? (
        <ErrorMessage>
          <p style={{ color: 'red' }}>{error}</p>
          <p>Debug info: 전체 신고 = {reports.length}개</p>
        </ErrorMessage>
      ) : (
        <TableContainer>
          <ReportTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>신고 유형</th>
                <th>신고자</th>
                <th>신고된 사용자</th>
                <th>신고일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    fontSize: '16px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>신고가 없습니다</div>
                    <div style={{ fontSize: '14px' }}>모든 사용자들이 건전하게 이용하고 있습니다</div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{getReportTypeText(report.reportType)}</td>
                    <td>{report.reporter.nickname}</td>
                    <td>{report.reportedUser.nickname}</td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge $status={report.status}>
                        {getStatusText(report.status)}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionButton onClick={() => fetchReportDetail(report.id)}>
                        상세보기
                      </ActionButton>
                      {report.status === 'PENDING' && (
                        <>
                          <ActionButton onClick={() => handleQuickAction(report, 'RESOLVED', '조치 완료')}>
                            해결
                          </ActionButton>
                          <ActionButton $danger onClick={() => handleQuickAction(report, 'REJECTED', '반려')}>
                            반려
                          </ActionButton>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </ReportTable>
        </TableContainer>
      )}

      {showDetail && renderReportDetail()}
    </AdminLayout>
  );
};

export default ReportManagementPage;

// 프로젝트 스타일 시스템에 맞춘 styled-components
const Title = styled.h1`
  margin-bottom: 32px;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "🚨";
    font-size: 32px;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #3682f8 0%, #764ba2 100%);
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  min-width: 180px;
  color: white;
  box-shadow: 0 4px 16px rgba(54, 130, 248, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(54, 130, 248, 0.4);
  }
  
  &:nth-child(1) {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    
    &:hover {
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
    }
  }
  
  &:nth-child(2) {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    
    &:hover {
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }
  }
  
  &:nth-child(3) {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    
    &:hover {
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    }
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "⏳";
    font-size: 48px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  p {
    font-size: 18px;
    color: #64748b;
    margin: 0;
    font-weight: 500;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "⚠️";
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: #f8fafc;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ $danger }) => ($danger ? '#ef4444' : '#3682f8')};
  color: white;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

const StatusBadge = styled.span<{ $status?: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'PENDING': 
        return '#f59e0b';
      case 'REVIEWED': 
        return '#06b6d4';
      case 'RESOLVED': 
        return '#10b981';
      case 'REJECTED': 
        return '#6b7280';
      default: 
        return '#6b7280';
    }
  }};
`;

// 상세 모달 스타일들
const DetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const DetailContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  
  h2 {
    margin: 0;
    color: #1e293b;
    font-size: 24px;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #1e293b;
    background-color: #f1f5f9;
  }
`;

const DetailBody = styled.div`
  padding: 24px;
`;

const DetailSection = styled.div`
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: #1e293b;
    border-bottom: 2px solid #3682f8;
    padding-bottom: 8px;
    font-size: 18px;
    font-weight: 600;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 16px;
  
  strong {
    color: #374151;
    font-weight: 600;
  }
`;

const DescriptionBox = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3682f8;
  margin-top: 8px;
  white-space: pre-wrap;
  color: #374151;
  line-height: 1.6;
`;

const ActionSection = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`; 