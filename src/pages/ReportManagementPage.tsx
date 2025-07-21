import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './ReportManagementPage.style';
import { dummyReports, Report } from '../data/dummyReports'; 

// --- 1. 신고 폼 컴포넌트 ---
// onAddReport 함수를 props로 받도록 수정합니다.
const ReportForm = ({ onAddReport }: { onAddReport: (newReport: Report) => void }) => {
  const [reportTarget, setReportTarget] = useState('');
  const [reportType, setReportType] = useState('부적절한 게시물');
  const [reportDetails, setReportDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget.trim() || !reportDetails.trim()) {
      alert('신고 대상과 상세 설명을 모두 입력해주세요.');
      return;
    }

    // 새로운 신고 객체를 생성합니다.
    const newReport: Report = {
      id: Date.now(), // 고유한 ID를 위해 현재 시간을 사용합니다.
      target: reportTarget,
      type: reportType,
      details: reportDetails, // 상세 내용을 추가합니다.
      date: new Date().toISOString().split('T')[0], // 오늘 날짜
      status: '접수 완료',
    };

    onAddReport(newReport); // 부모 컴포넌트로 새 신고를 전달합니다.
    alert('신고가 성공적으로 접수되었습니다.');

    // 폼을 초기화합니다.
    setReportTarget('');
    setReportType('부적절한 게시물');
    setReportDetails('');
  };

  return (
    <>
      <S.InfoBox>
        <S.InfoTitle>신고 처리 안내</S.InfoTitle>
        <S.InfoText>
          제출된 신고는 트래블메이트 운영팀에서 검토 후 24-48시간 내에 처리됩니다. 
          허위 신고는 서비스 이용 제한의 사유가 될 수 있으니 신중하게 작성해 주세요.
        </S.InfoText>
      </S.InfoBox>
      <form onSubmit={handleSubmit}>
        <S.Section>
          <S.Label htmlFor="reportTarget">신고 대상</S.Label>
          <S.Input
            id="reportTarget"
            type="text"
            value={reportTarget}
            onChange={(e) => setReportTarget(e.target.value)}
            placeholder="사용자명 또는 게시물 제목을 입력하세요."
          />
        </S.Section>

        <S.Divider />

        <S.Section>
          <S.Label>신고 유형</S.Label>
          <S.RadioGroup>
            {['inappropriate', 'spam', 'scam', 'hate', 'other'].map(type => (
              <S.RadioOption key={type}>
                <S.RadioInput
                  type="radio"
                  name="report-type"
                  value={type}
                  checked={reportType === type}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <S.RadioLabel>{
                  {
                    inappropriate: '부적절한 콘텐츠',
                    spam: '스팸',
                    scam: '사기',
                    hate: '혐오 발언',
                    other: '기타'
                  }[type]
                }</S.RadioLabel>
              </S.RadioOption>
            ))}
          </S.RadioGroup>
        </S.Section>
        
        <S.Divider />

        <S.Section>
          <S.Label htmlFor="reportDetails">상세 설명</S.Label>
          <S.Textarea
            id="reportDetails"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            rows={8}
            placeholder="신고 내용을 구체적으로 작성해주세요."
          />
        </S.Section>
        
        <S.SubmitButton type="submit">신고 제출</S.SubmitButton>
      </form>
    </>
  );
};


// --- 2. 신고 이력 목록 컴포넌트 ---
// reports와 onSelectReport를 props로 받습니다.
const ReportHistory = ({ reports, onSelectReport }: { reports: Report[]; onSelectReport: (report: Report) => void; }) => {
  return (
    <S.Table>
      <thead>
        <tr>
          <S.Th>신고 대상</S.Th>
          <S.Th>신고 유형</S.Th>
          <S.Th>신고 날짜</S.Th>
          <S.Th>처리 상태</S.Th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          // Tr로 변경하고 onClick 이벤트를 추가합니다.
          <S.Tr key={report.id} onClick={() => onSelectReport(report)}>
            <S.Td>{report.target}</S.Td>
            <S.Td>{report.type}</S.Td>
            <S.Td>{report.date}</S.Td>
            <S.Td>
              <S.StatusBadge status={report.status}>{report.status}</S.StatusBadge>
            </S.Td>
          </S.Tr>
        ))}
      </tbody>
    </S.Table>
  );
};


// --- 3. 신고 상세 정보 컴포넌트 ---
const ReportDetail = ({ report, onBackToList }: { report: Report; onBackToList: () => void; }) => {
  return (
    <S.DetailContainer>
      <S.DetailRow>
        <S.DetailLabel>신고 대상</S.DetailLabel>
        <S.DetailValue>{report.target}</S.DetailValue>
      </S.DetailRow>
      <S.DetailRow>
        <S.DetailLabel>신고 유형</S.DetailLabel>
        <S.DetailValue>{report.type}</S.DetailValue>
      </S.DetailRow>
      <S.DetailRow>
        <S.DetailLabel>신고 날짜</S.DetailLabel>
        <S.DetailValue>{report.date}</S.DetailValue>
      </S.DetailRow>
      <S.DetailRow>
        <S.DetailLabel>상세 내용</S.DetailLabel>
        <S.DetailValue>{report.details || '상세 내용이 없습니다.'}</S.DetailValue>
      </S.DetailRow>
      <S.DetailRow>
        <S.DetailLabel>처리 상태</S.DetailLabel>
        <S.DetailValue>
          <S.StatusBadge status={report.status}>{report.status}</S.StatusBadge>
        </S.DetailValue>
      </S.DetailRow>
      <S.SubmitButton onClick={onBackToList} style={{marginTop: '20px'}}>목록으로</S.SubmitButton>
    </S.DetailContainer>
  );
};


// --- 4. 메인 페이지 컴포넌트 (상태 관리) ---
const ReportManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  // 신고 목록을 상태로 관리합니다.
  const [reports, setReports] = useState<Report[]>(dummyReports);
  // 선택된 신고를 상태로 관리합니다.
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleAddReport = (newReport: Report) => {
    // 새 신고를 목록의 맨 앞에 추가합니다.
    setReports(prevReports => [newReport, ...prevReports]);
    // 신고 후 '신고 이력' 탭으로 자동 전환합니다.
    setActiveTab('history');
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };
  
  const handleBackToList = () => {
    setSelectedReport(null);
  };

  const handleTabClick = (tab: 'report' | 'history') => {
    setActiveTab(tab);
    // 탭을 바꿀 때 상세 보기를 닫습니다.
    setSelectedReport(null);
  }

  return (
    <S.ReportContainer>
      <S.Header>
        <S.BackButton onClick={() => navigate(-1)}>
          <i className="ri-arrow-left-line"></i>
        </S.BackButton>
        <S.HeaderTitle>신고 관리</S.HeaderTitle>
      </S.Header>
      
      <S.Tabs>
        <S.Tab isActive={activeTab === 'report'} onClick={() => handleTabClick('report')}>
          신고하기
        </S.Tab>
        <S.Tab isActive={activeTab === 'history'} onClick={() => handleTabClick('history')}>
          신고 이력
        </S.Tab>
      </S.Tabs>

      <S.Content>
        {activeTab === 'report' && <ReportForm onAddReport={handleAddReport} />}
        {activeTab === 'history' && (
          selectedReport 
            ? <ReportDetail report={selectedReport} onBackToList={handleBackToList} />
            : <ReportHistory reports={reports} onSelectReport={handleSelectReport} />
        )}
      </S.Content>
    </S.ReportContainer>
  );
};

export default ReportManagementPage; 