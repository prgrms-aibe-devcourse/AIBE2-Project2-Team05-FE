import axios from 'axios';
import api from './api';

// 채팅 관련 타입 정의
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

// 🔧 백엔드에서 현재 사용자 정보를 조회하는 함수
const getCurrentUserFromBackend = async (): Promise<{ id: number; nickname: string; email: string; profileImage?: string }> => {
  try {
    console.log('🔍 백엔드에서 현재 사용자 정보 조회 시작');
    
    // 토큰 상태 확인
    const tokenStatus = checkTokenStatus();
    if (!tokenStatus.hasToken) {
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }

    // 🔧 실제 토큰 가져오기
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('토큰을 찾을 수 없습니다.');
    }

    const response = await axios.get('http://localhost:8080/api/users/me', {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 백엔드에서 현재 사용자 정보 조회 성공:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ 백엔드에서 현재 사용자 정보 조회 실패:', error);
    
    if (error.response?.status === 401) {
      throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    throw new Error('사용자 정보 조회 실패: ' + (error.message || '알 수 없는 오류'));
  }
};

// 현재 로그인한 사용자 ID를 가져오는 함수 (개선됨)
const getCurrentUserId = async (): Promise<number> => {
  try {
    // 🔧 먼저 로컬스토리지에서 사용자 ID 확인
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          console.log('✅ 로컬스토리지에서 사용자 ID 조회 성공:', user.id);
          return user.id;
        }
      } catch (e) {
        console.warn('⚠️ 로컬스토리지 사용자 정보 파싱 실패, 백엔드에서 조회');
      }
    }
    
    // 🔧 로컬스토리지에 ID가 없으면 백엔드에서 조회
    console.log('🔍 로컬스토리지에 사용자 ID가 없음, 백엔드에서 조회');
    const currentUser = await getCurrentUserFromBackend();
    
    // 🔧 조회한 사용자 정보를 로컬스토리지에 업데이트
    const existingUser = userStr ? JSON.parse(userStr) : {};
    const updatedUser = { ...existingUser, ...currentUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('✅ 백엔드에서 사용자 ID 조회 및 로컬스토리지 업데이트 성공:', currentUser.id);
    return currentUser.id;
    
  } catch (error: any) {
    console.error('❌ 사용자 ID 조회 실패:', error);
    throw new Error('사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
  }
};

// 채팅방 목록 조회
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

// 메시지 조회
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
    
    // 🔧 현재 사용자 ID를 가져와서 메시지 변환에 사용 (async/await 적용)
    const currentUserId = await getCurrentUserId();
    return response.data.map((dto: ChatMessageResponseDTO) => transformToChatMessage(dto, currentUserId));
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    if (error.message?.includes('사용자 ID를 찾을 수 없습니다')) {
      throw new Error('로그인이 필요합니다.');
    }
    return [];
  }
};

// 메시지 전송
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
    
    // 🔧 현재 사용자 ID를 가져와서 메시지 변환에 사용 (async/await 적용)
    const currentUserId = await getCurrentUserId();
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
    
    // 🔧 사용자 검색 API 호출 (users 엔드포인트 사용)
    // api.get을 사용하면 자동으로 localhost:8080 + 토큰 헤더가 포함됩니다
    const response = await api.get<UserSearchResult[]>('/api/users/search', {
      params: { query: nickname.trim() }  // 🔧 백엔드와 맞추기 위해 nickname → query로 변경
    });
    
    return response.data;
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    return [];
  }
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

/**
 * 🔧 새로 추가: 매칭 수락 시 자동으로 채팅방 생성
 * @param matchingId 수락된 매칭 ID
 * @param otherUserId 상대방 사용자 ID
 * @returns 생성된 채팅방 정보
 */
export const createChatRoomFromMatching = async (matchingId: number, otherUserId: number): Promise<ChatRoomInfo | null> => {
  console.log('🔧 매칭 기반 채팅방 생성 시도:', { matchingId, otherUserId });
  
  try {
    // 기존 createOrGetChatRoom 함수를 재사용하되, matchingId를 포함
    const chatRoom = await createOrGetChatRoom(otherUserId, matchingId);
    
    if (chatRoom) {
      console.log('✅ 매칭 기반 채팅방 생성 성공:', chatRoom);
    }
    
    return chatRoom;
  } catch (error) {
    console.error('❌ 매칭 기반 채팅방 생성 실패:', error);
    throw error;
  }
}; 