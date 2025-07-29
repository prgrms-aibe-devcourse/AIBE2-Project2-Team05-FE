export interface ChatMessage {
  id: number;
  type: 'sent' | 'received';
  text: string;
  time: string;
}

export interface ChatRoomInfo {
  id: number;
  name: string;
  time: string;
  preview: string;
  unread: number;
}

// 사용자 검색 결과 타입 정의
export interface UserSearchResult {
  id: number;
  nickname: string;
  email: string;
  profileImage?: string; // 프로필 이미지 URL (선택적)
} 