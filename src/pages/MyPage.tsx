import { motion } from 'framer-motion';
import styled from 'styled-components';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const MyPage = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <PageTitle>프로필 수정</PageTitle>
      <MainContent>
        <ProfileSection>
          <ProfilePhoto>
            <PhotoUpload>
              {/* 아이콘 라이브러리 추가 후 <i className="ri-camera-line"></i> 등으로 대체 */}
              <span>📷</span>
              <PhotoUploadText>사진 업로드</PhotoUploadText>
            </PhotoUpload>
            <UploadButton>이미지 선택</UploadButton>
          </ProfilePhoto>
          <BasicInfo>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="name">이름</FormLabel>
                <FormControl type="text" id="name" defaultValue="김민준" />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="nickname">닉네임</FormLabel>
                <FormControl type="text" id="nickname" defaultValue="민준_여행가" />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <FormLabel>성별</FormLabel>
                <RadioGroup>
                  <label><input type="radio" name="gender" value="male" defaultChecked /> 남성</label>
                  <label><input type="radio" name="gender" value="female" /> 여성</label>
                </RadioGroup>
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="age">나이</FormLabel>
                <FormControl type="number" id="age" defaultValue="28" />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <FormLabel htmlFor="bio">자기소개</FormLabel>
              <FormControl as="textarea" id="bio" rows={4} defaultValue="새로운 곳을 탐험하고, 다양한 문화를 경험하는 것을 좋아합니다. 함께 좋은 추억 만들어요!" />
            </FormGroup>
          </BasicInfo>
        </ProfileSection>
      </MainContent>
    </motion.div>
  );
};

export default MyPage;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
`;

const MainContent = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
`;

const ProfilePhoto = styled.div`
  width: 200px;
  flex-shrink: 0;
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
  overflow: hidden;
  position: relative;
  border: 3px dashed #ccc;
  span {
    font-size: 48px;
    color: #aaa;
    margin-bottom: 10px;
  }
`;

const PhotoUploadText = styled.p`
  font-size: 14px;
  color: #888;
`;

const UploadButton = styled.button`
  margin-top: 15px;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  &:hover { background-color: #2980b9; }
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
  transition: all 0.3s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  height: 50px; // align with text input height
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  input {
    margin-right: 8px;
  }
`; 