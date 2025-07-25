import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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

interface ChatMessage {
  id: number;
  type: 'sent' | 'received';
  text: string;
  time: string;
}

interface MessageHistory {
  [roomId: number]: ChatMessage[];
}

// 임시 데이터
const dummyChatRooms = [
  {
    id: 1,
    name: '김지민',
    time: '오후 2:30',
    preview: '네, 제주도 여행 계획 공유해 드릴게요!',
    unread: 2,
  },
  {
    id: 2,
    name: '이서연',
    time: '오전 11:45',
    preview: '부산 여행은 언제 출발하시나요?',
    unread: 0,
  },
  {
    id: 3,
    name: '박준호',
    time: '어제',
    preview: '강릉 카페 추천해 주셔서 감사합니다!',
    unread: 0,
  },
];

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

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(1);
  const [messages, setMessages] = useState<MessageHistory>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  // const stompClient = useRef<Client | null>(null); // WebSocket 로직 주석 처리

  /*
  // ============== WebSocket 연결 로직 (주석 처리) ==============
  // TODO: 백엔드와 WebSocket 엔드포인트 및 경로 확정 후 주석 해제
  useEffect(() => {
    const connect = () => {
      // 1. 백엔드 WebSocket 엔드포인트. 현재는 '/ws'로 가정
      const socket = new SockJS('http://localhost:8080/ws'); 
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Connected to WebSocket!');
          if (selectedRoomId) {
            // 2. 특정 채팅방 구독 경로. 현재는 '/topic/chat/room/{roomId}'로 가정
            client.subscribe(`/topic/chat/room/${selectedRoomId}`, (message) => {
              const receivedMessage: ChatMessage = JSON.parse(message.body);
              // 메시지 수신 시 상태 업데이트
              setMessages(prev => ({
                ...prev,
                [selectedRoomId]: [...(prev[selectedRoomId] || []), receivedMessage],
              }));
            });
          }
        },
        onDisconnect: () => { console.log('Disconnected from WebSocket!'); },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        },
      });

      client.activate();
      // stompClient.current = client;
    };

    // connect();

    return () => {
      // if (stompClient.current && stompClient.current.active) {
      //   stompClient.current.deactivate();
      // }
    };
  }, [selectedRoomId]);
  */

  const selectedRoom = dummyChatRooms.find(
    (room) => room.id === selectedRoomId
  );

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedRoomId) return;

    /*
    // ============== WebSocket 메시지 전송 로직 (주석 처리) ==============
    // TODO: stompClient 활성화 및 실제 데이터 구조에 맞게 수정 후 주석 해제
    if (!stompClient.current) return;

    const chatMessage = {
      chatRoomId: selectedRoomId,
      senderId: 1, // TODO: 실제 로그인된 사용자 ID로 변경
      content: newMessage,
    };
    
    // 3. 메시지 발행 경로. 현재는 '/app/chat/message'로 가정
    stompClient.current.publish({
      destination: `/app/chat/message`,
      body: JSON.stringify(chatMessage),
    });
    */

    // 현재는 더미 데이터에 직접 추가 (UI 테스트용)
    const newMsg: ChatMessage = {
      id: Date.now(),
      type: 'sent' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), newMsg],
    }));

    setNewMessage('');
  };


  return (
    <ChatContainer>
      <ChatListPanel>
        <SearchContainer>
          <SearchBox>
            <i className="ri-search-line"></i>
            <input type="text" placeholder="채팅방 검색" />
          </SearchBox>
        </SearchContainer>
        <ChatRooms>
          {dummyChatRooms.map((room) => (
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
          ))}
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
              {(messages[selectedRoom.id] || []).map((msg: ChatMessage) => (
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
          <h2>채팅을 선택하여 대화를 시작하세요.</h2>
        )}
      </ChatContentPanel>
    </ChatContainer>
  );
};

export default ChatPage; 