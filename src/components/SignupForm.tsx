import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';
import { uploadImages } from '../services/feedStatusApi';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';

const GENDERS = { MALE: '남성', FEMALE: '여성', OTHER: '기타' };
const TRAVEL_STYLES = ['계획적인 여행', '즉흥적인 여행', '관광 중심', '휴양 중심', '액티비티', '맛집 탐방'];
const PREFERRED_DESTINATIONS = ['유럽', '아시아', '미주', '오세아니아', '아프리카', '국내'];

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  name: string;
  age: string;
  gender: string;
  bio: string;
  travelStyles: string[];
  preferredDestinations: string[];
  profileImage: File | null;
}

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      name: '',
      age: '',
      gender: '',
      bio: '',
      travelStyles: [],
      preferredDestinations: [],
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
      name: Yup.string().required('이름은 필수 항목입니다.'),
      age: Yup.number().typeError('나이는 숫자여야 합니다.').min(1, '나이는 1세 이상이어야 합니다.').max(120, '나이는 120세 이하여야 합니다.').required('나이는 필수 항목입니다.'),
      gender: Yup.string().required('성별은 필수 항목입니다.'),
      bio: Yup.string().max(150, '자기소개는 150자 이하로 작성해주세요.'),
      travelStyles: Yup.array().min(1, '여행 스타일을 1개 이상 선택해주세요.').required('여행 스타일은 필수 항목입니다.'),
      preferredDestinations: Yup.array().min(1, '선호 여행지를 1개 이상 선택해주세요.').required('선호 여행지는 필수 항목입니다.'),
      profileImage: Yup.mixed().nullable(),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      const loadingToast = toast.loading('회원가입을 진행 중입니다...');
      try {
        let profileImageUrl = null;
        
        // 프로필 이미지가 있으면 먼저 업로드
        if (values.profileImage) {
          try {
            const imageUrls = await uploadImages([values.profileImage]);
            if (imageUrls.length > 0) {
              profileImageUrl = imageUrls[0];
            }
          } catch (imageError) {
            console.error('이미지 업로드 실패:', imageError);
            toast.error('프로필 이미지 업로드에 실패했습니다. 이미지 없이 회원가입을 진행합니다.');
          }
        }

        const signupData = {
          email: values.email,
          password: values.password,
          nickname: values.nickname,
          // 프로필 정보 추가
          realName: values.name,
          age: parseInt(values.age),
          gender: values.gender,
          bio: values.bio,
          preferredDestinations: values.preferredDestinations.join(','),
          travelStyle: values.travelStyles.join(','),
          profileImage: profileImageUrl,
        };
        await api.post('/api/auth/signup', signupData);
        toast.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', { id: loadingToast });
        navigate('/login');
      } catch (err: any) {
        const message = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
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
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </PasswordToggle>
              </PasswordWrapper>
              {formik.touched.password && formik.errors.password && <ErrorMessage>{formik.errors.password}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>비밀번호 확인</Label>
              <PasswordWrapper>
                <Input type={showConfirmPassword ? 'text' : 'password'} {...formik.getFieldProps('confirmPassword')} />
                <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </PasswordToggle>
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
              <Input {...formik.getFieldProps('name')} />
              {formik.touched.name && formik.errors.name && <ErrorMessage>{formik.errors.name}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>나이</Label>
              <Input type="number" min={1} max={120} {...formik.getFieldProps('age')} />
              {formik.touched.age && formik.errors.age && <ErrorMessage>{formik.errors.age}</ErrorMessage>}
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
                {TRAVEL_STYLES.map((style) => (
                  <CheckboxLabel key={style} checked={formik.values.travelStyles.includes(style)}>
                    <input
                      type="checkbox"
                      name="travelStyles"
                      value={style}
                      checked={formik.values.travelStyles.includes(style)}
                      onChange={e => {
                        const { checked, value } = e.target;
                        const currentStyles = formik.values.travelStyles;
                        const newStyles = checked
                          ? [...currentStyles, value]
                          : currentStyles.filter(style => style !== value);
                        formik.setFieldValue('travelStyles', newStyles);
                      }}
                    />
                    {style}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
              {formik.touched.travelStyles && formik.errors.travelStyles && <ErrorMessage>{formik.errors.travelStyles}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>선호 여행지 (1개 이상 선택)</Label>
              <CheckboxGroup>
                {PREFERRED_DESTINATIONS.map((dest) => (
                  <CheckboxLabel key={dest} checked={formik.values.preferredDestinations.includes(dest)}>
                    <input
                      type="checkbox"
                      name="preferredDestinations"
                      value={dest}
                      checked={formik.values.preferredDestinations.includes(dest)}
                      onChange={e => {
                        const { checked, value } = e.target;
                        const current = formik.values.preferredDestinations;
                        const newArr = checked
                          ? [...current, value]
                          : current.filter((d: string) => d !== value);
                        formik.setFieldValue('preferredDestinations', newArr);
                      }}
                    />
                    {dest}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
              {formik.touched.preferredDestinations && formik.errors.preferredDestinations && <ErrorMessage>{formik.errors.preferredDestinations}</ErrorMessage>}
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
