import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
            birthdate: values.birthdate,
            gender: values.gender,
            bio: values.bio,
            travelStyles: values.travelStyles,
        };

        formData.append('signupRequest', new Blob([JSON.stringify(signupData)], { type: "application/json" }));

        if (values.profileImage) {
            formData.append('profileImage', values.profileImage);
        }

        await api.post('/api/users/signup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', { id: loadingToast });
        navigate('/login');

      } catch (err: any) {
        const message = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        toast.error(message, { id: loadingToast });
        // Field-specific errors can be set here if the backend provides them
        // e.g., if (message.includes('이메일')) setFieldError('email', message);
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

  return (
    <FormContainer>
      <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
        <Grid>
          {/* Left Column */}
          <Col>
            <FormGroup>
              <Label>이메일</Label>
              <Input {...formik.getFieldProps('email')} />
              {formik.touched.email && formik.errors.email && <ErrorMessage>{formik.errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>비밀번호</Label>
              <PasswordWrapper>
                <Input type={showPassword ? 'text' : 'password'} {...formik.getFieldProps('password')} />
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</PasswordToggle>
              </PasswordWrapper>
              {formik.touched.password && formik.errors.password && <ErrorMessage>{formik.errors.password}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>비밀번호 확인</Label>
              <PasswordWrapper>
                <Input type={showConfirmPassword ? 'text' : 'password'} {...formik.getFieldProps('confirmPassword')} />
                <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</PasswordToggle>
              </PasswordWrapper>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <ErrorMessage>{formik.errors.confirmPassword}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>닉네임</Label>
              <Input {...formik.getFieldProps('nickname')} />
              {formik.touched.nickname && formik.errors.nickname && <ErrorMessage>{formik.errors.nickname}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label>이름</Label>
              <Input {...formik.getFieldProps('realName')} />
              {formik.touched.realName && formik.errors.realName && <ErrorMessage>{formik.errors.realName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>생년월일</Label>
              <Input type="date" {...formik.getFieldProps('birthdate')} />
              {formik.touched.birthdate && formik.errors.birthdate && <ErrorMessage>{formik.errors.birthdate}</ErrorMessage>}
            </FormGroup>
          </Col>

          {/* Right Column */}
          <Col>
            <FormGroup>
              <Label>프로필 사진</Label>
              <ImagePreview src={imagePreview || '/default-place-image.jpg'} alt="Profile Preview" />
              <FileInput type="file" accept="image/*" onChange={handleImageChange} />
            </FormGroup>

            <FormGroup>
              <Label>성별</Label>
              <Select {...formik.getFieldProps('gender')}>
                <option value="" label="성별을 선택하세요" />
                {Object.entries(GENDERS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {formik.touched.gender && formik.errors.gender && <ErrorMessage>{formik.errors.gender}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>자기소개</Label>
              <Textarea {...formik.getFieldProps('bio')} />
              {formik.touched.bio && formik.errors.bio && <ErrorMessage>{formik.errors.bio}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>여행 스타일 (1개 이상 선택)</Label>
              <CheckboxGroup>
                {Object.entries(TRAVEL_STYLES).map(([key, value]) => (
                  <CheckboxLabel key={key} checked={formik.values.travelStyles.includes(key as never)}>
                    <input
                      type="checkbox"
                      name="travelStyles"
                      value={key}
                      checked={formik.values.travelStyles.includes(key as never)}
                      onChange={e => {
                        const { checked, value } = e.target;
                        const currentStyles = formik.values.travelStyles;
                        const newStyles = checked
                          ? [...currentStyles, value]
                          : currentStyles.filter(style => style !== value);
                        formik.setFieldValue('travelStyles', newStyles);
                      }}
                    />
                    {value}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
              {formik.touched.travelStyles && formik.errors.travelStyles && <ErrorMessage>{formik.errors.travelStyles}</ErrorMessage>}
            </FormGroup>
          </Col>
        </Grid>

        <SubmitButton type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? '가입 진행 중...' : '회원가입'}
        </SubmitButton>
      </form>
      <SwitchLink>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </SwitchLink>
    </FormContainer>
  );
};

// --- Styled Components ---

const FormContainer = styled.div`
  width: 100%;
  max-width: 900px;
  padding: 2rem;
  border-radius: 8px;
  background-color: #ffffff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CheckboxLabel = styled.label<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.checked ? '#1abc9c' : 'white'};
  color: ${props => props.checked ? 'white' : '#333'};
  border-color: ${props => props.checked ? '#1abc9c' : '#ccc'};

  input {
    display: none;
  }
`;

const ImagePreview = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #eee;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1abc9c, #3498db);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const SwitchLink = styled.p`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
`;

export default SignupForm;

