import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api'; // api 모듈 임포트

// 백엔드 AdminFeedDto와 타입을 맞춥니다.
interface AdminFeedDto {
  id: number;
  imageUrl: string;
  caption: string;
  createdBy: string; // 작성자 닉네임
}

// ManagedTravelFeed 엔티티 타입
interface ManagedTravelFeed {
  id: number;
  travelFeed: {
    id: number;
    imageUrl: string;
    caption: string;
    user: {
      nickname: string;
    };
  };
  admin: {
    id: number;
    email: string;
    name: string;
  };
  status: string; // HIDDEN, DELETED_BY_ADMIN
  reason?: string;
  updatedAt: string;
}

type TabType = 'all-feeds' | 'managed-feeds';

const FeedManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all-feeds');
  const [allFeeds, setAllFeeds] = useState<AdminFeedDto[]>([]);
  const [managedFeeds, setManagedFeeds] = useState<ManagedTravelFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 전체 피드 조회
  const fetchAllFeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/feeds', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('All Feeds API Response:', response);
      
      if (Array.isArray(response.data)) {
        setAllFeeds(response.data);
      } else {
        console.error('All feeds response is not an array:', response.data);
        setAllFeeds([]);
      }
    } catch (err: any) {
      console.error('Error fetching all feeds:', err);
      setAllFeeds([]);
    }
  };

  // 관리된 피드 조회 (API가 없을 수 있으므로 임시로 빈 배열)
  const fetchManagedFeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      // 관리된 피드 API 엔드포인트가 있다면 사용, 없으면 빈 배열
      const response = await api.get('/api/admin/manage/managed-feeds', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Managed Feeds API Response:', response);
      
      if (Array.isArray(response.data)) {
        setManagedFeeds(response.data);
      } else {
        console.error('Managed feeds response is not an array:', response.data);
        setManagedFeeds([]);
      }
    } catch (err: any) {
      console.error('Error fetching managed feeds:', err);
      // 관리된 피드 API가 없으면 빈 배열로 설정
      setManagedFeeds([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchAllFeeds(),
          fetchManagedFeeds()
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

  // 피드 상태 변경 함수
  const changeFeedStatus = async (feedId: number, newStatus: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // 디버깅: 토큰과 요청 정보 로그
      console.log('=== 피드 상태 변경 요청 디버깅 ===');
      console.log('Token:', token);
      console.log('Feed ID:', feedId);
      console.log('New Status:', newStatus);
      console.log('Reason:', reason);
      
      const requestData = {
        travelFeedId: feedId,
        status: newStatus,
        reason: reason
      };
      
      console.log('Request Data:', requestData);
      
      const response = await api.post('/api/admin/manage/feed', requestData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log('Feed status change response:', response);

      // 성공하면 데이터 다시 로드
      await Promise.all([
        fetchAllFeeds(),
        fetchManagedFeeds()
      ]);
      
      alert('피드 상태가 변경되었습니다.');
    } catch (err: any) {
      console.error('=== 피드 상태 변경 실패 ===');
      console.error('Error changing feed status:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
      } else {
        alert(`피드 상태 변경에 실패했습니다. (${err.response?.status || 'Network Error'})`);
      }
    }
  };

  // 간단한 상태 변경 (데모용)
  const handleQuickStatusChange = (feed: AdminFeedDto, newStatus: string) => {
    const statusText = newStatus === 'HIDDEN' ? '숨김' : '삭제';
    const reason = prompt(`"${feed.caption.substring(0, 30)}..." 피드를 ${statusText} 처리하는 이유를 입력하세요:`);
    if (reason) {
      changeFeedStatus(feed.id, newStatus, reason);
    }
  };

  const renderAllFeedsTab = () => (
    <FeedTable>
      <thead>
        <tr>
          <th>ID</th>
          <th>이미지</th>
          <th>내용</th>
          <th>작성자</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {allFeeds.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center' }}>
              피드가 없습니다.
            </td>
          </tr>
        ) : (
          allFeeds.map((feed) => (
            <tr key={feed.id}>
              <td>{feed.id}</td>
              <td>
                {feed.imageUrl ? (
                  <FeedImage src={feed.imageUrl} alt="피드 이미지" />
                ) : (
                  <NoImage>이미지 없음</NoImage>
                )}
              </td>
              <td>
                <FeedCaption>
                  {feed.caption.length > 50 
                    ? `${feed.caption.substring(0, 50)}...` 
                    : feed.caption}
                </FeedCaption>
              </td>
              <td>{feed.createdBy}</td>
              <td>
                <ActionButton onClick={() => handleQuickStatusChange(feed, 'HIDDEN')}>
                  숨김
                </ActionButton>
                <ActionButton danger onClick={() => handleQuickStatusChange(feed, 'DELETED_BY_ADMIN')}>
                  삭제
                </ActionButton>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </FeedTable>
  );

  const renderManagedFeedsTab = () => (
    <FeedTable>
      <thead>
        <tr>
          <th>관리 ID</th>
          <th>피드 정보</th>
          <th>작성자</th>
          <th>관리자</th>
          <th>상태</th>
          <th>처리 사유</th>
          <th>처리 일시</th>
        </tr>
      </thead>
      <tbody>
        {managedFeeds.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center' }}>
              관리된 피드가 없습니다.
            </td>
          </tr>
        ) : (
          managedFeeds.map((managedFeed) => (
            <tr key={managedFeed.id}>
              <td>{managedFeed.id}</td>
              <td>
                <div>
                  {managedFeed.travelFeed.imageUrl && (
                    <FeedImage src={managedFeed.travelFeed.imageUrl} alt="피드 이미지" />
                  )}
                  <FeedCaption>
                    {managedFeed.travelFeed.caption.length > 30 
                      ? `${managedFeed.travelFeed.caption.substring(0, 30)}...` 
                      : managedFeed.travelFeed.caption}
                  </FeedCaption>
                </div>
              </td>
              <td>{managedFeed.travelFeed.user.nickname}</td>
              <td>{managedFeed.admin.name}</td>
              <td>
                <StatusBadge status={managedFeed.status}>
                  {managedFeed.status === 'HIDDEN' ? '숨김' : '삭제'}
                </StatusBadge>
              </td>
              <td>{managedFeed.reason || 'N/A'}</td>
              <td>{new Date(managedFeed.updatedAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </FeedTable>
  );

  return (
    <AdminLayout>
      <Title>콘텐츠 관리</Title>
      
      <TabContainer>
        <TabButton 
          active={activeTab === 'all-feeds'} 
          onClick={() => setActiveTab('all-feeds')}
        >
          전체 피드 ({allFeeds.length})
        </TabButton>
        <TabButton 
          active={activeTab === 'managed-feeds'} 
          onClick={() => setActiveTab('managed-feeds')}
        >
          관리된 피드 ({managedFeeds.length})
        </TabButton>
      </TabContainer>

      {isLoading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>
          <p style={{ color: 'red' }}>{error}</p>
          <p>Debug info: 전체 피드 = {allFeeds.length}개, 관리된 피드 = {managedFeeds.length}개</p>
        </ErrorMessage>
      ) : (
        <TabContent>
          {activeTab === 'all-feeds' ? renderAllFeedsTab() : renderManagedFeedsTab()}
        </TabContent>
      )}
    </AdminLayout>
  );
};

export default FeedManagementPage;

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

const FeedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
`;

const FeedImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin-bottom: 4px;
`;

const NoImage = styled.div`
  width: 60px;
  height: 60px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #999;
  text-align: center;
`;

const FeedCaption = styled.div`
  font-size: 14px;
  line-height: 1.4;
  max-width: 200px;
  word-break: break-word;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 4px 8px;
  margin-right: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ danger }) => (danger ? '#dc3545' : '#ffc107')};
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
      case 'HIDDEN': return '#ffc107';
      case 'DELETED_BY_ADMIN': return '#dc3545';
      default: return '#6c757d';
    }
  }};
`; 