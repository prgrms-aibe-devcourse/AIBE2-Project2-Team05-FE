import api from './api';
import profileApiService from './profileApi';
import { createChatRoomFromMatching } from './chatApi'; // 🔧 채팅 API 추가

// 매칭 관련 타입 정의
export interface MatchRecommendation {
  userId: number;
  nickname: string;
  location: string;
  startDate: string;
  endDate: string;
  travelPlanId: number;
  compatibilityScore: number;
}

export interface MatchRequest {
  receiverId: number;
  planId: number;
}

export interface MatchResponse {
  matchId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  
  // 🔧 요청을 보낸 사람 정보 (받은 요청에서 중요)
  senderId: number;
  senderNickname: string;
  senderProfileImage?: string; // 프로필 이미지 (선택적)
  
  // 🔧 요청을 받은 사람 정보 (보낸 요청에서 중요)
  receiverId: number;
  receiverNickname: string;
  receiverProfileImage?: string; // 프로필 이미지 (선택적)
  
  // 🔧 여행 계획 정보
  planId: number;
  planTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  budget: number;
}

export interface TravelStatusUpdateRequest {
  travelPlanId: number;
  status: string;
}

// 매칭 API 서비스
class MatchingApiService {
  
  /**
   * 매칭 추천 목록 조회
   */
  async getRecommendations(): Promise<MatchRecommendation[]> {
    try {
      const response = await api.get('/api/match/recommendations');
      console.log('✅ 매칭 추천 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 매칭 추천 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 매칭 요청 전송
   */
  async sendMatchRequest(request: MatchRequest): Promise<MatchResponse> {
    try {
      const response = await api.post('/api/match/request', request);
      console.log('✅ 매칭 요청 전송 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 매칭 요청 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 🔧 개선된 매칭 요청에 응답 (수락/거절) - 채팅방 자동 생성 포함
   */
  async respondToMatchRequest(matchId: number, status: 'ACCEPTED' | 'REJECTED'): Promise<string> {
    try {
      const response = await api.patch('/api/match/respond', {
        matchId,
        status
      });
      console.log('✅ 매칭 요청 응답 성공:', response.data);
      
      // 🔧 매칭 수락 시 자동으로 채팅방 생성
      if (status === 'ACCEPTED') {
        try {
          // 먼저 매칭 정보를 조회하여 상대방 ID를 가져옴
          const matchDetails = await this.getMatchDetails(matchId);
          if (matchDetails && matchDetails.senderId) {
            console.log('🔧 매칭 수락됨 - 채팅방 생성 시도:', {
              matchId,
              otherUserId: matchDetails.senderId
            });
            
            // 채팅방 생성
            await createChatRoomFromMatching(matchId, matchDetails.senderId);
            console.log('✅ 매칭 수락 후 채팅방 생성 완료');
          }
        } catch (chatError) {
          console.error('❌ 채팅방 생성 실패 (매칭은 성공):', chatError);
          // 채팅방 생성 실패해도 매칭은 성공한 상태로 유지
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ 매칭 요청 응답 실패:', error);
      throw error;
    }
  }

  /**
   * 매칭 요청 취소
   */
  async cancelMatchRequest(matchId: number): Promise<string> {
    try {
      const response = await api.delete(`/api/match/cancel/${matchId}`);
      console.log('✅ 매칭 요청 취소 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 매칭 요청 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 매칭 거절 (추천 목록에서 X 버튼)
   */
  async rejectPlan(planId: number): Promise<void> {
    try {
      await api.post('/api/match/reject', { planId });
      console.log('✅ 매칭 거절 성공:', planId);
    } catch (error) {
      console.error('❌ 매칭 거절 실패:', error);
      throw error;
    }
  }

  /**
   * 수락된 매칭 취소
   */
  async cancelAcceptedMatch(matchId: number): Promise<string> {
    try {
      const response = await api.delete(`/api/match/cancel/accepted/${matchId}`);
      console.log('✅ 수락된 매칭 취소 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 수락된 매칭 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 여행 상태 업데이트
   */
  async updateTravelStatus(request: TravelStatusUpdateRequest): Promise<string> {
    try {
      const response = await api.patch('/api/match/travel-status', request);
      console.log('✅ 여행 상태 업데이트 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 여행 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 내가 보낸 매칭 요청 조회
   */
  async getMySentRequests(): Promise<MatchResponse[]> {
    try {
      const response = await api.get('/api/match/my/sent');
      console.log('✅ 내가 보낸 매칭 요청 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 내가 보낸 매칭 요청 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 내가 받은 매칭 요청 조회 (PENDING만)
   */
  async getMyReceivedRequests(): Promise<MatchResponse[]> {
    try {
      const response = await api.get('/api/match/my/received');
      console.log('✅ 내가 받은 매칭 요청 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 내가 받은 매칭 요청 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 내가 포함된 수락된 매칭 조회
   */
  async getMyAcceptedMatches(): Promise<MatchResponse[]> {
    try {
      const response = await api.get('/api/match/my/accepted');
      console.log('✅ 내가 포함된 수락된 매칭 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 내가 포함된 수락된 매칭 조회 실패:', error);
      throw error;
    }
  }

  // 🔧 사용자 프로필 정보 조회 (상대방 정보용)
  async getUserProfile(userId: number): Promise<{
    id: number;
    nickname: string;
    profileImage: string | null;
    age: number;
  }> {
    console.log('🔍 사용자 프로필 조회 요청:', userId);
    
    try {
      // 🔧 기존 profileApi 서비스 활용
      const profileData = await profileApiService.getProfile(userId);
      console.log('✅ 실제 사용자 프로필 조회 성공:', profileData);
      
      return {
        id: profileData.id,
        nickname: profileData.nickname,
        profileImage: profileData.profileImage || null,
        age: profileData.age || 25
      };
    } catch (error: any) {
      console.error('❌ 사용자 프로필 조회 실패:', error);
      // 기본값 반환
      return {
        id: userId,
        nickname: '알 수 없는 사용자',
        profileImage: null,
        age: 25
      };
    }
  }

  // 🔧 새로 추가: 내가 거절한 매칭 목록 조회
  async getMyRejectedMatches(): Promise<MatchResponse[]> {
    try {
      const response = await api.get('/api/match/my/rejected');
      console.log('✅ 내가 거절한 매칭 목록 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 내가 거절한 매칭 목록 조회 실패:', error);
      throw error;
    }
  }

  // 🔧 새로 추가: 거절한 매칭 취소 (다시 추천에 나오게)
  async unrejectMatch(matchingId: number): Promise<string> {
    try {
      const response = await api.delete(`/api/match/unreject/${matchingId}`);
      console.log('✅ 거절 취소 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 거절 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 🔧 새로 추가: 매칭 상세 정보 조회
   * @param matchId 매칭 ID
   * @returns 매칭 상세 정보
   */
  private async getMatchDetails(matchId: number): Promise<MatchResponse | null> {
    try {
      // 받은 매칭 요청에서 해당 매칭 찾기
      const receivedRequests = await this.getMyReceivedRequests();
      const sentRequests = await this.getMySentRequests();
      
      // 받은 요청과 보낸 요청에서 모두 검색
      const allRequests = [...receivedRequests, ...sentRequests];
      const matchDetails = allRequests.find(req => req.matchId === matchId);
      
      if (matchDetails) {
        console.log('✅ 매칭 상세 정보 조회 성공:', matchDetails);
        return matchDetails;
      }
      
      console.warn('⚠️ 매칭 상세 정보를 찾을 수 없음:', matchId);
      return null;
    } catch (error) {
      console.error('❌ 매칭 상세 정보 조회 실패:', error);
      return null;
    }
  }
}

// 매칭 API 서비스 인스턴스 생성 및 내보내기
const matchingApiService = new MatchingApiService();
export default matchingApiService; 