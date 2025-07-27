// 백엔드 여행 상태 API 서비스
import api from './api';
import { FeedStatus } from '../types/feed';

export interface TravelStatusUpdateRequest {
  travelStatus: FeedStatus;
  note?: string;
}

export interface TravelStatusUpdateResponse {
  success: boolean;
  message: string;
  travelPlanId: number; // TravelPlan ID 사용
  newStatus: FeedStatus;
  timestamp: string;
}

/**
 * 프론트엔드 FeedStatus를 백엔드 TravelStatus로 변환
 */
const convertToBackendStatus = (frontendStatus: FeedStatus): string => {
  return frontendStatus.toUpperCase();
};

/**
 * 백엔드에서 여행 상태 변경 (TravelPlan ID 사용)
 * 🎯 TravelPlan ID로 피드 상태 변경
 */
export const updateTravelStatusApi = async (
  travelPlanId: number, // TravelPlan ID
  newStatus: FeedStatus,
  note?: string
): Promise<TravelStatusUpdateResponse> => {
  try {
    console.log(`🔄 [API] TravelPlan ID ${travelPlanId} 여행 상태 변경: ${newStatus}`);

    // 🚨 토큰 강제 확인
    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token');
    console.log(`🚨 [토큰 확인] API 호출 전 토큰 상태:`, {
      hasAccessToken: !!accessToken,
      hasToken: !!token,
      accessTokenLength: accessToken?.length || 0,
      tokenLength: token?.length || 0,
      URL: `/api/feed/plan/${travelPlanId}/travel-status`, // TravelPlan ID 엔드포인트
    });
    
    // 🔄 프론트엔드 상태를 백엔드 형식으로 변환
    const backendStatus = convertToBackendStatus(newStatus);
    console.log(`🔄 [API] 상태 변환: ${newStatus} → ${backendStatus}`);
    
    const requestData: TravelStatusUpdateRequest = {
      travelStatus: backendStatus as any, // 백엔드 enum 형식으로 변환
      ...(note && { note })
    };

    // 🎯 TravelPlan ID 엔드포인트 호출
    const response = await api.put(`/api/feed/plan/${travelPlanId}/travel-status`, requestData);
    
    console.log(`✅ [API] TravelPlan ID ${travelPlanId} 여행 상태 변경 성공:`, response.data);
    return response.data;

  } catch (error: any) {
    console.error(`❌ [API] TravelPlan ID ${travelPlanId} 여행 상태 변경 실패:`, error);
    
    const errorMessage = error.response?.data?.message || error.message || '여행 상태 변경 실패';
    throw new Error(errorMessage);
  }
}; 