import styled from 'styled-components';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { deleteUser } from '../services/api';
import ReportModal from '../components/common/ReportModal';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

interface Feed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  type?: string;
  planId?: string;
  createdAt?: string;
}

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
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'feeds'>('profile');
  const [myFeeds, setMyFeeds] = useState<Feed[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // 신고하기 모달 관련 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // 내 피드 목록 로드
  useEffect(() => {
    const loadMyFeeds = () => {
      try {
        const savedFeeds = localStorage.getItem('myFeeds');
        if (savedFeeds) {
          setMyFeeds(JSON.parse(savedFeeds));
        }
      } catch (error) {
        console.error('피드 로드 중 오류:', error);
      }
    };

    if (activeTab === 'feeds') {
      loadMyFeeds();
    }
  }, [activeTab]);

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
      // localStorage에 프로필 정보 저장
      localStorage.setItem('userProfile', JSON.stringify(profileData));

      // 성공 메시지
      alert('프로필이 성공적으로 저장되었습니다! ✅');
    } catch (error) {
      console.error('프로필 저장 중 오류:', error);
      alert('프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 피드 클릭 시 여행 계획 페이지로 이동
  const handleFeedClick = (feed: Feed) => {
    if (feed.type === 'travel-plan' && feed.planId) {
      // 해당 계획을 currentTravelPlan으로 설정
      const planData = localStorage.getItem(`plan_${feed.planId}`);
      if (planData) {
        localStorage.setItem('currentTravelPlan', planData);
      }
      window.location.href = '/plan';
    }
  };

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

        {/* 탭 메뉴 */}
        <TabContainer>
          <TabButton
            $active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            📝 프로필 설정
          </TabButton>
          <TabButton
            $active={activeTab === 'feeds'}
            onClick={() => setActiveTab('feeds')}
          >
            📋 내 피드 ({myFeeds.length})
          </TabButton>
        </TabContainer>

        {/* 프로필 설정 탭 */}
        {activeTab === 'profile' && (
          <>
            <ProfileSection>
              <ProfilePhoto>
                <PhotoUpload>
                  <span>📷</span>
                  <PhotoUploadText>프로필 사진 추가</PhotoUploadText>
                </PhotoUpload>
                <UploadButton>사진 업로드</UploadButton>
              </ProfilePhoto>

              <BasicInfo>
                <SectionTitle>기본 정보</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel htmlFor="name">이름</FormLabel>
                    <FormControl
                      type="text"
                      id="name"
                      placeholder="실명을 입력하세요"
                      value={profileData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel htmlFor="nickname">닉네임</FormLabel>
                    <FormControl
                      type="text"
                      id="nickname"
                      placeholder="사용할 닉네임을 입력하세요"
                      value={profileData.nickname}
                      onChange={(e) =>
                        handleInputChange('nickname', e.target.value)
                      }
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel htmlFor="age">나이</FormLabel>
                    <FormControl
                      type="number"
                      id="age"
                      placeholder="만 나이를 입력하세요"
                      value={profileData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>성별</FormLabel>
                    <RadioGroup>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          checked={profileData.gender === '남성'}
                          onChange={() => handleInputChange('gender', '남성')}
                        />{' '}
                        남성
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          checked={profileData.gender === '여성'}
                          onChange={() => handleInputChange('gender', '여성')}
                        />{' '}
                        여성
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          checked={profileData.gender === '기타'}
                          onChange={() => handleInputChange('gender', '기타')}
                        />{' '}
                        기타
                      </label>
                    </RadioGroup>
                  </FormGroup>
                </FormRow>
              </BasicInfo>
            </ProfileSection>

            <PreferenceSection>
              <SectionTitle>여행 선호도</SectionTitle>
              <FormGroup>
                <FormLabel>선호 여행지</FormLabel>
                <TagsContainer>
                  {['유럽', '동남아시아', '일본', '미국/캐나다'].map(
                    (destination) => (
                      <Tag
                        key={destination}
                        className={
                          profileData.preferredDestinations.includes(
                            destination,
                          )
                            ? 'selected'
                            : ''
                        }
                        onClick={() => toggleDestination(destination)}
                      >
                        {destination}
                      </Tag>
                    ),
                  )}
                </TagsContainer>
              </FormGroup>
              <FormGroup>
                <FormLabel>여행 스타일</FormLabel>
                <CheckboxGroup>
                  {[
                    '계획적인 여행',
                    '즉흥적인 여행',
                    '관광 중심',
                    '휴식 중심',
                  ].map((style) => (
                    <label key={style}>
                      <input
                        type="checkbox"
                        checked={profileData.travelStyles.includes(style)}
                        onChange={() => toggleTravelStyle(style)}
                      />{' '}
                      {style}
                    </label>
                  ))}
                </CheckboxGroup>
              </FormGroup>
            </PreferenceSection>

            <Section>
              <SectionTitle>자기소개</SectionTitle>
              <FormGroup>
                <FormLabel htmlFor="bio">나에 대한 소개</FormLabel>
                <TextareaControl
                  id="bio"
                  rows={4}
                  placeholder="여행 동반자에게 자신을 소개해보세요."
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </FormGroup>
            </Section>

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
              <FormRow>
                <FormGroup>
                  <FormLabel htmlFor="new-password">새 비밀번호</FormLabel>
                  <FormControl
                    type="password"
                    id="new-password"
                    placeholder="새 비밀번호"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="confirm-password">
                    새 비밀번호 확인
                  </FormLabel>
                  <FormControl
                    type="password"
                    id="confirm-password"
                    placeholder="새 비밀번호 확인"
                  />
                </FormGroup>
              </FormRow>
              <AccountButtonContainer>
                <LogoutButton onClick={logout}>로그아웃</LogoutButton>
                <ReportButton onClick={handleOpenReportModal}>
                  신고하기
                </ReportButton>
              </AccountButtonContainer>
            </Section>

            <ButtonSection>
              <BtnCancel>취소</BtnCancel>
              <BtnSave onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장하기'}
              </BtnSave>
            </ButtonSection>

            <WithdrawalSection>
              <DestructiveButton onClick={handleDeleteAccount}>
                회원 탈퇴
              </DestructiveButton>
            </WithdrawalSection>
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

                    <FeedContent>
                      <FeedCaption>{feed.caption}</FeedCaption>
                    </FeedContent>

                    <FeedFooter>
                      <FeedLikeSection>❤️ {feed.likes}</FeedLikeSection>
                      <FeedActionSection>
                        <FeedActionBtn>📱 공유</FeedActionBtn>
                        <FeedActionBtn>📝 수정</FeedActionBtn>
                      </FeedActionSection>
                    </FeedFooter>
                  </FeedCard>
                ))}
              </FeedGrid>
            ) : (
              <EmptyMessage>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✈️</div>
                <div>아직 작성한 여행 계획이 없습니다.</div>
                <div style={{ marginTop: '20px' }}>
                  <Link to="/plan/write">
                    <CreateBtn>첫 여행 계획 만들기</CreateBtn>
                  </Link>
                </div>
              </EmptyMessage>
            )}
          </FeedsSection>
        )}
      </MainContent>

      {/* 신고하기 모달 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
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
`;

const BasicInfo = styled.div`
  flex-grow: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
`;

const FormControl = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input {
    margin-right: 8px;
  }
`;

const PreferenceSection = styled(Section)`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.div`
  background-color: #e0f2fe;
  color: #3498db;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;

  &.selected {
    background-color: #3498db;
    color: white;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input {
    margin-right: 8px;
  }
`;

const TextareaControl = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
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
const BtnCancel = styled(Btn)`
  background-color: #f1f1f1;
  color: #666;
`;

const BtnSave = styled(Btn)`
  background-color: #3498db;
  color: white;
`;

// '취소' 버튼 스타일을 기반으로 작은 액션 버튼 스타일을 새로 정의합니다.
const ActionButton = styled(BtnCancel)`
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
