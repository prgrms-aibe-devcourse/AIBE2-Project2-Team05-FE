import styled from 'styled-components';

// 전체 컨테이너
export const Container = styled.div`
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  background-color: #f8f9fa;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #333;
  line-height: 1.6;
`;

// 네비게이션 바
export const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #3682f8;
`;

export const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
`;

export const NavMenuItem = styled.li<{ $active?: boolean }>`
  a,
  & {
    text-decoration: none;
    color: ${(props) => (props.$active ? '#3682F8' : '#555')};
    font-weight: ${(props) => (props.$active ? 'bold' : '500')};
    font-size: 16px;
    transition: color 0.3s;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      color: #3682f8;
    }

    i {
      font-size: 18px;
    }
  }
`;

export const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dee2e6;
  }

  i {
    font-size: 20px;
    color: #6c757d;
  }
`;

// 메인 콘텐츠
export const MainContent = styled.div`
  padding: 40px;
  background-color: #fff;
  border-radius: 10px;
  margin: 30px 40px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
`;

export const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;

  i {
    color: #3682f8;
  }
`;

export const Section = styled.div`
  margin-bottom: 40px;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

// 폼 스타일
export const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
`;

export const FormCol = styled.div<{ $span: number }>`
  padding: 0 15px;
  margin-bottom: 20px;
  width: ${(props) => {
    if (props.$span === 12) return '100%';
    if (props.$span === 6) return '50%';
    if (props.$span === 4) return '33.333%';
    if (props.$span === 3) return '25%';
    return '100%';
  }};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  transition: border-color 0.3s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 2px rgba(54, 130, 248, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  transition: border-color 0.3s;
  font-family: inherit;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 2px rgba(54, 130, 248, 0.2);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  transition: border-color 0.3s;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 2px rgba(54, 130, 248, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

// 체크박스 관련 스타일 (CheckboxGroup 아래에 추가)
export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 8px;
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
`;

export const StyledCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

export const CheckboxLabel = styled.div<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background-color: white;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-height: 50px;
  width: 100%;

  &:hover {
    border-color: #3682f8;
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(54, 130, 248, 0.15);
  }

  /* 선택된 상태 스타일 */
  ${({ $checked }) =>
    $checked &&
    `
    background-color: #3682F8;
    color: white;
    border-color: #3682F8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.3);

    .checkbox-icon {
      transform: scale(1.1);
    }

    &:hover {
      background-color: #2563EB;
      border-color: #2563EB;
    }
  `}
`;

export const CheckboxIcon = styled.span`
  font-size: 20px;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checkbox-icon {
    transform: scale(1);
  }
`;

// 탭 메뉴
export const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

export const Tab = styled.div<{ $active?: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  margin-right: 5px;
  background-color: ${(props) => (props.$active ? '#fff' : '#f5f5f5')};
  color: ${(props) => (props.$active ? '#3682F8' : '#666')};
  font-weight: ${(props) => (props.$active ? '500' : 'normal')};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: ${(props) => (props.$active ? '#fff' : '#e9ecef')};
  }

  ${(props) =>
    props.$active &&
    `
    border-color: #ddd;
  `}
`;

export const TabContent = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? 'block' : 'none')};
  padding: 20px;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 5px 5px;
  background-color: #fff;
`;

// 일정 항목
export const ScheduleItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid #e9ecef;
`;

export const ScheduleItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  h4 {
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }
`;

export const RemoveItem = styled.div`
  color: #e74c3c;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fef2f2;
  }

  i {
    font-size: 16px;
  }
`;

export const AddScheduleBtn = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f8ff;
  border: 1px dashed #3682f8;
  color: #3682f8;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 15px;
  transition: all 0.3s;
  width: fit-content;

  i {
    margin-right: 8px;
    font-size: 16px;
  }

  &:hover {
    background-color: #e6f3ff;
  }
`;

// 버튼 스타일
export const BtnSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const Btn = styled.button<{
  $variant: 'primary' | 'secondary' | 'danger' | 'outline';
}>`
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: inherit;

  ${(props) => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: #3682F8;
          color: white;
          &:hover:not(:disabled) {
            background-color: #2c5aa0;
          }
        `;
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background-color: #5a6268;
          }
        `;
      case 'danger':
        return `
          background-color: #e74c3c;
          color: white;
          &:hover:not(:disabled) {
            background-color: #c0392b;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid #ddd;
          color: #555;
          &:hover:not(:disabled) {
            background-color: #f8f9fa;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 푸터
export const Footer = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 30px 40px;
  margin-top: 50px;
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const FooterLogo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #3682f8;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 20px;

  a {
    color: #ecf0f1;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #3682f8;
    }
  }
`;

export const FooterCopyright = styled.div`
  margin-top: 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
`;

// 라벨 아이콘 스타일
export const LabelIcon = styled.span`
  font-size: 16px;
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
`;

// 매칭 체크박스 관련 스타일
export const MatchingCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const MatchingCheckboxLabel = styled.label<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background-color: white;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  min-height: 60px;
  width: 100%;

  &:hover {
    border-color: #3682f8;
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(54, 130, 248, 0.15);
  }

  /* 선택된 상태 스타일 */
  ${({ $checked }) =>
    $checked &&
    `
    background-color: #3682F8;
    color: white;
    border-color: #3682F8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.3);

    .checkbox-icon {
      transform: scale(1.1);
    }

    &:hover {
      background-color: #2563EB;
      border-color: #2563EB;
    }
  `}
`;
