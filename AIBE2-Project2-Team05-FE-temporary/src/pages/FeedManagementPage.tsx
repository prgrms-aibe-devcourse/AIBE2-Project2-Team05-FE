import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ framer-motion 추가
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api';
import PlanPage from './PlanPage'; // ✅ PlanPage 컴포넌트 import
import { getValidImageUrl, handlePlaceImageError } from '../utils/imageUtils'; // 이미지 유틸리티 추가

// 백엔드 AdminFeedDto와 타입을 맞춥니다.
interface AdminFeedDto {
  id: number;
  imageUrl: string;
  caption: string;
  createdBy: string; // 작성자 닉네임
  status: string; // ✅ 백엔드에 status 필드가 추가되어 있음
  travelPlanId: number; // ✅ 여행 계획 ID 추가 (모달용)
}

// ✅ 백엔드 AdminManagedFeedDto와 타입을 맞춤 (플랫한 구조)
interface AdminManagedFeedDto {
  id: number;
  feedId: number;
  feedCaption: string;
  feedImageUrl: string;
  feedCreatedBy: string;
  status: string; // HIDDEN, DELETED_BY_ADMIN
  reason?: string;
  managedByAdmin: string;
  updatedAt: string;
}

// ✅ 모달 스타일 먼저 정의
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PlanPageModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  z-index: 1;

  &:hover {
    color: #374151;
  }
`;

const PlanPageWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

// ✅ TravelPlan 모달 컴포넌트 추가 (ProfilePage에서 가져옴)
const TravelPlanModal: React.FC<{
  planId: string;
  onClose: () => void;
}> = ({ planId, onClose }) => {
  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <PlanPageModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()} // ✅ 타입 명시
      >
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <PlanPageWrapper>
          <PlanPage planId={planId} isModal={true} />
        </PlanPageWrapper>
      </PlanPageModalContent>
    </ModalOverlay>
  );
};

type TabType = 'all-feeds' | 'managed-feeds';

const FeedManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all-feeds');
  const [allFeeds, setAllFeeds] = useState<AdminFeedDto[]>([]);
  const [managedFeeds, setManagedFeeds] = useState<AdminManagedFeedDto[]>([]); // ✅ 타입 변경
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ 모달 상태 추가
  const [travelPlanModalOpen, setTravelPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // 전체 피드 조회
  const fetchAllFeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/feeds', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('All Feeds API Response:', response.data); // ✅ 데이터 구조 확인을 위해 response.data 로깅
      
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

  // 관리된 피드 조회
  const fetchManagedFeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/manage/managed-feeds', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Managed Feeds API Response:', response.data); // ✅ 데이터 구조 확인을 위해 response.data 로깅
      
      if (Array.isArray(response.data)) {
        setManagedFeeds(response.data);
      } else {
        console.error('Managed feeds response is not an array:', response.data);
        setManagedFeeds([]);
      }
    } catch (err: any) {
      console.error('Error fetching managed feeds:', err);
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
      
      console.log('=== 피드 상태 변경 요청 ===');
      console.log('Feed ID:', feedId);
      console.log('New Status:', newStatus);
      console.log('Reason:', reason);
      
      const requestData = {
        travelFeedId: feedId,
        status: newStatus,
        reason: reason
      };
      
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
      console.error('피드 상태 변경 실패:', err);
      
      if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
      } else {
        alert(`피드 상태 변경에 실패했습니다. (${err.response?.status || 'Network Error'})`);
      }
    }
  };

  // 간단한 상태 변경
  const handleQuickStatusChange = (feed: AdminFeedDto, newStatus: string) => {
    const statusText = newStatus === 'HIDDEN' ? '숨김' : '삭제';
    const reason = prompt(`"${feed.caption.substring(0, 30)}..." 피드를 ${statusText} 처리하는 이유를 입력하세요:`);
    if (reason) {
      changeFeedStatus(feed.id, newStatus, reason);
    }
  };

  // ✅ 피드 상태 해제 함수 추가
  const handleRestoreFeed = async (managedFeed: AdminManagedFeedDto) => {
    const confirmMessage = `"${managedFeed.feedCaption.substring(0, 30)}..." 피드의 관리 상태를 해제하시겠습니까?\n다시 전체 피드 목록에 표시됩니다.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('=== 피드 상태 해제 요청 ===');
      console.log('Feed ID:', managedFeed.feedId);
      
      const response = await api.post(`/api/admin/manage/feed/restore?feedId=${managedFeed.feedId}`, null, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      console.log('Feed restore response:', response);

      // 성공하면 데이터 다시 로드
      await Promise.all([
        fetchAllFeeds(),
        fetchManagedFeeds()
      ]);
      
      alert('피드 상태가 해제되었습니다.');
    } catch (err: any) {
      console.error('피드 상태 해제 실패:', err);
      
      if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
      } else {
        alert(`피드 상태 해제에 실패했습니다. (${err.response?.status || 'Network Error'})`);
      }
    }
  };

  // ✅ 피드 클릭 핸들러 추가
  const handleFeedClick = (feed: AdminFeedDto) => {
    if (feed.travelPlanId) {
      console.log('🔍 피드 클릭 - 여행 계획 모달 열기:', {
        feedId: feed.id,
        travelPlanId: feed.travelPlanId,
      });
      
      setSelectedPlanId(feed.travelPlanId.toString());
      setTravelPlanModalOpen(true);
    } else {
      console.warn('⚠️ 여행 계획 ID가 없습니다:', feed);
    }
  };

  // ✅ 모달 닫기 핸들러 추가
  const closeTravelPlanModal = () => {
    setTravelPlanModalOpen(false);
    setSelectedPlanId(null);
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
                  <FeedImage 
                    src={getValidImageUrl(feed.imageUrl)} 
                    alt="피드 이미지" 
                    onClick={() => handleFeedClick(feed)}
                    onError={handlePlaceImageError}
                  />
                ) : (
                  <NoImage onClick={() => handleFeedClick(feed)}>이미지 없음</NoImage>
                )}
              </td>
              <td>
                <FeedCaption onClick={() => handleFeedClick(feed)}>
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
                <ActionButton $danger onClick={() => handleQuickStatusChange(feed, 'DELETED_BY_ADMIN')}>
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
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        {managedFeeds.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center' }}>
              관리된 피드가 없습니다.
            </td>
          </tr>
        ) : (
          managedFeeds.map((managedFeed) => (
            <tr key={managedFeed.id}>
              <td>{managedFeed.id}</td>
              <td>
                <div>
                  {/* ✅ 백엔드 구조에 맞게 수정: feedImageUrl 사용 */}
                  {managedFeed.feedImageUrl && (
                    <FeedImage 
                      src={getValidImageUrl(managedFeed.feedImageUrl)} 
                      alt="피드 이미지" 
                      onError={handlePlaceImageError}
                    />
                  )}
                  <FeedCaption>
                    {/* ✅ 백엔드 구조에 맞게 수정: feedCaption 사용 */}
                    {managedFeed.feedCaption.length > 30 
                      ? `${managedFeed.feedCaption.substring(0, 30)}...` 
                      : managedFeed.feedCaption}
                  </FeedCaption>
                </div>
              </td>
              {/* ✅ 백엔드 구조에 맞게 수정: feedCreatedBy 사용 */}
              <td>{managedFeed.feedCreatedBy}</td>
              {/* ✅ 백엔드 구조에 맞게 수정: managedByAdmin 사용 */}
              <td>{managedFeed.managedByAdmin}</td>
              <td>
                <StatusBadge $status={managedFeed.status}>
                  {managedFeed.status === 'HIDDEN' ? '숨김' : '삭제'}
                </StatusBadge>
              </td>
              <td>{managedFeed.reason || 'N/A'}</td>
              <td>{new Date(managedFeed.updatedAt).toLocaleString()}</td>
              {/* ✅ 새로운 액션 컬럼 - 상태 해제 버튼 */}
              <td>
                <RestoreButton onClick={() => handleRestoreFeed(managedFeed)}>
                  상태 해제
                </RestoreButton>
              </td>
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
          $active={activeTab === 'all-feeds'} 
          onClick={() => setActiveTab('all-feeds')}
        >
          전체 피드<span>{allFeeds.length}</span>
        </TabButton>
        <TabButton 
          $active={activeTab === 'managed-feeds'} 
          onClick={() => setActiveTab('managed-feeds')}
        >
          관리된 피드<span>{managedFeeds.length}</span>
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

      {/* ✅ 모달 컴포넌트 추가 */}
      <AnimatePresence>
        {travelPlanModalOpen && selectedPlanId && (
          <TravelPlanModal planId={selectedPlanId} onClose={closeTravelPlanModal} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default FeedManagementPage;

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
    content: "📸";
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
  background-color: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1e293b' : '#64748b')};
  cursor: pointer;
  border-radius: 8px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none')};

  &:hover {
    background-color: ${({ $active }) => ($active ? '#ffffff' : '#e2e8f0')};
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

const LoadingMessage = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
`;

const FeedTable = styled.table`
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

const FeedImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin-bottom: 4px;
  cursor: pointer; /* ✅ 클릭 가능하도록 커서 변경 */
`;

const NoImage = styled.div`
  width: 60px;
  height: 60px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
  cursor: pointer; /* ✅ 클릭 가능하도록 커서 변경 */
`;

const FeedCaption = styled.div`
  font-size: 14px;
  line-height: 1.4;
  max-width: 200px;
  word-break: break-word;
  color: #374151;
  cursor: pointer; /* ✅ 클릭 가능하도록 커서 변경 */
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ $danger }) => ($danger ? '#ef4444' : '#f59e0b')};
  color: white;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

// ✅ 상태 해제 버튼 스타일 추가
const RestoreButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #10b981; /* 초록색 - 복원을 의미 */
  color: white;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #059669;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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
      case 'HIDDEN': 
        return '#f59e0b';
      case 'DELETED_BY_ADMIN': 
        return '#ef4444';
      default: 
        return '#6b7280';
    }
  }};
`; 