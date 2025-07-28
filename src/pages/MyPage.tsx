/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import profileApiService from '../services/profileApi';
import api from '../services/api';

// 페이지 애니메이션
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

// 인터페이스 정의
interface UserProfile {
  nickname: string;
  bio: string;
  residence: string; // 🏠 거주지 추가
  profileImage: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

const MyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // 프로필 데이터
  const [profileData, setProfileData] = useState<UserProfile>({
    nickname: '',
    bio: '',
    residence: '', // 🏠 거주지 초기값 추가
    profileImage: ''
  });

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        console.log('📋 프로필 정보 로드 중...');
        
        const profile = await profileApiService.getMyProfile();
        console.log('✅ 프로필 로드 성공:', profile);
        
        setProfileData({
          nickname: profile.nickname || '',
          bio: profile.bio || '',
          residence: profile.residence || '', // 🏠 거주지 추가
          profileImage: profile.profileImage || ''
        });

      } catch (error) {
        console.error('❌ 프로필 로드 실패:', error);
        alert('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.email]);

  // 프로필 업데이트
  const handleProfileUpdate = async () => {
    if (!profileData.bio.trim()) {
      alert('자기소개를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 프로필 업데이트 중...');

      await profileApiService.updateProfile({
        nickname: profileData.nickname, // 닉네임은 변경 불가하지만 기존 값 유지
        bio: profileData.bio.trim(),
        residence: profileData.residence.trim(), // 🏠 거주지 업데이트 추가
        profileImage: profileData.profileImage // 🖼️ 기존 프로필 이미지 보존
      });

      alert('프로필이 성공적으로 업데이트되었습니다! ✅');
      console.log('✅ 프로필 업데이트 완료');

    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPEG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);
      console.log('🖼️ 프로필 이미지 업로드 중...', file.name);

      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post('/api/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { imageUrl } = response.data;
      console.log('✅ 이미지 업로드 성공:', imageUrl);

      // 프로필 데이터 업데이트
      setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
      alert('프로필 이미지가 성공적으로 업로드되었습니다! ✅');

    } catch (error: any) {
      console.error('❌ 이미지 업로드 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '이미지 업로드 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.newPasswordConfirm) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setSaving(true);
      console.log('🔒 비밀번호 변경 중...');

      await api.put('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirm: passwordForm.newPasswordConfirm
      });

      alert('비밀번호가 성공적으로 변경되었습니다! ✅');
      console.log('✅ 비밀번호 변경 완료');
      
      // 폼 초기화
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
      });

    } catch (error: any) {
      console.error('❌ 비밀번호 변경 실패:', error);
      const errorMessage = error.response?.data || error.message || '비밀번호 변경 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // 회원탈퇴
  const handleAccountDeletion = async () => {
    const confirmMessage = `정말로 회원탈퇴를 하시겠습니까?

⚠️ 탈퇴 시 다음 데이터가 모두 삭제됩니다:
• 프로필 정보
• 여행 계획
• 피드 게시물
• 모든 활동 기록

이 작업은 되돌릴 수 없습니다.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = window.confirm('정말로 탈퇴하시겠습니까? 마지막 확인입니다.');
    if (!finalConfirm) {
      return;
    }

    try {
      setSaving(true);
      console.log('🗑️ 회원탈퇴 처리 중...');

      await api.delete('/api/users/delete');

      alert('회원탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
      console.log('✅ 회원탈퇴 완료');
      
      logout();
      navigate('/');

    } catch (error: any) {
      console.error('❌ 회원탈퇴 실패:', error);
      const errorMessage = error.response?.data || error.message || '회원탈퇴 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
      >
        <Container>
          <Header>
            <Title>마이페이지</Title>
          </Header>
          <LoadingMessage>
            🔄 프로필 정보를 불러오는 중...
          </LoadingMessage>
        </Container>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <Container>
                 <Header>
           <Title>마이페이지</Title>
           <UserInfo>
             <UserIconContainer>
               {profileData.profileImage ? (
                 <UserProfileImage 
                   src={profileData.profileImage} 
                   alt="프로필"
                   onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                     e.currentTarget.style.display = 'none';
                     const parent = e.currentTarget.parentElement;
                     if (parent) {
                       parent.innerHTML = '<div style="font-size: 32px;">👤</div>';
                     }
                   }}
                 />
               ) : (
                 <UserIcon>👤</UserIcon>
               )}
             </UserIconContainer>
             <UserName>{user?.nickname || '사용자'}</UserName>
           </UserInfo>
         </Header>

        {/* 탭 메뉴 */}
        <TabContainer>
          <TabButton 
            $active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          >
            📝 프로필 관리
          </TabButton>
          <TabButton 
            $active={activeTab === 'password'} 
            onClick={() => setActiveTab('password')}
          >
            🔒 비밀번호 변경
          </TabButton>
        </TabContainer>

        {/* 프로필 관리 탭 */}
        {activeTab === 'profile' && (
          <Section>
            <SectionTitle>프로필 정보</SectionTitle>
            
            {/* 프로필 이미지 */}
            <FormGroup>
              <Label>프로필 이미지</Label>
              <ProfileImageContainer>
                <ProfileImagePreview>
                  {profileData.profileImage ? (
                                         <ProfileImage 
                       src={profileData.profileImage} 
                       alt="프로필 이미지"
                       onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                         e.currentTarget.style.display = 'none';
                         const parent = e.currentTarget.parentElement;
                         if (parent) {
                           parent.innerHTML = '<div style="font-size: 48px; color: #adb5bd;">👤</div>';
                         }
                       }}
                     />
                  ) : (
                    <DefaultProfileIcon>👤</DefaultProfileIcon>
                  )}
                </ProfileImagePreview>
                <ImageUploadControls>
                  <ImageUploadInput
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="profile-image-upload"
                  />
                  <ImageUploadButton 
                    htmlFor="profile-image-upload"
                    $uploading={uploading}
                  >
                    {uploading ? '업로드 중...' : '📷 이미지 변경'}
                  </ImageUploadButton>
                  <HelpText>
                    💡 JPEG, PNG, GIF, WebP 형식 (최대 5MB)
                  </HelpText>
                </ImageUploadControls>
              </ProfileImageContainer>
            </FormGroup>
            
            <FormGroup>
              <Label>닉네임 (변경 불가)</Label>
              <ReadOnlyInput 
                value={profileData.nickname} 
                readOnly
                placeholder="닉네임 정보 없음"
              />
              <HelpText>💡 닉네임은 보안상 변경할 수 없습니다</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>거주지</Label>
              <Input
                value={profileData.residence}
                onChange={(e) => setProfileData(prev => ({ ...prev, residence: e.target.value }))}
                placeholder="예: 서울, 대한민국"
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label>자기소개</Label>
              <TextArea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="자신을 소개해주세요..."
                rows={4}
                maxLength={200}
              />
              <CharCount>{profileData.bio.length}/200</CharCount>
            </FormGroup>

            <ButtonContainer>
              <PrimaryButton 
                onClick={handleProfileUpdate}
                disabled={saving}
              >
                {saving ? '저장 중...' : '💾 프로필 저장'}
              </PrimaryButton>
            </ButtonContainer>
          </Section>
        )}

        {/* 비밀번호 변경 탭 */}
        {activeTab === 'password' && (
          <Section>
            <SectionTitle>비밀번호 변경</SectionTitle>
            
            <FormGroup>
              <Label>현재 비밀번호</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="새 비밀번호 (최소 6자)"
                minLength={6}
              />
            </FormGroup>

            <FormGroup>
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={passwordForm.newPasswordConfirm}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPasswordConfirm: e.target.value }))}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              {passwordForm.newPassword && passwordForm.newPasswordConfirm && 
               passwordForm.newPassword !== passwordForm.newPasswordConfirm && (
                <ErrorText>비밀번호가 일치하지 않습니다</ErrorText>
              )}
            </FormGroup>

            <ButtonContainer>
              <PrimaryButton 
                onClick={handlePasswordChange}
                disabled={saving}
              >
                {saving ? '변경 중...' : '🔒 비밀번호 변경'}
              </PrimaryButton>
            </ButtonContainer>
          </Section>
        )}

        {/* 계정 관리 */}
        <DangerSection>
          <DangerTitle>⚠️ 계정 관리</DangerTitle>
          <DangerDescription>
            계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </DangerDescription>
          <ButtonContainer>
            <SecondaryButton onClick={logout}>
              🚪 로그아웃
            </SecondaryButton>
            <DangerButton 
              onClick={handleAccountDeletion}
              disabled={saving}
            >
              {saving ? '처리 중...' : '🗑️ 회원탈퇴'}
            </DangerButton>
          </ButtonContainer>
        </DangerSection>
      </Container>
    </motion.div>
  );
};

export default MyPage;

// 스타일 컴포넌트들
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Pretendard', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f3f5;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
`;

const UserIcon = styled.div`
  font-size: 32px;
`;

const UserProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #495057;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e9ecef;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? '#3682F8' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#3682F8' : '#f8f9fa'};
    color: ${props => props.$active ? 'white' : '#3682F8'};
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 24px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3682F8;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const ReadOnlyInput = styled(Input)`
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3682F8;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #6c757d;
  margin: 4px 0 0 0;
`;

const CharCount = styled.p`
  font-size: 12px;
  color: #adb5bd;
  text-align: right;
  margin: 4px 0 0 0;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #dc3545;
  margin: 4px 0 0 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const BaseButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: #3682F8;
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;

  &:hover:not(:disabled) {
    background: #e9ecef;
  }
`;

const DangerButton = styled(BaseButton)`
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

const DangerSection = styled(Section)`
  border: 1px solid #f5c6cb;
  background: #f8d7da;
`;

const DangerTitle = styled(SectionTitle)`
  color: #721c24;
`;

const DangerDescription = styled.p`
  color: #721c24;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #6c757d;
`;

// 프로필 이미지 관련 스타일
const ProfileImageContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const ProfileImagePreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultProfileIcon = styled.div`
  font-size: 48px;
  color: #adb5bd;
`;

const ImageUploadControls = styled.div`
  flex: 1;
`;

const ImageUploadInput = styled.input`
  display: none;
`;

const ImageUploadButton = styled.label<{ $uploading: boolean }>`
  display: inline-block;
  padding: 12px 20px;
  background: ${props => props.$uploading ? '#6c757d' : '#3682F8'};
  color: white;
  border-radius: 8px;
  cursor: ${props => props.$uploading ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.$uploading ? '#6c757d' : '#2563eb'};
  }
`;

