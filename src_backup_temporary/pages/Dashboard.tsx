import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Dashboard as DashboardComponent } from '../components/dashboard';

/**
 * 관리자 대시보드 페이지
 * - AdminLayout으로 감싸진 메인 대시보드
 * - 통계, 차트, 신고 이력 등 모든 관리 정보를 제공
 */
const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <DashboardComponent />
    </AdminLayout>
  );
};

export default DashboardPage; 