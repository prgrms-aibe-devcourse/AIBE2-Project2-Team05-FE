import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api'; // api 모듈 임포트

// 백엔드 User 엔티티와 타입을 맞춥니다.
interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  status?: string; // UserStatus ENUM 값 (ACTIVE, BANNED, INACTIVE)
  createdAt: string; // ISO 8601 형식의 문자열
}

// ManagedUser 엔티티 타입
interface ManagedUser {
  id: number;
  user: User;
  admin: {
    id: number;
    email: string;
    name: string;
  };
  status: string;
  reason?: string;
  updatedAt: string;
}

type TabType = 'all-users' | 'managed-users';

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all-users');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 전체 사용자 조회
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/users', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('All Users API Response:', response);
      
      if (Array.isArray(response.data)) {
        setAllUsers(response.data);
      } else {
        console.error('All users response is not an array:', response.data);
        setAllUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching all users:', err);
      setAllUsers([]);
    }
  };

  // 관리된 사용자 조회
  const fetchManagedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/managed-users', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Managed Users API Response:', response);
      
      if (Array.isArray(response.data)) {
        setManagedUsers(response.data);
      } else {
        console.error('Managed users response is not an array:', response.data);
        setManagedUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching managed users:', err);
      // 관리된 사용자 API가 없으면 빈 배열로 설정
      setManagedUsers([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchAllUsers(),
          fetchManagedUsers()
        ]);
      } catch (err: any) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 사용자 상태 변경 함수
  const changeUserStatus = async (userId: number, newStatus: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // 디버깅: 토큰과 요청 정보 로그
      console.log('=== 상태 변경 요청 디버깅 ===');
      console.log('Token:', token);
      console.log('User ID:', userId);
      console.log('New Status:', newStatus);
      console.log('Reason:', reason);
      
      // JWT 토큰 파싱해서 사용자 정보 확인
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token Payload:', tokenPayload);
          console.log('User Role:', tokenPayload.role || tokenPayload.authorities);
        } catch (e) {
          console.log('Token parsing failed:', e);
        }
      }
      
      const requestData = {
        userId: userId,
        status: newStatus,
        reason: reason
      };
      
      console.log('Request Data:', requestData);
      
      const response = await api.post('/api/admin/manage/user', requestData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log('Status change response:', response);

      // 성공하면 데이터 다시 로드
      await Promise.all([
        fetchAllUsers(),
        fetchManagedUsers()
      ]);
      
      alert('사용자 상태가 변경되었습니다.');
    } catch (err: any) {
      console.error('=== 상태 변경 실패 ===');
      console.error('Error changing user status:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
      } else {
        alert(`상태 변경에 실패했습니다. (${err.response?.status || 'Network Error'})`);
      }
    }
  };

  // 간단한 상태 변경 (데모용)
  const handleQuickStatusChange = (user: User, newStatus: string) => {
    const reason = prompt(`${user.nickname}님의 상태를 ${newStatus}로 변경하는 이유를 입력하세요:`);
    if (reason) {
      changeUserStatus(user.id, newStatus, reason);
    }
  };

  const renderAllUsersTab = () => (
    <UserTable>
      <thead>
        <tr>
          <th>ID</th>
          <th>이메일</th>
          <th>닉네임</th>
          <th>가입일</th>
          <th>역할</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {allUsers.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center' }}>
              사용자가 없습니다.
            </td>
          </tr>
        ) : (
          allUsers.map((user) => {
            // status가 null이거나 undefined면 'ACTIVE'로 기본 처리
            const userStatus = user.status || 'ACTIVE';
            
            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.nickname}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>{user.role}</td>
                <td>
                  <StatusBadge status={userStatus}>
                    {userStatus}
                  </StatusBadge>
                </td>
                <td>
                  <ActionButton onClick={() => handleQuickStatusChange(user, 'BANNED')}>
                    차단
                  </ActionButton>
                  <ActionButton onClick={() => handleQuickStatusChange(user, 'ACTIVE')}>
                    활성화
                  </ActionButton>
                  <ActionButton onClick={() => handleQuickStatusChange(user, 'INACTIVE')}>
                    비활성화
                  </ActionButton>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </UserTable>
  );

  const renderManagedUsersTab = () => (
    <UserTable>
      <thead>
        <tr>
          <th>관리 ID</th>
          <th>사용자 정보</th>
          <th>관리자</th>
          <th>상태</th>
          <th>변경 사유</th>
          <th>변경 일시</th>
        </tr>
      </thead>
      <tbody>
        {managedUsers.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center' }}>
              관리된 사용자가 없습니다.
            </td>
          </tr>
        ) : (
          managedUsers.map((managedUser) => (
            <tr key={managedUser.id}>
              <td>{managedUser.id}</td>
              <td>
                <div>
                  <strong>{managedUser.user.nickname}</strong><br />
                  <small>{managedUser.user.email}</small>
                </div>
              </td>
              <td>{managedUser.admin.name}</td>
              <td>
                <StatusBadge status={managedUser.status}>
                  {managedUser.status}
                </StatusBadge>
              </td>
              <td>{managedUser.reason || 'N/A'}</td>
              <td>{new Date(managedUser.updatedAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </UserTable>
  );

  return (
    <AdminLayout>
      <Title>회원 관리</Title>
      
      <TabContainer>
        <TabButton 
          active={activeTab === 'all-users'} 
          onClick={() => setActiveTab('all-users')}
        >
          전체 사용자 ({allUsers.length})
        </TabButton>
        <TabButton 
          active={activeTab === 'managed-users'} 
          onClick={() => setActiveTab('managed-users')}
        >
          관리된 사용자 ({managedUsers.length})
        </TabButton>
      </TabContainer>

      {isLoading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>
          <p style={{ color: 'red' }}>{error}</p>
          <p>Debug info: 전체 사용자 = {allUsers.length}명, 관리된 사용자 = {managedUsers.length}명</p>
        </ErrorMessage>
      ) : (
        <TabContent>
          {activeTab === 'all-users' ? renderAllUsersTab() : renderManagedUsersTab()}
        </TabContent>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  border: none;
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  color: ${({ active }) => (active ? 'white' : '#333')};
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => (active ? '#007bff' : 'transparent')};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};

  &:hover {
    background-color: ${({ active }) => (active ? '#0056b3' : '#f8f9fa')};
  }
`;

const TabContent = styled.div`
  margin-top: 1rem;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 2rem;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 4px 8px;
  margin-right: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ danger }) => (danger ? '#f44336' : '#007bff')};
  color: white;
  font-size: 12px;

  &:hover {
    opacity: 0.8;
  }
`;

const StatusBadge = styled.span<{ status?: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'BANNED': return '#dc3545';
      case 'INACTIVE': return '#6c757d';
      default: return '#ffc107';
    }
  }};
`; 