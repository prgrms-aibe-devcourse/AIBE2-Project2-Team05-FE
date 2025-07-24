
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string; // email
    role: string;
    iat: number;
    exp: number;
}

const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!auth) {
            setError("인증 컨텍스트를 찾을 수 없습니다.");
            return;
        }

        try {
            const response = await api.post('/api/admin/login', {
                email,
                password,
            });

            const { accessToken } = response.data;
            const decodedToken = jwtDecode<DecodedToken>(accessToken);
            const userInfo = {
                email: decodedToken.sub,
                role: decodedToken.role
            };
            
            auth.login(accessToken, userInfo);
            navigate('/dashboard');
        } catch (err) {
            setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            console.error('Admin login error:', err);
        }
    };

    return (
        <Container>
            <MainContent>
                <ImageSection>
                    <ImageOverlay />
                    <TravelIllustration>
                        <i className="ri-shield-user-line travel-icon"></i>
                    </TravelIllustration>
                    <ImageText>
                        <h2>관리자 페이지</h2>
                        <p>
                            시스템의 원활한 운영을 위해 최선을 다하고 있습니다.
                        </p>
                    </ImageText>
                </ImageSection>
                <FormSection>
                    <FormContainer>
                        <FormHeader>
                            <h1>관리자 로그인</h1>
                            <p>관리자 계정으로 로그인해주세요.</p>
                        </FormHeader>
                        <form onSubmit={handleSubmit}>
                            <InputGroup>
                                <label htmlFor="email">이메일</label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <label htmlFor="password">비밀번호</label>
                                <Input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </InputGroup>
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                            <SubmitButton type="submit">로그인</SubmitButton>
                        </form>
                    </FormContainer>
                </FormSection>
            </MainContent>
        </Container>
    );
};

export default AdminLoginPage;


// LoginPage와 유사한 스타일 컴포넌트들
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const ImageSection = styled.div`
  width: 50%;
  background: linear-gradient(135deg, #485461, #28313b);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const TravelIllustration = styled.div`
  width: 100%;
  height: 400px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  .travel-icon {
    font-size: 180px;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ImageText = styled.div`
  text-align: center;
  z-index: 2;
  h2 {
    font-size: 36px;
    margin-bottom: 15px;
    font-weight: bold;
  }
  p {
    font-size: 18px;
    line-height: 1.6;
    max-width: 80%;
    margin: 0 auto;
  }
`;

const FormSection = styled.div`
  width: 50%;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
  }
  p {
    color: #777;
    font-size: 16px;
  }
`;

const InputGroup = styled.div`
    margin-bottom: 20px;
    label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-size: 14px;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 8px;
    background-color: #34495e;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #2c3e50;
    }
`;

const ErrorMessage = styled.p`
    color: #e74c3c;
    font-size: 14px;
    text-align: center;
    margin-bottom: 15px;
`; 