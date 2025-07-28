
import axios from 'axios';
import { ChatMessage, ChatRoomInfo, UserSearchResult } from '../types/chat';
import api from './api';

const API_URL = '/api/chat'; // 백엔드 API 주소

// 백엔드 응답 DTO와 프론트엔드 ChatMessage 타입 간의 변환을 위한 인터페이스
interface ChatMessageResponseDTO {
  id: number;
  senderId: number;
  message: string;
  sentAt: string; // ISO 8601 형식의 문자열
}

// DTO를 프론트엔드 모델로 변환하는 함수
const transformToChatMessage = (dto: ChatMessageResponseDTO, currentUserId: number): ChatMessage => ({
  id: dto.id,
  type: dto.senderId === currentUserId ? 'sent' : 'received',
  text: dto.message,
  time: new Date(dto.sentAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }),
});

// DTO를 프론트엔드 모델로 변환하는 함수
const transformToChatRoomInfo = (dto: any): ChatRoomInfo => ({
  id: dto.id,
  name: dto.name,
  time: new Date(dto.time).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  preview: dto.preview,
  unread: dto.unread,
});


export const getChatRooms = async (): Promise<ChatRoomInfo[]> => {
  try {
    // 토큰 상태 확인
    const tokenStatus = checkTokenStatus();
    
    // 토큰이 없는 경우
    if (!tokenStatus.hasToken) {
      console.error('❌ 토큰이 없습니다. 로그인이 필요합니다.');
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }
    
    // 토큰이 만료된 경우
    if (tokenStatus.isExpired) {
      console.error('❌ 토큰이 만료되었습니다.');
      throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    console.log('✅ 토큰 상태 정상, 채팅방 목록 조회 시도');
    
    // 토큰을 포함하여 요청
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const response = await axios.get('http://localhost:8080/api/chat/rooms', {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 채팅방 목록 조회 성공:', response.data);
    return response.data.map(transformToChatRoomInfo);
  } catch (error: any) {
    console.error('❌ 채팅방 목록 조회 실패:', error);
    
    // 401 오류인 경우 특별 처리
    if (error.response?.status === 401) {
      console.error('🔐 401 Unauthorized - 인증 실패');
      throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
    }
    
    // 기타 오류
    if (error.message) {
      throw new Error(`채팅방 목록 조회 실패: ${error.message}`);
    } else {
      throw new Error('채팅방 목록 조회 중 오류가 발생했습니다.');
    }
  }
};

export const getMessages = async (roomId: number, lastMessageId: number): Promise<ChatMessage[]> => {
  try {
    // 토큰 상태 확인
    const tokenStatus = checkTokenStatus();
    
    if (!tokenStatus.hasToken) {
      throw new Error('로그인이 필요합니다.');
    }
    
    if (tokenStatus.isExpired) {
      throw new Error('토큰이 만료되었습니다.');
    }
    
    // 토큰을 포함하여 요청
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8080/api/chat/rooms/${roomId}/messages`, {
      params: { lastMessageId },
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 현재 사용자 ID를 가져와서 메시지 변환에 사용
    const currentUserId = getCurrentUserId();
    return response.data.map((dto: ChatMessageResponseDTO) => transformToChatMessage(dto, currentUserId));
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    if (error.message?.includes('사용자 ID를 찾을 수 없습니다')) {
      throw new Error('로그인이 필요합니다.');
    }
    return [];
  }
};

export const sendMessage = async (roomId: number, message: string): Promise<ChatMessage | null> => {
  try {
    // 토큰 상태 확인
    const tokenStatus = checkTokenStatus();
    
    if (!tokenStatus.hasToken) {
      throw new Error('로그인이 필요합니다.');
    }
    
    if (tokenStatus.isExpired) {
      throw new Error('토큰이 만료되었습니다.');
    }
    
    // 토큰을 포함하여 요청
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const response = await axios.post('http://localhost:8080/api/chat/message', {
      chatRoomId: roomId,
      message,
    }, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 현재 사용자 ID를 가져와서 메시지 변환에 사용
    const currentUserId = getCurrentUserId();
    return transformToChatMessage(response.data, currentUserId);
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.message?.includes('사용자 ID를 찾을 수 없습니다')) {
      throw new Error('로그인이 필요합니다.');
    }
    return null;
  }
};

/**
 * 사용자 검색 API
 * 닉네임으로 사용자를 검색합니다
 * @param nickname 검색할 닉네임 (부분 일치)
 * @returns 검색된 사용자 리스트
 */
export const searchUsers = async (nickname: string): Promise<UserSearchResult[]> => {
  try {
    // 빈 검색어인 경우 빈 배열 반환
    if (!nickname || nickname.trim() === '') {
      return [];
    }
    
    // 사용자 검색 API 호출 (users 엔드포인트 사용)
    // api.get을 사용하면 자동으로 localhost:8080 + 토큰 헤더가 포함됩니다
    const response = await api.get<UserSearchResult[]>('/api/users/search', {
      params: { nickname: nickname.trim() }
    });
    
    return response.data;
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    return [];
  }
};

// 토큰 상태를 확인하는 유틸리티 함수
const checkTokenStatus = () => {
  const accessToken = localStorage.getItem('accessToken');
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 토큰 상태 확인:', {
    hasAccessToken: !!accessToken,
    hasToken: !!token,
    hasUser: !!user,
    accessTokenLength: accessToken?.length || 0,
    tokenLength: token?.length || 0
  });
  
  // 토큰 유효성 검사 (간단한 형식 검사)
  const currentToken = accessToken || token;
  if (currentToken) {
    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      console.log('🔍 토큰 유효성 검사:', {
        email: payload.sub,
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        isExpired: isExpired,
        currentTime: new Date(currentTime * 1000).toLocaleString()
      });
      
      return {
        hasToken: true,
        isExpired: isExpired,
        email: payload.sub
      };
    } catch (e) {
      console.error('❌ 토큰 파싱 실패:', e);
      return {
        hasToken: false,
        isExpired: true,
        email: null
      };
    }
  }
  
  return {
    hasToken: false,
    isExpired: true,
    email: null
  };
};

/**
 * 채팅방 생성 또는 기존 채팅방 반환 API
 * @param targetUserId 상대방 사용자 ID
 * @param matchingId 매칭 ID (선택사항)
 * @returns 생성되거나 기존의 채팅방 정보
 */
export const createOrGetChatRoom = async (targetUserId: number, matchingId?: number): Promise<ChatRoomInfo | null> => {
  try {
    // 토큰 상태 먼저 확인
    const tokenStatus = checkTokenStatus();
    
    // 토큰이 없는 경우
    if (!tokenStatus.hasToken) {
      console.error('❌ 토큰이 없습니다. 로그인이 필요합니다.');
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }
    
    // 토큰이 만료된 경우
    if (tokenStatus.isExpired) {
      console.error('❌ 토큰이 만료되었습니다.');
      throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    // 사용자 정보 확인
    const user = localStorage.getItem('user');
    if (!user) {
      console.error('❌ 사용자 정보가 없습니다.');
      throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
    }
    
    console.log('✅ 토큰 상태 정상, 채팅방 생성 시도');
    
    // 실제 전송될 요청 정보 확인
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('🔍 전송될 요청 정보:', {
      url: '/api/chat/rooms',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        targetUserId,
        matchingId: matchingId || null
      }
    });
    
    // 직접 axios 요청을 만들어서 토큰이 확실히 전송되도록 함
    const response = await axios.post('http://localhost:8080/api/chat/rooms', {
      targetUserId,
      matchingId: matchingId || null
    }, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 채팅방 생성 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ 채팅방 생성 실패:', error);
    
    // 401 오류인 경우 특별 처리
    if (error.response?.status === 401) {
      console.error('🔐 401 Unauthorized - 인증 실패');
      
      // 토큰 상태 재확인
      const currentTokenStatus = checkTokenStatus();
      
      if (currentTokenStatus.isExpired) {
        throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
      }
    }
    
    // 기타 오류
    if (error.message) {
      throw new Error(`채팅방 생성 실패: ${error.message}`);
    } else {
      throw new Error('채팅방 생성 중 오류가 발생했습니다.');
    }
  }
};

// 현재 로그인한 사용자 ID를 가져오는 함수
const getCurrentUserId = (): number => {
  // 로컬스토리지에서 사용자 정보 가져오기
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }
  
  try {
    const user = JSON.parse(userStr);
    if (!user.id) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }
    return user.id;
  } catch (e) {
    console.error('사용자 정보 파싱 실패:', e);
    throw new Error('사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
  }
}; 