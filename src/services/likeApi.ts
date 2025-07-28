import api from './api';

// 좋아요 응답 타입 정의
export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
  message?: string;
}

// 좋아요 상태 조회 응답 타입
export interface LikeStatusResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

// 좋아요한 사용자 정보 타입
export interface LikeUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
  likedAt: string;
}

// 좋아요한 사용자 목록 응답 타입
export interface LikeUsersResponse {
  success: boolean;
  users: LikeUser[];
  totalCount: number;
  message?: string;
}

/**
 * 피드에 좋아요를 추가하거나 제거하는 함수
 * @param travelFeedId 여행 피드 ID (숫자) 또는 여행 계획 ID (문자열)
 * @returns 좋아요 처리 결과
 */
export const toggleFeedLike = async (travelFeedId: number | string): Promise<LikeResponse> => {
  try {
    // console.log(`🔄 좋아요 토글 API 호출: travelFeedId=${travelFeedId}`);
    
    const response = await api.post<LikeResponse>(`/api/feed/like/toggle`, {
      travelFeedId: travelFeedId
    });
    
    // console.log(`✅ 좋아요 토글 성공:`, response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ 좋아요 토글 실패:', error);
    
    // 상세한 에러 처리
    let errorMessage = '좋아요 처리 중 오류가 발생했습니다.';
    
    if (error.response?.status === 403) {
      errorMessage = '좋아요 기능이 아직 구현되지 않았습니다. 백엔드 개발자에게 문의해주세요.';
    } else if (error.response?.status === 404) {
      errorMessage = '해당 피드를 찾을 수 없습니다.';
    } else if (error.response?.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    // 에러 발생 시 기본값 반환
    return {
      success: false,
      liked: false,
      likeCount: 0,
      message: errorMessage,
    };
  }
};

/**
 * 피드의 현재 좋아요 상태를 조회하는 함수
 * @param travelFeedId 여행 피드 ID (숫자) 또는 여행 계획 ID (문자열)
 * @returns 좋아요 상태 정보
 */
export const getFeedLikeStatus = async (travelFeedId: number | string): Promise<LikeStatusResponse> => {
  try {
    // console.log(`🔄 좋아요 상태 조회 API 호출: travelFeedId=${travelFeedId}`);
    
    const response = await api.get<LikeStatusResponse>(`/api/feed/like/status`, {
      params: { travelFeedId: travelFeedId }
    });
    
    // console.log(`✅ 좋아요 상태 조회 성공:`, response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ 좋아요 상태 조회 실패:', error);
    
    // 403/404 에러는 조용히 처리 (API 미구현 상태)
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.warn('⚠️ 좋아요 API가 아직 구현되지 않았습니다.');
    }
    
    // 에러 발생 시 기본값 반환
    return {
      success: false,
      liked: false,
      likeCount: 0,
    };
  }
};

/**
 * 피드의 좋아요 개수만 조회하는 함수
 * @param travelFeedId 여행 피드 ID (숫자) 또는 여행 계획 ID (문자열)
 * @returns 좋아요 개수
 */
export const getFeedLikeCount = async (travelFeedId: number | string): Promise<number> => {
  try {
    // console.log(`🔄 좋아요 개수 조회 API 호출: travelFeedId=${travelFeedId}`);
    
    const response = await api.get<{ likeCount: number }>(`/api/feed/like/count`, {
      params: { travelFeedId: travelFeedId }
    });
    
    // console.log(`✅ 좋아요 개수 조회 성공: ${response.data.likeCount}개`);
    
    return response.data.likeCount;
  } catch (error: any) {
    console.error('❌ 좋아요 개수 조회 실패:', error);
    
    // 에러 발생 시 0 반환
    return 0;
  }
};

/**
 * 피드에 좋아요한 사용자 목록을 조회하는 함수
 * @param travelFeedId 여행 피드 ID (숫자) 또는 여행 계획 ID (문자열)
 * @returns 좋아요한 사용자 목록
 */
export const getFeedLikeUsers = async (travelFeedId: number | string): Promise<LikeUsersResponse> => {
  try {
    const response = await api.get<LikeUsersResponse>(`/api/feed/like/users`, {
      params: { travelFeedId: travelFeedId }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ 좋아요한 사용자 목록 조회 실패:', error);
    
    // 에러 발생 시 빈 목록 반환
    return {
      success: false,
      users: [],
      totalCount: 0,
      message: '좋아요한 사용자 목록을 불러올 수 없습니다.',
    };
  }
};

export default {
  toggleFeedLike,
  getFeedLikeStatus,
  getFeedLikeCount,
  getFeedLikeUsers,
}; 