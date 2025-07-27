// 백엔드 여행 계획 API 서비스
import api from './api'; // ✅ 인증 토큰이 포함된 api 사용

// API 베이스 URL
const API_PREFIX = '/api/plan';

// ✅ api.ts에서 인터셉터가 이미 설정되어 있으므로 제거

// 타입 정의
export interface TravelPlanData {
  planId?: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  period: string;
  budget: string;
  people: string;
  styles: string[];
  styleLabels: string[];
  matchingInfo?: {
    preferredGender?: string;
    preferredAge?: string;
    preferredLanguage?: string;
    matchingMemo?: string;
  };
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  schedules: Record<string, ScheduleItem[]>;
  aiHashtags?: string[];
  nearbyRecommendations?: RecommendedPlace[];
  imageUrl?: string;
  accommodationInfo?: string;
  transportationInfo?: string;
  extraMemo?: string;
}

export interface ScheduleItem {
  time: string;
  place: string;
  activity: string;
  memo?: string;
}

export interface RecommendedPlace {
  name: string;
  description: string;
  category: string;
  distance?: string;
  verified?: boolean;
  source?: string;
  rating?: number;
  tags?: string[];
}

export interface TravelPlanResponse extends TravelPlanData {
  planId: string;
  matchingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 여행 계획 API 서비스 클래스
 */
class TravelPlanApiService {
  /**
   * 토큰 상태 정리 및 검증
   */
  private validateTokens() {
    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('🔍 토큰 상태 검증:', {
      hasToken: !!token,
      hasAccessToken: !!accessToken,
      user: user,
      tokenCount: [token, accessToken].filter(Boolean).length,
    });

    // 토큰이 두 개 이상 있으면 경고
    if (token && accessToken && token !== accessToken) {
      console.warn('⚠️ 중복 토큰 발견 - 정리 권장:', {
        tokenEmail: this.decodeTokenEmail(token),
        accessTokenEmail: this.decodeTokenEmail(accessToken),
        currentUserEmail: user.email,
      });
    }

    return { token, accessToken, user };
  }

  /**
   * JWT 토큰에서 이메일 추출 (디버깅용)
   */
  private decodeTokenEmail(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || 'unknown';
    } catch (e) {
      return 'invalid-token';
    }
  }
  /**
   * 여행 계획 저장 (생성 또는 업데이트)
   */
  async saveTravelPlan(
    travelPlan: TravelPlanData,
  ): Promise<TravelPlanResponse> {
    try {
      console.log('💾 여행 계획 저장 시작:', travelPlan.title);
      console.log('🤝 매칭 자동 활성화: true (여행메이트 찾기 가능)');

      // ✅ 토큰 상태 검증
      const tokenState = this.validateTokens();

      // ✅ 요청 데이터 미리보기
      const requestData = {
        title: travelPlan.title,
        location: travelPlan.destination,
        startDate: travelPlan.startDate,
        endDate: travelPlan.endDate,
        description: `${travelPlan.title} 여행 계획`,
        interests: Array.isArray(travelPlan.styleLabels)
          ? travelPlan.styleLabels.join(',')
          : travelPlan.styles?.join(',') || '',
        numberOfPeople: parseInt(travelPlan.people) || 1,
        budget: parseInt(travelPlan.budget) || 0,
        preferredGender: travelPlan.matchingInfo?.preferredGender || '상관없음',
        preferredAgeRange: travelPlan.matchingInfo?.preferredAge || '상관없음',
        preferredLanguage:
          travelPlan.matchingInfo?.preferredLanguage || '한국어',
        matchingNote: travelPlan.matchingInfo?.matchingMemo || '',
        accommodationInfo: travelPlan.accommodationInfo || '',
        transportationInfo: travelPlan.transportationInfo || '',
        extraMemo: travelPlan.extraMemo || '',
        matchingEnabled: true, // ✅ 여행계획 생성 시 매칭 기본 활성화
        days: [], // ✅ 백엔드 필수 필드 추가 (현재는 빈 배열로 전송)
        // ✅ Google Places & OpenAI API 결과 포함
        styles: JSON.stringify(travelPlan.styles || []),
        styleLabels: JSON.stringify(travelPlan.styleLabels || []),
        schedules: JSON.stringify(travelPlan.schedules || []),
        aiHashtags: JSON.stringify(travelPlan.aiHashtags || []),
        nearbyRecommendations: JSON.stringify(
          travelPlan.nearbyRecommendations || [],
        ),
        imageUrl: travelPlan.imageUrl || '',
      };

      console.log('📤 백엔드로 전송할 데이터:', {
        title: requestData.title,
        location: requestData.location,
        numberOfPeople: requestData.numberOfPeople,
        budget: requestData.budget,
        matchingEnabled: requestData.matchingEnabled,
        hasAiHashtags: !!travelPlan.aiHashtags?.length,
        hasNearbyRecommendations: !!travelPlan.nearbyRecommendations?.length,
        hasImageUrl: !!travelPlan.imageUrl,
      });

      console.log('🚀 백엔드 API 호출 시작 - POST', API_PREFIX);

      const response = await api.post<TravelPlanResponse>(
        API_PREFIX,
        requestData,
      );

      console.log('✅ 백엔드 API 응답 수신 성공!');
      console.log('📋 응답 데이터:', response.data);
      console.log('✅ 여행 계획 저장 완료:', response.data.planId);
      return response.data;
    } catch (error: any) {
      console.error('❌ 여행 계획 저장 실패:', error);

      // ✅ 매우 상세한 오류 정보 로그
      console.error('🔍 오류 상세 정보:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        hasResponse: !!error.response,
        isNetworkError: error.code === 'NETWORK_ERROR' || !error.response,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: error.config
            ? `${error.config.baseURL}${error.config.url}`
            : 'unknown',
          headers: error.config?.headers,
        },
      });

      // ✅ 토큰 만료 체크
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('🚫 인증 실패 - 토큰 문제 가능성 높음:', {
          status: error.response.status,
          currentTokens: {
            token: localStorage.getItem('token') ? 'exists' : 'none',
            accessToken: localStorage.getItem('accessToken')
              ? 'exists'
              : 'none',
          },
          authHeader: error.config?.headers?.Authorization
            ? 'present'
            : 'missing',
        });

        alert('❌ 인증이 만료되었습니다. 다시 로그인해주세요.');
        throw new Error('인증 실패: 다시 로그인이 필요합니다.');
      }

      // 네트워크 오류 등으로 백엔드 연결 실패 시 로컬스토리지 폴백
      if (!error.response || error.code === 'NETWORK_ERROR') {
        console.warn('🔄 백엔드 연결 실패, 로컬스토리지로 폴백');
        return this.saveTravelPlanToLocalStorage(travelPlan);
      }

      throw new Error(
        `여행 계획 저장 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 여행 계획 조회
   */
  async getTravelPlan(planId: string): Promise<TravelPlanResponse | null> {
    try {
      console.log('📋 여행 계획 조회 시작:', planId);

      const response = await api.get<TravelPlanResponse>(
        `${API_PREFIX}/by-plan-id/${planId}`,
      );

      console.log('✅ 여행 계획 조회 완료:', response.data.title);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('⚠️ 여행 계획을 찾을 수 없음:', planId);
        return null;
      }

      // 네트워크 오류 시 로컬스토리지에서 조회
      if (!error.response) {
        console.warn('🔄 백엔드 연결 실패, 로컬스토리지에서 조회');
        return this.getTravelPlanFromLocalStorage(planId);
      }

      console.error('❌ 여행 계획 조회 실패:', error);
      throw new Error(
        `여행 계획 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 사용자의 여행 계획 목록 조회
   */
  async getUserTravelPlans(userId: string): Promise<TravelPlanResponse[]> {
    try {
      console.log('📋 사용자 여행 계획 목록 조회:', userId);

      const response = await api.get<TravelPlanResponse[]>(
        `${API_PREFIX}?userId=${encodeURIComponent(userId)}`,
      );

      console.log(
        '✅ 사용자 여행 계획 목록 조회 완료:',
        response.data.length,
        '개',
      );
      return response.data;
    } catch (error: any) {
      // 네트워크 오류 시 로컬스토리지에서 조회
      if (!error.response) {
        console.warn('🔄 백엔드 연결 실패, 로컬스토리지에서 조회');
        return this.getUserTravelPlansFromLocalStorage(userId);
      }

      console.error('❌ 사용자 여행 계획 목록 조회 실패:', error);
      return []; // 빈 배열 반환
    }
  }

  /**
   * 매칭 활성화된 여행 계획 목록 조회 (여행메이트 찾기용)
   */
  async getMatchingTravelPlans(): Promise<TravelPlanResponse[]> {
    try {
      console.log('🎯 매칭 여행 계획 목록 조회');

      const response = await api.get<TravelPlanResponse[]>(
        `${API_PREFIX}/matching`,
      );

      console.log(
        '✅ 매칭 여행 계획 목록 조회 완료:',
        response.data.length,
        '개',
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ 매칭 여행 계획 목록 조회 실패:', error);
      return []; // 빈 배열 반환
    }
  }

  /**
   * 여행 계획 삭제
   */
  async deleteTravelPlan(planId: string, userId: string): Promise<boolean> {
    try {
      console.log('🗑️ 여행 계획 삭제:', planId);

      await api.delete(
        `${API_PREFIX}/${planId}?userId=${encodeURIComponent(userId)}`,
      );

      console.log('✅ 여행 계획 삭제 완료:', planId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('⚠️ 삭제할 여행 계획을 찾을 수 없음:', planId);
        return false;
      }

      console.error('❌ 여행 계획 삭제 실패:', error);
      throw new Error(
        `여행 계획 삭제 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * API 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      await api.get(`${API_PREFIX}/health`);
      return true;
    } catch (error) {
      console.warn('⚠️ 백엔드 API 연결 실패');
      return false;
    }
  }

  // =========================
  // 로컬스토리지 폴백 메서드들
  // =========================

  /**
   * 로컬스토리지에 여행 계획 저장 (폴백용)
   */
  private saveTravelPlanToLocalStorage(
    travelPlan: TravelPlanData,
  ): TravelPlanResponse {
    const planId = travelPlan.planId || `plan_${Date.now()}`;
    const now = new Date().toISOString();

    const savedPlan: TravelPlanResponse = {
      ...travelPlan,
      planId,
      matchingEnabled: !!travelPlan.matchingInfo,
      createdAt: now,
      updatedAt: now,
    };

    // 개별 계획 저장
    localStorage.setItem(`plan_${planId}`, JSON.stringify(savedPlan));

    // 현재 계획으로도 저장
    localStorage.setItem('currentTravelPlan', JSON.stringify(savedPlan));

    console.log('💾 로컬스토리지에 여행 계획 저장:', planId);
    return savedPlan;
  }

  /**
   * 로컬스토리지에서 여행 계획 조회 (폴백용)
   */
  private getTravelPlanFromLocalStorage(
    planId: string,
  ): TravelPlanResponse | null {
    try {
      const stored = localStorage.getItem(`plan_${planId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('로컬스토리지 여행 계획 조회 실패:', error);
      return null;
    }
  }

  /**
   * 로컬스토리지에서 사용자 여행 계획 목록 조회 (폴백용)
   */
  private getUserTravelPlansFromLocalStorage(
    userId: string,
  ): TravelPlanResponse[] {
    try {
      const myFeeds = localStorage.getItem('myFeeds');
      if (!myFeeds) return [];

      const feeds = JSON.parse(myFeeds);
      const travelPlanFeeds = feeds.filter(
        (feed: any) => feed.type === 'travel-plan' && feed.planId,
      );

      const travelPlans: TravelPlanResponse[] = [];

      travelPlanFeeds.forEach((feed: any) => {
        const planData = localStorage.getItem(`plan_${feed.planId}`);
        if (planData) {
          travelPlans.push(JSON.parse(planData));
        }
      });

      return travelPlans;
    } catch (error) {
      console.error('로컬스토리지 사용자 여행 계획 목록 조회 실패:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스 생성
const travelPlanApiService = new TravelPlanApiService();

export default travelPlanApiService;
