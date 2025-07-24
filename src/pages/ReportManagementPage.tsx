import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api'; // api 모듈 임포트

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
      
      console.log('=== 신고 처리 요청 디버깅 ===');
      console.log('Report ID:', reportId);
      console.log('New Status:', newStatus);
      console.log('Action Taken:', actionTaken);
      
      const requestData = {
        reportId: reportId,
        status: newStatus,
        actionTaken: actionTaken
      };
      
      console.log('Request Data:', requestData);
      
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
      console.error('=== 신고 처리 실패 ===');
      console.error('Error processing report:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
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
                <StatusBadge status={selectedReport.status}>
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
                  danger 
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
        <LoadingMessage>로딩 중...</LoadingMessage>
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
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    신고가 없습니다.
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
                      <StatusBadge status={report.status}>
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
                          <ActionButton danger onClick={() => handleQuickAction(report, 'REJECTED', '반려')}>
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

const Title = styled.h1`
  margin-bottom: 2rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 120px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 2rem;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 6px 12px;
  margin-right: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ danger }) => (danger ? '#dc3545' : '#007bff')};
  color: white;
  font-size: 12px;

  &:hover {
    opacity: 0.8;
  }
`;

const StatusBadge = styled.span<{ status?: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'REVIEWED': return '#17a2b8';
      case 'RESOLVED': return '#28a745';
      case 'REJECTED': return '#6c757d';
      default: return '#6c757d';
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
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DetailContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const DetailBody = styled.div`
  padding: 1.5rem;
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 0.5rem;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 1rem;
  
  strong {
    color: #555;
  }
`;

const DescriptionBox = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  margin-top: 0.5rem;
  white-space: pre-wrap;
`;

const ActionSection = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`; 