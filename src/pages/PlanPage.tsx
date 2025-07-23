import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import * as S from './PlanPage.style';
import PlaceMap from '../components/PlaceMap';
import AIRecommendationSection from '../components/AIRecommendationSection';
import FeedStatusChanger from '../components/feed/FeedStatusChanger';
import FeedStatusBadge from '../components/feed/FeedStatusBadge';
import ReviewWriteModal from '../components/feed/ReviewWriteModal';
import feedStatusService from '../services/feedStatusService';
import { TravelStatus, FeedWithTravelStatus } from '../types/feed';

// 여행 계획 타입 정의
interface TravelEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  price: string;
  category: string;
}

interface TravelDay {
  id: string;
  dayNumber: number;
  date: string;
  events: TravelEvent[];
}

interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: string;
  people: string;
  period: string;
  days: TravelDay[];
  likes: number;
  likedUsers: string[];
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  styleLabels?: string[]; // 여행 스타일 레이블
  aiHashtags?: string[]; // AI 추천 해시태그
  nearbyRecommendations?: Array<{
    name: string;
    description: string;
    category: string;
    distance: string;
  }>; // AI 추천 근처 관광지
  // 새로운 AI 추천 시스템용 (비용 절약을 위해 한 번만 생성)
  aiRecommendations?: {
    recommendations: Array<{
      name: string;
      description: string;
      category: string;
      distance: string;
      verified: boolean;
      source: string;
    }>;
    generatedAt: string;
    destination: string;
    visitedPlaces: string[];
    travelStyles: string[];
  };
}

const PlanPage: React.FC = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 피드 상태 관리 state
  const [feedStatus, setFeedStatus] = useState<TravelStatus>('recruiting');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentUser] = useState('current-user'); // 현재 사용자 ID (실제로는 context에서 가져와야 함)
  const [isAuthor, setIsAuthor] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);

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
    const loadTravelPlan = () => {
      let loadedPlan: TravelPlan | null = null;
      let savedPlan: string | null = null;

      try {
        // URL 파라미터에 따른 계획 로드 (우선순위: 개별 계획 > 현재 계획)
        if (id && id !== 'undefined') {
          // 1. URL 파라미터가 있으면 해당 개별 계획 로드
          console.log('🔍 개별 여행 계획 로드 시도:', id);
          savedPlan = localStorage.getItem(`plan_${id}`);

          if (savedPlan) {
            console.log('✅ 개별 계획 로드 성공:', id);
          } else {
            console.log('⚠️ 개별 계획 없음, 현재 계획으로 폴백:', id);
            // 개별 계획이 없으면 현재 계획으로 폴백
            savedPlan = localStorage.getItem('currentTravelPlan');
          }
        } else {
          // 2. URL 파라미터가 없으면 현재 계획 로드
          console.log('🔍 현재 여행 계획 로드');
          savedPlan = localStorage.getItem('currentTravelPlan');
        }

        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          loadedPlan = parsedPlan;
          setPlan(parsedPlan);
          setIsLiked(parsedPlan.isLiked || false);
          setLikeCount(parsedPlan.likes || 0);
        } else {
          // 저장된 계획이 없으면 기본 계획 사용
          const defaultPlan = createDefaultPlan();
          loadedPlan = defaultPlan;
          setPlan(defaultPlan);
          setIsLiked(defaultPlan.isLiked);
          setLikeCount(defaultPlan.likes);
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
        // 피드 상태 정보 로드
        try {
          const planId = loadedPlan?.id || 'default';
          const planNumericId =
            typeof planId === 'string' ? planId.replace(/[^\d]/g, '') : planId;
          const feedId = parseInt(String(planNumericId)) || 1;

          // 피드 상태 가져오기
          const statusInfo = feedStatusService.getFeedStatus(feedId);
          if (statusInfo) {
            setFeedStatus(statusInfo);
          }

          // 후기 작성 완료 여부 확인
          const hasReview = feedStatusService.hasReviewWritten(feedId);
          setReviewCompleted(hasReview);

          // 기존 후기 데이터 로드
          const existingReviews = JSON.parse(
            localStorage.getItem('travelReviews') || '[]',
          );
          const planReviews = existingReviews.filter(
            (review: any) =>
              review.feedId === feedId || review.planId === loadedPlan?.id,
          );
          setUserReviews(planReviews);

          // 작성자 여부 확인
          const isCurrentUserAuthor =
            loadedPlan?.author?.id === currentUser ||
            loadedPlan?.author?.name === '나' ||
            loadedPlan?.author?.name === currentUser;
          setIsAuthor(isCurrentUserAuthor);
        } catch (statusError) {
          console.error('피드 상태 로드 오류:', statusError);
        }

        setLoading(false);
      }
    };

    loadTravelPlan();
  }, [id]);

  // 피드 상태 변경 핸들러
  const handleStatusChange = (feedId: number, newStatus: TravelStatus) => {
    try {
      const success = feedStatusService.updateFeedStatus(feedId, newStatus);
      if (success) {
        setFeedStatus(newStatus);

        // 상태별 친근한 메시지
        let message = '';
        if (newStatus === 'recruiting') {
          message = '👥 모집중으로 변경되었습니다!';
        } else if (newStatus === 'traveling') {
          message = '✈️ 즐거운 여행 되세요!';
        } else if (newStatus === 'completed') {
          message = '🎉 여행이 완료되었습니다! 후기를 작성해보세요.';
        }

        alert(message);
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 후기 작성 모달 열기
  const handleOpenReviewModal = () => {
    if (feedStatus !== 'completed') {
      alert('여행이 완료된 후에 후기를 작성할 수 있습니다.');
      return;
    }

    const planId = plan?.id || 'default';
    const planNumericId =
      typeof planId === 'string' ? planId.replace(/[^\d]/g, '') : planId;
    const feedId = parseInt(String(planNumericId)) || 1;

    if (feedStatusService.hasReviewWritten(feedId)) {
      alert('이미 후기를 작성한 여행입니다.');
      return;
    }

    setReviewModalOpen(true);
  };

  // 후기 작성 완료 핸들러
  const handleReviewSubmit = (reviewData: any) => {
    try {
      const planId = plan?.id || 'default';
      const planNumericId =
        typeof planId === 'string' ? planId.replace(/[^\d]/g, '') : planId;
      const feedId = parseInt(String(planNumericId)) || 1;

      // 후기 데이터를 localStorage에 저장
      const existingReviews = JSON.parse(
        localStorage.getItem('travelReviews') || '[]',
      );
      const newReview = {
        id: Date.now(),
        feedId: feedId,
        planId: plan?.id,
        planTitle: plan?.title,
        destination: plan?.destination,
        ...reviewData,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUser,
          name: plan?.author?.name || '나',
          profileImage: plan?.author?.profileImage || '👤',
        },
      };
      existingReviews.push(newReview);
      localStorage.setItem('travelReviews', JSON.stringify(existingReviews));

      // 후기 작성 완료 표시
      feedStatusService.markReviewCompleted(feedId);

      // 상태 업데이트
      setReviewCompleted(true);
      setUserReviews((prev) => [...prev, newReview]);
      setReviewModalOpen(false);

      alert('🌟 여행 후기가 작성되었습니다!');
    } catch (error) {
      console.error('후기 작성 오류:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <S.Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: '18px',
            color: '#666',
          }}
        >
          여행 계획을 불러오는 중...
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
        </div>
      </S.Container>
    );
  }

  // 좋아요 토글 함수
  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // localStorage 업데이트
    if (plan) {
      const updatedPlan = {
        ...plan,
        isLiked: !isLiked,
        likes: isLiked ? likeCount - 1 : likeCount + 1,
      };
      localStorage.setItem('currentTravelPlan', JSON.stringify(updatedPlan));
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  // Mock 데이터 (HTML에서 참고)
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
      {/* 상단 상태 표시 - 작성자만 */}
      {isAuthor && (
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
            <S.CardTitle>예산</S.CardTitle>
            <S.CardValue>{plan.budget}</S.CardValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.CardTitle>인원</S.CardTitle>
            <S.CardValue>{plan.people}</S.CardValue>
          </S.SummaryCard>
        </S.SummaryCards>

        {/* 여행 스타일 표시 */}
        {plan.styleLabels && plan.styleLabels.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🎨 여행 스타일
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {plan.styleLabels.map((style: string, index: number) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#f0f2ff',
                    color: '#3682F8',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #e0e6ff',
                  }}
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI 추천 해시태그 */}
        {plan.aiHashtags && plan.aiHashtags.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🤖 AI 추천 해시태그
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {plan.aiHashtags.map((hashtag: string, index: number) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#e8f5e8',
                    color: '#2d5d2d',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #c3e6c3',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    // 해시태그 클릭 시 클립보드에 복사
                    navigator.clipboard?.writeText(hashtag);
                    alert('해시태그가 복사되었습니다! 📋');
                  }}
                >
                  {hashtag}
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '8px',
                fontStyle: 'italic',
              }}
            >
              💡 해시태그를 클릭하면 복사됩니다
            </p>
          </div>
        )}
      </S.MainInfo>

      {/* 타임라인 섹션 */}
      <S.Timeline>
        {plan.days.map((day) => (
          <S.DaySection key={day.id}>
            <S.DayMarker>
              <S.DayCircle>{day.dayNumber}</S.DayCircle>
              <div>
                <S.DayTitle>
                  {day.dayNumber === 1
                    ? '첫째 날'
                    : day.dayNumber === 2
                      ? '둘째 날'
                      : day.dayNumber === 3
                        ? '셋째 날'
                        : `${day.dayNumber}일째`}
                </S.DayTitle>
                <S.DayDate>{day.date}</S.DayDate>
              </div>
            </S.DayMarker>

            <S.TimelineEvents>
              {day.events.map((event) => (
                <S.Event key={event.id}>
                  <S.EventTime>{event.time}</S.EventTime>
                  <S.EventTitle>{event.title}</S.EventTitle>
                  <S.EventLocation>
                    <i className="ri-map-pin-line"></i>
                    {event.location}
                  </S.EventLocation>

                  <S.EventDescription>{event.description}</S.EventDescription>
                  <S.EventTags>
                    {event.tags.map((tag, index) => (
                      <S.Tag key={index}>{tag}</S.Tag>
                    ))}
                    <S.PriceTag>{event.price}</S.PriceTag>
                  </S.EventTags>

                  {/* 장소가 있으면 카카오맵으로 위치 표시 */}
                  {event.location && (
                    <div style={{ marginTop: '15px' }}>
                      <PlaceMap placeName={event.location} height="180px" />
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
          savedRecommendations={plan.aiRecommendations}
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
                        {review.author?.name || '익명'}
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

                  {review.selectedTags && review.selectedTags.length > 0 && (
                    <S.ReviewTags>
                      {review.selectedTags.map((tag: string, index: number) => (
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 40px',
          backgroundColor: '#f8f9fa',
          marginTop: '20px',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e9ecef',
          }}
        >
          {plan.author.profileImage}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {plan.author.name}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            여행 계획 작성자
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <S.Footer>
        <S.Likes>
          <S.LikeButton onClick={toggleLike} $isLiked={isLiked}>
            <i className={isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
            <span>{likeCount}</span>
          </S.LikeButton>
          <S.ProfileImages>{/* 좋아요한 사용자들 표시 생략 */}</S.ProfileImages>
          <S.LikeText>좋아요 누른 사람을 보기</S.LikeText>
        </S.Likes>

        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 작성자만 볼 수 있는 상태 관리 버튼 */}
          {isAuthor && (
            <>
              {feedStatus === 'recruiting' && (
                <button
                  onClick={() => {
                    const feedId = parseInt(
                      String(plan?.id?.replace(/[^\d]/g, '') || '1'),
                    );
                    handleStatusChange(feedId, 'traveling');
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
                  ✈️ 여행중
                </button>
              )}

              {feedStatus === 'traveling' && (
                <button
                  onClick={() => {
                    const feedId = parseInt(
                      String(plan?.id?.replace(/[^\d]/g, '') || '1'),
                    );
                    handleStatusChange(feedId, 'completed');
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
                  ✅ 여행완료
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
          feedId={parseInt(String(plan.id?.replace(/[^\d]/g, '') || '1'))}
          planId={plan.id}
          destination={plan.destination}
          onClose={() => setReviewModalOpen(false)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </S.Container>
  );
};

export default PlanPage;
