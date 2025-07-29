import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useContext 대신 useAuth 훅을 임포트
import api from '../services/api'; // 수정된 api 모듈을 임포트합니다.
import profileApiService from '../services/profileApi'; // ✅ 프로필 API 추가

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
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
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

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const { login } = useAuth(); // useAuth 훅 사용
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // ✅ 로딩 시작

    try {
      console.log('🔐 로그인 시도 시작:', { email });
      
      // 1️⃣ 로그인 API 호출
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { accessToken, email: responseEmail, nickname, role } = response.data;
      console.log('✅ 로그인 API 성공:', { email: responseEmail, nickname, role });

      if (accessToken) {
        // 🎯 로그인 응답에서 직접 받은 닉네임 사용 (더 이상 별도 API 호출 불필요)
        const userData = {
          email: responseEmail || email,
          role: role.toString(),
          nickname: nickname, // 백엔드에서 직접 받은 정확한 닉네임 사용
        };

        console.log('🔐 로그인 완료, 사용자 데이터:', userData);
        login(accessToken, userData);
        navigate('/');
      } else {
        setError('로그인에 실패했습니다: 토큰이 없습니다.');
      }
    } catch (err: any) {
      console.error('❌ 로그인 실패:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || '로그인 중 오류가 발생했습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 서버에 문제가 있을 수 있습니다.');
      }
    } finally {
      setIsLoading(false); // ✅ 로딩 종료
    }
  };

  return (
    <FormContainer>
      <h2>로그인</h2>
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
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <SwitchLink>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </SwitchLink>
    </FormContainer>
  );
};

export default LoginForm;
