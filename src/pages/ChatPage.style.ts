import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 70px); /* 헤더 높이를 제외한 전체 높이 */
  background-color: #ffffff;
`;

export const ChatListPanel = styled.div`
  width: 360px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

export const SearchContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 10px 15px;

  i {
    color: #9ca3af;
    margin-right: 10px;
  }

  input {
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
    font-size: 14px;
  }
`;

export const ChatRooms = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const ChatRoom = styled.div<{ isActive: boolean }>`
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.isActive ? '#eff6ff' : 'transparent')};
  border-left: 3px solid
    ${(props) => (props.isActive ? '#3b82f6' : 'transparent')};

  &:hover {
    background-color: #f9fafb;
  }
`;

export const ChatAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e0e7ff;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 20px;
  flex-shrink: 0;
`;

export const ChatInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

export const ChatName = styled.span`
  font-weight: 500;
  font-size: 16px;
`;

export const ChatTime = styled.span`
  color: #9ca3af;
  font-size: 12px;
`;

export const ChatPreview = styled.div`
  color: #6b7280;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UnreadBadge = styled.div`
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: 10px;
  align-self: center;
`;

export const ChatContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
`;

export const ChatHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
`;

export const ChatUserInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled(ChatAvatar)`
  width: 45px;
  height: 45px;
  font-size: 18px;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

export const UserStatus = styled.div`
  color: #10b981;
  font-size: 14px;
  display: flex;
  align-items: center;

  i {
    margin-right: 5px;
    font-size: 12px;
  }
`;

export const ChatOptions = styled.div`
  display: flex;
`;

export const ChatOptionBtn = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 20px;
  margin-left: 15px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`; 