import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage, ChatRoomInfo, UserSearchResult } from '../types/chat'; // 타입 import 경로 변경
import { getMessages, sendMessage, getChatRooms, createOrGetChatRoom } from '../services/chatApi'; // API 서비스 import
import UserSearchModal from '../components/chat/UserSearchModal'; // 사용자 검색 모달 import
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 import
import {
  ChatContainer,
  ChatListPanel,
  SearchContainer,
  SearchBox,
  ChatRooms,
  ChatRoom,
  ChatAvatar,
  ChatInfo,
  ChatHeader,
  ChatName,
  ChatTime,
  ChatPreview,
  UnreadBadge,
  ChatContentPanel,
  ChatHeaderBar,
  ChatUserInfo,
  UserAvatar,
  UserDetails,
  UserName,
  UserStatus,
  ChatOptions,
  ChatOptionBtn,
  ChatMessages,
  DateDivider,
  DateText,
  Message,
  MessageContent,
  MessageMeta,
  ChatInputArea,
  AttachmentBtn,
  MessageInput,
  SendBtn,
  AttachmentMenu,
  AttachmentMenuItem,
} from './ChatPage.style';

// ChatMessage 인터페이스를 types/chat.ts 로 이동
// interface ChatMessage {
//   id: number;
//   type: 'sent' | 'received';
//   text: string;
//   time: string;
// }

interface MessageHistory {
  [roomId: number]: ChatMessage[];
}

const dummyMessages: MessageHistory = {
  1: [
    { id: 1, type: 'received', text: '안녕하세요! 제주도 여행 매칭이 되어서 연락드립니다.', time: '오전 10:15' },
    { id: 2, type: 'sent', text: '안녕하세요! 반갑습니다. 제주도 여행 계획 중이신가요?', time: '오전 10:18' },
    { id: 3, type: 'received', text: '네, 6월 중순에 3박 4일로 계획 중이에요. 혹시 같은 일정이신가요?', time: '오전 10:20' },
  ],
  2: [
    { id: 1, type: 'received', text: '부산 여행은 언제 출발하시나요?', time: '오전 11:45' },
  ],
  3: [
    { id: 1, type: 'sent', text: '강릉 카페 추천해 주셔서 감사합니다!', time: '어제' },
  ],
};

const menuVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// 로딩 스피너 애니메이션 스타일
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 스타일 태그 추가
if (!document.getElementById('spinner-style')) {
  const style = document.createElement('style');
  style.id = 'spinner-style';
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

const ChatPage: React.FC = () => {
  const { user } = useAuth(); // useAuth 훅 사용
  const [chatRooms, setChatRooms] = useState<ChatRoomInfo[]>([]); // 초기값 빈 배열로 변경
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null); // 초기값 null로 변경
  const [messages, setMessages] = useState<MessageHistory>({}); // 초기 메시지 비움
  const [newMessage, setNewMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(0); // 마지막 메시지 ID 추적
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false); // 사용자 검색 모달 상태
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(false); // 채팅방 목록 로딩 상태
  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // 메시지 로딩 상태
  
  // 현재 사용자 ID를 AuthContext에서 가져오기
  const currentUserId = user?.id || null;

  // 채팅방 목록 로드
  useEffect(() => {
    if (!currentUserId) return; // 사용자가 로그인하지 않은 경우 리턴
    
    const fetchChatRooms = async () => {
      setIsLoadingChatRooms(true); // 로딩 시작
      try {
        const rooms = await getChatRooms();
        setChatRooms(rooms);
        // 첫 번째 채팅방을 자동으로 선택
        if (rooms.length > 0) {
          setSelectedRoomId(rooms[0].id);
        }
      } catch (error: any) {
        console.error('채팅방 목록 조회 실패:', error);
        
        // 에러 메시지에 따라 다른 처리
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
          // 기타 오류는 조용히 처리 (채팅방이 없을 수도 있음)
          console.log('채팅방 목록을 가져올 수 없습니다:', error.message);
        }
      } finally {
        setIsLoadingChatRooms(false); // 로딩 완료
      }
    };
    fetchChatRooms();
  }, [currentUserId]);

  // 선택된 룸 변경 시 메시지 로드
  useEffect(() => {
    if (selectedRoomId !== null) {
      setMessages({}); // 채팅방 변경 시 기존 메시지 초기화
      setLastMessageId(0); // 마지막 메시지 ID 초기화
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
    if (!currentUserId) return; // 사용자가 로그인하지 않은 경우 리턴
    
    // 첫 번째 로딩인 경우에만 로딩 상태 표시
    if (lastId === 0) {
      setIsLoadingMessages(true);
    }
    
    try {
      const newMessages = await getMessages(roomId, lastId);
      if (newMessages.length > 0) {
        setMessages((prev: MessageHistory) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), ...newMessages],
        }));
        setLastMessageId(newMessages[newMessages.length - 1].id);
      }
    } catch (error: any) {
      console.error('메시지 조회 실패:', error);
      // 메시지 조회 실패는 조용히 처리 (네트워크 오류 등일 수 있음)
    } finally {
      setIsLoadingMessages(false); // 로딩 완료
    }
  };

  const selectedRoom = chatRooms.find(
    (room: ChatRoomInfo) => room.id === selectedRoomId
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedRoomId || !currentUserId) return;
    
    const sentMessage = await sendMessage(selectedRoomId, newMessage);

    if (sentMessage) {
      setMessages((prev: MessageHistory) => ({
        ...prev,
        [selectedRoomId]: [...(prev[selectedRoomId] || []), sentMessage],
      }));
      setLastMessageId(sentMessage.id);
      setNewMessage('');
    }
  };

  // 사용자 검색 모달에서 사용자를 선택했을 때 호출되는 함수
  const handleUserSelect = async (user: UserSearchResult) => {
    console.log('선택된 사용자:', user);
    
    try {
      // 선택된 사용자와 채팅방 생성 또는 기존 채팅방 반환
      const newChatRoom = await createOrGetChatRoom(user.id);
      
      if (newChatRoom) {
        console.log('채팅방 생성/반환 성공:', newChatRoom);
        
        // 새로 생성된 채팅방을 채팅방 목록에 추가
        setChatRooms(prevRooms => {
          // 이미 존재하는 채팅방인지 확인
          const existingRoom = prevRooms.find(room => room.id === newChatRoom.id);
          if (existingRoom) {
            // 기존 채팅방이 있으면 해당 채팅방으로 이동
            setSelectedRoomId(newChatRoom.id);
            return prevRooms;
          } else {
            // 새 채팅방이면 목록에 추가하고 선택
            const updatedRooms = [newChatRoom, ...prevRooms];
            setSelectedRoomId(newChatRoom.id);
            return updatedRooms;
          }
        });
        
        // 성공 메시지
        alert(`${user.nickname}님과의 채팅방이 생성되었습니다!`);
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      
      // 에러 메시지에 따라 다른 처리
      if (error.message?.includes('토큰이 만료')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 이동하거나 새로고침
        window.location.reload();
      } else if (error.message?.includes('로그인이 필요')) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.reload();
      } else if (error.message?.includes('사용자 정보를 찾을 수 없습니다')) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        window.location.reload();
      } else {
        // 기타 오류는 사용자에게 표시
        alert(`채팅방 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    }
  };

  // 사용자가 로그인하지 않은 경우
  if (!currentUserId) {
    return (
      <ChatContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          fontSize: '18px',
          color: '#666'
        }}>
          채팅을 이용하려면 로그인이 필요합니다.
        </div>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatListPanel>
        <SearchContainer>
          <SearchBox onClick={() => setIsUserSearchModalOpen(true)}>
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="사용자 검색" 
              readOnly // 클릭만 가능하도록 읽기 전용으로 설정
              style={{ cursor: 'pointer' }}
            />
          </SearchBox>
        </SearchContainer>
        <ChatRooms>
          {isLoadingChatRooms ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#666'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '10px'
              }}></div>
              <p style={{ margin: 0, fontSize: '14px' }}>채팅방 목록을 불러오는 중입니다...</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#666'
            }}>
              <i className="ri-chat-3-line" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
              <p style={{ margin: 0, fontSize: '14px' }}>채팅방이 없습니다.<br/>새로운 채팅방을 만들어보세요!</p>
            </div>
          ) : (
            chatRooms.map((room: ChatRoomInfo) => ( // chatRooms 상태 사용
              <ChatRoom
                key={room.id}
                isActive={room.id === selectedRoomId}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <ChatAvatar>
                  <i className="ri-user-line"></i>
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
                  <i className="ri-user-line"></i>
                </UserAvatar>
                <UserDetails>
                  <UserName>{selectedRoom.name}</UserName>
                  <UserStatus>
                    <i className="ri-record-circle-fill"></i>
                    온라인
                  </UserStatus>
                </UserDetails>
              </ChatUserInfo>
              <ChatOptions>
                <ChatOptionBtn>
                  <i className="ri-more-2-fill"></i>
                </ChatOptionBtn>
              </ChatOptions>
            </ChatHeaderBar>
            <ChatMessages>
              <DateDivider>
                <DateText>2023년 5월 25일</DateText>
              </DateDivider>
              {isLoadingMessages ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#666'
                }}>
                  <div style={{
                    display: 'inline-block',
                    width: '30px',
                    height: '30px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '10px'
                  }}></div>
                  <p style={{ margin: 0, fontSize: '14px' }}>메시지를 불러오는 중입니다...</p>
                </div>
              ) : (messages[selectedRoom.id] || []).length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#666'
                }}>
                  <i className="ri-message-3-line" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
                  <p style={{ margin: 0, fontSize: '14px' }}>첫 번째 메시지를 보내보세요!</p>
                </div>
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
                  <AttachmentMenu
                    variants={menuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <AttachmentMenuItem>
                      <i className="ri-image-line"></i>
                      사진
                    </AttachmentMenuItem>
                    <AttachmentMenuItem>
                      <i className="ri-map-pin-line"></i>
                      지도
                    </AttachmentMenuItem>
                    <AttachmentMenuItem>
                      <i className="ri-calendar-todo-line"></i>
                      일정
                    </AttachmentMenuItem>
                  </AttachmentMenu>
                )}
              </AnimatePresence>
              <AttachmentBtn onClick={() => setIsAttachmentMenuOpen(prev => !prev)}>
                <i className="ri-add-circle-line"></i>
              </AttachmentBtn>
              <MessageInput 
                placeholder="메시지를 입력하세요..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <SendBtn onClick={handleSendMessage}><i className="ri-send-plane-fill"></i></SendBtn>
            </ChatInputArea>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#666',
            textAlign: 'center',
            padding: '20px'
          }}>
            <i className="ri-chat-smile-3-line" style={{ 
              fontSize: '64px', 
              marginBottom: '20px', 
              opacity: 0.5,
              color: '#007bff'
            }}></i>
            <h2 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '20px',
              fontWeight: '500'
            }}>채팅방을 선택하세요</h2>
            <p style={{ 
              margin: 0, 
              fontSize: '14px',
              opacity: 0.7
            }}>왼쪽에서 채팅방을 선택하여 대화를 시작하세요</p>
          </div>
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