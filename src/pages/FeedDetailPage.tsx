import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { BackendFeedResponse } from '../services/feedApi';
import { createOrGetChatRoom, searchUsers } from '../services/chatApi'; // 🔧 채팅 API 추가
import { useAuth } from '../contexts/AuthContext'; // 🔧 인증 컨텍스트 추가
import ImageModal from '../components/profile/ImageModal';

const FeedDetailPage: React.FC = () => {
  const { id: feedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // 🔧 현재 로그인한 사용자 정보

  const [feedData, setFeedData] = useState<BackendFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false); // 🔧 채팅방 생성 로딩 상태

  // 피드 데이터 로드
  useEffect(() => {
    const loadFeedData = async () => {
      if (!feedId) {
        setError('피드 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 피드 ${feedId} 상세 정보 로딩 시작`);
        // travelPlanId를 사용하는 새로운 엔드포인트 사용
        const response = await api.get<BackendFeedResponse>(`/api/feed/plan/${feedId}`);
        
        console.log('✅ 피드 상세 데이터:', response.data);
        setFeedData(response.data);
      } catch (err) {
        console.error('❌ 피드 상세 데이터 로딩 실패:', err);
        setError('피드를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadFeedData();
  }, [feedId]);

  // 🔧 작성자와 채팅 시작하기
  const handleStartChat = async () => {
    if (!feedData || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const authorName = feedData.createdBy || feedData.authorName;
    if (!authorName) {
      alert('작성자 정보를 찾을 수 없습니다.');
      return;
    }

    // 자신의 피드인 경우 채팅 불가 (닉네임으로 비교)
    if (authorName === user.nickname) {
      alert('본인이 작성한 피드입니다.');
      return;
    }

    setChatLoading(true);
    try {
      console.log('🔧 작성자 검색 시도:', { authorName });

      // 1. 먼저 작성자 이름으로 사용자 검색
      const searchResults = await searchUsers(authorName);
      
      if (searchResults.length === 0) {
        alert('작성자를 찾을 수 없습니다.');
        return;
      }

      // 정확히 일치하는 사용자 찾기
      const exactMatch = searchResults.find(result => 
        result.nickname === authorName
      );

      if (!exactMatch) {
        alert('작성자를 정확히 찾을 수 없습니다.');
        return;
      }

      console.log('🔧 채팅방 생성 시도:', {
        targetUserId: exactMatch.id,
        authorName: exactMatch.nickname
      });

      // 2. 채팅방 생성 또는 기존 채팅방 반환
      const chatRoom = await createOrGetChatRoom(exactMatch.id);
      
      if (chatRoom) {
        console.log('✅ 채팅방 생성/반환 성공:', chatRoom);
        // 채팅 페이지로 이동
        navigate('/chat', { 
          state: { 
            selectedRoomId: chatRoom.id,
            authorName: exactMatch.nickname
          }
        });
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 채팅방 생성 실패:', error);
      
      if (error.message?.includes('토큰이 만료')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 이동하거나 새로고침
        window.location.reload();
      } else if (error.message?.includes('로그인이 필요')) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.reload();
      } else {
        alert(`채팅방 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setChatLoading(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>여행 계획을 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // 에러 상태
  if (error || !feedData) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error || '피드를 찾을 수 없습니다.'}</ErrorText>
          <BackButton onClick={() => navigate('/')}>
            메인으로 돌아가기
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  // 🔧 채팅 버튼 표시 여부 결정
  const authorName = feedData.createdBy || feedData.authorName;
  const canStartChat = user && authorName && authorName !== user.nickname;

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← 뒤로가기
        </BackButton>
        <HeaderTitle>여행 계획 상세</HeaderTitle>
      </Header>

      {/* 여행 정보 카드 */}
      <TravelCard>
        {/* 이미지 섹션 */}
        {feedData.imageUrl && (
          <ImageSection 
            onClick={() => setImageModalOpen(true)}
          >
            <TravelImage src={feedData.imageUrl} alt={feedData.title} />
            <ImageOverlay>
              <ImageExpandIcon>🔍 이미지 확대</ImageExpandIcon>
            </ImageOverlay>
          </ImageSection>
        )}

        {/* 여행 기본 정보 */}
        <InfoSection>
          <TravelTitle>{feedData.title}</TravelTitle>
          <TravelMeta>
            <MetaItem>📍 {feedData.location}</MetaItem>
            <MetaItem>📅 {feedData.startDate} ~ {feedData.endDate}</MetaItem>
            <MetaItem>👥 {feedData.numberOfPeople}명</MetaItem>
            <MetaItem>💰 {feedData.budget}만원</MetaItem>
          </TravelMeta>
          
          <AuthorInfo>
            <AuthorSection>
              <AuthorLabel>여행 계획 작성자</AuthorLabel>
              <AuthorName>{feedData.createdBy || feedData.authorName}</AuthorName>
            </AuthorSection>
            {/* 🔧 채팅 시작 버튼 추가 */}
            {canStartChat && (
              <ChatButton 
                onClick={handleStartChat}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <>
                    <ChatButtonSpinner />
                    연결 중...
                  </>
                ) : (
                  <>
                    💬 채팅하기
                  </>
                )}
              </ChatButton>
            )}
          </AuthorInfo>

          {feedData.description && (
            <Description>{feedData.description}</Description>
          )}

          {feedData.interests && (
            <InterestsSection>
              <InterestsLabel>관심사</InterestsLabel>
              <InterestsList>
                {String(feedData.interests).split(',').map((interest: string, index: number) => (
                  <InterestTag key={index}>{interest.trim()}</InterestTag>
                ))}
              </InterestsList>
            </InterestsSection>
          )}
        </InfoSection>
      </TravelCard>

      {/* 일정 상세 */}
      {feedData.days && feedData.days.length > 0 && (
        <ScheduleSection>
          <SectionTitle>📋 여행 일정</SectionTitle>
          {feedData.days.map((day, dayIndex) => (
            <DayCard key={dayIndex}>
              <DayHeader>
                <DayTitle>Day {day.dayNumber}</DayTitle>
                <DayDate>{day.date}</DayDate>
              </DayHeader>
              {day.schedules && day.schedules.length > 0 ? (
                <ScheduleList>
                  {day.schedules.map((schedule, scheduleIndex) => (
                    <ScheduleItem key={scheduleIndex}>
                      <ScheduleTime>{schedule.time}</ScheduleTime>
                      <ScheduleContent>
                        <SchedulePlace>{schedule.place}</SchedulePlace>
                        <ScheduleActivity>{schedule.activity}</ScheduleActivity>
                        {schedule.memo && <ScheduleMemo>{schedule.memo}</ScheduleMemo>}
                        {schedule.cost > 0 && <ScheduleCost>💰 {schedule.cost.toLocaleString()}원</ScheduleCost>}
                      </ScheduleContent>
                    </ScheduleItem>
                  ))}
                </ScheduleList>
              ) : (
                <NoSchedule>일정이 없습니다.</NoSchedule>
              )}
            </DayCard>
          ))}
        </ScheduleSection>
      )}

      {/* 이미지 모달 */}
      <AnimatePresence>
        {imageModalOpen && feedData.imageUrl && (
          <ImageModal 
            imageUrl={feedData.imageUrl} 
            onClose={() => setImageModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default FeedDetailPage; 

// 스타일 컴포넌트들
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #3682F8;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const TravelCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
`;

const ImageSection = styled.div`
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

const TravelImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;

  ${ImageSection}:hover & {
    background: rgba(0, 0, 0, 0.3);
    opacity: 1;
  }
`;

const ImageExpandIcon = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const InfoSection = styled.div`
  padding: 24px;
`;

const TravelTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
`;

const TravelMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #666;
`;

const AuthorInfo = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

// 🔧 새로 추가된 스타일 컴포넌트들
const AuthorSection = styled.div`
  flex: 1;
`;

const AuthorLabel = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
`;

const AuthorName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #3682F8;
`;

const ChatButton = styled.button`
  background: #3682F8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #2c5aa0;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ChatButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 20px;
`;

const InterestsSection = styled.div`
  margin-top: 20px;
`;

const InterestsLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InterestTag = styled.span`
  background: #3682F8;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const ScheduleSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
`;

const DayCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const DayHeader = styled.div`
  background: #3682F8;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DayTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const DayDate = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const ScheduleList = styled.div`
  padding: 0;
`;

const ScheduleItem = styled.div`
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleTime = styled.div`
  min-width: 80px;
  font-size: 14px;
  font-weight: 600;
  color: #3682F8;
  margin-right: 16px;
`;

const ScheduleContent = styled.div`
  flex: 1;
`;

const SchedulePlace = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ScheduleActivity = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ScheduleMemo = styled.div`
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
`;

const ScheduleCost = styled.div`
  font-size: 13px;
  color: #e74c3c;
  font-weight: 500;
`;

const NoSchedule = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3682F8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: #666;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`; 