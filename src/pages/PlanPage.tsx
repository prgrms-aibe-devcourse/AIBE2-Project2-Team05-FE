import React, { useState } from 'react';
import { TravelPlan } from '../types/plan';
import * as S from './PlanPage.style';

// 여행 계획 페이지 컴포넌트
const PlanPage: React.FC = () => {
  // 좋아요 상태를 관리하는 state - 사용자가 좋아요를 눌렀는지 여부
  const [isLiked, setIsLiked] = useState(false);

  // 좋아요 수를 관리하는 state - 총 좋아요 수
  const [likeCount, setLikeCount] = useState(42);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // 날짜 포맷팅 함수 - "2023-06-15" 형태를 "2023년 6월 15일 (목)" 형태로 변환
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

  // 모킹 데이터 - 실제 서비스에서는 API에서 가져올 데이터
  const mockPlan: TravelPlan = {
    id: '1',
    title: '제주도 힐링 여행',
    startDate: '2023-06-15',
    endDate: '2023-06-17',
    summaryCards: [
      { title: '여행 기간', value: '2박 3일' },
      { title: '총 비용', value: '₩450,000' },
      { title: '방문 장소', value: '12곳' },
      { title: '이동 거리', value: '180km' },
    ],
    days: [
      {
        id: 'day1',
        dayNumber: 1,
        date: '2023-06-15',
        events: [
          {
            id: 'event1',
            time: '09:00',
            title: '제주공항 도착',
            location: '제주국제공항',
            description: '제주국제공항에 도착하여 렌터카를 픽업합니다.',
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
            title: '제주공항 출발',
            location: '제주국제공항',
            description:
              '즐거웠던 제주 여행을 마치고 공항으로 향합니다. 렌터카를 반납하고 항공편을 이용합니다.',
            tags: ['교통'],
            price: '무료',
            category: 'transport',
          },
        ],
      },
    ],
    likes: likeCount,
    likedUsers: ['/images/user1.jpg', '/images/user2.jpg', '/images/user3.jpg'],
    isLiked: isLiked,
    author: {
      id: 'author1',
      name: '여행러버',
      profileImage: '/images/author.jpg',
    },
  };

  // 이벤트 렌더링 함수
  const renderEvent = (event: any) => (
    <S.Event key={event.id}>
      <S.EventTime>{event.time}</S.EventTime>
      <S.EventTitle>{event.title}</S.EventTitle>
      <S.EventLocation>
        <i className="ri-map-pin-line"></i>
        {event.location}
      </S.EventLocation>
      <S.EventDescription>{event.description}</S.EventDescription>

      {/* 이벤트에 이미지가 있는 경우 디테일 박스 표시 */}
      {event.imageUrl && (
        <S.EventDetails>
          <S.EventImage>
            <img src={event.imageUrl} alt={event.title} />
          </S.EventImage>
          <S.EventDescription>{event.description}</S.EventDescription>
        </S.EventDetails>
      )}

      {/* 태그들 표시 */}
      <S.EventTags>
        {event.tags.map((tag: string, index: number) => (
          <S.Tag key={index}>{tag}</S.Tag>
        ))}
        <S.PriceTag>{event.price}</S.PriceTag>
      </S.EventTags>
    </S.Event>
  );

  return (
    <S.PlanPageContainer>
      {/* 여행 정보 섹션 */}
      <S.TripInfoSection>
        <S.TripTitle>{mockPlan.title}</S.TripTitle>
        <S.TripDate>
          {formatDate(mockPlan.startDate)} ~ {formatDate(mockPlan.endDate)}
        </S.TripDate>

        {/* 요약 카드들 */}
        <S.SummaryCards>
          {mockPlan.summaryCards.map((card, index) => (
            <S.SummaryCard key={index}>
              <S.CardTitle>{card.title}</S.CardTitle>
              <S.CardValue>{card.value}</S.CardValue>
            </S.SummaryCard>
          ))}
        </S.SummaryCards>
      </S.TripInfoSection>

      {/* 타임라인 섹션 */}
      <S.TimelineSection>
        {mockPlan.days.map((day) => (
          <S.DaySection key={day.id}>
            <S.DayMarker>
              <S.DayCircle>{day.dayNumber}</S.DayCircle>
              <S.DayTitle>
                {day.dayNumber === 1
                  ? '첫째 날'
                  : day.dayNumber === 2
                    ? '둘째 날'
                    : '셋째 날'}
              </S.DayTitle>
              <S.DayDate>{formatDate(day.date)}</S.DayDate>
            </S.DayMarker>

            <S.TimelineEvents>{day.events.map(renderEvent)}</S.TimelineEvents>
          </S.DaySection>
        ))}
      </S.TimelineSection>

      {/* 푸터 - 좋아요 기능 */}
      <S.PlanFooter>
        <S.LikesSection>
          <S.LikeButton
            onClick={handleLikeClick}
            className={isLiked ? 'liked' : ''}
          >
            <i className={isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
            {likeCount}
          </S.LikeButton>

          <S.ProfileImages>
            {mockPlan.likedUsers.slice(0, 3).map((userImage, index) => (
              <S.ProfileImage key={index}>
                <img src={userImage} alt={`User ${index + 1}`} />
              </S.ProfileImage>
            ))}
          </S.ProfileImages>

          <S.LikeText>{mockPlan.likedUsers.length}명이 좋아합니다</S.LikeText>
        </S.LikesSection>
      </S.PlanFooter>
    </S.PlanPageContainer>
  );
};

export default PlanPage;
