
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
    font-size: 20px;
    font-weight: 500;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;



const LogoutButton = styled.button`
    background: #f5f7fa;
    border: 1px solid #e0e0e0;
    padding: 8px 15px;
    border-radius: 8px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
        background: #e0e6ed;
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
            <PageTitle>대시보드 홈</PageTitle>
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