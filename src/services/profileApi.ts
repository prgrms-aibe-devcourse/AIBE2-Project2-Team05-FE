import api from './api';

// 프로필 타입 정의 (백엔드 ProfileResponseDto와 매칭)
export interface ProfileData {
  id: number;
  nickname: string;
  email: string;
  bio?: string;
  profileImage?: string;
  age?: number;
  gender?: string;
  residence?: string; // 🏠 거주지 추가
  followerCount: number;
  followingCount: number;
  postsCount: number;
  createdTripsCount: number;
  joinedTripsCount: number;
  feeds?: any[];
}

/**
 * 프로필 API 서비스 클래스
 */
class ProfileApiService {
  /**
   * 현재 로그인한 사용자의 프로필 조회
   */
  async getMyProfile(): Promise<ProfileData> {
    try {
      console.log('👤 현재 사용자 프로필 조회 시작');

      const response = await api.get<ProfileData>('/api/profile/me');

      console.log('✅ 현재 사용자 프로필 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 현재 사용자 프로필 조회 실패:', error);

      // 네트워크 오류 등으로 백엔드 연결 실패 시 기본값 반환
      if (!error.response || error.code === 'NETWORK_ERROR') {
        console.warn('🔄 백엔드 연결 실패, 기본 프로필 데이터 반환');
        return this.getDefaultProfile();
      }

      throw new Error(
        `프로필 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 특정 사용자의 프로필 조회
   */
  async getProfile(userId: number): Promise<ProfileData> {
    try {
      console.log('👤 사용자 프로필 조회 시작:', userId);

      const response = await api.get<ProfileData>(`/api/profile/${userId}`);

      console.log('✅ 사용자 프로필 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 사용자 프로필 조회 실패:', error);

      // 네트워크 오류 등으로 백엔드 연결 실패 시 기본값 반환
      if (!error.response || error.code === 'NETWORK_ERROR') {
        console.warn('🔄 백엔드 연결 실패, 기본 프로필 데이터 반환');
        return this.getDefaultProfile(userId);
      }

      throw new Error(
        `프로필 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 닉네임으로 사용자 프로필 조회
   */
  async getProfileByNickname(nickname: string): Promise<ProfileData> {
    try {
      console.log('👤 닉네임으로 사용자 프로필 조회 시작:', nickname);

      const response = await api.get<ProfileData>(
        `/api/profile/user/${nickname}`,
      );

      console.log('✅ 닉네임으로 사용자 프로필 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 닉네임으로 사용자 프로필 조회 실패:', error);

      // 404 에러인 경우 사용자를 찾을 수 없음
      if (error.response?.status === 404) {
        throw new Error(`사용자를 찾을 수 없습니다: ${nickname}`);
      }

      // 네트워크 오류 등으로 백엔드 연결 실패 시 기본값 반환
      if (!error.response || error.code === 'NETWORK_ERROR') {
        console.warn('🔄 백엔드 연결 실패, 기본 프로필 데이터 반환');
        return this.getDefaultProfile();
      }

      throw new Error(
        `프로필 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 프로필 업데이트 (닉네임 포함)
   */
  async updateProfile(profileData: {
    nickname?: string;
    realName?: string;
    age?: number;
    gender?: string;
    preferredDestinations?: string;
    residence?: string; // 🏠 거주지 추가
    travelStyle?: string;
    bio?: string;
    profileImage?: string;
  }): Promise<void> {
    try {
      console.log('✏️ 프로필 업데이트 시작:', profileData);

      const response = await api.put('/api/profile', profileData);

      console.log('✅ 프로필 업데이트 성공:', response.data);
    } catch (error: any) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw new Error(
        `프로필 업데이트 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 팔로우
   */
  async follow(targetUserId: number): Promise<void> {
    try {
      await api.post(`/api/profile/follow/${targetUserId}`);
      console.log('✅ 팔로우 성공:', targetUserId);
    } catch (error: any) {
      console.error('❌ 팔로우 실패:', error);
      throw new Error(
        `팔로우 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 언팔로우
   */
  async unfollow(targetUserId: number): Promise<void> {
    try {
      await api.delete(`/api/profile/unfollow/${targetUserId}`);
      console.log('✅ 언팔로우 성공:', targetUserId);
    } catch (error: any) {
      console.error('❌ 언팔로우 실패:', error);
      throw new Error(
        `언팔로우 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 백엔드 연결 실패 시 기본 프로필 데이터 반환
   */
  private getDefaultProfile(userId?: number): ProfileData {
    const userEmail = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').email
      : 'user@example.com';

    return {
      id: userId || 1,
      nickname: userEmail.split('@')[0] || '사용자',
      email: userEmail,
      bio: '자기소개를 입력해주세요.',
      profileImage: undefined,
      age: 0,
      gender: '비공개',
      followerCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdTripsCount: 0,
      joinedTripsCount: 0,
      feeds: [],
    };
  }

  /**
   * 피드 삭제
   */
  async deleteFeed(feedId: string | number): Promise<void> {
    try {
      console.log('🗑️ 피드 삭제 시작:', feedId);

      await api.delete(`/api/feeds/${feedId}`);

      console.log('✅ 피드 삭제 성공:', feedId);
    } catch (error: any) {
      console.error('❌ 피드 삭제 실패:', error);
      throw new Error(
        `피드 삭제 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}

// 싱글톤 인스턴스 생성
const profileApiService = new ProfileApiService();

export default profileApiService;
