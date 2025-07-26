import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api';

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
      console.log('Managed Users Data:', response.data);
      
      if (Array.isArray(response.data)) {
        setManagedUsers(response.data);
        console.log('Managed Users set successfully:', response.data);
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
      
      console.log('=== 상태 변경 요청 ===');
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
      console.error('상태 변경 실패:', err);
      
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
            <td colSpan={7} style={{ 
              textAlign: 'center', 
              padding: '3rem',
              fontSize: '16px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>등록된 사용자가 없습니다</div>
              <div style={{ fontSize: '14px' }}>새로운 사용자가 가입하면 여기에 표시됩니다</div>
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
                  <StatusBadge $status={userStatus}>
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
            <td colSpan={6} style={{ 
              textAlign: 'center', 
              padding: '3rem',
              fontSize: '16px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>관리 기록이 없습니다</div>
              <div style={{ fontSize: '14px' }}>사용자 관리 조치를 취하면 여기에 기록됩니다</div>
            </td>
          </tr>
        ) : (
          managedUsers.map((managedUser) => (
            <tr key={managedUser.id}>
              <td>{managedUser.id}</td>
              <td>
                <div>
                  <strong>{managedUser.user?.nickname || 'N/A'}</strong><br />
                  <small>{managedUser.user?.email || 'N/A'}</small>
                </div>
              </td>
              <td>{managedUser.admin?.name || managedUser.admin?.email || 'N/A'}</td>
              <td>
                <StatusBadge $status={managedUser.status}>
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
          $active={activeTab === 'all-users'} 
          onClick={() => setActiveTab('all-users')}
        >
          전체 사용자<span>{allUsers.length}</span>
        </TabButton>
        <TabButton 
          $active={activeTab === 'managed-users'} 
          onClick={() => setActiveTab('managed-users')}
        >
          관리된 사용자<span>{managedUsers.length}</span>
        </TabButton>
      </TabContainer>

      {isLoading ? (
        <LoadingMessage>
          <p>데이터를 불러오는 중입니다...</p>
        </LoadingMessage>
      ) : error ? (
        <ErrorMessage>
          <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: '600', margin: '8px 0' }}>{error}</p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>전체 사용자: {allUsers.length}명, 관리된 사용자: {managedUsers.length}명</p>
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

// 프로젝트 스타일 시스템에 맞춘 styled-components
const Title = styled.h1`
  margin-bottom: 32px;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: "👥";
    font-size: 32px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border: none;
  background-color: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1e293b' : '#64748b')};
  cursor: pointer;
  border-radius: 8px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none')};
  position: relative;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#fff' : '#e2e8f0')};
    transform: translateY(-1px);
  }

  span {
    display: inline-block;
    margin-left: 8px;
    background: ${({ $active }) => ($active ? '#3682f8' : '#64748b')};
    color: white;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
  }
`;

const TabContent = styled.div`
  margin-top: 16px;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "⏳";
    font-size: 48px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  p {
    font-size: 18px;
    color: #64748b;
    margin: 0;
    font-weight: 500;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "⚠️";
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  th, td {
    padding: 16px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover {
    background-color: #f8fafc;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ $danger }) => ($danger ? '#ef4444' : '#3682f8')};
  color: white;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

const StatusBadge = styled.span<{ $status?: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'ACTIVE': 
        return '#10b981';
      case 'BANNED': 
        return '#ef4444';
      case 'INACTIVE': 
        return '#6b7280';
      default: 
        return '#f59e0b';
    }
  }};
`; 