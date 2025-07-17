import React, { useState, useEffect } from 'react';
import KakaoMap from '../components/KakaoMap';
import { MarkerData } from '../types/kakao';
import './MatchRecommendPage.css';

interface Activity {
  time: string;
  title: string;
  description?: string;
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

// 매칭 사용자 인터페이스
interface MatchingUser {
  id: number;
  name: string;
  age: number;
  location: string;
  profileImage: string;
  destination: string;
  duration: string;
  budget: string;
  travelStyle: string[];
  coordinates: { lat: number; lng: number };
  maxMembers: number;
  currentMembers: number;
  travelPlan: DayPlan[];
}

// 필터 상태 인터페이스
interface FilterState {
  destination: string;
  duration: string;
  style: string;
  groupSize: string;
  budget: string;
  gender: string;
  age: string;
}

const MatchRecommendPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    destination: '',
    duration: '',
    style: '',
    groupSize: '',
    budget: '',
    gender: '',
    age: '',
  });

  // 여행 일정 페이지네이션 상태
  const [planPage, setPlanPage] = useState(0);

  // 사용자가 변경될 때마다 여행 일정 페이지를 0으로 초기화
  useEffect(() => {
    setPlanPage(0);
  }, [currentIndex]);

  // 더미 사용자 데이터
  const users: MatchingUser[] = [
    {
      id: 1,
      name: '김민수',
      age: 25,
      location: '서울',
      profileImage: 'https://i.pravatar.cc/100?u=1',
      destination: '제주도',
      duration: '3박 4일',
      budget: '₩850,000',
      travelStyle: ['힐링', '자연', '맛집탐방'],
      coordinates: { lat: 33.3607, lng: 126.5312 },
      maxMembers: 4,
      currentMembers: 2,
      travelPlan: [
        {
          day: 1,
          activities: [
            {
              time: '13:00',
              title: '제주공항 도착',
              description: '렌트카 픽업 후 이동',
            },
            {
              time: '14:00',
              title: '점심: 흑돼지 전문점',
              description: '유명한 현지 맛집 방문',
            },
            {
              time: '16:00',
              title: '성산일출봉 등반',
              description: '가벼운 트래킹 코스',
            },
            {
              time: '19:00',
              title: '저녁: 해물라면',
              description: '해변가에서 일몰 감상',
            },
          ],
        },
        {
          day: 2,
          activities: [
            {
              time: '10:00',
              title: '우도 탐방',
              description: '전기 자전거 대여하여 섬 한바퀴',
            },
            {
              time: '12:30',
              title: '점심: 땅콩 아이스크림 & 해물짬뽕',
              description: '우도 명물 맛보기',
            },
            {
              time: '15:00',
              title: '섭지코지 산책',
              description: '아름다운 해안 절경 감상',
            },
            {
              time: '18:00',
              title: '저녁: 동문 야시장',
              description: '다양한 길거리 음식 체험',
            },
          ],
        },
        {
          day: 3,
          activities: [
            {
              time: '09:00',
              title: '한라산 등반 (영실코스)',
              description: '약 3-4시간 소요 예상',
            },
            {
              time: '13:00',
              title: '점심: 근처 백숙집',
              description: '등산 후 든든한 식사',
            },
            {
              time: '15:30',
              title: '이중섭 거리 구경',
              description: '예술 작품 감상 및 카페',
            },
            {
              time: '18:30',
              title: '저녁: 올레시장',
              description: '시장 구경 및 저녁 식사',
            },
          ],
        },
        {
          day: 4,
          activities: [
            {
              time: '10:30',
              title: '애월 카페거리 방문',
              description: '오션뷰 카페에서 브런치',
            },
            {
              time: '13:00',
              title: '기념품 쇼핑',
              description: '마음샌드, 특산품 등 구매',
            },
            {
              time: '15:00',
              title: '제주공항 출발',
              description: '여행 마무리',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: '이수진',
      age: 28,
      location: '부산',
      profileImage: 'https://i.pravatar.cc/100?u=2',
      destination: '부산',
      duration: '2박 3일',
      budget: '₩600,000',
      travelStyle: ['액티비티', '야경', '카페투어'],
      coordinates: { lat: 35.1796, lng: 129.0756 },
      maxMembers: 3,
      currentMembers: 1,
      travelPlan: [
        {
          day: 1,
          activities: [
            {
              time: '12:00',
              title: '부산역 도착',
              description: '숙소에 짐 맡기기',
            },
            {
              time: '13:00',
              title: '점심: 돼지국밥',
              description: '부산 대표 음식',
            },
            {
              time: '15:00',
              title: '광안리 해수욕장',
              description: '해변 산책 및 카페',
            },
            {
              time: '18:00',
              title: '저녁: 해변가 조개구이',
              description: '광안대교 야경 감상',
            },
          ],
        },
        {
          day: 2,
          activities: [
            {
              time: '10:00',
              title: '감천문화마을',
              description: '인생샷 스팟 탐방',
            },
            {
              time: '13:00',
              title: '점심: 씨앗호떡',
              description: '남포동 BIFF 거리',
            },
            { time: '16:00', title: '태종대', description: '다누비 열차 탑승' },
            {
              time: '19:00',
              title: '저녁: 서면',
              description: '젊음의 거리에서 자유시간',
            },
          ],
        },
        {
          day: 3,
          activities: [
            {
              time: '10:00',
              title: '해동용궁사',
              description: '바다 위의 사찰',
            },
            { time: '12:00', title: '점심: 근처 해물칼국수' },
            { time: '14:00', title: '부산역 출발' },
          ],
        },
      ],
    },
  ];

  const currentUser = users.length > 0 ? users[currentIndex] : null;

  if (!currentUser) {
    return <div>매칭 가능한 사용자가 없습니다.</div>;
  }

  // 여행 일정 페이지네이션 계산
  const plansPerPage = 3;
  const totalPlanPages = Math.ceil(
    currentUser.travelPlan.length / plansPerPage,
  );
  const paginatedPlans = currentUser.travelPlan.slice(
    planPage * plansPerPage,
    (planPage + 1) * plansPerPage,
  );

  // 지도 마커 데이터 생성
  const markerData: MarkerData[] = [
    {
      id: currentUser.id.toString(),
      position: {
        lat: currentUser.coordinates.lat,
        lng: currentUser.coordinates.lng,
      },
      title: currentUser.destination,
      description: currentUser.name,
      category: 'attraction' as const,
    },
  ];

  // 다음 사용자로 이동
  const nextUser = () => {
    setCurrentIndex((prev) => (prev + 1) % users.length);
  };

  // 이전 사용자로 이동
  const prevUser = () => {
    setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
  };

  // 좋아요 처리
  const handleLike = () => {
    console.log(`${currentUser.name}님을 좋아요!`);
    nextUser();
  };

  // 패스 처리
  const handlePass = () => {
    console.log(`${currentUser.name}님을 패스`);
    nextUser();
  };

  // 필터 적용
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      destination: '',
      duration: '',
      style: '',
      groupSize: '',
      budget: '',
      gender: '',
      age: '',
    });
  };

  // 거절 처리
  const handleReject = () => {
    console.log(`${currentUser.name}님을 거절`);
    nextUser();
  };

  const toggleFilterModal = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="match-recommend-page">
      <div className="page-header">
        <h1>매칭 추천</h1>
        <button onClick={toggleFilterModal} className="filter-icon-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
          </svg>
        </button>
      </div>

      <div className="main-content">
        {/* Pass 버튼 */}
        <div className="side-action">
          <button onClick={handlePass} className="action-button pass-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="card-container">
          <div className="user-card">
            <div className="card-header">
              <div className="header-profile">
                <img
                  src={currentUser.profileImage}
                  alt={`${currentUser.name} 프로필`}
                  className="header-profile-image"
                />
                <div className="header-profile-info">
                  <h2>
                    {currentUser.name}, {currentUser.age}세
                  </h2>
                  <p>{currentUser.location}</p>
                </div>
              </div>
              <div className="header-right">
                <span className="recruitment-status">
                  <span className="current-members">
                    {currentUser.currentMembers}
                  </span>
                  /{currentUser.maxMembers}명
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="map-section">
                <KakaoMap
                  center={currentUser.coordinates}
                  markers={[
                    {
                      id: `marker-${currentUser.id}`,
                      position: currentUser.coordinates,
                      title: currentUser.destination,
                      category: 'attraction' as const,
                    },
                  ]}
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="tags-overlay">
                  {currentUser.travelStyle.map((style, index) => (
                    <span key={index} className="tag">
                      #{style}
                    </span>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span className="info-value">{currentUser.destination}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span className="info-value">{currentUser.duration}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">💰</span>
                  <span className="info-value">{currentUser.budget}</span>
                </div>
              </div>

              <div className="plan-section">
                <h3>여행 일정 📝</h3>
                <div className="timeline-horizontal-scroll">
                  <div className="timeline-container">
                    {paginatedPlans.map((plan, index) => (
                      <div key={index} className="day-column">
                        <div className="day-header">
                          <span className="day-badge">DAY {plan.day}</span>
                        </div>
                        <ul className="activity-list">
                          {plan.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="activity-item">
                              <div className="activity-time">
                                {activity.time}
                              </div>
                              <div className="activity-content">
                                <div className="activity-title">
                                  {activity.title}
                                </div>
                                {activity.description && (
                                  <div className="activity-description">
                                    {activity.description}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 여행 일정 페이지네이션 */}
                {totalPlanPages > 1 && (
                  <div className="plan-pagination">
                    {Array.from({ length: totalPlanPages }, (_, i) => (
                      <button
                        key={i}
                        className={`page-button ${
                          planPage === i ? 'active' : ''
                        }`}
                        onClick={() => setPlanPage(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Like 버튼 */}
        <div className="side-action">
          <button onClick={handleLike} className="action-button like-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="1"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-modal-overlay" onClick={toggleFilterModal}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <h2>필터</h2>
            <div className="filter-options">
              <div className="filter-group">
                <label>여행지</label>
                <select
                  value={filters.destination}
                  onChange={(e) =>
                    handleFilterChange('destination', e.target.value)
                  }
                >
                  <option value="">전체</option>
                  <option value="제주도">제주도</option>
                  <option value="부산">부산</option>
                  <option value="강릉">강릉</option>
                  <option value="서울">서울</option>
                </select>
              </div>

              <div className="filter-group">
                <label>여행 기간</label>
                <select
                  value={filters.duration}
                  onChange={(e) =>
                    handleFilterChange('duration', e.target.value)
                  }
                >
                  <option value="">전체</option>
                  <option value="1-2일">1-2일</option>
                  <option value="3-4일">3-4일</option>
                  <option value="5-7일">5-7일</option>
                  <option value="1주일 이상">1주일 이상</option>
                </select>
              </div>

              <div className="filter-group">
                <label>여행 스타일</label>
                <select
                  value={filters.style}
                  onChange={(e) => handleFilterChange('style', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="힐링">힐링</option>
                  <option value="액티비티">액티비티</option>
                  <option value="문화">문화</option>
                  <option value="맛집">맛집</option>
                </select>
              </div>

              <div className="filter-group">
                <label>인원수</label>
                <select
                  value={filters.groupSize}
                  onChange={(e) =>
                    handleFilterChange('groupSize', e.target.value)
                  }
                >
                  <option value="">전체</option>
                  <option value="2명">2명</option>
                  <option value="3-4명">3-4명</option>
                  <option value="5명 이상">5명 이상</option>
                </select>
              </div>

              <div className="filter-group">
                <label>예산</label>
                <select
                  value={filters.budget}
                  onChange={(e) => handleFilterChange('budget', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="10만원 이하">10만원 이하</option>
                  <option value="10-30만원">10-30만원</option>
                  <option value="30-50만원">30-50만원</option>
                  <option value="50만원 이상">50만원 이상</option>
                </select>
              </div>

              <div className="filter-group">
                <label>성별</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>

              <div className="filter-group">
                <label>나이</label>
                <select
                  value={filters.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="50대 이상">50대 이상</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="reset-button" onClick={resetFilters}>
                초기화
              </button>
              <button
                className="apply-button"
                onClick={() => setIsFilterOpen(false)}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchRecommendPage;
