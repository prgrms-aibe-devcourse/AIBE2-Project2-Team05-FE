import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';

const SignupForm = () => (
  <Formik
    initialValues={{
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    }}
    validationSchema={Yup.object({
      email: Yup.string()
        .email('올바른 이메일 형식이 아닙니다.')
        .required('이메일을 입력해주세요.'),
      name: Yup.string().required('이름을 입력해주세요.'),
      password: Yup.string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
        .required('비밀번호를 입력해주세요.'),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref('password'), undefined],
          '비밀번호가 일치하지 않습니다.',
        )
        .required('비밀번호 확인을 입력해주세요.'),
      agreeTerms: Yup.boolean()
        .oneOf([true], '이용약관에 동의해야 합니다.')
        .required('이용약관에 동의해야 합니다.'),
    })}
    onSubmit={(values, { setSubmitting }) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }, 400);
    }}
  >
    <StyledForm>
      <FormGroup>
        <label htmlFor="signup-email">이메일</label>
        <Field
          name="email"
          type="email"
          id="signup-email"
          as={FormControl}
          placeholder="이메일을 입력하세요"
        />
        <StyledErrorMessage name="email" component="div" />
      </FormGroup>
      <FormGroup>
        <label htmlFor="signup-name">이름</label>
        <Field
          name="name"
          type="text"
          id="signup-name"
          as={FormControl}
          placeholder="이름을 입력하세요"
        />
        <StyledErrorMessage name="name" component="div" />
      </FormGroup>
      <FormGroup>
        <label htmlFor="signup-password">비밀번호</label>
        <Field
          name="password"
          type="password"
          id="signup-password"
          as={FormControl}
          placeholder="비밀번호를 입력하세요"
        />
        <StyledErrorMessage name="password" component="div" />
      </FormGroup>
      <FormGroup>
        <label htmlFor="signup-confirm-password">비밀번호 확인</label>
        <Field
          name="confirmPassword"
          type="password"
          id="signup-confirm-password"
          as={FormControl}
          placeholder="비밀번호를 다시 입력하세요"
        />
        <StyledErrorMessage name="confirmPassword" component="div" />
      </FormGroup>
      <FormCheck>
        <Field type="checkbox" name="agreeTerms" id="agree-terms" />
        <label htmlFor="agree-terms">
          이용약관 및 개인정보처리방침에 동의합니다
        </label>
      </FormCheck>
      <StyledErrorMessage name="agreeTerms" component="div" />
      <SubmitButton type="submit">회원가입</SubmitButton>
    </StyledForm>
  </Formik>
);

export default SignupForm;

const StyledForm = styled(Form)`
  width: 100%;
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
  margin-top: 10px;
  &:hover {
    background-color: #2980b9;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;
