import React, { useState } from 'react';
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
} from './ChatPage.style';

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

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(1);

  const selectedRoom = dummyChatRooms.find(
    (room) => room.id === selectedRoomId
  );

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
              {/* 여기에 채팅 메시지들이 표시됩니다. */}
              <p>{selectedRoom.name}님과의 대화 내용</p>
            </ChatMessages>
          </>
        ) : (
          <h2>채팅을 선택하여 대화를 시작하세요.</h2>
        )}
      </ChatContentPanel>
    </ChatContainer>
  );
};

export default ChatPage; 