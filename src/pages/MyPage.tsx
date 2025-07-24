import styled from 'styled-components';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
// 프로필 API 추가
import profileApiService from '../services/profileApi';
import { FeedWithTravelStatus } from '../types/feed';
import { deleteUser, uploadProfileImage } from '../services/api';
import ReportModal from '../components/common/ReportModal';
import PasswordChangeModal from '../components/common/PasswordChangeModal';

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
  const { logout, updateUser, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 신고하기 모달 관련 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // 비밀번호 변경 모달 관련 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 파일 업로드 관련 상태
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 프로필 데이터 로드 - 백엔드에서 실제 사용자 정보 가져오기
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) {
        console.log('🔍 사용자 정보 없음, 로딩 중...');
        return;
      }

      setLoading(true);
      console.log('🔄 프로필 데이터 로드 시작 - 사용자:', user.email);

      // ✅ 사용자가 변경되었을 때 이전 사용자의 localStorage 데이터 정리
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed.email && parsed.email !== user.email) {
            console.log(
              '🧹 다른 사용자의 데이터 정리:',
              parsed.email,
              '→',
              user.email,
            );
            localStorage.removeItem('userProfile');
            localStorage.removeItem('currentTravelPlan');
          }
        } catch (e) {
          console.warn('localStorage 파싱 오류, 정리:', e);
          localStorage.removeItem('userProfile');
        }
      }

      try {
        // ✅ 백엔드에서 현재 로그인된 사용자의 실제 프로필 정보 가져오기
        const profileResponse: any = await profileApiService.getMyProfile();
        console.log('✅ 백엔드에서 프로필 로드 성공:', profileResponse);

        // 백엔드 데이터로 상태 업데이트
        setProfileData({
          name: profileResponse.realName || '',
          nickname: profileResponse.nickname || '',
          age: profileResponse.age ? profileResponse.age.toString() : '',
          gender: profileResponse.gender || '남성',
          bio: profileResponse.bio || '',
          username: profileResponse.nickname || 'Traveler',
          profileImage: profileResponse.profileImage || '👤',
          preferredDestinations: profileResponse.preferredDestinations
            ? profileResponse.preferredDestinations.split(',').filter(Boolean)
            : ['유럽'],
          travelStyles: profileResponse.travelStyle
            ? profileResponse.travelStyle.split(',').filter(Boolean)
            : ['계획적인 여행', '관광 중심'],
        });

        // 백업용으로 localStorage에도 저장 (이메일 포함)
        localStorage.setItem(
          'userProfile',
          JSON.stringify({
            email: user.email, // ✅ 현재 사용자 이메일 추가
            name: profileResponse.realName,
            nickname: profileResponse.nickname,
            age: profileResponse.age?.toString(),
            gender: profileResponse.gender,
            bio: profileResponse.bio,
          }),
        );
      } catch (error) {
        console.error('❌ 백엔드 프로필 로드 실패:', error);

        // 백엔드 실패 시에만 localStorage 백업 사용
        try {
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            console.log('📦 localStorage 백업 사용:', parsed);
            setProfileData((prev) => ({ ...prev, ...parsed }));
          }
        } catch (localError) {
          console.error('localStorage 읽기 실패:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.email]); // user.email이 변경될 때마다 다시 로드

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

      // localStorage에도 저장 (로컬 캐시용, 현재 사용자 이메일 포함)
      localStorage.setItem(
        'userProfile',
        JSON.stringify({
          ...profileData,
          email: user?.email, // ✅ 현재 사용자 이메일 추가
        }),
      );

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

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              fontSize: '18px',
              color: '#666',
            }}
          >
            🔄 프로필 정보를 불러오는 중...
          </div>
        </MainContent>
      </motion.div>
    );
  }
  // 회원탈퇴 처리 함수
  const handleDeleteAccount = async () => {
    // 사용자에게 한 번 더 확인받기
    const isConfirmed = window.confirm(
      '정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.'
    );

    if (!isConfirmed) {
      return; // 사용자가 취소를 선택한 경우
    }

    try {
      // 백엔드 API 호출하여 회원탈퇴 진행
      await deleteUser();
      
      // 성공 메시지 표시
      alert('회원탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
      
      // 로그아웃 처리 (토큰 삭제 등)
      logout();
      
      // 메인 페이지로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('회원탈퇴 중 오류:', error);
      alert('회원탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 신고하기 모달 열기
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  // 신고하기 모달 닫기
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };
  
  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };
  
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadProfileImage(file);
      console.log('업로드된 이미지 URL:', imageUrl);
      
      // 프로필 데이터 업데이트
      const updatedProfileData = {
        ...profileData,
        profileImage: imageUrl
      };
      
      setProfileData(updatedProfileData);
      console.log('업데이트된 프로필 데이터:', updatedProfileData);

      // localStorage에 저장
      localStorage.setItem('userProfile', JSON.stringify(updatedProfileData));

      alert('프로필 이미지가 성공적으로 업로드되었습니다! ✅');
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
        {/* 프로필 설정 탭 */}
        {activeTab === 'profile' && (
          <>
            <ProfileSection>
              <ProfilePhoto>
                {profileData.profileImage && profileData.profileImage !== '👤' ? (
                  <ProfileImageContainer>
                    <ProfileImage 
                      src={`http://localhost:8080${profileData.profileImage}`} 
                      alt="프로필 이미지"
                      onError={(e) => {
                        console.error('이미지 로드 실패:', profileData.profileImage);
                        // 이미지 로드 실패 시 기본 아이콘으로 대체
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.setAttribute('style', 'display: block');
                      }}
                      onLoad={() => {
                        console.log('이미지 로드 성공:', profileData.profileImage);
                      }}
                    />
                    <PhotoUpload style={{ display: 'none' }}>
                      <span>📷</span>
                      <PhotoUploadText>프로필 사진 추가</PhotoUploadText>
                    </PhotoUpload>
                  </ProfileImageContainer>
                ) : (
                  <PhotoUpload>
                    <span>📷</span>
                    <PhotoUploadText>프로필 사진 추가</PhotoUploadText>
                  </PhotoUpload>
                )}
                <UploadButton 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? '업로드 중...' : '사진 업로드'}
                </UploadButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </ProfilePhoto>

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
            <Section>
              <SectionTitle>계정 설정</SectionTitle>
              <FormGroup>
                <FormLabel htmlFor="username">아이디 (변경 불가)</FormLabel>
                <FormControl
                  type="text"
                  id="username"
                  value={profileData.username}
                  disabled
                />
              </FormGroup>

            </Section>

            <ButtonSection>
              <BtnCancel>취소</BtnCancel>
              <BtnSave onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장하기'}
              </BtnSave>
            </ButtonSection>

            <Divider />

            <AccountButtonContainer>
              <LeftButtonGroup>
                <PasswordChangeButton onClick={handleOpenPasswordModal}>
                  🔒 비밀번호 변경
                </PasswordChangeButton>
                <LogoutButton onClick={logout}>로그아웃</LogoutButton>
                <ReportButton onClick={handleOpenReportModal}>
                  신고하기
                </ReportButton>
              </LeftButtonGroup>
              <RightButtonGroup>
                <DestructiveButton onClick={handleDeleteAccount}>
                  회원 탈퇴
                </DestructiveButton>
              </RightButtonGroup>
            </AccountButtonContainer>
          </>
        )}

        {/* 내 피드 탭 */}
        {activeTab === 'feeds' && (
          <FeedsSection>
            {myFeeds.length > 0 ? (
              <FeedGrid>
                {myFeeds.map((feed) => (
                  <FeedCard key={feed.id} onClick={() => handleFeedClick(feed)}>
                    <FeedHeader>
                      <FeedAuthor>
                        <span>{feed.avatar}</span>
                        <span>{feed.author}</span>
                      </FeedAuthor>
                      <FeedDate>
                        {feed.createdAt
                          ? new Date(feed.createdAt).toLocaleDateString('ko-KR')
                          : '방금 전'}
                      </FeedDate>
                    </FeedHeader>

                    {feed.type === 'travel-plan' && (
                      <FeedBadge>✈️ 여행 계획</FeedBadge>
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

      {/* 신고하기 모달 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
      />
      
      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
      />
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
const ProfileImageContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoUpload = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px dashed #ccc;
  margin-bottom: 15px;

  span {
    font-size: 48px;
    color: #aaa;
  }
`;

const PhotoUploadText = styled.p`
  font-size: 14px;
  color: #888;
`;

const UploadButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 15px;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
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
  height: 40px; // 고정 높이 설정
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f1f3f5; // 마우스 올렸을 때의 배경색
  }
`;

// ActionButton을 기반으로 신고하기 버튼 스타일을 정의합니다.
const ReportButton = styled(ActionButton)`
  background-color: transparent;
  border: 1px solid #f39c12; // 주황색 테두리
  color: #f39c12; // 주황색 글씨
  height: 40px; // 고정 높이 설정
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(243, 156, 18, 0.1); // 마우스 올렸을 때의 배경색
  }
`;

// ActionButton을 기반으로 비밀번호 변경 버튼 스타일을 정의합니다.
const PasswordChangeButton = styled(ActionButton)`
  background-color: transparent;
  border: 1px solid #3498db; // 파란색 테두리
  color: #3498db; // 파란색 글씨
  height: 40px; // 고정 높이 설정
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(52, 152, 219, 0.1); // 마우스 올렸을 때의 배경색
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
  justify-content: space-between; // 왼쪽과 오른쪽 버튼 그룹을 멀리 분리
  align-items: center;
  margin-top: 20px; // 입력 필드와의 간격 조정
`;

const LeftButtonGroup = styled.div`
  display: flex;
  gap: 10px; // 왼쪽 버튼들 사이의 간격
`;

const RightButtonGroup = styled.div`
  display: flex;
  gap: 10px; // 오른쪽 버튼들 사이의 간격
`;

// 구분선 컴포넌트
const Divider = styled.hr`
  border: none;
  height: 4px;
  background: #e1e5e9;
  margin: 30px 0;
  width: 100%;
  border-radius: 1px;
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
