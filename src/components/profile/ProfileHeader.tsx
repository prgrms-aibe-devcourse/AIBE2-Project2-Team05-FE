import React, { memo } from 'react';
import styled from 'styled-components';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';

// 타입 정의
interface UserProfile {
  id?: number;
  username: string;
  nickname: string;
  profileImage: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isCurrentUser?: boolean;
  feeds?: any[];
}

interface ProfileHeaderProps {
  profile: {
    nickname: string;
    profileImage: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    age: number; // 🔧 실제 나이 추가
    residence: string; // 🏠 거주지 추가
    isCurrentUser?: boolean; // ✅ 누락된 속성 추가
  };
  feedCount: number; // 실제 피드 개수를 전달받음
}

// ✅ React.memo로 최적화
const ProfileHeader = memo<ProfileHeaderProps>(({ profile, feedCount }) => {
  return (
    <Container>
      <ProfileImage>
        <img 
          src={getProfileImageUrl(profile.profileImage)} 
          alt={profile.nickname}
          onError={(e) => handleImageError(e, 150)}
        />
      </ProfileImage>
      <ProfileInfo>
        <ProfileTop>
          <Username>{profile.nickname}</Username>
          <UserDetails>
            <DetailItem>
              <i className="ri-calendar-line"></i>
              {profile.age}세
            </DetailItem>
            <DetailItem>
              <i className="ri-map-pin-line"></i>
              {profile.residence || '거주지 미설정'}
            </DetailItem>
          </UserDetails>
        </ProfileTop>
        
        {/* 통계 섹션 */}
        <Stats>
          <span>
            게시물 <strong>{feedCount}</strong>
          </span>
          <span>
            팔로워{' '}
            <strong>{profile.followersCount.toLocaleString()}</strong>
          </span>
          <span>
            팔로우 <strong>{profile.followingCount}</strong>
          </span>
        </Stats>
      </ProfileInfo>
    </Container>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

// 스타일 컴포넌트들
const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 30px;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(54, 130, 248, 0.15);
  border: 4px solid rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const Username = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #6b7280;
  font-weight: 400;

  i {
    font-size: 16px;
    color: #8b9dc3;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    justify-content: center;
  }
`;

// 통계 섹션 (기존 코드에서 가져옴)
const Stats = styled.div`
  display: flex;
  gap: 40px;
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 30px;
  }

  @media (max-width: 480px) {
    gap: 20px;
  }

  span {
    font-size: 16px;
    color: #4a5568;
    font-weight: 400;

    @media (max-width: 480px) {
      font-size: 14px;
    }

    strong {
      font-weight: 700;
      color: #1a202c;
      margin-left: 4px;
    }
  }
`;

export default ProfileHeader; 