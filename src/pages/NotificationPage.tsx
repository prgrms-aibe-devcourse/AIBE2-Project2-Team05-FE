import React, { useState, useMemo } from 'react'; // useMemo 추가
import * as S from './NotificationPage.style';
import {
  dummyNotifications,
  Notification,
} from '../data/dummyNotifications';

// 알림 타입에 따라 적절한 Remixicon 클래스 이름을 반환하는 헬퍼 함수입니다.
const getIconForNotification = (type: Notification['type']) => {
  switch (type) {
    case 'match':
      return 'ri-user-add-line'; // 매칭 요청 아이콘
    case 'follow':
      return 'ri-group-line'; // 팔로우 아이콘
    case 'comment':
      return 'ri-chat-3-line'; // 댓글 아이콘
    default:
      return 'ri-notification-3-line'; // 기본 알림 아이콘
  }
};

const NotificationPage = () => {
  // 알림 목록을 상태로 관리합니다. 초기값으로 더미 데이터를 사용합니다.
  const [notifications, setNotifications] = useState<Notification[]>(
    dummyNotifications
  );
  // 'all' 또는 'unread' 상태를 가질 수 있는 필터 상태입니다.
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // 특정 알림을 클릭했을 때 호출되는 함수입니다.
  const handleNotificationClick = (id: number) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  // '모두 읽음' 버튼을 클릭했을 때 호출되는 함수입니다.
  const handleMarkAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) => ({ ...n, isRead: true }))
    );
  };

  // filter 상태에 따라 보여줄 알림 목록을 계산합니다. (useMemo로 최적화)
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <S.NotificationContainer>
      <S.Header>
        <S.Title>알림</S.Title>
        <S.MarkAllButton onClick={handleMarkAllAsRead}>
          모두 읽음 처리
        </S.MarkAllButton>
      </S.Header>

      <S.FilterBar>
        <S.FilterButton
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          전체
        </S.FilterButton>
        <S.FilterButton
          isActive={filter === 'unread'}
          onClick={() => setFilter('unread')}
        >
          안 읽음
        </S.FilterButton>
      </S.FilterBar>

      <S.NotificationList>
        {/* 필터링된 알림이 하나도 없을 경우 메시지를 보여줍니다. */}
        {filteredNotifications.length === 0 ? (
          <S.EmptyMessage>표시할 알림이 없습니다.</S.EmptyMessage>
        ) : (
          filteredNotifications.map((notification) => (
            <S.NotificationItem
              key={notification.id}
              isRead={notification.isRead}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <S.IconWrapper>
                <i className={getIconForNotification(notification.type)}></i>
              </S.IconWrapper>
              <S.ContentWrapper>
                <S.Content>
                  <strong>{notification.user.name}</strong>
                  {/* 더미 데이터의 content에서 사용자 이름 부분을 제외하고 텍스트를 조합합니다. */}
                  {notification.type === 'follow' && `님이 회원님을 팔로우하기 시작했습니다.`}
                  {notification.type === 'match' && `님이 회원님께 여행 메이트 요청을 보냈습니다.`}
                  {notification.type === 'comment' && `님이 "${notification.content}" 게시물에 댓글을 남겼습니다.`}
                </S.Content>
                <S.Time>{notification.time}</S.Time>
              </S.ContentWrapper>
            </S.NotificationItem>
          ))
        )}
      </S.NotificationList>
    </S.NotificationContainer>
  );
};

export default NotificationPage;
