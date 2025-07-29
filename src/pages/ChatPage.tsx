import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage, ChatRoomInfo, UserSearchResult } from '../types/chat';
import { getMessages, sendMessage, getChatRooms, createOrGetChatRoom } from '../services/chatApi';
import UserSearchModal from '../components/chat/UserSearchModal';
import { useAuth } from '../contexts/AuthContext';

interface MessageHistory {
  [roomId: number]: ChatMessage[];
}

const ChatPage: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth(); // 🔧 isLoading, isAuthenticated 추가
  const location = useLocation();
  
  // location.state에서 selectedRoomId를 가져와 초기값으로 설정
  const initialRoomId = location.state?.selectedRoomId || null;

  const [chatRooms, setChatRooms] = useState<ChatRoomInfo[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(initialRoomId);
  const [messages, setMessages] = useState<MessageHistory>({});
  const [newMessage, setNewMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(0);
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // 🔧 user.id 대신 user.email을 사용하여 사용자 식별
  const currentUserEmail = user?.email || null;
  const currentUserId = user?.id || null; // ID가 있을 때만 사용

  // 🔧 모든 useEffect는 조건부 return 이전에 호출해야 함 (React Hooks 규칙)
  
  // 채팅방 목록 로드
  useEffect(() => {
    // 🔧 로그인되어 있고 이메일이 있을 때만 실행
    if (!isAuthenticated || !currentUserEmail) return;
    
    const fetchChatRooms = async () => {
      setIsLoadingChatRooms(true);
      try {
        const rooms = await getChatRooms();
        setChatRooms(rooms);
        
        // 초기 선택된 방이 없고 채팅방이 있으면 첫 번째 방 선택
        if (!selectedRoomId && rooms.length > 0) {
          setSelectedRoomId(rooms[0].id);
        }
      } catch (error: any) {
        console.error('채팅방 목록 조회 실패:', error);
        
        if (error.message?.includes('토큰이 만료')) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          window.location.reload();
        } else if (error.message?.includes('로그인이 필요')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          window.location.reload();
        } else if (error.message?.includes('인증에 실패')) {
          alert('인증에 실패했습니다. 다시 로그인해주세요.');
          window.location.reload();
        } else {
          console.log('채팅방 목록을 가져올 수 없습니다:', error.message);
        }
      } finally {
        setIsLoadingChatRooms(false);
      }
    };
    
    fetchChatRooms();
  }, [isAuthenticated, currentUserEmail, selectedRoomId]);

  // 선택된 룸 변경 시 메시지 로드
  useEffect(() => {
    // 🔧 로그인되어 있고 이메일이 있으며 선택된 방이 있을 때만 실행
    if (selectedRoomId !== null && isAuthenticated && currentUserEmail) {
      setMessages({}); // 채팅방 변경 시 기존 메시지 초기화
      setLastMessageId(0);
      fetchMessages(selectedRoomId, 0);
    }
  }, [selectedRoomId]);
  
  // 새로운 메시지를 주기적으로 가져오는 로직
  useEffect(() => {
    if (selectedRoomId === null) return;

    const interval = setInterval(() => {
      fetchMessages(selectedRoomId, lastMessageId);
    }, 3000); // 3초마다 새로운 메시지를 가져옴

    return () => clearInterval(interval);
  }, [selectedRoomId, lastMessageId]);

  const fetchMessages = async (roomId: number, lastId: number) => {
    // 🔧 isAuthenticated와 currentUserEmail로 로그인 상태 확인 (currentUserId 체크 제거)
    if (!isAuthenticated || !currentUserEmail) {
      console.log('메시지 조회 조건 미충족:', { isAuthenticated, hasEmail: !!currentUserEmail });
      return;
    }
    
    // 첫 번째 로딩인 경우에만 로딩 상태 표시
    if (lastId === 0) {
      setIsLoadingMessages(true);
    }
    
    try {
      console.log('메시지 조회 시도:', { roomId, lastId });
      const newMessages = await getMessages(roomId, lastId);
      console.log('메시지 조회 결과:', newMessages);
      
      if (newMessages.length > 0) {
        setMessages((prev: MessageHistory) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), ...newMessages],
        }));
        setLastMessageId(newMessages[newMessages.length - 1].id);
        console.log('메시지 상태 업데이트 완료:', newMessages.length, '개');
      }
    } catch (error: any) {
      console.error('메시지 조회 실패:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const selectedRoom = chatRooms.find(
    (room: ChatRoomInfo) => room.id === selectedRoomId
  );

  const handleSendMessage = async () => {
    // 🔧 isAuthenticated와 currentUserEmail로 로그인 상태 확인 (currentUserId 체크 제거)
    if (newMessage.trim() === '' || !selectedRoomId || !isAuthenticated || !currentUserEmail) {
      console.log('메시지 전송 조건 미충족:', {
        hasMessage: newMessage.trim() !== '',
        hasRoomId: !!selectedRoomId,
        isAuthenticated,
        hasEmail: !!currentUserEmail
      });
      return;
    }
    
    try {
      console.log('메시지 전송 시도:', { roomId: selectedRoomId, message: newMessage });
      const sentMessage = await sendMessage(selectedRoomId, newMessage);

      if (sentMessage) {
        console.log('메시지 전송 성공:', sentMessage);
        setMessages((prev: MessageHistory) => ({
          ...prev,
          [selectedRoomId]: [...(prev[selectedRoomId] || []), sentMessage],
        }));
        setLastMessageId(sentMessage.id);
        setNewMessage('');
        
        // 🔧 메시지 전송 후 즉시 최신 메시지 조회하여 DB와 동기화
        setTimeout(() => {
          fetchMessages(selectedRoomId, sentMessage.id);
        }, 500); // 0.5초 후 조회 (DB 저장 시간 고려)
      }
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  // 사용자 검색 모달에서 사용자를 선택했을 때 호출되는 함수
  const handleUserSelect = async (user: UserSearchResult) => {
    console.log('선택된 사용자:', user);
    
    try {
      const newChatRoom = await createOrGetChatRoom(user.id);
      
      if (newChatRoom) {
        console.log('채팅방 생성/반환 성공:', newChatRoom);
        
        setChatRooms(prevRooms => {
          const existingRoom = prevRooms.find(room => room.id === newChatRoom.id);
          if (existingRoom) {
            setSelectedRoomId(newChatRoom.id);
            return prevRooms;
          } else {
            const updatedRooms = [newChatRoom, ...prevRooms];
            setSelectedRoomId(newChatRoom.id);
            return updatedRooms;
          }
        });
        
        alert(`${user.nickname}님과의 채팅방이 생성되었습니다!`);
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      
      if (error.message?.includes('토큰이 만료')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.reload();
      } else if (error.message?.includes('로그인이 필요')) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.reload();
      } else if (error.message?.includes('사용자 정보를 찾을 수 없습니다')) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        window.location.reload();
      } else {
        alert(`채팅방 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    }
  };

  // 🔧 조건부 렌더링 (React Hooks 규칙에 따라 마지막에 배치)
  
  // 로딩 중일 때
  if (isLoading) {
    return (
      <ChatContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </ChatContainer>
    );
  }

  // 사용자가 로그인하지 않은 경우
  if (!isAuthenticated || !currentUserEmail) {
    return (
      <ChatContainer>
        <NotLoggedInContainer>
          <NotLoggedInIcon>🔒</NotLoggedInIcon>
          <NotLoggedInText>채팅을 이용하려면 로그인이 필요합니다.</NotLoggedInText>
          <LoginButton onClick={() => window.location.href = '/login'}>
            로그인하기
          </LoginButton>
        </NotLoggedInContainer>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatListPanel>
        <SearchContainer>
          <SearchBox onClick={() => setIsUserSearchModalOpen(true)}>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="사용자 검색" 
              readOnly
            />
          </SearchBox>
        </SearchContainer>
        
        <ChatRooms>
          {isLoadingChatRooms ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>채팅방 목록을 불러오는 중입니다...</LoadingText>
            </LoadingContainer>
          ) : chatRooms.length === 0 ? (
            <EmptyRoomsContainer>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyText>채팅방이 없습니다.<br/>새로운 채팅방을 만들어보세요!</EmptyText>
            </EmptyRoomsContainer>
          ) : (
            chatRooms.map((room: ChatRoomInfo) => (
              <ChatRoom
                key={room.id}
                isActive={room.id === selectedRoomId}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <ChatAvatar>
                  <AvatarIcon>👤</AvatarIcon>
                </ChatAvatar>
                <ChatInfo>
                  <ChatHeader>
                    <ChatName>{room.name}</ChatName>
                    <ChatTime>{room.time}</ChatTime>
                  </ChatHeader>
                  <ChatPreview>{room.preview}</ChatPreview>
                </ChatInfo>
                {room.unread > 0 && <UnreadBadge>{room.unread}</UnreadBadge>}
              </ChatRoom>
            ))
          )}
        </ChatRooms>
      </ChatListPanel>

      <ChatContentPanel>
        {selectedRoom ? (
          <>
            <ChatHeaderBar>
              <ChatUserInfo>
                <UserAvatar>
                  <AvatarIcon>👤</AvatarIcon>
                </UserAvatar>
                <UserDetails>
                  <UserName>{selectedRoom.name}</UserName>
                  <UserStatus>
                    <StatusIndicator />
                    온라인
                  </UserStatus>
                </UserDetails>
              </ChatUserInfo>
              <ChatOptions>
                <ChatOptionBtn>
                  <OptionsIcon>⋮</OptionsIcon>
                </ChatOptionBtn>
              </ChatOptions>
            </ChatHeaderBar>

            <ChatMessages>
              <DateDivider>
                <DateText>오늘</DateText>
              </DateDivider>
              {isLoadingMessages ? (
                <MessageLoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>메시지를 불러오는 중입니다...</LoadingText>
                </MessageLoadingContainer>
              ) : (messages[selectedRoom.id] || []).length === 0 ? (
                <EmptyMessagesContainer>
                  <EmptyIcon>📝</EmptyIcon>
                  <EmptyText>첫 번째 메시지를 보내보세요!</EmptyText>
                </EmptyMessagesContainer>
              ) : (messages[selectedRoom.id] || []).map((msg: ChatMessage) => (
                <Message key={msg.id} className={msg.type}>
                  <MessageContent className={msg.type}>{msg.text}</MessageContent>
                  <MessageMeta>{msg.time}</MessageMeta>
                </Message>
              ))}
            </ChatMessages>

            <ChatInputArea>
              <AnimatePresence>
                {isAttachmentMenuOpen && (
                  <AttachmentMenu>
                    <AttachmentMenuItem>
                      📷 사진
                    </AttachmentMenuItem>
                    <AttachmentMenuItem>
                      📍 지도
                    </AttachmentMenuItem>
                    <AttachmentMenuItem>
                      📅 일정
                    </AttachmentMenuItem>
                  </AttachmentMenu>
                )}
              </AnimatePresence>
              <AttachmentBtn onClick={() => setIsAttachmentMenuOpen(prev => !prev)}>
                ➕
              </AttachmentBtn>
              <MessageInput 
                placeholder="메시지를 입력하세요..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <SendBtn onClick={handleSendMessage}>
                📤
              </SendBtn>
            </ChatInputArea>
          </>
        ) : (
          <WelcomeContainer>
            <WelcomeIcon>💬</WelcomeIcon>
            <WelcomeTitle>채팅방을 선택하세요</WelcomeTitle>
            <WelcomeText>왼쪽에서 채팅방을 선택하여 대화를 시작하세요</WelcomeText>
          </WelcomeContainer>
        )}
      </ChatContentPanel>
      
      {/* 사용자 검색 모달 */}
      <UserSearchModal
        isOpen={isUserSearchModalOpen}
        onClose={() => setIsUserSearchModalOpen(false)}
        onUserSelect={handleUserSelect}
      />
    </ChatContainer>
  );
};

export default ChatPage;

// 스타일 컴포넌트들
const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Pretendard', sans-serif;
`;

const ChatListPanel = styled.div`
  width: 350px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #e9ecef;
  }
`;

const SearchIcon = styled.div`
  margin-right: 8px;
  font-size: 16px;
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  cursor: pointer;
  color: #666;

  &::placeholder {
    color: #aaa;
  }
`;

const ChatRooms = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatRoom = styled.div<{ isActive: boolean }>`
  display: flex;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${props => props.isActive ? '#3682F8' : 'white'};
  color: ${props => props.isActive ? 'white' : '#333'};

  &:hover {
    background: ${props => props.isActive ? '#3682F8' : '#f8f9fa'};
  }
`;

const ChatAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3682F8 0%, #667eea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
`;

const AvatarIcon = styled.div`
  color: white;
  font-size: 20px;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ChatName = styled.div`
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChatTime = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;

const ChatPreview = styled.div`
  font-size: 14px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadBadge = styled.div`
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const ChatContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ChatHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  background: white;
`;

const ChatUserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3682F8 0%, #667eea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 2px;
`;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #28a745;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  margin-right: 4px;
`;

const ChatOptions = styled.div``;

const ChatOptionBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #666;

  &:hover {
    background: #f8f9fa;
  }
`;

const OptionsIcon = styled.div`
  font-size: 18px;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  background: #f8f9fa;
`;

const DateDivider = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const DateText = styled.span`
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Message = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;

  &.sent {
    align-items: flex-end;
  }

  &.received {
    align-items: flex-start;
  }
`;

const MessageContent = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  margin-bottom: 4px;

  &.sent {
    background: #3682F8;
    color: white;
  }

  &.received {
    background: white;
    color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const MessageMeta = styled.div`
  font-size: 11px;
  color: #999;
  margin: 0 4px;
`;

const ChatInputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: white;
  position: relative;
`;

const AttachmentMenu = styled.div`
  position: absolute;
  bottom: 70px;
  left: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
`;

const AttachmentMenuItem = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const AttachmentBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
  border-radius: 50%;
  font-size: 16px;
  color: #666;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  border-radius: 20px;
  background: #f8f9fa;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;

  &::placeholder {
    color: #aaa;
  }
`;

const SendBtn = styled.button`
  background: #3682F8;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 12px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  
  &:hover {
    background: #2c5aa0;
  }
`;

// 로딩 및 빈 상태 스타일
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
`;

const MessageLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3682F8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 14px;
`;

const EmptyRoomsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
`;

const WelcomeIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const WelcomeTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const WelcomeText = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
  line-height: 1.5;
`;

const NotLoggedInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
`;

const NotLoggedInIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const NotLoggedInText = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
`;

const LoginButton = styled.button`
  background: #3682F8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2c5aa0;
  }
`; 