import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';

// Enum-like objects for Gender and TravelStyle
const GENDERS = { MALE: '남성', FEMALE: '여성', OTHER: '기타' };
const TRAVEL_STYLES = {
  RELAXATION: '휴양',
  FOOD: '맛집탐방',
  ACTIVITY: '액티비티',
  SHOPPING: '쇼핑',
  CULTURE: '문화/예술',
  NATURE: '자연',
};

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      realName: '',
      birthdate: '',
      gender: '',
      bio: '',
      travelStyles: [],
      profileImage: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('유효한 이메일 형식이 아닙니다.').required('이메일은 필수 항목입니다.'),
      password: Yup.string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
        .matches(/[a-zA-Z]/, '비밀번호는 영문자를 포함해야 합니다.')
        .matches(/[0-9]/, '비밀번호는 숫자를 포함해야 합니다.')
        .required('비밀번호는 필수 항목입니다.'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], '비밀번호가 일치하지 않습니다.')
        .required('비밀번호 확인은 필수 항목입니다.'),
      nickname: Yup.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(15, '닉네임은 15자 이하이어야 합니다.').required('닉네임은 필수 항목입니다.'),
      realName: Yup.string().required('이름은 필수 항목입니다.'),
      birthdate: Yup.date().required('생년월일은 필수 항목입니다.'),
      gender: Yup.string().required('성별은 필수 항목입니다.'),
      bio: Yup.string().max(150, '자기소개는 150자 이하로 작성해주세요.'),
      travelStyles: Yup.array().min(1, '여행 스타일을 1개 이상 선택해주세요.').required('여행 스타일은 필수 항목입니다.'),
      profileImage: Yup.mixed().nullable(),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      const loadingToast = toast.loading('회원가입을 진행 중입니다...');
      
      try {
        const formData = new FormData();
        
        const signupData = {
            email: values.email,
            password: values.password,
            nickname: values.nickname,
            realName: values.realName,
            birthdate: values.birthdate 
                ? new Date(values.birthdate).toISOString().split('T')[0]  // YYYY-MM-DD 형식으로 변환
                : values.birthdate,
            gender: values.gender,
            bio: values.bio,
            preferredDestinations: "", // ✅ 빈 문자열로 초기화
            travelStyles: values.travelStyles,
        };

        // ✅ Blob 대신 JSON 문자열을 직접 append
        formData.append('signupRequest', JSON.stringify(signupData));

        if (values.profileImage) {
            formData.append('profileImage', values.profileImage);
        }

        console.log('📤 전송할 데이터:', signupData);
        console.log('📎 프로필 이미지:', values.profileImage ? (values.profileImage as File).name : '없음');

        await api.post('/api/users/signup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', { id: loadingToast });
        navigate('/login');

      } catch (err: any) {
        console.error('❌ 회원가입 오류:', err);
        const message = err.response?.data?.message || err.response?.data || '알 수 없는 오류가 발생했습니다.';
        toast.error(message, { id: loadingToast });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('profileImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return formik.values.email && formik.values.password && formik.values.confirmPassword && 
             !formik.errors.email && !formik.errors.password && !formik.errors.confirmPassword;
    }
    if (currentStep === 2) {
      return formik.values.nickname && formik.values.realName && formik.values.birthdate && formik.values.gender &&
             !formik.errors.nickname && !formik.errors.realName && !formik.errors.birthdate && !formik.errors.gender;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <StepContainer>
      <StepTitle>기본 정보를 입력해주세요</StepTitle>
      <StepDescription>안전한 계정을 위한 기본 정보입니다</StepDescription>

      <InputGroup>
        <Label>이메일 *</Label>
        <Input 
          type="email"
          placeholder="example@email.com"
          {...formik.getFieldProps('email')} 
        />
        {formik.touched.email && formik.errors.email && (
          <ErrorText>{formik.errors.email}</ErrorText>
        )}
      </InputGroup>

      <InputGroup>
        <Label>비밀번호 *</Label>
        <PasswordField>
          <Input 
            type={showPassword ? 'text' : 'password'} 
            placeholder="영문, 숫자 조합 8자 이상"
            {...formik.getFieldProps('password')} 
          />
          <ToggleButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </ToggleButton>
        </PasswordField>
        {formik.touched.password && formik.errors.password && (
          <ErrorText>{formik.errors.password}</ErrorText>
        )}
      </InputGroup>

      <InputGroup>
        <Label>비밀번호 확인 *</Label>
        <PasswordField>
          <Input 
            type={showConfirmPassword ? 'text' : 'password'} 
            placeholder="비밀번호를 다시 입력해주세요"
            {...formik.getFieldProps('confirmPassword')} 
          />
          <ToggleButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? '🙈' : '👁️'}
          </ToggleButton>
        </PasswordField>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <ErrorText>{formik.errors.confirmPassword}</ErrorText>
        )}
      </InputGroup>
    </StepContainer>
  );

  const renderStep2 = () => (
    <StepContainer>
      <StepTitle>개인 정보를 입력해주세요</StepTitle>
      <StepDescription>프로필에 표시될 기본 정보입니다</StepDescription>

      <InputGroup>
        <Label>닉네임 *</Label>
        <Input 
          placeholder="2-15자로 입력해주세요"
          {...formik.getFieldProps('nickname')} 
        />
        {formik.touched.nickname && formik.errors.nickname && (
          <ErrorText>{formik.errors.nickname}</ErrorText>
        )}
      </InputGroup>
      
      <InputGroup>
        <Label>이름 *</Label>
        <Input 
          placeholder="실명을 입력해주세요"
          {...formik.getFieldProps('realName')} 
        />
        {formik.touched.realName && formik.errors.realName && (
          <ErrorText>{formik.errors.realName}</ErrorText>
        )}
      </InputGroup>

      <InputGroup>
        <Label>생년월일 *</Label>
        <Input 
          type="date" 
          {...formik.getFieldProps('birthdate')} 
        />
        {formik.touched.birthdate && formik.errors.birthdate && (
          <ErrorText>{formik.errors.birthdate}</ErrorText>
        )}
      </InputGroup>

      <InputGroup>
        <Label>성별 *</Label>
        <Select {...formik.getFieldProps('gender')}>
          <option value="">성별을 선택하세요</option>
          {Object.entries(GENDERS).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </Select>
        {formik.touched.gender && formik.errors.gender && (
          <ErrorText>{formik.errors.gender}</ErrorText>
        )}
      </InputGroup>
    </StepContainer>
  );

  const renderStep3 = () => (
    <StepContainer>
      <StepTitle>프로필을 완성해주세요</StepTitle>
      <StepDescription>나만의 개성을 표현해보세요</StepDescription>

      <InputGroup>
        <Label>프로필 사진</Label>
        <ImageUpload>
          <ProfileImage src={imagePreview || '/default-place-image.jpg'} alt="프로필" />
          <UploadArea>
            <UploadText>클릭해서 이미지 선택</UploadText>
            <HiddenInput type="file" accept="image/*" onChange={handleImageChange} />
          </UploadArea>
        </ImageUpload>
      </InputGroup>

      <InputGroup>
        <Label>자기소개</Label>
        <Textarea 
          placeholder="간단한 자기소개를 입력해주세요 (150자 이내)"
          {...formik.getFieldProps('bio')} 
        />
        {formik.touched.bio && formik.errors.bio && (
          <ErrorText>{formik.errors.bio}</ErrorText>
        )}
      </InputGroup>

      <InputGroup>
        <Label>여행 스타일 * (1개 이상 선택)</Label>
        <TagContainer>
          {Object.entries(TRAVEL_STYLES).map(([key, value]) => (
            <Tag 
              key={key} 
              selected={formik.values.travelStyles.includes(key as never)}
              onClick={() => {
                const currentStyles = formik.values.travelStyles;
                const newStyles = currentStyles.includes(key as never)
                  ? currentStyles.filter(style => style !== key)
                  : [...currentStyles, key];
                formik.setFieldValue('travelStyles', newStyles);
              }}
            >
              {value}
            </Tag>
          ))}
        </TagContainer>
        {formik.touched.travelStyles && formik.errors.travelStyles && (
          <ErrorText>{formik.errors.travelStyles}</ErrorText>
        )}
      </InputGroup>
    </StepContainer>
  );

  return (
    <Container>
      <FormWrapper>
        <ProgressBar>
          <ProgressStep active={currentStep >= 1} completed={currentStep > 1}>1</ProgressStep>
          <ProgressLine completed={currentStep > 1} />
          <ProgressStep active={currentStep >= 2} completed={currentStep > 2}>2</ProgressStep>
          <ProgressLine completed={currentStep > 2} />
          <ProgressStep active={currentStep >= 3} completed={currentStep > 3}>3</ProgressStep>
        </ProgressBar>

        <form onSubmit={formik.handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <ButtonSection>
            {currentStep > 1 && (
              <PrevButton type="button" onClick={handlePrev}>
                이전
              </PrevButton>
            )}
            
            {currentStep < 3 ? (
              <NextButton 
                type="button" 
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                다음
              </NextButton>
            ) : (
              <SubmitButton type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? '가입 진행 중...' : '회원가입 완료'}
              </SubmitButton>
            )}
          </ButtonSection>

          {currentStep === 1 && (
            <LoginLink>
              이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </LoginLink>
          )}
        </form>
      </FormWrapper>
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 1600px;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.active || props.completed ? 'white' : '#a0aec0'};
  background: ${props => props.completed ? '#10b981' : props.active ? '#667eea' : '#e2e8f0'};
  transition: all 0.3s ease;
`;

const ProgressLine = styled.div<{ completed: boolean }>`
  width: 80px;
  height: 3px;
  background: ${props => props.completed ? '#10b981' : '#e2e8f0'};
  transition: all 0.3s ease;
`;

const StepContainer = styled.div`
  margin-bottom: 2.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const PasswordField = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;

  &:hover {
    opacity: 0.7;
  }
`;

const ImageUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
`;

const UploadArea = styled.div`
  position: relative;
  flex: 1;
  padding: 1.25rem;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const UploadText = styled.p`
  color: #a0aec0;
  font-size: 1rem;
  margin: 0;
`;

const HiddenInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Tag = styled.button<{ selected: boolean }>`
  padding: 0.75rem 1.25rem;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  background: ${props => props.selected ? '#667eea' : 'white'};
  color: ${props => props.selected ? 'white' : '#4a5568'};
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    background: ${props => props.selected ? '#5a67d8' : '#edf2f7'};
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.95rem;
  margin-top: 0.75rem;
`;

const ButtonSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
`;

const PrevButton = styled.button`
  flex: 1;
  padding: 1.25rem;
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
`;

const NextButton = styled.button`
  flex: 2;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.p`
  margin-top: 2rem;
  color: #718096;
  font-size: 1rem;
  text-align: center;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StepTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const StepDescription = styled.p`
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 2rem;
  text-align: center;
`;

export default SignupForm;