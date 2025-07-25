import styled from 'styled-components';

// --- 추가된 탭 스타일 ---
export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eeeeee;
`;

export const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 15px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: transparent;
  border-bottom: 3px solid ${(props) => (props.isActive ? '#3498db' : 'transparent')};
  color: ${(props) => (props.isActive ? '#3498db' : '#888888')};
  transition: all 0.3s;
`;

// --- 신고 이력 테이블 스타일 ---
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const Th = styled.th`
  background-color: #f8f9fa;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eeeeee;
`;

// --- 추가: 테이블 행(Tr) 스타일 ---
export const Tr = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

// --- 추가: 신고 상세 보기 스타일 ---
export const DetailContainer = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 20px;
`;

export const DetailRow = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

export const DetailLabel = styled.span`
  font-weight: 600;
  color: #555;
  width: 100px;
`;

export const DetailValue = styled.span`
  color: #333;
`;

export const StatusBadge = styled.span<{ status: string }>`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${(props) =>
    props.status === '처리 완료'
      ? '#28a745' // 초록색
      : props.status === '처리 중'
      ? '#ffc107' // 노란색
      : '#6c757d'}; // 회색
`;


export const ReportContainer = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 20px 30px;
  background-color: #3498db;
  color: white;
  position: relative;
  height: 80px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  left: 30px;
`;

export const HeaderTitle = styled.h1`
  flex-grow: 1;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
`;

export const Content = styled.div`
  padding: 30px;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

// --- 추가 스타일 ---

export const InfoBox = styled.div`
  background-color: #f0f7ff;
  border-left: 4px solid #3498db;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 4px;
`;

export const InfoTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: #3498db;
  font-size: 18px;
`;

export const InfoText = styled.p`
  color: #666666;
  line-height: 1.6;
  font-size: 16px;
`;

export const Section = styled.div`
  margin-bottom: 25px;
`;

/*
export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333333;
`;
*/

export const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 10px;
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 150px;
  resize: vertical;
`;

export const RadioGroup = styled.div`
  margin-bottom: 20px;
`;

export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  margin-right: 10px;
  width: 20px;
  height: 20px;
  accent-color: #3498db;
`;

export const RadioLabel = styled.label`
  margin-left: 8px;
  cursor: pointer;
`;

// --- 추가: 폼 섹션의 제목(레이블) 스타일 ---
export const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

export const Divider = styled.div`
  height: 1px;
  background-color: #eeeeee;
  margin: 30px 0;
`; 