
import React, { useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
    background: #fff;
    padding: 15px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    z-index: 100;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
        content: "🏠";
        font-size: 28px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const LogoutButton = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:active {
        transform: translateY(0);
    }
`;

const AdminHeader: React.FC = () => {
    const auth = useContext(AuthContext);

    const handleLogout = () => {
        if(auth) {
            auth.logout();
        }
    }

    return (
        <HeaderContainer>
            <PageTitle>관리자 대시보드</PageTitle>
            <HeaderActions>
                <LogoutButton onClick={handleLogout}>
                    <i className="ri-logout-box-r-line"></i>
                    로그아웃
                </LogoutButton>
            </HeaderActions>
        </HeaderContainer>
    );
};

export default AdminHeader; 