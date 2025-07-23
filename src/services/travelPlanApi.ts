// 백엔드 여행 계획 API 서비스
import axios from 'axios';

// API 베이스 URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_PREFIX = '/api/travel-plans';

// Axios 인스턴스 생성
const travelPlanApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청/응답 인터셉터
travelPlanApi.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`,
      config.data,
    );
    return config;
  },
  (error) => {
    console.error('❌ API 요청 오류:', error);
    return Promise.reject(error);
  },
);

travelPlanApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(
      `❌ API 응답 오류: ${error.config?.url}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

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
   * 여행 계획 저장 (생성 또는 업데이트)
   */
  async saveTravelPlan(
    travelPlan: TravelPlanData,
  ): Promise<TravelPlanResponse> {
    try {
      console.log('💾 여행 계획 저장 시작:', travelPlan.title);

      const response = await travelPlanApi.post<TravelPlanResponse>(
        API_PREFIX,
        {
          ...travelPlan,
          // matchingInfo가 있으면 활성화된 것으로 간주
          matchingInfo: travelPlan.matchingInfo || null,
        },
      );

      console.log('✅ 여행 계획 저장 완료:', response.data.planId);
      return response.data;
    } catch (error: any) {
      console.error('❌ 여행 계획 저장 실패:', error);

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

      const response = await travelPlanApi.get<TravelPlanResponse>(
        `${API_PREFIX}/${planId}`,
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

      const response = await travelPlanApi.get<TravelPlanResponse[]>(
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

      const response = await travelPlanApi.get<TravelPlanResponse[]>(
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

      await travelPlanApi.delete(
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
      await travelPlanApi.get(`${API_PREFIX}/health`);
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
