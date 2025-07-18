import styled from 'styled-components';

// 메인 컨테이너
export const PlanWriteContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

// 페이지 헤더
export const PageHeader = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

export const PageSubtitle = styled.p`
  font-size: 16px;
  color: #666;
`;

// 폼 컨테이너
export const FormContainer = styled.form`
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

// 섹션 스타일
export const Section = styled.div`
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
`;

// 폼 레이아웃
export const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

export const FormCol = styled.div<{ width?: string }>`
  flex: 1;
  min-width: 280px;

  ${(props) => props.width === '100%' && 'width: 100%;'}
  ${(props) => props.width === '50%' && 'width: calc(50% - 10px);'}
  ${(props) => props.width === '33%' && 'width: calc(33.33% - 14px);'}
  ${(props) => props.width === '25%' && 'width: calc(25% - 15px);'}
`;

// 폼 그룹
export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }
`;

// 체크박스 그룹
export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  input {
    width: auto;
    margin-right: 8px;
  }

  &:hover {
    color: #3498db;
  }
`;

// 탭 메뉴
export const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

export const Tab = styled.div<{ active?: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  margin-right: 5px;
  background-color: ${(props) => (props.active ? '#fff' : '#f5f5f5')};
  color: ${(props) => (props.active ? '#3498db' : '#666')};
  font-weight: ${(props) => (props.active ? '500' : 'normal')};
  border-color: ${(props) => (props.active ? '#ddd' : 'transparent')};
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) => (props.active ? '#fff' : '#e9ecef')};
  }
`;

export const TabContent = styled.div<{ active?: boolean }>`
  display: ${(props) => (props.active ? 'block' : 'none')};
  padding: 20px;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 5px 5px;
  background-color: white;
`;

// 일정 항목
export const ScheduleItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid #e9ecef;
`;

export const ScheduleItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const ScheduleItemTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #fadbd8;
  }
`;

// 일정 추가 버튼
export const AddScheduleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #f0f8ff;
  border: 1px dashed #3498db;
  color: #3498db;
  padding: 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;

  i {
    margin-right: 8px;
  }

  &:hover {
    background-color: #e6f3ff;
    border-color: #2980b9;
  }
`;

// 일 추가 버튼
export const AddDayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 40px;
  background-color: #f0f8ff;
  border: 1px dashed #3498db;
  color: #3498db;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;

  &:hover {
    background-color: #e6f3ff;
    border-color: #2980b9;
  }
`;

// 버튼 섹션
export const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
`;

// 버튼 스타일
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}>`
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #3498db;
          color: white;
          &:hover {
            background-color: #2980b9;
          }
        `;
      case 'secondary':
        return `
          background-color: #95a5a6;
          color: white;
          &:hover {
            background-color: #7f8c8d;
          }
        `;
      case 'danger':
        return `
          background-color: #e74c3c;
          color: white;
          &:hover {
            background-color: #c0392b;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid #ddd;
          color: #555;
          &:hover {
            background-color: #f5f5f5;
          }
        `;
      default:
        return `
          background-color: #3498db;
          color: white;
          &:hover {
            background-color: #2980b9;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 에러 메시지
export const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  margin-left: 4px;
`;

// 성공 메시지
export const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 12px;
  margin-top: 5px;
  margin-left: 4px;
`;

// 로딩 스피너
export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 반응형 디자인
export const MobileResponsive = styled.div`
  @media (max-width: 768px) {
    ${PlanWriteContainer} {
      padding: 10px 20px;
    }

    ${FormContainer} {
      padding: 20px;
    }

    ${FormRow} {
      flex-direction: column;
    }

    ${FormCol} {
      width: 100%;
      min-width: auto;
    }

    ${ButtonSection} {
      flex-direction: column;

      ${Button} {
        width: 100%;
      }
    }
  }
`;
