
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
            // API 요청: 관리자 로그인
            const response = await api.post('/api/admin/login', {
                email,
                password,
            });

            const { accessToken } = response.data;
            
            // 토큰 디코딩
            const decodedToken = jwtDecode<DecodedToken>(accessToken);
            const userInfo = {
                email: decodedToken.sub,
                role: decodedToken.role
            };
            
            auth.login(accessToken, userInfo); // 로그인 처리
            
            navigate('/dashboard'); // 관리자 대시보드로 이동
        } catch (err) {
            setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            console.error('Admin login error:', err);
        }
    };

    return (
        <div>
            <h2>관리자 로그인</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">로그인</button>
            </form>
        </div>
    );
};

export default AdminLoginPage; 