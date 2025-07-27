
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const SidebarContainer = styled.div`
    width: 280px;
    background: #2c3e50;
    color: #fff;
    height: 100vh;
    padding: 20px 0;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
`;

const SidebarHeader = styled.div`
    padding: 0 20px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
`;

const LogoIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
`;

const LogoText = styled.div`
    font-weight: 700;
    font-size: 18px;
`;

const AdminProfile = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const AdminAvatar = styled.div`
    width: 50px;
    height: 50px;
    background: #3498db;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
`;

const AdminInfo = styled.div`
    h4 {
        font-size: 16px;
        margin-bottom: 5px;
    }

    p {
        font-size: 13px;
        opacity: 0.7;
    }
`;

const MenuItems = styled.ul`
    list-style: none;
    padding: 0 10px;
`;

const MenuItem = styled.li`
    margin-bottom: 5px;
    border-radius: 8px;
    transition: all 0.3s;

    a {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 15px;
        border-radius: 8px;
        transition: all 0.3s;
    }

    a.active {
        background: rgba(52, 152, 219, 0.2);
        color: #fff;
    }

    a:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
    }

    i {
        margin-right: 15px;
        font-size: 18px;
    }
`;

const AdminSidebar: React.FC = () => {
    return (
        <SidebarContainer>
            <SidebarHeader>
                <Logo>
                    <LogoIcon><i className="ri-plane-line"></i></LogoIcon>
                    <LogoText>트립매치</LogoText>
                </Logo>
                <AdminProfile>
                    <AdminAvatar><i className="ri-user-line"></i></AdminAvatar>
                    <AdminInfo>
                        <h4>김관리자</h4>
                        <p>시스템 관리자</p>
                    </AdminInfo>
                </AdminProfile>
            </SidebarHeader>

            <MenuItems>
                <MenuItem>
                    <NavLink to="/dashboard">
                        <i className="ri-dashboard-line"></i> 대시보드 홈
                    </NavLink>
                </MenuItem>
                <MenuItem>
                    <NavLink to="/admin/users">
                        <i className="ri-user-settings-line"></i> 회원 관리
                    </NavLink>
                </MenuItem>
                <MenuItem>
                    <NavLink to="/admin/feeds">
                        <i className="ri-file-list-3-line"></i> 여행 피드 관리
                    </NavLink>
                </MenuItem>
                <MenuItem>
                    <NavLink to="/admin/reports">
                        <i className="ri-alarm-warning-line"></i> 신고 처리
                    </NavLink>
                </MenuItem>
            </MenuItems>
        </SidebarContainer>
    );
};

export default AdminSidebar; 