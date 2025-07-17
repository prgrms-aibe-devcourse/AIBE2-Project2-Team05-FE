import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const SwitchLink = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); // 상태 변수 이름을 nickname으로 변경
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 백엔드 회원가입 API 호출 시 필드 이름을 nickname으로 변경
      await api.post('/api/auth/signup', {
        email,
        password,
        nickname,
      });

      // 회원가입 성공 시 알림을 띄우고 로그인 페이지로 이동합니다.
      alert(
        '회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.',
      );
      navigate('/login');
    } catch (err: any) {
      // 에러 발생 시 처리
      if (err.response && err.response.data) {
        // 백엔드에서 보내주는 에러 메시지를 표시합니다. (예: "이미 존재하는 이메일입니다.")
        setError(
          err.response.data.message || '회원가입 중 오류가 발생했습니다.',
        );
      } else {
        setError(
          '회원가입 중 오류가 발생했습니다. 서버에 문제가 있을 수 있습니다.',
        );
      }
    }
  };

  return (
    <FormContainer>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">회원가입</Button>
      </form>
      <SwitchLink>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </SwitchLink>
    </FormContainer>
  );
};

export default SignupForm;
