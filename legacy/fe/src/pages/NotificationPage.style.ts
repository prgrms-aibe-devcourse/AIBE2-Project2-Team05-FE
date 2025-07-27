import styled from 'styled-components';

// 알림 페이지 전체를 감싸는 컨테이너입니다.
export const NotificationContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

// 페이지 상단 영역(제목, 모두 읽음 버튼)을 위한 컨테이너입니다.
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

// "알림" 제목 스타일입니다.
export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
`;

// '모두 읽음' 버튼 스타일입니다.
export const MarkAllButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
`;

// 필터 버튼들을 감싸는 컨테이너입니다.
export const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

// '전체', '안 읽음' 필터 버튼 스타일입니다.
export const FilterButton = styled.button<{ isActive: boolean }>`
  background-color: ${(props) => (props.isActive ? '#eff6ff' : 'transparent')};
  color: ${(props) => (props.isActive ? '#3b82f6' : '#475569')};
  border: 1px solid ${(props) => (props.isActive ? '#3b82f6' : '#e2e8f0')};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #3b82f6;
  }
`;

// 알림 목록 전체를 감싸는 리스트입니다.
export const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// 각각의 알림 항목입니다. isRead 값에 따라 배경색이 달라집니다.
export const NotificationItem = styled.li<{ isRead: boolean }>`
  position: relative; // ::before 가상 요소를 위한 position 설정
  display: flex;
  align-items: center;
  padding: 20px 15px 20px 30px; // 점이 들어갈 왼쪽 공간 확보
  border-bottom: 1px solid #f1f5f9;
  background-color: ${(props) => (props.isRead ? '#fff' : '#f8fafc')};
  transition: background-color 0.3s;
  cursor: pointer; // 클릭 가능하도록 커서 변경

  /* 안 읽은 알림을 강조하기 위한 파란색 점 */
  &::before {
    content: '';
    /* isRead가 false일 때만 점(block)을 보여줍니다. */
    display: ${(props) => (props.isRead ? 'none' : 'block')};
    position: absolute;
    left: 10px; /* 왼쪽에 위치 */
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background-color: #3b82f6;
    border-radius: 50%;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f1f5f9;
  }
`;

// 표시할 알림이 없을 때 보여줄 메시지 스타일입니다.
export const EmptyMessage = styled.div`
  padding: 50px;
  text-align: center;
  color: #94a3b8;
  font-size: 16px;
`;

// 알림 타입에 따라 다른 아이콘을 보여주기 위한 아이콘 래퍼입니다.
export const IconWrapper = styled.div`
  flex-shrink: 0;
  margin-right: 20px;
  font-size: 24px;
  color: #475569;
`;

// 알림 내용과 시간을 감싸는 컨테이너입니다.
export const ContentWrapper = styled.div`
  flex-grow: 1;
`;

// 알림 내용 텍스트입니다.
export const Content = styled.p`
  margin: 0;
  font-size: 16px;
  color: #334155;

  strong {
    font-weight: 600;
  }
`;

// 알림 시간 텍스트입니다.
export const Time = styled.span`
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
  display: block;
`; 