import styled from 'styled-components';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
// 프로필 API 추가
import profileApiService from '../services/profileApi';
import { FeedWithTravelStatus } from '../types/feed';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

interface UserProfile {
  name: string;
  nickname: string;
  age: string;
  gender: string;
  bio: string;
  username: string;
  profileImage: string;
  preferredDestinations: string[];
  travelStyles: string[];
}

const MyPage = () => {
  const { logout, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // 프로필 데이터 상태
  const [profileData, setProfileData] = useState<UserProfile>({
    name: '',
    nickname: '',
    age: '',
    gender: '남성',
    bio: '',
    username: 'Traveler_Kim',
    profileImage: '👤',
    preferredDestinations: ['유럽'],
    travelStyles: ['계획적인 여행', '관광 중심'],
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfileData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('프로필 로드 중 오류:', error);
      }
    };

    loadProfile();
  }, []);

  // 프로필 데이터 변경 핸들러
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 선호 여행지 토글
  const toggleDestination = (destination: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferredDestinations: prev.preferredDestinations.includes(destination)
        ? prev.preferredDestinations.filter((d) => d !== destination)
        : [...prev.preferredDestinations, destination],
    }));
  };

  // 여행 스타일 토글
  const toggleTravelStyle = (style: string) => {
    setProfileData((prev) => ({
      ...prev,
      travelStyles: prev.travelStyles.includes(style)
        ? prev.travelStyles.filter((s) => s !== style)
        : [...prev.travelStyles, style],
    }));
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!profileData.nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      // ✅ 백엔드 API로 프로필 업데이트
      await profileApiService.updateProfile({
        nickname: profileData.nickname.trim(),
        realName: profileData.name,
        age: profileData.age ? parseInt(profileData.age) : 0,
        gender: profileData.gender,
        bio: profileData.bio,
        // TODO: 선호 여행지와 여행 스타일을 문자열로 변환
        preferredDestinations: profileData.preferredDestinations.join(','),
        travelStyle: profileData.travelStyles.join(','),
      });

      // localStorage에도 저장 (로컬 캐시용)
      localStorage.setItem('userProfile', JSON.stringify(profileData));

      // ✅ AuthContext의 사용자 정보도 업데이트 (프로필 페이지 실시간 반영)
      updateUser({
        nickname: profileData.nickname.trim(),
      });

      // 성공 메시지
      alert(
        '프로필이 성공적으로 저장되었습니다! ✅\n\n• 닉네임이 DB에 저장되었습니다\n• 프로필 페이지에 바로 반영됩니다\n• 다른 페이지에서도 즉시 확인 가능합니다',
      );

      console.log('💾 프로필 업데이트 완료:', {
        nickname: profileData.nickname,
        realName: profileData.name,
        bio: profileData.bio,
      });
    } catch (error) {
      console.error('❌ 프로필 저장 중 오류:', error);
      alert(
        '프로필 저장 중 오류가 발생했습니다.\n\n' +
          (error instanceof Error
            ? error.message
            : '네트워크 오류가 발생했습니다.') +
          '\n\n다시 시도해주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 피드 클릭 시 여행 계획 페이지로 이동
  const handleFeedClick = (feed: FeedWithTravelStatus) => {
    if (feed.type === 'travel-plan' && feed.planId) {
      // 해당 계획을 currentTravelPlan으로 설정
      const planData = localStorage.getItem(`plan_${feed.planId}`);
      if (planData) {
        localStorage.setItem('currentTravelPlan', planData);
      }
      window.location.href = '/plan';
    }
  };

  // 계정 탈퇴 함수
  const handleAccountDeletion = () => {
    if (
      window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')
    ) {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentTravelPlan'); // 현재 여행 계획 데이터도 삭제
      alert('회원 탈퇴가 완료되었습니다. 감사합니다!');
      logout(); // 로그아웃 후 홈으로 이동
      window.location.href = '/';
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <MainContent>
        <PageTitle>마이페이지</PageTitle>

        {/* 프로필 설정 */}
        <ProfileSection>
          <ProfilePhoto>
            <div style={{ fontSize: '60px' }}>{profileData.profileImage}</div>
            <PhotoUploadButton>📷 사진 변경</PhotoUploadButton>
          </ProfilePhoto>

          <InputGroup>
            <Label>이름</Label>
            <Input
              type="text"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="실명을 입력해주세요"
            />
          </InputGroup>

          <InputGroup>
            <Label>닉네임*</Label>
            <Input
              type="text"
              value={profileData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="사용할 닉네임을 입력해주세요"
            />
          </InputGroup>

          <InputGroup>
            <Label>나이</Label>
            <Input
              type="text"
              value={profileData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="나이를 입력해주세요"
            />
          </InputGroup>

          <InputGroup>
            <Label>성별</Label>
            <Select
              value={profileData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">기타</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>자기소개</Label>
            <TextArea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="자신을 소개해주세요"
              rows={4}
            />
          </InputGroup>
        </ProfileSection>

        <PreferenceSection>
          <SectionTitle>여행 선호도</SectionTitle>
          <CheckboxSection>
            <CheckboxLabel>선호 여행지</CheckboxLabel>
            <CheckboxGrid>
              {['유럽', '아시아', '미주', '오세아니아', '아프리카', '국내'].map(
                (destination) => (
                  <CheckboxItem
                    key={destination}
                    $checked={profileData.preferredDestinations.includes(
                      destination,
                    )}
                    onClick={() => toggleDestination(destination)}
                  >
                    {destination}
                  </CheckboxItem>
                ),
              )}
            </CheckboxGrid>
          </CheckboxSection>

          <CheckboxSection>
            <CheckboxLabel>여행 스타일</CheckboxLabel>
            <CheckboxGrid>
              {[
                '계획적인 여행',
                '즉흥적인 여행',
                '관광 중심',
                '휴양 중심',
                '액티비티',
                '맛집 탐방',
              ].map((style) => (
                <CheckboxItem
                  key={style}
                  $checked={profileData.travelStyles.includes(style)}
                  onClick={() => toggleTravelStyle(style)}
                >
                  {style}
                </CheckboxItem>
              ))}
            </CheckboxGrid>
          </CheckboxSection>
        </PreferenceSection>

        <ButtonSection>
          <BtnSave onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? '저장 중...' : '💾 프로필 저장'}
          </BtnSave>
          <BtnLogout onClick={logout}>🚪 로그아웃</BtnLogout>
        </ButtonSection>

        {/* 계정 탈퇴 섹션 */}
        <WithdrawalSection>
          <h3>⚠️ 위험 영역</h3>
          <p>계정을 탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
          <DestructiveButton onClick={handleAccountDeletion}>
            회원 탈퇴
          </DestructiveButton>
        </WithdrawalSection>
      </MainContent>
    </motion.div>
  );
};

export default MyPage;

// --- Styled Components ---

const MainContent = styled.div`
  padding: 40px;
  background-color: white;
  border-radius: 15px;
  margin: 30px 40px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #3498db;
`;

const ProfileSection = styled(Section)`
  display: flex;
  gap: 40px;
`;

const ProfilePhoto = styled.div`
  width: 200px;
  flex-shrink: 0;
  text-align: center;
`;

const PhotoUploadButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 15px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
`;

const PreferenceSection = styled(Section)`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
`;

const CheckboxSection = styled.div`
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.h3`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const CheckboxItem = styled.div<{ $checked: boolean }>`
  background-color: ${(props) => (props.$checked ? '#3498db' : '#e0f2fe')};
  color: ${(props) => (props.$checked ? 'white' : '#3498db')};
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3498db;
    color: white;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 40px;
`;

// 1. 가장 기본이 되는 버튼 스타일을 먼저 정의합니다.
const Btn = styled.button`
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  border: none;
`;

// 2. Btn을 상속받는 버튼들을 정의합니다.
const BtnSave = styled(Btn)`
  background-color: #3498db;
  color: white;
`;

const BtnLogout = styled(Btn)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #d73a49;
  }
`;

// '취소' 버튼 스타일을 기반으로 작은 액션 버튼 스타일을 새로 정의합니다.
const ActionButton = styled(BtnSave)`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
`;

// ActionButton을 기반으로 로그아웃 버튼 스타일을 정의합니다.
const LogoutButton = styled(ActionButton)`
  background-color: transparent;
  border: 1px solid #adb5bd; // 차분한 회색 테두리
  color: #495057; // 조금 더 진한 회색 글씨

  &:hover {
    background-color: #f1f3f5; // 마우스 올렸을 때의 배경색
  }
`;

// ActionButton을 기반으로 신고하기 버튼 스타일을 정의합니다.
const ReportButton = styled(ActionButton)`
  background-color: transparent;
  border: 1px solid #f39c12; // 주황색 테두리
  color: #f39c12; // 주황색 글씨

  &:hover {
    background: rgba(243, 156, 18, 0.1); // 마우스 올렸을 때의 배경색
  }
`;

// '회원탈퇴'와 같이 주의가 필요한 버튼 스타일을 정의합니다.
const DestructiveButton = styled(ActionButton)`
  background-color: #fee2e2; // 연한 빨강 배경
  color: #ef4444; // 진한 빨강 글씨

  &:hover {
    background-color: #fecaca;
  }
`;

// 나머지 컴포넌트들을 정의합니다.
const AccountButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px; // 입력 필드와의 간격 조정
`;

const WithdrawalSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  text-align: right;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px 8px 0 0;
  background-color: ${(props) => (props.$active ? '#3498db' : '#f1f1f1')};
  color: ${(props) => (props.$active ? 'white' : '#555')};
  font-size: 18px;
  font-weight: ${(props) => (props.$active ? 'bold' : '500')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0f2fe;
    color: #3498db;
  }
`;

const FeedsSection = styled(Section)`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const FeedCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
`;

const FeedAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span:first-child {
    font-size: 24px;
    color: #3498db;
  }

  span:last-child {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
`;

const FeedDate = styled.span`
  font-size: 14px;
  color: #888;
`;

const FeedBadge = styled.span`
  background-color: #e0f2fe;
  color: #3498db;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
`;

const FeedContent = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const FeedCaption = styled.p`
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const FeedFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
`;

const FeedLikeSection = styled.span`
  font-size: 14px;
  color: #888;
  font-weight: 500;
`;

const FeedActionSection = styled.div`
  display: flex;
  gap: 15px;
`;

const FeedActionBtn = styled(ActionButton)`
  padding: 8px 12px;
  font-size: 13px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 50px 0;
  color: #888;
  font-size: 18px;
`;

const CreateBtn = styled(BtnSave)`
  padding: 12px 30px;
  font-size: 16px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 18px;
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #ef4444;
  font-size: 18px;
`;
