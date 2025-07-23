import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api'; // api 모듈 임포트

// 백엔드 User 엔티티와 타입을 맞춥니다.
interface ManagedUser {
  email: string;
  nickname: string;
  role: string;
  createdAt: string; // ISO 8601 형식의 문자열
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // 임시로 토큰을 수동으로 헤더에 추가
        const token = localStorage.getItem('token');
        console.log('Token found:', token); // 디버깅용
        
        const response = await api.get<ManagedUser[]>('/api/admin/manage/users', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError('사용자 정보를 불러오는 데 실패했습니다.');
        console.error('Error details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <Title>회원 관리</Title>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <UserTable>
          <thead>
            <tr>
              <th>이메일</th>
              <th>닉네임</th>
              <th>가입일</th>
              <th>역할</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.email}</td>
                <td>{user.nickname}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.role}</td>
                <td>
                  <ActionButton>상태 변경</ActionButton>
                  <ActionButton danger>삭제</ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </UserTable>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;

const Title = styled.h1`
  margin-bottom: 2rem;
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
  }
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ danger }) => (danger ? '#f44336' : '#007bff')};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`; 