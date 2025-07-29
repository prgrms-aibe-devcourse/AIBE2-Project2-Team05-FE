
import React from 'react';
import styled from 'styled-components';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const MainContentContainer = styled.div`
    margin-left: 280px; /* 사이드바 너비만큼 밀어내기 */
    display: flex;
    flex-direction: column;
    height: 100vh; /* 전체 화면 높이 차지 */
`;

const Content = styled.main`
    flex: 1; /* 헤더를 제외한 나머지 공간을 모두 차지 */
    padding: 30px;
    background-color: #f5f7fa;
    overflow-y: auto; /* 내용이 길어지면 이 부분만 스크롤 */
`;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div>
            <AdminSidebar />
            <MainContentContainer>
                <AdminHeader />
                <Content>{children}</Content>
            </MainContentContainer>
        </div>
    );
};

export default AdminLayout; 