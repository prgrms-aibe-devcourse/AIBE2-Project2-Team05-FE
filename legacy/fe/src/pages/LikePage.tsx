import React from 'react';
import * as S from './LikePage.style';

// 임시 사용자 데이터
const mockUsers = [
  {
    id: 1,
    name: '정기현',
    description: '여행 블로거',
    location: '서울',
    followers: '1.2K',
    isFollowing: true,
    initial: 'JK',
  },
  {
    id: 2,
    name: '손지영',
    description: '사진작가',
    location: '부산',
    followers: '3.5K',
    isFollowing: false,
    initial: 'SJ',
  },
  {
    id: 3,
    name: '민지원',
    description: '여행 에세이스트',
    location: '제주',
    followers: '876',
    isFollowing: true,
    initial: 'MJ',
  },
  {
    id: 4,
    name: '한주연',
    description: '푸드 트래블러',
    location: '인천',
    followers: '2.1K',
    isFollowing: false,
    initial: 'HJ',
  },
  {
    id: 5,
    name: '도현우',
    description: '여행 가이드',
    location: '대구',
    followers: '1.8K',
    isFollowing: true,
    initial: 'DH',
  },
  {
    id: 6,
    name: '윤서연',
    description: '여행 크리에이터',
    location: '광주',
    followers: '4.3K',
    isFollowing: false,
    initial: 'YS',
  },
  {
    id: 7,
    name: '장우진',
    description: '백패커',
    location: '대전',
    followers: '925',
    isFollowing: true,
    initial: 'JW',
  },
  {
    id: 8,
    name: '서민지',
    description: '여행 작가',
    location: '울산',
    followers: '1.5K',
    isFollowing: false,
    initial: 'SM',
  },
];

const LikePage = () => {
  return (
    <S.Container>
      <S.Content>
        <S.PageTitle>좋아요를 누른 사람들</S.PageTitle>
        <S.PageSubtitle>제주도 3박 4일 힐링 여행 계획</S.PageSubtitle>

        <S.StatsContainer>
          <S.StatCard>
            <S.StatNumber>24</S.StatNumber>
            <S.StatLabel>좋아요</S.StatLabel>
          </S.StatCard>
          <S.StatCard>
            <S.StatNumber>12</S.StatNumber>
            <S.StatLabel>댓글</S.StatLabel>
          </S.StatCard>
          <S.StatCard>
            <S.StatNumber>8</S.StatNumber>
            <S.StatLabel>저장</S.StatLabel>
          </S.StatCard>
        </S.StatsContainer>

        <S.SectionHeader>
          <S.SectionTitle>좋아요를 누른 사람들</S.SectionTitle>
          <i className="ri-heart-fill heart-icon"></i>
          <S.CountBadge>24명</S.CountBadge>
        </S.SectionHeader>

        <S.UsersGrid>
          {mockUsers.map((user) => (
            <S.UserCard key={user.id}>
              <S.ProfileImage>{user.initial}</S.ProfileImage>
              <S.UserInfo>
                <S.UserName>{user.name}</S.UserName>
                <S.UserDescription>{user.description}</S.UserDescription>
                <S.UserMeta>
                  {user.location} · 팔로워 {user.followers}
                </S.UserMeta>
              </S.UserInfo>
              <S.FollowButton isFollowing={user.isFollowing}>
                {user.isFollowing ? '팔로잉' : '팔로우'}
              </S.FollowButton>
            </S.UserCard>
          ))}
        </S.UsersGrid>
      </S.Content>
    </S.Container>
  );
};

export default LikePage; 