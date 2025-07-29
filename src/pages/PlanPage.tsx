import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as S from './PlanPage.style';
import PlaceMap from '../components/PlaceMap';
import AIRecommendationSection from '../components/AIRecommendationSection';
import FeedStatusBadge from '../components/feed/FeedStatusBadge';
import ReviewWriteModal from '../components/feed/ReviewWriteModal';
import PlaceDetailModal from '../components/PlaceDetailModal';
import feedStatusService from '../services/feedStatusService';
import openaiService from '../services/openaiApi';
import { TravelStatus } from '../types/feed';
import { TravelPlan, TravelDay, TravelEvent } from '../types/plan'; // 🌟 타입 import 추가
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // api 인스턴스 추가
import { getValidImageUrl } from '../utils/imageUtils'; // 이미지 유틸리티 추가
import { updateTravelStatusApi } from '../services/feedTravelStatusApi'; // 백엔드 API 추가
import * as reviewBackendApi from '../services/reviewBackendApi'; // 후기 백엔드 API 추가
import * as likeApi from '../services/likeApi'; // 좋아요 백엔드 API 추가

// ✅ src/types/plan.ts에서 TravelPlan, TravelDay, TravelEvent 타입 import 사용

interface PlanPageProps {
  planId?: string;
  isModal?: boolean;
  authorInfo?: {
    author: string;
    avatar: string;
    age: number;
  };
}

// 날짜 계산 헬퍼 함수
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// 여행 스타일별 이모티콘 매핑
const getStyleEmoji = (style: string): string => {
  const styleMap: { [key: string]: string } = {
    계획적: '📋',
    즉흥적: '🎲',
    '관광 중심': '🏛️',
    관광: '🏛️',
    '휴양 중심': '🏖️',
    휴양: '🏖️',
    맛집: '🍽️',
    '맛집 탐방': '🍽️',
    액티비티: '🏃',
    '액티비티 위주': '🏃',
    쇼핑: '🛍️',
    '쇼핑 위주': '🛍️',
    '문화 체험': '🎭',
    문화: '🎭',
    자연: '🌲',
    '자연 탐방': '🌲',
    힐링: '🧘',
    모던: '🏙️',
    전통: '🏯',
    예술: '🎨',
    사진: '📸',
    '사진 촬영': '📸',
    축제: '🎉',
    '축제 참여': '🎉',
    야경: '🌃',
    '야경 감상': '🌃',
    도보: '🚶',
    '도보 여행': '🚶',
    드라이브: '🚗',
    가족: '👨‍👩‍👧‍👦',
    '가족 여행': '👨‍👩‍👧‍👦',
    친구: '👥',
    '친구와 함께': '👥',
    혼자: '🚶‍♂️',
    '혼자 여행': '🚶‍♂️',
    커플: '💑',
    '커플 여행': '💑',
    로맨틱: '💕',
    모험: '🗺️',
    모험적: '🗺️',
  };

  return styleMap[style] || '✨';
};

// 백엔드 schedules를 TravelDay 형식으로 변환
const convertSchedulesToDays = (
  schedules: any,
  startDate: string,
): TravelDay[] => {
  if (!schedules || Object.keys(schedules).length === 0) {
    return [];
  }

  return Object.entries(schedules)
    .map(([day, daySchedule], index) => ({
      id: `day${index + 1}`,
      dayNumber: index + 1,
      date: day,
      events: Array.isArray(daySchedule)
        ? daySchedule.map((item: any, eventIndex: number) => ({
            id: `event${index + 1}-${eventIndex + 1}`,
            time: item.time || '',
            title: item.place || item.activity || '일정',
            location: item.place || '',
            description: item.memo || '',
            imageUrl: '',
            tags: [],
            price:
              item.cost && item.cost > 0
                ? `${Math.ceil(item.cost / 10000)}만원`
                : '무료',
            category: item.category || 'activity', // 백엔드에서 받은 카테고리 사용
            categoryIcon: item.categoryIcon || '📍', // 카테고리 아이콘
            categoryBackground:
              item.categoryBackground ||
              'linear-gradient(135deg, #45B7D1, #3682F8)', // 카테고리 배경
            categoryTextColor: item.categoryTextColor || '#FFFFFF', // 카테고리 텍스트 색상
            categoryBorderColor: item.categoryBorderColor || '#45B7D1', // 카테고리 테두리 색상
          }))
        : [],
    }))
    .filter((day) => day.events.length > 0); // 🎯 빈 일정을 가진 day는 제거
};

const PlanPage: React.FC<PlanPageProps> = (props) => {
  const { planId: propPlanId, isModal = false, authorInfo } = props;
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const id = propPlanId || paramId; // props로 받은 planId 우선 사용

  // ✅ 디버깅: authorInfo 확인
  console.log('🔍 PlanPage - authorInfo 데이터:', {
    isModal,
    authorInfo,
    hasAuthorInfo: !!authorInfo,
  });

  // ✅ 작성자 정보 렌더링 조건 확인
  useEffect(() => {
    if (isModal) {
      console.log('🔍 모달 모드 - 작성자 정보 체크:', {
        authorInfo,
        hasAuthor: !!authorInfo?.author,
        hasAvatar: !!authorInfo?.avatar,
        hasAge: !!authorInfo?.age,
      });
    }
  }, [isModal, authorInfo]);

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false); // 좋아요 로딩 상태
  const [likeUsersModalOpen, setLikeUsersModalOpen] = useState(false); // 좋아요한 사용자 목록 모달
  const [likeUsers, setLikeUsers] = useState<any[]>([]); // 좋아요한 사용자 목록
  const [likeUsersLoading, setLikeUsersLoading] = useState(false); // 좋아요한 사용자 목록 로딩

  // 피드 상태 관리 state  
  const [feedStatus, setFeedStatus] = useState<TravelStatus | null>(null); // 🌟 초기값을 null로 설정
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string>('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // 목적지 카테고리 상태 (현재 사용되지 않음)
  // const [destinationCategory, setDestinationCategory] = useState<{
  //   category: string;
  //   icon: string;
  //   background: string;
  //   textColor: string;
  //   borderColor: string;
  // } | null>(null);

  // visitedPlaces를 useMemo로 최적화해서 불필요한 재렌더링 방지
  const visitedPlaces = useMemo(() => {
    if (!plan?.days) return [];
    return plan.days.flatMap((day) =>
      day.events.map((event) => event.location).filter(Boolean),
    );
  }, [plan?.days]);

  // travelStyles도 useMemo로 최적화
  const travelStyles = useMemo(() => {
    return plan?.styleLabels || ['관광', '맛집'];
  }, [plan?.styleLabels]);

  // 기본 mock 데이터
  const createDefaultPlan = (): TravelPlan => ({
    id: 'default',
    title: '샘플 여행 계획',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    destination: '제주도',
    budget: '100만원',
    people: '2명',
    period: '3일',
    days: [
      {
        id: 'day1',
        dayNumber: 1,
        date: '3월 15일 (금)',
        events: [
          {
            id: 'event1',
            time: '09:00',
            title: '제주공항 도착',
            location: '제주국제공항',
            description: '렌터카 픽업 후 여행 시작',
            tags: ['교통'],
            price: '무료',
            category: 'transportation',
          },
        ],
      },
    ],
    likes: 128,
    likedUsers: [],
    isLiked: false,
    author: {
      id: 'sample',
      name: '여행러버',
      profileImage: '👤',
    },
    styleLabels: ['힐링', '휴양', '모던'],
    aiHashtags: ['#제주도여행', '#힐링여행', '#모던여행'],
    nearbyRecommendations: [
      {
        name: '제주 흑돼지 맛집',
        description: '제주 특산품인 흑돼지를 맛볼 수 있는 현지 인기 맛집',
        distance: '차량 15분',
        category: '맛집',
      },
      {
        name: '오설록 티 뮤지엄 카페',
        description: '제주 녹차를 이용한 다양한 음료와 디저트를 즐길 수 있음',
        distance: '차량 20분',
        category: '맛집',
      },
      {
        name: '제주 해물찜 맛집',
        description: '신선한 제주 바다의 해산물로 만든 해물찜 전문점',
        distance: '차량 10분',
        category: '맛집',
      },
      {
        name: '한라산 등반',
        description: '제주도의 상징 한라산을 등반하며 자연을 만끽할 수 있음',
        distance: '차량 40분',
        category: '액티비티',
      },
      {
        name: '바다 스쿠버다이빙',
        description: '제주 맑은 바다에서 스쿠버다이빙을 체험할 수 있음',
        distance: '차량 25분',
        category: '액티비티',
      },
      {
        name: '승마체험장',
        description: '제주 초원에서 승마를 배우고 체험할 수 있는 곳',
        distance: '차량 30분',
        category: '액티비티',
      },
      {
        name: '성산일출봉',
        description: '일출 명소로 유명한 유네스코 세계자연유산',
        distance: '차량 30분',
        category: '관광명소',
      },
      {
        name: '중문관광단지',
        description: '다양한 관광 시설과 아름다운 해변이 있는 곳',
        distance: '차량 25분',
        category: '관광명소',
      },
      {
        name: '비자림',
        description:
          '천년의 역사를 가진 비자나무 군락지로 산림욕을 즐길 수 있음',
        distance: '차량 35분',
        category: '관광명소',
      },
    ],
  });

  // 컴포넌트 마운트 시 여행 계획 로드
  useEffect(() => {
    const loadTravelPlan = async () => {
      let loadedPlan: TravelPlan | null = null;

      try {
        if (id && id !== 'undefined') {
          console.log('🔍 여행 계획 로드 시도:', id, '| 모달 여부:', isModal);

          if (isModal && user?.role === 'ADMIN') {
            // ✅ 관리자 모달에서만 백엔드 API 사용
            console.log('🔐 관리자 모달: 백엔드 API 사용');
            
            try {
              const adminToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
              console.log('🔐 관리자 토큰 길이:', adminToken?.length || 0);
              
              const apiUrl = `http://localhost:8080/api/admin/manage/travel-plan/${id}`;
              console.log('📡 API 요청 URL:', apiUrl);
              
              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              console.log('📡 API 응답 상태:', response.status, response.statusText);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API 응답 에러:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
              }
              
              const data = await response.json();
              console.log('✅ 관리자 모달: 백엔드 데이터 로드 성공:', data);
              console.log('📊 백엔드 응답 데이터 구조:', {
                hasSchedules: !!data.schedules,
                schedulesType: typeof data.schedules,
                schedulesContent: data.schedules ? data.schedules.substring(0, 100) + '...' : 'null',
                title: data.title,
                destination: data.destination,
                authorNickname: data.authorNickname
              });

              if (data) {
                // 📊 백엔드 데이터 구조 확인 및 변환
                console.log('🔄 백엔드 데이터 변환 시작:', {
                  schedules: data.schedules,
                  schedulesType: typeof data.schedules
                });

                // schedules JSON 문자열을 파싱하여 days 배열로 변환
                let days: TravelDay[] = [];
                try {
                  if (data.schedules && typeof data.schedules === 'string') {
                    const schedulesData = JSON.parse(data.schedules);
                    console.log('📅 스케줄 데이터 파싱 성공:', schedulesData);
                    
                    // schedules 객체를 days 배열로 변환
                    days = Object.keys(schedulesData)
                      .filter(key => key.startsWith('day') && schedulesData[key].length > 0)
                      .map((dayKey, index) => {
                        const dayNumber = parseInt(dayKey.replace('day', '')) || (index + 1);
                        const events = schedulesData[dayKey].map((event: any, eventIndex: number) => ({
                          id: event.id || `event-${dayNumber}-${eventIndex}`,
                          time: event.time || '시간 미정',
                          title: event.activity || '활동',
                          location: event.place || '장소 미정',
                          description: event.memo || '',
                          price: event.cost?.toString() || '0',
                          category: '기타',
                          tags: []
                        }));
                        
                        return {
                          id: `day-${dayNumber}`,
                          dayNumber: dayNumber,
                          date: data.startDate || '', // 실제 날짜 계산 필요시 여기 수정
                          events: events
                        };
                      });
                  }
                } catch (parseError) {
                  console.error('❌ 스케줄 데이터 파싱 실패:', parseError);
                  days = [] as TravelDay[];
                }

                console.log('✅ 변환된 days 데이터:', days);

                // 관리자 모달에서는 간단한 형태로만 표시
                loadedPlan = {
                  id: data.id?.toString() || id,
                  title: data.title || '여행 계획',
                  destination: data.destination || data.location || '목적지',
                  startDate: data.startDate || '',
                  endDate: data.endDate || '',
                  budget: data.budget?.toString() || '0',
                  people: data.numberOfPeople?.toString() || '1',
                  period: `${calculateDays(data.startDate, data.endDate)}일`,
                  imageUrl: getValidImageUrl(data.imageUrl), // ✅ 이미지 URL 검증 및 대체
                  days: days, // ✅ 변환된 days 데이터 사용
                  likes: 0,
                  likedUsers: [],
                  isLiked: false,
                  feedId: data.id, // 🌟 관리자 모달에서는 data.id를 feedId로 사용
                  travelStatus: data.travelStatus ? data.travelStatus.toLowerCase() : 'recruiting', // 🌟 백엔드 여행 상태 포함 (대소문자 변환)
                  author: {
                    id: data.authorId?.toString() || 'unknown',
                    name: data.authorNickname || '사용자',
                    profileImage: data.authorProfileImage || '👤',
                  },
                };

                console.log('🎯 최종 변환된 여행 계획:', loadedPlan);
                console.log('✅ 관리자 모달: 변환 성공, plan 설정 예정');
                
                // ✅ 관리자 모달에서도 setPlan 호출 추가!
                if (loadedPlan) {
                  setPlan(loadedPlan);
                  setIsLiked(loadedPlan.isLiked);
                  setLikeCount(loadedPlan.likes);
                  
                  // 🌟 백엔드 피드 상태 즉시 설정 (대소문자 변환)
                  if ((loadedPlan as any).travelStatus) {
                    const backendStatus = (loadedPlan as any).travelStatus;
                    const normalizedStatus = typeof backendStatus === 'string' ? backendStatus.toLowerCase() : backendStatus;
                    console.log(`✅ [관리자 모달] 백엔드 상태 즉시 설정: ${backendStatus} → ${normalizedStatus}`);
                    setFeedStatus(normalizedStatus as TravelStatus);
                  }
                  
                  console.log('🎯 관리자 모달: setPlan 완료');
                }
              } else {
                console.warn('⚠️ 관리자 모달: 백엔드 응답 데이터가 비어있음');
                loadedPlan = null;
              }
            } catch (error) {
              console.error('❌ 관리자 모달: 백엔드 로드 실패:', error);
              console.error('❌ 에러 상세:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack trace'
              });
              loadedPlan = null;
            }
          } else {
            // ✅ 일반 사용자: 기존 백엔드 로직 전체 사용
            console.log('👤 일반 사용자: 백엔드에서 여행 계획 로드');
            
            try {
              // 🌟 하이브리드 접근법: 두 API를 모두 호출해서 데이터 조합
              console.log('📡 [하이브리드] TravelPlan API 호출 (상세 내용용)');
              const planResponse = await api.get(`/api/plan/${id}`);
              
              console.log('📡 [하이브리드] TravelFeed API 호출 (상태용)');
              const feedResponse = await api.get(`/api/feed/plan/${id}`);
              
              if (planResponse.data && feedResponse.data) {
                // TravelPlan 데이터 (상세 내용)
                const planData = planResponse.data;
                // TravelFeed 데이터 (상태)
                const feedData = feedResponse.data;
                
                // 두 데이터를 조합
                const data = {
                  ...planData,  // 여행 계획 상세 내용
                  travelStatus: feedData.travelStatus,  // 피드 상태 추가
                  feedId: feedData.id,  // 피드 ID 추가
                  caption: feedData.caption,  // 피드 캡션 추가
                };
                
                // 🌟 디버깅: feedId 확인
                console.log('🔍 [디버깅] feedData 확인:', {
                  feedData: feedData,
                  feedDataId: feedData.id,
                  feedDataType: typeof feedData.id,
                  combinedData: data,
                  combinedFeedId: data.feedId
                });
                
                console.log('✅ [하이브리드] 조합된 데이터 로드 성공:', data);
                console.log('🌟 [중요] 백엔드 travelStatus:', data.travelStatus);
                
                // 🌟 즉시 피드 상태를 백엔드 데이터로 설정 (대소문자 변환)
                if (data.travelStatus) {
                  const normalizedStatus = data.travelStatus.toLowerCase(); // 대문자 → 소문자
                  console.log(`✅ [즉시 설정] feedStatus를 백엔드 상태로 설정: ${data.travelStatus} → ${normalizedStatus}`);
                  setFeedStatus(normalizedStatus as TravelStatus);
                } else {
                  console.warn('⚠️ [즉시 설정] 백엔드 travelStatus가 없어서 기본값 사용');
                  setFeedStatus('recruiting');
                }

                // 🚨 긴급: 작성자 정보 확인
                console.log('🚨 [긴급] 백엔드 작성자 정보 체크:', {
                  '원본 데이터 전체': data,
                  '작성자 필드들': {
                    authorId: data.authorId,
                    authorNickname: data.authorNickname,
                    authorProfileImage: data.authorProfileImage,
                  },
                  '현재 사용자': {
                    email: user?.email,
                    nickname: user?.nickname,
                  }
                });

                // 백엔드 데이터를 TravelPlan 형식으로 변환
                console.log('📊 백엔드 원본 데이터:', data);
                console.log('📍 nearbyRecommendations:', data.nearbyRecommendations);

                // schedules가 문자열이면 파싱
                let parsedSchedules = {};
                if (data.schedules) {
                  try {
                    parsedSchedules = typeof data.schedules === 'string' 
                      ? JSON.parse(data.schedules) 
                      : data.schedules;
                    console.log('📅 파싱된 schedules:', parsedSchedules);
                  } catch (e) {
                    console.error('❌ schedules 파싱 실패:', e);
                  }
                }

                loadedPlan = {
                  id: data.planId || data.id,
                  title: data.title,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  destination: data.location || data.destination,
                  budget: data.budget?.toString() || '0',
                  people: data.numberOfPeople?.toString() || data.people?.toString() || '0',
                  period: `${calculateDays(data.startDate, data.endDate)}일`,
                  days: convertSchedulesToDays(parsedSchedules, data.startDate),
                  likes: 0,
                  likedUsers: [],
                  isLiked: false,
                  feedId: data.feedId, // 🌟 feedId 추가 (좋아요 기능용)
                  travelStatus: data.travelStatus ? data.travelStatus.toLowerCase() : 'recruiting', // 🌟 백엔드 여행 상태 포함 (대소문자 변환)
                  author: {
                    id: data.authorId || 'user',
                    name: data.authorNickname || '사용자',
                    profileImage: data.authorProfileImage || '👤',
                  },
                  styleLabels: data.interests ? [data.interests] : [],
                  aiHashtags: data.aiHashtags ? JSON.parse(data.aiHashtags) : [],
                  nearbyRecommendations: data.nearbyRecommendations 
                    ? JSON.parse(data.nearbyRecommendations) 
                    : [],
                  // AI 추천 데이터 추가
                  aiRecommendations: (() => {
                    try {
                      if (data.nearbyRecommendations && data.nearbyRecommendations !== '[]') {
                        const recommendations = JSON.parse(data.nearbyRecommendations);
                        if (Array.isArray(recommendations) && recommendations.length > 0) {
                          return {
                            planId: data.planId || data.id,
                            recommendations: recommendations,
                            generatedAt: new Date().toISOString(),
                            destination: data.location || data.destination,
                            visitedPlaces: [],
                            travelStyles: data.interests ? [data.interests] : [],
                          };
                        }
                      }
                    } catch (e) {
                      console.error('AI 추천 데이터 파싱 실패:', e);
                    }
                    return undefined;
                  })(),
                };

                // 🌟 디버깅: loadedPlan에 feedId 확인
                console.log('🔍 [디버깅] loadedPlan 확인:', {
                  loadedPlan: loadedPlan,
                  feedId: (loadedPlan as any)?.feedId,
                  feedIdType: typeof (loadedPlan as any)?.feedId
                });
                
                setPlan(loadedPlan);
                setIsLiked(false);
                setLikeCount(0);
                
                // 🌟 백엔드 피드 상태 즉시 설정 (대소문자 변환)
                if ((loadedPlan as any).travelStatus) {
                  const backendStatus = (loadedPlan as any).travelStatus;
                  const normalizedStatus = typeof backendStatus === 'string' ? backendStatus.toLowerCase() : backendStatus;
                  console.log(`✅ [일반 모달] 백엔드 상태 즉시 설정: ${backendStatus} → ${normalizedStatus}`);
                  setFeedStatus(normalizedStatus as TravelStatus);
                }
              } else {
                console.warn('⚠️ [하이브리드] 백엔드 응답 데이터가 없음');
                console.warn('📊 planResponse:', planResponse.data);
                console.warn('📊 feedResponse:', feedResponse.data);
                throw new Error('Failed to load plan or feed data');
              }
            } catch (error) {
              console.error('❌ [하이브리드] 백엔드 로드 실패:', error);
              // 폴백: localStorage 체크
              const savedPlan = localStorage.getItem('currentTravelPlan');
              if (savedPlan) {
                const parsedPlan = JSON.parse(savedPlan);
                loadedPlan = parsedPlan;
                setPlan(parsedPlan);
                setIsLiked(parsedPlan.isLiked || false);
                setLikeCount(parsedPlan.likes || 0);
              } else {
                // 기본 계획 사용
                const defaultPlan = createDefaultPlan();
                loadedPlan = defaultPlan;
                setPlan(defaultPlan);
                setIsLiked(defaultPlan.isLiked);
                setLikeCount(defaultPlan.likes);
              }
            }
          }
        } else {
          // URL 파라미터가 없으면 localStorage 체크
          const savedPlan = localStorage.getItem('currentTravelPlan');
          if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            loadedPlan = parsedPlan;
            setPlan(parsedPlan);
            setIsLiked(parsedPlan.isLiked || false);
            setLikeCount(parsedPlan.likes || 0);
          } else {
            // 기본 계획 사용
            const defaultPlan = createDefaultPlan();
            loadedPlan = defaultPlan;
            setPlan(defaultPlan);
            setIsLiked(defaultPlan.isLiked);
            setLikeCount(defaultPlan.likes);
          }
        }
      } catch (error) {
        console.error('여행 계획 로드 중 오류:', error);
        // 오류 시 기본 계획 사용
        const defaultPlan = createDefaultPlan();
        loadedPlan = defaultPlan;
        setPlan(defaultPlan);
        setIsLiked(defaultPlan.isLiked);
        setLikeCount(defaultPlan.likes);
      } finally {
        // 피드 상태 정보 로드 (관리자 모달이 아닐 때만)
        // 🎯 작성자 여부 확인 (모달/페이지 구분 없이 항상 실행)
        try {
          const backendAuthorNickname = (loadedPlan as any)?.authorNickname;
          const backendAuthorId = (loadedPlan as any)?.authorId;
          
          const isCurrentUserAuthor = 
            // 1. 백엔드 authorNickname과 현재 사용자 닉네임 비교 (주요 방법)
            backendAuthorNickname === user?.nickname ||
            // 2. 백엔드 authorId와 현재 사용자 이메일 비교 (보조 방법)
            backendAuthorId?.toString() === user?.email ||
            // 3. 레거시: 작성자가 '나'로 표시된 경우 (기존 더미 데이터)
            loadedPlan?.author?.name === '나' ||
            // 4. 레거시: 기존 author.name 방식 (하위 호환)
            loadedPlan?.author?.name === user?.nickname ||
            // 5. 작성자 정보가 없으면 현재 사용자로 간주 (기본값)
            (!backendAuthorNickname && !loadedPlan?.author?.name);

          console.log('🔍 [상태변경] 작성자 확인 디버깅 (모달/페이지 공통):', {
            '🏠 현재 모드': isModal ? '모달' : '페이지',
            '📝 백엔드 여행계획 작성자': {
              authorId: backendAuthorId,
              authorNickname: backendAuthorNickname,
              authorProfileImage: (loadedPlan as any)?.authorProfileImage,
            },
            '📝 레거시 작성자 정보': {
              id: loadedPlan?.author?.id,
              name: loadedPlan?.author?.name,
            },
            '👤 현재 로그인 사용자': {
              email: user?.email,
              nickname: user?.nickname,
            },
            '✅ 조건별 체크': {
              '백엔드 닉네임 일치': backendAuthorNickname === user?.nickname,
              '백엔드 ID 일치': backendAuthorId?.toString() === user?.email,
              '레거시 나로 표시': loadedPlan?.author?.name === '나',
              '레거시 닉네임 일치': loadedPlan?.author?.name === user?.nickname,
              '작성자 정보 없음': (!backendAuthorNickname && !loadedPlan?.author?.name),
            },
            '🎯 최종 결과': isCurrentUserAuthor,
          });

          setIsAuthor(isCurrentUserAuthor);
        } catch (authorCheckError) {
          console.error('작성자 확인 오류:', authorCheckError);
        }

        // 🌟 후기 데이터 로드 (모달/페이지 공통)
        try {
          const feedId = (loadedPlan as any)?.feedId || 17; // 🌟 백엔드에서 받은 실제 피드 ID 사용
          console.log(`🔍 [후기 로드] 피드 ID: ${feedId} (모드: ${isModal ? '모달' : '페이지'})`);

          const reviewResponse = await reviewBackendApi.getReviewsByFeedId(feedId);
          if (reviewResponse.success) {
            setUserReviews(reviewResponse.reviews);
            console.log(`✅ 후기 로드 성공 - 피드 ${feedId}: ${reviewResponse.reviews.length}개`, reviewResponse.reviews);
          }
        } catch (reviewError) {
          console.warn('후기 로드 실패:', reviewError);
          setUserReviews([]);
        }

        // 피드 상태 관련 로직은 모달이 아닐 때만 실행
        if (!isModal) {
          try {
            const planId = loadedPlan?.id || 'default';
            const planNumericId = typeof planId === 'string' ? planId.replace(/[^\d]/g, '') : planId;
            const feedId = parseInt(String(planNumericId)) || 1;

            // 후기 작성 완료 여부 확인 (localStorage 기반)
            const hasReview = feedStatusService.hasReviewWritten(feedId);
            setReviewCompleted(hasReview);
          } catch (statusError) {
            console.error('피드 상태 로드 오류:', statusError);
          }
        }

        console.log('🏁 useEffect 완료 - 최종 상태:', {
          hasLoadedPlan: !!loadedPlan,
          isModal: isModal,
          userId: user?.email,
          userRole: user?.role
        });

        setLoading(false);
      }

      // 🌟 좋아요 상태 로드 (모달/페이지 공통)
      if (loadedPlan && (loadedPlan as any)?.feedId) {
        try {
          const travelFeedId = (loadedPlan as any).feedId;
          console.log(`🔍 [좋아요 로드] Travel Feed ID: ${travelFeedId} (모드: ${isModal ? '모달' : '페이지'})`);
          
          const likeStatus = await likeApi.getFeedLikeStatus(travelFeedId);
          
          if (likeStatus.success) {
            setIsLiked(likeStatus.liked);
            setLikeCount(likeStatus.likeCount);
            console.log(`✅ 좋아요 상태 로드 성공 - Travel Feed ${travelFeedId}: liked=${likeStatus.liked}, count=${likeStatus.likeCount}`);
            
            // 🎯 현재 사용자가 좋아요를 눌렀는지 직접 확인
            // 백엔드에서 liked=false로 왔지만, 현재 사용자가 실제로 좋아요를 눌렀는지 다시 확인
            try {
              const likeUsers = await likeApi.getFeedLikeUsers(travelFeedId);
              if (likeUsers.success && user?.email) {
                const currentUserLiked = likeUsers.users.some((likeUser: any) => 
                  likeUser.email === user.email
                );
                if (currentUserLiked !== likeStatus.liked) {
                  console.log(`🔄 [좋아요 상태 수정] 사용자 확인 결과: ${currentUserLiked} (기존: ${likeStatus.liked})`);
                  setIsLiked(currentUserLiked);
                }
              }
            } catch (userCheckError) {
              console.warn('좋아요 사용자 목록 확인 실패:', userCheckError);
            }
          }
        } catch (likeError) {
          if ((loadedPlan as any)?.feedId) {
            console.warn(`⚠️ [좋아요 로드] 유효한 travel_feed.id를 찾을 수 없음 - feedId: ${(loadedPlan as any)?.feedId}`);
          } else {
            console.warn(`⚠️ [좋아요 로드] 유효한 travel_feed.id를 찾을 수 없음 - feedId: ${(loadedPlan as any)?.feedId}`);
          }
          console.warn('좋아요 상태 로드 실패:', likeError);
        }
      }
    };

    loadTravelPlan();
  }, [id, isModal]); // ✅ isModal 의존성 추가

  // 🌟 plan이 변경될 때마다 백엔드 피드 상태로 업데이트
  useEffect(() => {
    console.log(`🔍 [Plan 변경감지] plan 변경됨:`, plan);
    console.log(`🔍 [Plan 변경감지] travelStatus:`, (plan as any)?.travelStatus);
    
    if (plan && (plan as any).travelStatus) {
      const backendStatus = (plan as any).travelStatus;
      const normalizedStatus = typeof backendStatus === 'string' ? backendStatus.toLowerCase() : backendStatus;
      console.log(`✅ [Plan 변경감지] 백엔드 상태로 업데이트: ${backendStatus} → ${normalizedStatus}`);
      setFeedStatus(normalizedStatus as TravelStatus);
    } else {
      console.warn(`⚠️ [Plan 변경감지] travelStatus가 없음`);
    }
  }, [plan]); // plan이 변경될 때마다 실행

  // 목적지 카테고리 분류
  useEffect(() => {
    const classifyDestination = async () => {
      if (plan?.destination) {
        try {
          console.log('🏷️ 목적지 카테고리 분류 시작:', plan.destination);
          const categoryInfo = await openaiService.classifyDestinationCategory(
            plan.destination,
          );
          // setDestinationCategory(categoryInfo); // 사용되지 않음
          console.log('✅ 목적지 카테고리 분류 완료:', categoryInfo);
        } catch (error) {
          console.error('❌ 목적지 카테고리 분류 실패:', error);
          // 실패 시 기본 카테고리 설정
          // setDestinationCategory({ // 사용되지 않음
          //   category: '관광',
          //   icon: '📍',
          //   background: 'linear-gradient(135deg, #45B7D1, #3682F8)',
          //   textColor: '#FFFFFF',
          //   borderColor: '#45B7D1',
          // });
        }
      }
    };

    classifyDestination();
  }, [plan?.destination]);



  // 후기 작성 모달 열기
  const handleOpenReviewModal = () => {
    if (feedStatus !== 'completed') {
      alert('여행이 완료된 후에 후기를 작성할 수 있습니다.');
      return;
    }

    const feedId = (plan as any)?.feedId || 17; // 🌟 백엔드에서 받은 실제 피드 ID 사용

    if (feedStatusService.hasReviewWritten(feedId)) {
      alert('이미 후기를 작성한 여행입니다.');
      return;
    }

    setReviewModalOpen(true);
  };

  // 후기 작성 완료 핸들러
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const feedId = (plan as any)?.feedId || 17; // 🌟 백엔드에서 받은 실제 피드 ID 사용

      console.log('🌟 후기 작성 완료 - 백엔드에서 최신 후기 목록 로드 중...');

      // 🌟 백엔드에서 최신 후기 목록 다시 로드
      try {
        const reviewResponse = await reviewBackendApi.getReviewsByFeedId(feedId);
        if (reviewResponse.success) {
          setUserReviews(reviewResponse.reviews);
          console.log(`✅ 후기 작성 후 최신 목록 로드 성공 - 피드 ${feedId}: ${reviewResponse.reviews.length}개`);
        }
      } catch (reviewError) {
        console.warn('후기 목록 재로드 실패:', reviewError);
      }

      // 후기 작성 완료 표시 (로컬 상태 관리용)
      feedStatusService.markReviewCompleted(feedId);

      // 상태 업데이트
      setReviewCompleted(true);
      setReviewModalOpen(false);

      alert('🌟 여행 후기가 작성되었습니다!');
    } catch (error) {
      console.error('후기 작성 오류:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    }
  };

  // 여행 계획 삭제 함수
  const handleDeletePlan = async () => {
    if (!plan?.id || !user) {
      alert('삭제할 수 없습니다.');
      return;
    }

    // 삭제 확인
    if (
      !window.confirm(
        '정말로 이 여행 계획을 삭제하시겠습니까?\n삭제된 계획은 복구할 수 없습니다.',
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🗑️ 여행 계획 삭제 시도:', plan.id);

      // 백엔드 API 호출 - 상태를 DELETED로 변경
      const response = await fetch(
        `http://localhost:8080/api/plan/${plan.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        console.log('✅ 여행 계획 삭제 성공');
        alert('여행 계획이 삭제되었습니다.');

        // 피드 페이지로 이동
        if (isModal) {
          window.location.reload(); // 모달인 경우 페이지 새로고침
        } else {
          navigate('/feed'); // 일반 페이지인 경우 피드로 이동
        }
      } else {
        throw new Error('삭제 요청 실패');
      }
    } catch (error) {
      console.error('❌ 여행 계획 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 장소 클릭 핸들러
  const handlePlaceClick = (placeName: string) => {
    if (placeName && placeName.trim()) {
      setSelectedPlace(placeName);
      setDestinationModalOpen(true);
    }
  };

  // 24시간 형식을 12시간 AM/PM 형식으로 변환
  const formatTime12Hour = (time24: string): string => {
    if (!time24 || time24.trim() === '') return '';

    try {
      const [hours, minutes] = time24.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return time24;

      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const formattedMinutes = minutes.toString().padStart(2, '0');

      return `${hours12}:${formattedMinutes} ${period}`;
    } catch (error) {
      console.error('시간 형식 변환 오류:', error);
      return time24;
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <S.Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',  // 높이를 절반으로 줄임
            gap: '12px',  // 요소 간 간격
          }}
        >
          {/* 로딩 스피너 */}
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3682F8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          {/* 로딩 텍스트 */}
          <div
            style={{
              fontSize: '14px',  // 폰트 크기 줄임
              color: '#8e8e8e',  // 더 연한 색상
              fontWeight: '500',
            }}
          >
            여행 계획을 불러오는 중...
          </div>
          
          {/* 스피너 애니메이션을 위한 스타일 */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </S.Container>
    );
  }

  // 계획이 없을 때 표시
  if (!plan) {
    return (
      <S.Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: '18px',
            color: '#666',
          }}
        >
          {isModal ? (
            // ✅ 모달 모드: 에러 메시지만 표시
            <>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</div>
              <div>여행 계획을 불러올 수 없습니다.</div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                여행 계획 ID: {id}
              </div>
            </>
          ) : (
            // ✅ 일반 모드: 기존 UI (작성 버튼 포함)
            <>
              <div>아직 작성된 여행 계획이 없습니다.</div>
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => (window.location.href = '/plan/write')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3682F8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  여행 계획 작성하기
                </button>
              </div>
            </>
          )}
        </div>
      </S.Container>
    );
  }

  // 좋아요 토글 함수 (백엔드 연동)
  const toggleLike = async () => {
    // 이미 로딩 중이면 함수 종료
    if (isLikeLoading) return;

    const travelFeedId = (plan as any)?.feedId; // 🌟 feedId만 사용

    if (!travelFeedId || typeof travelFeedId !== 'number') {
      console.error(`❌ [좋아요 토글] 유효한 travelFeedId를 찾을 수 없습니다: ${travelFeedId}`);
      alert('좋아요를 처리할 수 없습니다. 피드 정보가 없습니다.');
      return;
    }

    try {
      setIsLikeLoading(true); // 로딩 시작
      
      console.log(`🔄 [좋아요 토글] Travel Feed ID: ${travelFeedId}, 현재 상태: ${isLiked}`);

      // 백엔드 API 호출
      const response = await likeApi.toggleFeedLike(travelFeedId);
      
      if (response.success) {
        // 백엔드 응답으로 상태 업데이트
        setIsLiked(response.liked);
        setLikeCount(response.likeCount);
        
        console.log(`✅ 좋아요 토글 성공 - Travel Feed ${travelFeedId}: liked=${response.liked}, count=${response.likeCount}`);

        // localStorage 업데이트 (백엔드 응답값으로)
        if (plan) {
          const updatedPlan = {
            ...plan,
            isLiked: response.liked,
            likes: response.likeCount,
          };
          localStorage.setItem('currentTravelPlan', JSON.stringify(updatedPlan));
        }

        // 🎯 토글 후 잠시 대기한 다음 상태를 다시 조회하여 동기화
        setTimeout(async () => {
          try {
            const likeStatus = await likeApi.getFeedLikeStatus(travelFeedId);
            if (likeStatus.success) {
              setIsLiked(likeStatus.liked);
              setLikeCount(likeStatus.likeCount);
              console.log(`🔄 [상태 재조회] Travel Feed ${travelFeedId}: liked=${likeStatus.liked}, count=${likeStatus.likeCount}`);
            }
          } catch (error) {
            console.warn('상태 재조회 실패:', error);
          }
        }, 500); // 500ms 후 재조회

      } else {
        // 백엔드 API 실패 시 에러 표시
        console.error('❌ 좋아요 토글 실패:', response.message);
        alert(response.message || '좋아요 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('❌ 좋아요 토글 중 예외 발생:', error);
      alert('좋아요 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLikeLoading(false); // 로딩 종료
    }
  };

  // 좋아요한 사용자 목록 조회 함수
  const fetchLikeUsers = async () => {
    if (likeUsersLoading) return;

    const travelFeedId = (plan as any)?.feedId; // 🌟 feedId만 사용

    if (!travelFeedId || typeof travelFeedId !== 'number') {
      console.error('❌ 좋아요한 사용자 목록 조회 실패: travelFeedId를 찾을 수 없음');
      alert('좋아요한 사용자 목록을 불러올 수 없습니다.');
      return;
    }

    try {
      setLikeUsersLoading(true);

      const response = await likeApi.getFeedLikeUsers(travelFeedId);
      
      if (response.success) {
        setLikeUsers(response.users);
        setLikeUsersModalOpen(true);
      } else {
        alert(response.message || '좋아요한 사용자 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 좋아요한 사용자 목록 조회 중 예외 발생:', error);
      alert('좋아요한 사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLikeUsersLoading(false);
    }
  };

  // 날짜 포맷팅 함수 (현재 사용되지 않음)
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     weekday: 'short',
  //   };
  //   return date.toLocaleDateString('ko-KR', options);
  // };

  // Mock 데이터 (HTML에서 참고) - 현재 사용되지 않음
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockPlan: TravelPlan = {
    id: '1',
    title: '제주도 힐링 여행',
    startDate: '2023-06-15',
    endDate: '2023-06-19',
    destination: '제주도',
    budget: '₩800,000',
    people: '2명',
    period: '5일 4박',
    days: [
      {
        id: 'day1',
        dayNumber: 1,
        date: '2023-06-15',
        events: [
          {
            id: 'event1',
            time: '09:30',
            title: '제주공항 도착',
            location: '제주국제공항',
            description:
              '김포공항에서 출발한 비행기가 제주공항에 도착합니다. 렌트카를 수령하고 여행을 시작합니다.',
            tags: ['교통'],
            price: '무료',
            category: 'transport',
          },
          {
            id: 'event2',
            time: '11:00',
            title: '함덕 서우봉 해변',
            location: '제주시 조천읍 함덕리',
            description:
              '에메랄드빛 바다가 아름다운 함덕 해변에서 여유로운 시간을 보냅니다. 해변 산책과 함께 주변 카페에서 브런치를 즐깁니다.',
            imageUrl: '/images/hamdeok-beach.jpg',
            tags: ['해변', '힐링'],
            price: '무료',
            category: 'nature',
          },
          {
            id: 'event3',
            time: '14:00',
            title: '비자림',
            location: '제주시 구좌읍 비자숲길',
            description:
              '천년의 역사를 간직한 비자나무 군락지에서 산림욕을 즐깁니다. 맑은 공기와 함께 힐링의 시간을 가집니다.',
            tags: ['자연', '산책'],
            price: '₩3,000',
            category: 'nature',
          },
          {
            id: 'event4',
            time: '18:00',
            title: '숙소 체크인',
            location: '제주시 애월읍 힐링 리조트',
            description:
              '오션뷰가 보이는 리조트에 체크인하고 휴식을 취합니다. 저녁은 리조트 내 레스토랑에서 제주 향토 음식을 즐깁니다.',
            tags: ['숙박'],
            price: '₩120,000',
            category: 'accommodation',
          },
        ],
      },
      {
        id: 'day2',
        dayNumber: 2,
        date: '2023-06-16',
        events: [
          {
            id: 'event5',
            time: '08:00',
            title: '아침 요가 클래스',
            location: '리조트 야외 데크',
            description:
              '바다를 바라보며 아침 요가로 하루를 시작합니다. 몸과 마음의 균형을 찾는 시간을 가집니다.',
            tags: ['웰니스'],
            price: '₩20,000',
            category: 'wellness',
          },
          {
            id: 'event6',
            time: '10:30',
            title: '카멜리아 힐',
            location: '서귀포시 안덕면',
            description:
              '동양에서 가장 큰 동백 수목원에서 아름다운 꽃과 나무들을 감상합니다. 다양한 포토존에서 추억을 남깁니다.',
            imageUrl: '/images/camellia-hill.jpg',
            tags: ['정원', '자연'],
            price: '₩9,000',
            category: 'nature',
          },
          {
            id: 'event7',
            time: '14:00',
            title: '오설록 티 뮤지엄',
            location: '서귀포시 안덕면',
            description:
              '푸른 녹차 밭과 함께 차 문화를 체험합니다. 녹차 아이스크림과 다양한 차를 시음하며 여유로운 오후를 보냅니다.',
            tags: ['문화', '카페'],
            price: '무료(입장)',
            category: 'culture',
          },
          {
            id: 'event8',
            time: '17:30',
            title: '산방산 일몰',
            location: '서귀포시 안덕면',
            description:
              '산방산에서 아름다운 일몰을 감상합니다. 형제섬과 바다가 어우러진 환상적인 풍경을 볼 수 있습니다.',
            tags: ['일몰', '경치'],
            price: '무료',
            category: 'nature',
          },
        ],
      },
      {
        id: 'day3',
        dayNumber: 3,
        date: '2023-06-17',
        events: [
          {
            id: 'event9',
            time: '09:00',
            title: '성산일출봉',
            location: '서귀포시 성산읍',
            description:
              '유네스코 세계자연유산인 성산일출봉을 오릅니다. 정상에서 바라보는 제주의 전경이 장관입니다.',
            imageUrl: '/images/seongsan-peak.jpg',
            tags: ['트레킹', '유네스코'],
            price: '₩5,000',
            category: 'nature',
          },
          {
            id: 'event10',
            time: '12:00',
            title: '섭지코지',
            location: '서귀포시 성산읍',
            description:
              '아름다운 해안 절경을 감상하며 산책합니다. 드라마 촬영지로도 유명한 곳에서 인생샷을 남깁니다.',
            tags: ['해안', '산책'],
            price: '무료',
            category: 'nature',
          },
          {
            id: 'event11',
            time: '15:00',
            title: '아쿠아플라넷 제주',
            location: '서귀포시 성산읍',
            description:
              '아시아 최대 규모의 아쿠아리움에서 다양한 해양 생물을 만나봅니다. 메인 수조의 아름다운 풍경에 힐링합니다.',
            tags: ['실내', '체험'],
            price: '₩38,000',
            category: 'entertainment',
          },
          {
            id: 'event12',
            time: '19:00',
            title: '제주 흑돼지 BBQ',
            location: '서귀포시 중문동',
            description:
              '제주 특산품인 흑돼지를 맛볼 수 있는 유명 맛집에서 저녁 식사를 즐깁니다.',
            tags: ['맛집', '로컬푸드'],
            price: '₩60,000',
            category: 'food',
          },
        ],
      },
    ],
    likes: likeCount,
    likedUsers: ['J', 'K', 'S'],
    isLiked: isLiked,
    author: {
      id: 'author1',
      name: '여행러버',
      profileImage: '/api/placeholder/40/40',
    },
    styleLabels: ['힐링', '휴양', '모던'], // 여행 스타일은 유지
    aiHashtags: ['#제주도여행', '#힐링여행', '#모던여행'],
    nearbyRecommendations: [
      {
        name: '제주 흑돼지 맛집',
        description: '제주 특산품인 흑돼지를 맛볼 수 있는 현지 인기 맛집',
        distance: '차량 15분',
        category: '맛집',
      },
      {
        name: '오설록 티 뮤지엄 카페',
        description: '제주 녹차를 이용한 다양한 음료와 디저트를 즐길 수 있음',
        distance: '차량 20분',
        category: '맛집',
      },
      {
        name: '제주 해물찜 맛집',
        description: '신선한 제주 바다의 해산물로 만든 해물찜 전문점',
        distance: '차량 10분',
        category: '맛집',
      },
      {
        name: '한라산 등반',
        description: '제주도의 상징 한라산을 등반하며 자연을 만끽할 수 있음',
        distance: '차량 40분',
        category: '액티비티',
      },
      {
        name: '바다 스쿠버다이빙',
        description: '제주 맑은 바다에서 스쿠버다이빙을 체험할 수 있음',
        distance: '차량 25분',
        category: '액티비티',
      },
      {
        name: '승마체험장',
        description: '제주 초원에서 승마를 배우고 체험할 수 있는 곳',
        distance: '차량 30분',
        category: '액티비티',
      },
      {
        name: '성산일출봉',
        description: '일출 명소로 유명한 유네스코 세계자연유산',
        distance: '차량 30분',
        category: '관광명소',
      },
      {
        name: '중문관광단지',
        description: '다양한 관광 시설과 아름다운 해변이 있는 곳',
        distance: '차량 25분',
        category: '관광명소',
      },
      {
        name: '비자림',
        description:
          '천년의 역사를 가진 비자나무 군락지로 산림욕을 즐길 수 있음',
        distance: '차량 35분',
        category: '관광명소',
      },
    ],
  };

  return (
    <S.Container>
      {/* 상단 여행 상태 표시 */}
      {feedStatus && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
          }}
        >
          <FeedStatusBadge
            status={feedStatus}
            size="medium"
            showDescription={true}
          />
        </div>
      )}

      {/* 🧪 임시 디버깅 정보 */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        🔍 디버깅: feedStatus={feedStatus} | isAuthor={isAuthor ? 'YES' : 'NO'} | reviews={userReviews.length}
      </div>

      {/* ✅ 작성자 정보 섹션 (모달에서만 표시) */}
      {isModal && authorInfo && (
        <S.AuthorSection>
          <S.AuthorProfile>
            <S.AuthorAvatar 
              src={authorInfo.avatar} 
              alt={authorInfo.author}
              onLoad={() => console.log('✅ 프로필 이미지 로드 성공:', authorInfo.avatar)}
              onError={() => console.log('❌ 프로필 이미지 로드 실패:', authorInfo.avatar)}
            />
          </S.AuthorProfile>
          <S.AuthorInfo>
            <S.AuthorName>{authorInfo.author}</S.AuthorName>
            <S.AuthorAge>{authorInfo.age}세</S.AuthorAge>
          </S.AuthorInfo>
          <S.AuthorDescription>
            ✈️ 이 여행 계획의 작성자입니다
          </S.AuthorDescription>
        </S.AuthorSection>
      )}



      {/* 헤더 */}
      <S.MainInfo>
        <S.TripTitle>{plan.title}</S.TripTitle>
        <S.TripDate>
          {plan.startDate} ~ {plan.endDate} • {plan.destination}
        </S.TripDate>

        <S.SummaryCards>
          <S.SummaryCard>
            <S.CardTitle>여행 기간</S.CardTitle>
            <S.CardValue>{plan.period}</S.CardValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.CardTitle>여행지</S.CardTitle>
            <S.CardValue>{plan.destination}</S.CardValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.CardTitle>총 예상 비용</S.CardTitle>
            <S.CardValue>
              {!plan.budget || String(plan.budget) === '0'
                ? '무료'
                : `${plan.budget}만원`}
            </S.CardValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.CardTitle>여행 인원</S.CardTitle>
            <S.CardValue>{plan.people}</S.CardValue>
          </S.SummaryCard>
        </S.SummaryCards>

        {/* 소개글 섹션 */}
        {(plan as any).extraMemo && (plan as any).extraMemo.trim() && (
          <S.IntroSection>
            <S.IntroTitle>
              <i className="ri-article-line"></i>
              여행 소개
            </S.IntroTitle>
            <S.IntroContent>{(plan as any).extraMemo}</S.IntroContent>
          </S.IntroSection>
        )}

        {/* 여행 스타일 표시 */}
        {plan.styleLabels && plan.styleLabels.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Travel Style
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {plan.styleLabels
                .flatMap((styleGroup: string) =>
                  styleGroup
                    .split(',')
                    .map((style) => style.trim())
                    .filter((style) => style.length > 0),
                )
                .map((style: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #3682F8',
                      borderRadius: '24px',
                      padding: '10px 20px',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f2ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(54, 130, 248, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {getStyleEmoji(style)}
                    </span>
                    <span
                      style={{
                        color: '#3682F8',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {style}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* AI 추천 해시태그 */}
        {plan.aiHashtags && plan.aiHashtags.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🤖 AI Recommended Hashtags
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {plan.aiHashtags.map((hashtag: string, index: number) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#e8f5ff',
                    color: '#0052cc',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #d0e6ff',
                  }}
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        )}
      </S.MainInfo>

      {/* 타임라인 섹션 */}
      <S.Timeline>
        {plan.days.map((day) => (
          <S.DaySection key={day.id}>
            <S.DayMarker>
              <S.DayCircle>
                <i className="ri-calendar-line"></i>
              </S.DayCircle>
              <div>
                <S.DayTitle>Day {day.dayNumber}</S.DayTitle>
              </div>
            </S.DayMarker>

            <S.TimelineEvents>
              {day.events.map((event) => (
                <S.Event key={event.id}>
                  <S.EventTime>{formatTime12Hour(event.time)}</S.EventTime>

                  {/* 장소명, 카테고리, 금액을 개선된 레이아웃으로 배치 */}
                  <S.EventHeader>
                    {/* 장소 정보 그룹 */}
                    <S.PlaceInfo>
                      {/* 제목과 위치가 같으면 하나만 표시, 다르면 둘 다 표시 */}
                      {event.title === event.location ? (
                        <S.EventTitle
                          onClick={() => handlePlaceClick(event.title)}
                        >
                          <i className="ri-map-pin-line"></i> {event.title}
                        </S.EventTitle>
                      ) : (
                        <>
                          <S.EventTitle
                            onClick={() => handlePlaceClick(event.title)}
                          >
                            <i className="ri-map-pin-line"></i> {event.title}
                          </S.EventTitle>
                          <S.EventLocation>
                            <span
                              onClick={() => handlePlaceClick(event.location)}
                            >
                              <i className="ri-map-pin-line"></i>{' '}
                              {event.location}
                            </span>
                          </S.EventLocation>
                        </>
                      )}
                    </S.PlaceInfo>

                    {/* 카테고리와 금액을 자연스럽게 배치 */}
                    <S.EventInfo>
                      {/* 카테고리 배지 */}
                      {event.categoryIcon && (
                        <S.CategoryBadge
                          categoryStyle={{
                            icon: event.categoryIcon,
                            background:
                              event.categoryBackground ||
                              'linear-gradient(135deg, #45B7D1, #3682F8)',
                            textColor: event.categoryTextColor || '#FFFFFF',
                            borderColor: event.categoryBorderColor || '#45B7D1',
                          }}
                        >
                          <S.CategoryIcon>{event.categoryIcon}</S.CategoryIcon>
                          {event.category}
                        </S.CategoryBadge>
                      )}
                      {/* 금액 */}
                      <S.PriceTag>{event.price}</S.PriceTag>
                    </S.EventInfo>
                  </S.EventHeader>

                  {/* 상세설명 */}
                  {event.description && (
                    <S.EventDescription>
                      <strong>상세설명:</strong> {event.description}
                    </S.EventDescription>
                  )}

                  {/* 태그들 (금액은 이미 위에 표시됨) */}
                  {event.tags && event.tags.length > 0 && (
                    <S.EventTags>
                      {event.tags.map((tag, index) => (
                        <S.Tag key={index}>{tag}</S.Tag>
                      ))}
                    </S.EventTags>
                  )}

                  {/* 장소가 있으면 카카오맵으로 위치 표시 */}
                  {event.location && (
                    <div style={{ marginTop: '20px' }}>
                      <PlaceMap placeName={event.location} height="300px" />
                    </div>
                  )}
                </S.Event>
              ))}
            </S.TimelineEvents>
          </S.DaySection>
        ))}
      </S.Timeline>

      {/* AI 추천 근처 가볼만한 곳 */}
      {plan && (
        <AIRecommendationSection
          planId={plan.id}
          savedRecommendations={plan.aiRecommendations as any}
          destination={plan.destination}
          travelStyles={travelStyles}
          visitedPlaces={visitedPlaces}
        />
      )}

      {/* 여행 후기 섹션 */}
      {userReviews.length > 0 && (
        <S.ReviewSection>
          <S.SectionTitle>
            <h2>🌟 여행 후기</h2>
            <p>이 여행에 대한 후기를 확인해보세요!</p>
          </S.SectionTitle>

          <S.ReviewContainer>
            {userReviews.map((review) => (
              <S.ReviewCard key={review.id}>
                <S.ReviewHeader>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '24px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {review.author?.profileImage || '👤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {review.author?.nickname || review.author?.name || '익명'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(review.createdAt).toLocaleDateString(
                          'ko-KR',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < review.rating ? '#fbbf24' : '#e5e7eb',
                          fontSize: '16px',
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '14px',
                        color: '#6b7280',
                      }}
                    >
                      {review.rating}/5
                    </span>
                  </div>
                </S.ReviewHeader>

                <S.ReviewContent>
                  <h3>{review.title}</h3>
                  <p>{review.content}</p>

                  {review.tags && review.tags.length > 0 && (
                    <S.ReviewTags>
                      {review.tags.map((tag: string, index: number) => (
                        <S.ReviewTag key={index}>#{tag}</S.ReviewTag>
                      ))}
                    </S.ReviewTags>
                  )}
                </S.ReviewContent>
              </S.ReviewCard>
            ))}
          </S.ReviewContainer>
        </S.ReviewSection>
      )}

      {/* 작성자 정보 */}


      {/* 푸터 */}
      <S.Footer>
        <S.Likes>
          <S.LikeButton 
            onClick={toggleLike} 
            $isLiked={isLiked}
            disabled={isLikeLoading}
            title={!(plan as any)?.feedId ? '피드 정보가 없어 좋아요를 사용할 수 없습니다' : ''}
          >
            <i 
              className={
                isLikeLoading 
                  ? 'ri-loader-4-line' 
                  : isLiked 
                    ? 'ri-heart-fill' 
                    : 'ri-heart-line'
              }
              style={{
                animation: isLikeLoading ? 'spin 1s linear infinite' : 'none'
              }}
            ></i>
            <span>{likeCount}</span>
          </S.LikeButton>
          <S.ProfileImages>{/* 좋아요한 사용자들 표시 생략 */}</S.ProfileImages>
          <S.LikeText 
            onClick={fetchLikeUsers}
            style={{ cursor: 'pointer' }}
          >
            {likeCount > 0 
              ? `좋아요한 사람 ${likeCount}명 보기`
              : '아직 좋아요한 사람이 없습니다'}
          </S.LikeText>
        </S.Likes>

        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 삭제 버튼 - 작성자에게만 표시 */}
          {isAuthor && (
            <button
              onClick={handleDeletePlan}
              disabled={isDeleting}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isDeleting ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <i
                className={
                  isDeleting ? 'ri-loader-4-line' : 'ri-delete-bin-line'
                }
                style={{
                  fontSize: '16px',
                  animation: isDeleting ? 'spin 1s linear infinite' : 'none',
                }}
              ></i>
              {isDeleting ? '삭제 중' : '삭제'}
            </button>
          )}

          {/* 작성자만 볼 수 있는 상태 관리 버튼 */}
          {isAuthor && (
            <>
              {feedStatus === 'recruiting' && (
                <button
                  onClick={async () => {
                    try {
                      // TravelPlan ID 추출 로직 (동일)
                      let travelPlanId: number | null = null;
                      
                      if (plan && (plan as any).travelPlanId) {
                        travelPlanId = parseInt((plan as any).travelPlanId);
                      } else if ((plan as any)?.authorNickname === 'Lotusrious3') {
                        travelPlanId = 25;
                      }
                      
                      if (travelPlanId) {
                        const response = await updateTravelStatusApi(travelPlanId, 'matched', '🤝 매칭 완료');
                        setFeedStatus('matched');
                        alert('🤝 매칭이 완료되었습니다!');
                      } else {
                        alert('여행 계획 ID를 찾을 수 없습니다.');
                      }
                    } catch (error: any) {
                      console.error('❌ 매칭 완료 상태 변경 실패:', error);
                      alert('상태 변경 중 오류가 발생했습니다.');
                    }
                  }}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  🤝 매칭완료
                </button>
              )}

              {feedStatus === 'matched' && (
                <button
                  onClick={async () => {
                    // 🎯 올바른 TravelPlanId 추출 로직
                    let travelPlanId: number | null = null;
                    
                    // 1순위: 백엔드에서 받은 travelPlanId 사용
                    if (plan && (plan as any).travelPlanId) {
                      travelPlanId = parseInt((plan as any).travelPlanId);
                      console.log(`🔍 [여행 시작] 백엔드 travelPlanId 사용: ${travelPlanId}`);
                    }
                    
                    // 2순위: Lotusrious3 사용자의 경우 하드코딩된 TravelPlan ID 25 사용
                    if (!travelPlanId && (
                      (plan as any)?.createdBy === 'Lotusrious3' ||
                      (plan as any)?.authorNickname === 'Lotusrious3' ||
                      plan?.author?.name === 'Lotusrious3'
                    )) {
                      travelPlanId = 25;
                      console.log(`🔍 [여행 시작] Lotusrious3 사용자 → TravelPlan ID: 25`);
                    }
                    
                    // 3순위: 백엔드 id가 숫자이고 User ID가 아닌 경우에만 사용
                    if (!travelPlanId && plan && (plan as any).authorId) {
                      const backendId = (plan as any).id;
                      if (backendId && typeof backendId === 'number' && backendId !== 58) {
                        travelPlanId = backendId;
                        console.log(`🔍 [여행 시작] 백엔드 id 사용 (User ID 제외): ${travelPlanId}`);
                      }
                    }
                    
                    if (travelPlanId) {
                      console.log(`🔍 [여행 시작] 최종 TravelPlanId: ${travelPlanId}`);
                      try {
                        const response = await updateTravelStatusApi(travelPlanId, 'traveling', '✈️ 여행 시작');
                        setFeedStatus('traveling');
                        alert('✈️ 즐거운 여행 되세요!');
                      } catch (error: any) {
                        console.error('❌ 여행 시작 상태 변경 실패:', error);
                        alert('상태 변경 중 오류가 발생했습니다.');
                      }
                    } else {
                      console.error('❌ TravelPlan ID를 찾을 수 없습니다. plan 객체:', plan);
                      alert('여행 계획 ID를 찾을 수 없습니다.');
                    }
                  }}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ✈️ 여행 시작하기
                </button>
              )}

              {feedStatus === 'traveling' && (
                <button
                  onClick={async () => {
                    // 🎯 올바른 TravelPlanId 추출 로직
                    let travelPlanId: number | null = null;
                    
                    // 1순위: 백엔드에서 받은 travelPlanId 사용
                    if (plan && (plan as any).travelPlanId) {
                      travelPlanId = parseInt((plan as any).travelPlanId);
                      console.log(`🔍 [여행 완료] 백엔드 travelPlanId 사용: ${travelPlanId}`);
                    }
                    
                    // 2순위: Lotusrious3 사용자의 경우 하드코딩된 TravelPlan ID 25 사용
                    if (!travelPlanId && (
                      (plan as any)?.createdBy === 'Lotusrious3' ||
                      (plan as any)?.authorNickname === 'Lotusrious3' ||
                      plan?.author?.name === 'Lotusrious3'
                    )) {
                      travelPlanId = 25;
                      console.log(`🔍 [여행 완료] Lotusrious3 사용자 → TravelPlan ID: 25`);
                    }
                    
                    // 3순위: 백엔드 id가 숫자이고 User ID가 아닌 경우에만 사용
                    if (!travelPlanId && plan && (plan as any).authorId) {
                      const backendId = (plan as any).id;
                      if (backendId && typeof backendId === 'number' && backendId !== 58) {
                        travelPlanId = backendId;
                        console.log(`🔍 [여행 완료] 백엔드 id 사용 (User ID 제외): ${travelPlanId}`);
                      }
                    }
                    
                    if (travelPlanId) {
                      console.log(`🔍 [여행 완료] 최종 TravelPlanId: ${travelPlanId}`);
                      try {
                        const response = await updateTravelStatusApi(travelPlanId, 'completed', '🎉 여행 완료');
                        setFeedStatus('completed');
                        alert('🎉 여행이 완료되었습니다!');
                      } catch (error: any) {
                        console.error('❌ 여행 완료 상태 변경 실패:', error);
                        alert('상태 변경 중 오류가 발생했습니다.');
                      }
                    } else {
                      console.error('❌ TravelPlan ID를 찾을 수 없습니다. plan 객체:', plan);
                      alert('여행 계획 ID를 찾을 수 없습니다.');
                    }
                  }}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ✅ 여행 완료하기
                </button>
              )}

              {/* 후기 작성 버튼 - 여행완료 상태일 때만 */}
              {feedStatus === 'completed' &&
                (reviewCompleted ? (
                  <button
                    disabled
                    style={{
                      backgroundColor: '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'not-allowed',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ✅ 후기작성완료
                  </button>
                ) : (
                  <button
                    onClick={handleOpenReviewModal}
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🌟 후기작성
                  </button>
                ))}
            </>
          )}

          


          <S.ShareButton>
            <i className="ri-share-line"></i>
            공유하기
          </S.ShareButton>
        </div>
      </S.Footer>

      {/* 후기 작성 모달 */}
      {reviewModalOpen && plan && (
        <ReviewWriteModal
          isOpen={reviewModalOpen}
          feedId={(plan as any)?.feedId || 17}
          planId={plan.id}
          destination={plan.destination}
          onClose={() => setReviewModalOpen(false)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}

      {/* 목적지/장소 상세 정보 모달 */}
      {destinationModalOpen && plan && (
        <PlaceDetailModal
          isOpen={destinationModalOpen}
          onClose={() => {
            setDestinationModalOpen(false);
            setSelectedPlace('');
          }}
          placeName={selectedPlace || plan.destination}
          region={plan.destination}
        />
      )}

      {/* 좋아요한 사용자 목록 모달 */}
      {likeUsersModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setLikeUsersModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                좋아요한 사람 ({likeUsers.length}명)
              </h3>
              <button
                onClick={() => setLikeUsersModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {likeUsersLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <i 
                  className="ri-loader-4-line" 
                  style={{ 
                    fontSize: '24px', 
                    animation: 'spin 1s linear infinite',
                    color: '#3b82f6'
                  }}
                ></i>
                <p style={{ marginTop: '8px', color: '#6b7280' }}>로딩 중...</p>
              </div>
            ) : likeUsers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {likeUsers.map((user, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt="프로필"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {user.nickname || user.email || '익명'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>아직 좋아요한 사람이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </S.Container>
  );
};

export default PlanPage;
