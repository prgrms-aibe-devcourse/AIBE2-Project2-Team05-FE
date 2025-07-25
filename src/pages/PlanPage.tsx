import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as S from './PlanPage.style';
import PlaceMap from '../components/PlaceMap';
import LikesModal from '../components/common/LikesModal';

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
}

const PlanPage: React.FC = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // 좋아요 모달 상태 관리
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

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
      try {
        // localStorage에서 저장된 계획 불러오기
        const savedPlan = localStorage.getItem('currentTravelPlan');

        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          setPlan(parsedPlan);
          setIsLiked(parsedPlan.isLiked || false);
          setLikeCount(parsedPlan.likes || 0);
        } else {
          // 저장된 계획이 없으면 기본 계획 사용
          const defaultPlan = createDefaultPlan();
          setPlan(defaultPlan);
          setIsLiked(defaultPlan.isLiked);
          setLikeCount(defaultPlan.likes);
        }
      } catch (error) {
        console.error('여행 계획 로드 중 오류:', error);
        // 오류 시 기본 계획 사용
        const defaultPlan = createDefaultPlan();
        setPlan(defaultPlan);
        setIsLiked(defaultPlan.isLiked);
        setLikeCount(defaultPlan.likes);
      } finally {
        setLoading(false);
      }
    };

    loadTravelPlan();
  }, [id]);

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
      profileImage: '/images/author.jpg',
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
  };

  // 카테고리별 색상 함수
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '맛집':
        return { bg: '#fff3e0', text: '#f57c00' }; // 오렌지 계열
      case '액티비티':
        return { bg: '#e8f5e8', text: '#2d5d2d' }; // 초록 계열
      case '관광명소':
        return { bg: '#e0e6ff', text: '#3682F8' }; // 파랑 계열
      // 기존 카테고리들 (하위 호환성)
      case 'food':
        return { bg: '#fff3e0', text: '#f57c00' };
      case 'nature':
      case 'beach':
        return { bg: '#e8f5e8', text: '#2d5d2d' };
      case 'culture':
      case 'tourism':
        return { bg: '#e0e6ff', text: '#3682F8' };
      case 'wellness':
        return { bg: '#f3e5f5', text: '#7b1fa2' }; // 보라 계열
      case 'transportation':
        return { bg: '#e3f2fd', text: '#1976d2' }; // 연파랑 계열
      case 'accommodation':
        return { bg: '#f1f8e9', text: '#689f38' }; // 연초록 계열
      case 'entertainment':
        return { bg: '#fce4ec', text: '#c2185b' }; // 핑크 계열
      default:
        return { bg: '#f5f5f5', text: '#666' }; // 회색 계열
    }
  };

  return (
    <S.Container>
      {/* 메인 정보 섹션 */}
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

      {/* AI 추천 근처 관광지 */}
      {plan.nearbyRecommendations && plan.nearbyRecommendations.length > 0 && (
        <div
          style={{
            margin: '30px 40px',
            padding: '25px',
            backgroundColor: '#fafbfc',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎯 AI 추천 근처 가볼만한 곳
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px',
            }}
          >
            {plan.nearbyRecommendations.map((place: any, index: number) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(0,0,0,0.05)';
                }}
                onClick={() => {
                  // 장소명으로 검색 (나중에 구글맵 연동 가능)
                  window.open(
                    `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`,
                    '_blank',
                  );
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      margin: '0',
                    }}
                  >
                    {place.name}
                  </h4>
                  <span
                    style={{
                      backgroundColor: getCategoryColor(place.category).bg,
                      color: getCategoryColor(place.category).text,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {place.category}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4',
                    margin: '0 0 8px 0',
                  }}
                >
                  {place.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: '#888',
                  }}
                >
                  <span>📍</span>
                  <span>{place.distance}</span>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '15px',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            💡 장소를 클릭하면 Google 지도에서 확인할 수 있습니다
          </p>
        </div>
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
          <S.LikeText onClick={() => setIsLikesModalOpen(true)}>
            좋아요 누른 사람을 보기
          </S.LikeText>
        </S.Likes>
        <S.ShareButton>
          <i className="ri-share-line"></i>
          공유하기
        </S.ShareButton>
      </S.Footer>

      {/* 좋아요 누른 사람들 모달 */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        title={plan?.title || "여행 계획"}
        likesCount={likeCount}
      />
    </S.Container>
  );
};

export default PlanPage;
