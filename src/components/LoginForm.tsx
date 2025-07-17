import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const LoginForm = () => (
  <Formik
    initialValues={{ email: '', password: '' }}
    validationSchema={Yup.object({
      email: Yup.string()
        .email('올바른 이메일 형식이 아닙니다.')
        .required('이메일을 입력해주세요.'),
      password: Yup.string().required('비밀번호를 입력해주세요.'),
    })}
    onSubmit={(values, { setSubmitting }) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }, 400);
    }}
  >
    <StyledForm>
      <FormContent>
        <FormGroup>
          <label htmlFor="email">이메일 또는 아이디</label>
          <Field
            name="email"
            type="email"
            as={FormControl}
            placeholder="이메일 또는 아이디를 입력하세요"
          />
          <StyledErrorMessage name="email" component="div" />
        </FormGroup>

        <FormGroup>
          <label htmlFor="password">비밀번호</label>
          <Field
            name="password"
            type="password"
            as={FormControl}
            placeholder="비밀번호를 입력하세요"
          />
          <StyledErrorMessage name="password" component="div" />
        </FormGroup>

        <FormCheck>
          <Field type="checkbox" name="rememberMe" id="remember-me" />
          <label htmlFor="remember-me">로그인 상태 유지</label>
        </FormCheck>

        <ForgotPassword>
          <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
        </ForgotPassword>

        <SubmitButton type="submit">로그인</SubmitButton>
      </FormContent>
      <SocialLogin />
    </StyledForm>
  </Formik>
);

export default LoginForm;

const SocialLogin = () => (
  <SocialLoginContainer>
    <SocialLoginText>소셜 계정으로 로그인</SocialLoginText>
    <SocialButtons>
      <SocialButton className="kakao">
        <i className="ri-chat-1-fill"></i>
      </SocialButton>
      <SocialButton className="naver">
        <i className="ri-chat-3-fill"></i>
      </SocialButton>
      <SocialButton className="google">
        <i className="ri-google-fill"></i>
      </SocialButton>
    </SocialButtons>
  </SocialLoginContainer>
);

const StyledForm = styled(Form)`
  width: 100%;
`;

const FormContent = styled.div`
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  }
`;

const FormControl = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const FormCheck = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  input {
    margin-right: 10px;
  }
  label {
    margin-bottom: 0;
    font-weight: normal;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  margin-bottom: 20px;
  a,
  & > a {
    color: #3498db;
    text-decoration: none;
    font-size: 14px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #3498db;
  color: white;
  &:hover {
    background-color: #2980b9;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

const SocialLoginContainer = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const SocialLoginText = styled.p`
  color: #777;
  margin-bottom: 20px;
  position: relative;
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background-color: #ddd;
  }
  &::before {
    left: 0;
  }
  &::after {
    right: 0;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const SocialButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-3px);
  }
  &.kakao {
    background-color: #fee500;
    color: #3c1e1e;
  }
  &.naver {
    background-color: #03c75a;
    color: white;
  }
  &.google {
    background-color: #ffffff;
    color: #4285f4;
    border: 1px solid #ddd;
  }
`;
