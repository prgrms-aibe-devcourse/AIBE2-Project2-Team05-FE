// src/data/dummyNotifications.ts

// 알림 데이터의 타입을 정의합니다.
// 'match': 매칭 요청, 'follow': 새 팔로워, 'comment': 새 댓글
export type NotificationType = 'match' | 'follow' | 'comment';

export interface Notification {
  id: number;
  type: NotificationType;
  user: {
    name: string;
    avatar: string; // 사용자 프로필 이미지 URL
  };
  content: string; // 알림 내용 (예: "회원님을 팔로우하기 시작했습니다.")
  time: string; // 알림이 발생한 시간 (예: "1시간 전")
  isRead: boolean; // 사용자가 알림을 읽었는지 여부
}

// 다양한 종류의 알림을 담은 더미 데이터 배열입니다.
export const dummyNotifications: Notification[] = [
  {
    id: 1,
    type: 'match',
    user: { name: '김여행', avatar: '' },
    content: '회원님께 여행 메이트 요청을 보냈습니다.',
    time: '30분 전',
    isRead: false,
  },
  {
    id: 2,
    type: 'follow',
    user: { name: '박탐험', avatar: '' },
    content: '회원님을 팔로우하기 시작했습니다.',
    time: '1시간 전',
    isRead: false,
  },
  {
    id: 3,
    type: 'comment',
    user: { name: '이모험', avatar: '' },
    content: '회원님의 "제주도 여행" 게시물에 댓글을 남겼습니다.',
    time: '3시간 전',
    isRead: true,
  },
  {
    id: 4,
    type: 'follow',
    user: { name: '최모험가', avatar: '' },
    content: '회원님을 팔로우하기 시작했습니다.',
    time: '5시간 전',
    isRead: true,
  },
  {
    id: 5,
    type: 'match',
    user: { name: '정탐험', avatar: '' },
    content: '회원님께 여행 메이트 요청을 보냈습니다.',
    time: '1일 전',
    isRead: true,
  },
    {
    id: 6,
    type: 'comment',
    user: { name: '강모험', avatar: '' },
    content: '회원님의 "부산 맛집 탐방" 게시물에 댓글을 남겼습니다.',
    time: '2일 전',
    isRead: true,
  },
]; 