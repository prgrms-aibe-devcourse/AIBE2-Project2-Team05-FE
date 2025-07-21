import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // Link를 import 합니다.

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const MyPage = () => {
  const { logout } = useAuth();

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <MainContent>
        <PageTitle>프로필 작성/수정</PageTitle>

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
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="nickname">닉네임</FormLabel>
                <FormControl
                  type="text"
                  id="nickname"
                  placeholder="사용할 닉네임을 입력하세요"
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
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>성별</FormLabel>
                <RadioGroup>
                  <label>
                    <input type="radio" name="gender" defaultChecked /> 남성
                  </label>
                  <label>
                    <input type="radio" name="gender" /> 여성
                  </label>
                  <label>
                    <input type="radio" name="gender" /> 기타
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
              <Tag className="selected">유럽</Tag>
              <Tag>동남아시아</Tag>
              <Tag>일본</Tag>
              <Tag>미국/캐나다</Tag>
            </TagsContainer>
          </FormGroup>
          <FormGroup>
            <FormLabel>여행 스타일</FormLabel>
            <CheckboxGroup>
              <label>
                <input type="checkbox" defaultChecked /> 계획적인 여행
              </label>
              <label>
                <input type="checkbox" /> 즉흥적인 여행
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 관광 중심
              </label>
              <label>
                <input type="checkbox" /> 휴식 중심
              </label>
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
              defaultValue="Traveler_Kim"
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
              <FormLabel htmlFor="confirm-password">새 비밀번호 확인</FormLabel>
              <FormControl
                type="password"
                id="confirm-password"
                placeholder="새 비밀번호 확인"
              />
            </FormGroup>
          </FormRow>
          {/* 버튼들을 묶어주는 컨테이너입니다. */}
          <AccountButtonContainer>
            <LogoutButton onClick={logout}>로그아웃</LogoutButton>
            {/* 신고 페이지로 이동하는 링크를 버튼 형태로 추가합니다. */}
            <Link to="/report">
              <ReportButton>신고하기</ReportButton>
            </Link>
          </AccountButtonContainer>
        </Section>

        <ButtonSection>
          <BtnCancel>취소</BtnCancel>
          <BtnSave>저장하기</BtnSave>
        </ButtonSection>

        <WithdrawalSection>
          <DestructiveButton>회원 탈퇴</DestructiveButton>
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
