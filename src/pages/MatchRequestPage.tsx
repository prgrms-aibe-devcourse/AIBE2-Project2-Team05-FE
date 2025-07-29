import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🔧 추가
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import matchingApiService from '../services/matchingApi';
import { MatchResponse } from '../services/matchingApi';
import PlanPage from './PlanPage';

// 🔧 스타일드 컴포넌트들을 먼저 정의 (hoisting 문제 해결)

// Container
const Container = styled(motion.div)`
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// Tabs
const TabsContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : 'transparent'};
  color: ${props => props.$active ? '#1e293b' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
  position: relative;

  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
    color: ${props => props.$active ? '#1e293b' : 'white'};
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TabBadge = styled.span`
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  margin-left: 6px;
  font-weight: 700;
`;

// Request Cards
const RequestsGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RequestCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RequestTitle = styled.h3`
  color: #1e293b;
  margin: 0;
  font-weight: 600;
  font-size: 16px;
`;

const RequestDetails = styled.div`
  color: #64748b;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 🔧 요청자 정보 표시를 위한 스타일드 컴포넌트들
const SenderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  padding: 12px;
  background: rgba(54, 130, 248, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(54, 130, 248, 0.1);
  cursor: pointer; // 🔧 클릭 가능 표시
  transition: all 0.2s ease;
  
  // 🔧 호버 효과 추가
  &:hover {
    background: rgba(54, 130, 248, 0.1);
    border-color: rgba(54, 130, 248, 0.2);
    transform: translateY(-1px);
  }
`;

const SenderAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(54, 130, 248, 0.2);
`;

const SenderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SenderName = styled.div`
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
`;

const SenderLabel = styled.div`
  color: #64748b;
  font-size: 12px;
`;

const ReceiverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  padding: 12px;
  background: rgba(54, 130, 248, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(54, 130, 248, 0.1);
  cursor: pointer; // 🔧 클릭 가능 표시
  transition: all 0.2s ease;
  
  // 🔧 호버 효과 추가
  &:hover {
    background: rgba(54, 130, 248, 0.1);
    border-color: rgba(54, 130, 248, 0.2);
    transform: translateY(-1px);
  }
`;

const ReceiverAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(54, 130, 248, 0.2);
`;

const ReceiverDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReceiverName = styled.div`
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
`;

const ReceiverLabel = styled.div`
  color: #64748b;
  font-size: 12px;
`;

const RequestId = styled.div`
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
`;

const StatusBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
          &:hover {
            background: #e2e8f0;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return '';
    }
  }}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
`;

const EmptyTitle = styled.h3`
  margin-bottom: 12px;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

// 🔧 모달 관련 스타일 컴포넌트들 (프로필 페이지 스타일)
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const PlanPageModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  overflow: hidden; // 🔧 외부 컨테이너는 hidden으로 설정
  position: relative;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  margin: 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    margin: 10px;
    border-radius: 12px;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #1e293b;
    transform: scale(1.05);
  }
`;

const PlanPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto; // 🔧 세로 스크롤 허용
  overflow-x: hidden; // 가로 스크롤은 숨김
  
  // 🎨 스크롤바 스타일링
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    transition: background 0.2s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

// 누락된 스타일드 컴포넌트들 추가
const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0 0 32px 0;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

// ✅ TravelPlan 모달 컴포넌트 (프로필 정보 포함)
const TravelPlanModal: React.FC<{
  planId: string;
  authorInfo?: {
    author: string;
    avatar: string;
    age: number;
  };
  onClose: () => void;
}> = ({ planId, authorInfo, onClose }) => {
  
  console.log('🏡 매칭요청 TravelPlanModal에서 받은 작성자 정보:', {
    planId,
    authorInfo,
    '전달할 정보': authorInfo ? `${authorInfo.author} (${authorInfo.age}세)` : '없음'
  });

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
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <PlanPageWrapper>
          <PlanPage planId={planId} isModal={true} authorInfo={authorInfo} />
        </PlanPageWrapper>
      </PlanPageModalContent>
    </ModalOverlay>
  );
};

// 매칭 요청 페이지 컴포넌트
const MatchRequestPage: React.FC = () => {
  const navigate = useNavigate(); // 🔧 navigate 훅 추가
  
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'accepted' | 'rejected'>('received');
  const [sentRequests, setSentRequests] = useState<MatchResponse[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchResponse[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<MatchResponse[]>([]);
  const [rejectedMatches, setRejectedMatches] = useState<MatchResponse[]>([]); // 🔧 거절한 매칭 상태 추가
  const [loading, setLoading] = useState(true);
  
  // 🔧 현재 로그인한 사용자 정보 상태 추가
  const [currentUser, setCurrentUser] = useState<{nickname: string; email: string} | null>(null);
  
  // 🔧 모달 상태 추가 (프로필 페이지 스타일)
  const [travelPlanModalOpen, setTravelPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedAuthorInfo, setSelectedAuthorInfo] = useState<{
    author: string;
    avatar: string;
    age: number;
  } | null>(null);

  // 🔧 요청자 프로필 페이지로 이동하는 핸들러
  const handleSenderProfileClick = (senderNickname: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 상위 카드 클릭 이벤트 방지
    console.log('👤 요청자 프로필로 이동:', senderNickname);
    navigate(`/profile/${senderNickname}`);
  };

  // 🔧 요청 받은 사람 프로필 페이지로 이동하는 핸들러
  const handleReceiverProfileClick = (receiverNickname: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 상위 카드 클릭 이벤트 방지
    console.log('👤 요청 받은 사람 프로필로 이동:', receiverNickname);
    navigate(`/profile/${receiverNickname}`);
  };

  // 데이터 로드
  useEffect(() => {
    loadMatchingData();
  }, []);

  const loadMatchingData = async () => {
    setLoading(true);
    try {
      console.log('📋 매칭 요청 데이터 로드 시작...');
      
      // ✅ 토큰 상태 확인
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      const userInfo = user ? JSON.parse(user) : null;
      
      console.log('🔍 토큰 상태 확인:', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasUser: !!user,
        userInfo: userInfo
      });
      
      // 🔧 현재 사용자 정보 설정
      if (userInfo) {
        setCurrentUser({
          nickname: userInfo.nickname,
          email: userInfo.email
        });
        console.log('👤 현재 로그인 사용자:', userInfo.nickname);
      }

      // 🔧 모든 매칭 요청 데이터를 개별로 로드하여 어떤 API에서 실패하는지 확인
      console.log('📤 1. 보낸 요청 조회 시작...');
      const sent = await matchingApiService.getMySentRequests();
      console.log('✅ 1. 보낸 요청 조회 성공:', sent.length, '개');
      console.log('📋 보낸 요청 상세:', sent);

      console.log('📥 2. 받은 요청 조회 시작...');
      const received = await matchingApiService.getMyReceivedRequests();
      console.log('✅ 2. 받은 요청 조회 성공:', received.length, '개');
      console.log('📋 받은 요청 상세:', received);

      console.log('🤝 3. 수락된 매칭 조회 시작...');
      const accepted = await matchingApiService.getMyAcceptedMatches();
      console.log('✅ 3. 수락된 매칭 조회 성공:', accepted.length, '개');
      console.log('📋 수락된 매칭 상세:', accepted);

      console.log('🚫 4. 거절한 매칭 조회 시작...');
      const rejected = await matchingApiService.getMyRejectedMatches();
      console.log('✅ 4. 거절한 매칭 조회 성공:', rejected.length, '개');
      console.log('📋 거절한 매칭 상세:', rejected);

      setSentRequests(sent);
      setReceivedRequests(received);
      setAcceptedMatches(accepted);
      setRejectedMatches(rejected);

      console.log('✅ 매칭 요청 데이터 로드 완료');
      console.log(`📊 데이터 현황: 보낸 요청 ${sent.length}개, 받은 요청 ${received.length}개, 수락된 매칭 ${accepted.length}개, 거절한 매칭 ${rejected.length}개`);
      
    } catch (error: any) {
      console.error('❌ 매칭 요청 데이터 로드 실패:', error);
      // ✅ 에러 상세 정보 로그
      if (error?.response) {
        console.error('🔍 에러 응답 상세:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 매칭 요청 응답 (수락/거절)
  const handleRespondToRequest = async (matchId: number, status: 'ACCEPTED' | 'REJECTED', event?: React.MouseEvent) => {
    // 🚨 이벤트 버블링 방지 (카드 클릭 모달 방지)
    if (event) {
      event.stopPropagation();
    }
    
    try {
      console.log(`🎯 매칭 요청 ${status === 'ACCEPTED' ? '수락' : '거절'}: ${matchId}`);
      
      await matchingApiService.respondToMatchRequest(matchId, status);
      
      if (status === 'ACCEPTED') {
        alert('매칭 요청을 수락했습니다! 🎉');
      } else {
        alert('매칭 요청을 거절했습니다.');
      }
      
      // 데이터 새로고침
      await loadMatchingData();
    } catch (error) {
      console.error(`❌ 매칭 요청 ${status === 'ACCEPTED' ? '수락' : '거절'} 실패:`, error);
      alert('요청 처리 중 오류가 발생했습니다.');
    }
  };

  // 매칭 요청 취소
  const handleCancelRequest = async (matchId: number, event?: React.MouseEvent) => {
    // 🚨 이벤트 버블링 방지 (카드 클릭 모달 방지)
    if (event) {
      event.stopPropagation();
    }
    
    try {
      console.log(`🗑️ 매칭 요청 취소: ${matchId}`);
      
      await matchingApiService.cancelMatchRequest(matchId);
      alert('매칭 요청을 취소했습니다.');
      
      // 데이터 새로고침
      await loadMatchingData();
    } catch (error) {
      console.error('❌ 매칭 요청 취소 실패:', error);
      alert('요청 취소 중 오류가 발생했습니다.');
    }
  };

  // 수락된 매칭 취소
  const handleCancelAcceptedMatch = async (matchId: number, event?: React.MouseEvent) => {
    // 🚨 이벤트 버블링 방지 (카드 클릭 모달 방지)
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const confirmed = window.confirm('정말로 매칭을 취소하시겠습니까?');
      if (!confirmed) return;

      await matchingApiService.cancelAcceptedMatch(matchId);
      console.log('✅ 수락된 매칭 취소 성공');
      
      alert('매칭이 취소되었습니다.');
      loadMatchingData(); // 데이터 새로고침
    } catch (error) {
      console.error('❌ 수락된 매칭 취소 실패:', error);
      alert('매칭 취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 🔧 새로 추가: 거절 취소 (다시 추천 목록에 나오게)
  const handleUnrejectMatch = async (matchId: number, event?: React.MouseEvent) => {
    // 🚨 이벤트 버블링 방지 (카드 클릭 모달 방지)
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const confirmed = window.confirm('이 사용자를 거절 목록에서 제거하시겠습니까?\n다시 매칭 추천 목록에 나타날 수 있습니다.');
      if (!confirmed) return;

      await matchingApiService.unrejectMatch(matchId);
      console.log('✅ 거절 취소 성공');
      
      alert('거절이 취소되었습니다. 해당 사용자가 다시 추천 목록에 나타날 수 있습니다.');
      loadMatchingData(); // 데이터 새로고침
    } catch (error) {
      console.error('❌ 거절 취소 실패:', error);
      alert('거절 취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 현재 탭에 따른 데이터 반환
  const getCurrentData = () => {
    let data: MatchResponse[];
    switch (activeTab) {
      case 'sent':
        data = sentRequests;
        break;
      case 'received':
        data = receivedRequests;
        break;
      case 'accepted':
        data = acceptedMatches;
        break;
      case 'rejected': // 🔧 거절한 매칭 데이터 반환
        data = rejectedMatches;
        break;
      default:
        data = [];
    }
    
    // 🔧 디버깅 로그 추가
    console.log(`📊 [getCurrentData] activeTab: ${activeTab}, 데이터 개수: ${data.length}`, data);
    return data;
  };

  // 상태에 따른 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b'; // 황색
      case 'ACCEPTED':
        return '#10b981'; // 녹색
      case 'REJECTED':
        return '#ef4444'; // 적색
      default:
        return '#64748b'; // 회색
    }
  };

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'ACCEPTED':
        return '수락됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  // 🔧 매칭 요청 상세 보기 모달 열기 (프로필 페이지 스타일)
  const handleRequestClick = async (request: MatchResponse) => {
    try {
      console.log('🔍 매칭 요청 클릭:', request);
      
      // 상대방 프로필 정보 조회
      const userProfile = await matchingApiService.getUserProfile(request.receiverId);
      
      console.log('👤 상대방 프로필 정보:', userProfile);
      
      // 모달 데이터 설정
      setSelectedPlanId(request.planId.toString());
      setSelectedAuthorInfo({
        author: userProfile.nickname,
        avatar: userProfile.profileImage || '',
        age: userProfile.age
      });
      setTravelPlanModalOpen(true);
    } catch (error) {
      console.error('❌ 상대방 프로필 조회 실패:', error);
      // 실패해도 기본 정보로 모달 열기
      setSelectedPlanId(request.planId.toString());
      setSelectedAuthorInfo({
        author: request.receiverNickname,
        avatar: '',
        age: 25
      });
      setTravelPlanModalOpen(true);
    }
  };

  // 🔧 모달 닫기
  const handleCloseModal = () => {
    setTravelPlanModalOpen(false);
    setSelectedPlanId(null);
    setSelectedAuthorInfo(null);
  };

  if (loading) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageTitle>🤝 매칭 요청 관리</PageTitle>
        <Description>보낸 요청과 받은 요청을 관리하세요</Description>
        <LoadingContainer>
          매칭 요청 데이터를 불러오는 중...
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageTitle>🤝 매칭 요청 관리</PageTitle>
      <Description>보낸 요청과 받은 요청을 관리하세요</Description>

      <TabsContainer>
        <Tab 
          $active={activeTab === 'received'} 
          onClick={() => setActiveTab('received')}
        >
          받은 요청 <TabBadge>{receivedRequests.length}</TabBadge>
        </Tab>
        <Tab 
          $active={activeTab === 'sent'} 
          onClick={() => setActiveTab('sent')}
        >
          보낸 요청 <TabBadge>{sentRequests.length}</TabBadge>
        </Tab>
        <Tab 
          $active={activeTab === 'accepted'} 
          onClick={() => setActiveTab('accepted')}
        >
          매칭 성공 <TabBadge>{acceptedMatches.length}</TabBadge>
        </Tab>
        <Tab 
          $active={activeTab === 'rejected'} 
          onClick={() => setActiveTab('rejected')}
        >
          거절된 매칭 <TabBadge>{rejectedMatches.length}</TabBadge>
        </Tab>
      </TabsContainer>

      <RequestsGrid>
        {getCurrentData().length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              {activeTab === 'received' && '📬'}
              {activeTab === 'sent' && '📤'}
              {activeTab === 'accepted' && '🎉'}
              {activeTab === 'rejected' && '👎'}
            </EmptyIcon>
            <EmptyTitle>
              {activeTab === 'received' && '받은 매칭 요청이 없습니다'}
              {activeTab === 'sent' && '보낸 매칭 요청이 없습니다'}
              {activeTab === 'accepted' && '매칭된 여행이 없습니다'}
              {activeTab === 'rejected' && '거절된 매칭이 없습니다'}
            </EmptyTitle>
            <EmptyDescription>
              {activeTab === 'received' && '다른 사용자들이 매칭 요청을 보내면 여기에 표시됩니다.'}
              {activeTab === 'sent' && '관심있는 여행에 매칭 요청을 보내보세요!'}
              {activeTab === 'accepted' && '매칭이 성사되면 여기에서 확인할 수 있습니다.'}
              {activeTab === 'rejected' && '거절된 매칭은 여기에서 확인할 수 있습니다.'}
            </EmptyDescription>
          </EmptyState>
        ) : (
          getCurrentData().map((request) => (
            <RequestCard 
              key={request.matchId} 
              onClick={() => handleRequestClick(request)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequestInfo>
                <RequestTitle>
                  {/* 🔧 현재 로그인한 사용자 관점에서 표시 */}
                  {(() => {
                    if (activeTab === 'received') {
                      return `${request.senderNickname}님이 보낸 요청`;
                    } else if (activeTab === 'sent') {
                      return `${request.receiverNickname}님에게 보낸 요청`;
                                         } else if (activeTab === 'accepted') {
                       // 수락된 매칭: 현재 사용자가 sender인지 receiver인지 확인
                       const isCurrentUserSender = currentUser?.nickname === request.senderNickname;
                       console.log(`🎯 수락된 매칭 표시 로직: 현재사용자(${currentUser?.nickname}) === 요청자(${request.senderNickname}) ? ${isCurrentUserSender}`);
                       if (isCurrentUserSender) {
                         return `${request.receiverNickname}님과의 매칭 성사`;
                       } else {
                         return `${request.senderNickname}님과의 매칭 성사`;
                       }
                    } else if (activeTab === 'rejected') {
                      // 거절된 매칭: 현재 사용자가 sender인지 receiver인지 확인
                      const isCurrentUserSender = currentUser?.nickname === request.senderNickname;
                      if (isCurrentUserSender) {
                        return `${request.receiverNickname}님에게 보낸 요청이 거절됨`;
                      } else {
                        return `${request.senderNickname}님의 요청을 거절함`;
                      }
                    }
                    return '매칭 요청';
                  })()} - {request.planTitle || '여행계획'}
                </RequestTitle>
                <RequestDetails>
                  📍 {request.location} | 🗓️ {request.startDate} ~ {request.endDate}
                  <br />
                  👥 {request.numberOfPeople}명 | 💰 {request.budget?.toLocaleString()}원
                </RequestDetails>
                {/* 받은 요청일 때는 요청을 보낸 사람 정보 추가 표시 */}
                {activeTab === 'received' && (
                  <SenderInfo onClick={(e) => handleSenderProfileClick(request.senderNickname, e)}>
                    <SenderAvatar 
                      src={request.senderProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.senderNickname || 'User')}&background=64748b&color=ffffff&size=40`} 
                      alt={`${request.senderNickname} 프로필`}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.senderNickname || 'User')}&background=64748b&color=ffffff&size=40`;
                      }}
                    />
                    <SenderDetails>
                      <SenderName>{request.senderNickname}</SenderName>
                      <SenderLabel>매칭 요청자</SenderLabel>
                    </SenderDetails>
                  </SenderInfo>
                )}
                {activeTab === 'sent' && (
                  <ReceiverInfo onClick={(e) => handleReceiverProfileClick(request.receiverNickname, e)}>
                    <ReceiverAvatar 
                      src={request.receiverProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.receiverNickname || 'User')}&background=64748b&color=ffffff&size=40`} 
                      alt={`${request.receiverNickname} 프로필`}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.receiverNickname || 'User')}&background=64748b&color=ffffff&size=40`;
                      }}
                    />
                    <ReceiverDetails>
                      <ReceiverName>{request.receiverNickname}</ReceiverName>
                      <ReceiverLabel>요청 받은 사람</ReceiverLabel>
                    </ReceiverDetails>
                  </ReceiverInfo>
                )}
                <StatusBadge $color={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </StatusBadge>
              </RequestInfo>

              <RequestActions>
                {/* 받은 요청에서 PENDING 상태인 경우 수락/거절 버튼 */}
                {activeTab === 'received' && request.status === 'PENDING' && (
                  <>
                    <ActionButton 
                      $variant="primary"
                      onClick={(e) => handleRespondToRequest(request.matchId, 'ACCEPTED', e)}
                    >
                      수락
                    </ActionButton>
                    <ActionButton 
                      $variant="secondary"
                      onClick={(e) => handleRespondToRequest(request.matchId, 'REJECTED', e)}
                    >
                      거절
                    </ActionButton>
                  </>
                )}

                {/* 보낸 요청에서 PENDING 상태인 경우 취소 버튼 */}
                {activeTab === 'sent' && request.status === 'PENDING' && (
                  <ActionButton 
                    $variant="danger"
                    onClick={(e) => handleCancelRequest(request.matchId, e)}
                  >
                    요청 취소
                  </ActionButton>
                )}

                {/* 수락된 매칭에서 취소 버튼 */}
                {activeTab === 'accepted' && (
                  <ActionButton 
                    $variant="danger"
                    onClick={(e) => handleCancelAcceptedMatch(request.matchId, e)}
                  >
                    매칭 취소
                  </ActionButton>
                )}

                {/* 🔧 거절된 매칭에서 거절 취소 버튼 - 조건을 더 명확하게 */}
                {activeTab === 'rejected' && (
                  <ActionButton 
                    $variant="danger"
                    onClick={(e) => {
                      console.log(`🎯 거절 취소 버튼 클릭: matchId=${request.matchId}`);
                      handleUnrejectMatch(request.matchId, e);
                    }}
                  >
                    거절 취소
                  </ActionButton>
                )}
              </RequestActions>
            </RequestCard>
          ))
        )}
      </RequestsGrid>

      {/* 🔧 여행 계획 모달 (프로필 페이지 스타일) */}
      <AnimatePresence>
        {travelPlanModalOpen && selectedPlanId && selectedAuthorInfo && (
          <TravelPlanModal
            planId={selectedPlanId}
            authorInfo={selectedAuthorInfo}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default MatchRequestPage; 