export interface User {
  id: number;                    // 사용자 ID (필수)
  email: string;                 // 이메일 (필수)
  role: string;                  // 권한 (필수)
  nickname?: string;             // 닉네임
  profileImage?: string;         // 프로필 이미지 URL
  bio?: string;                  // 자기소개
  age?: number;                  // 나이
  gender?: string;               // 성별
  followerCount?: number;        // 팔로워 수
  followingCount?: number;       // 팔로잉 수
  postsCount?: number;           // 게시물 수
  createdTripsCount?: number;    // 생성한 여행 수
  joinedTripsCount?: number;     // 참여한 여행 수
}
