
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

const SearchBar = styled.div`
    position: relative;

    input {
        padding: 10px 15px 10px 40px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        width: 250px;
        font-size: 14px;
        outline: none;
        transition: all 0.3s;

        &:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
    }

    i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
    }
`;

const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #666;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        background: #e0e6ed;
    }
`;

const NotificationBadge = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
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
                <SearchBar>
                    <i className="ri-search-line"></i>
                    <input type="text" placeholder="검색..." />
                </SearchBar>
                <HeaderIcon>
                    <i className="ri-notification-3-line"></i>
                    <NotificationBadge>5</NotificationBadge>
                </HeaderIcon>
                <HeaderIcon>
                    <i className="ri-message-3-line"></i>
                    <NotificationBadge>3</NotificationBadge>
                </HeaderIcon>
                <LogoutButton onClick={handleLogout}>
                    <i className="ri-logout-box-r-line"></i>
                    로그아웃
                </LogoutButton>
            </HeaderActions>
        </HeaderContainer>
    );
};

export default AdminHeader; 