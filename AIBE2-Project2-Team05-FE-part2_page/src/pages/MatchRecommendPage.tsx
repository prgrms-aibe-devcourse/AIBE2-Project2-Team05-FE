import React, { useState, useEffect, useMemo } from 'react';
import KakaoMap from '../components/KakaoMap';
import {
  MarkerData,
  PlaceSearchResult,
  KakaoPlacesService,
} from '../types/kakao';
import { getPlaceImageByCategory } from '../services/unsplashApi';
import { getPlaceImageFromBackend } from '../services/backendPlacesApi';
import mockUsers from '../data/mockUsers.json';
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
  gender: string; // 성별 필드 추가
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
  // 선택된 Day 상태 (지도에 해당 Day 장소들을 표시하기 위함)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  // 키워드 검색으로 찾은 마커들을 캐시
  const [searchedMarkers, setSearchedMarkers] = useState<{
    [key: string]: MarkerData[];
  }>({});
  // 장소 검색 로딩 상태
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  // 지도 인스턴스 참조
  const [mapInstance, setMapInstance] = useState<any>(null);
  // 선택된 마커 정보 (정보창 표시용)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  // 선택된 마커의 상세 정보
  const [markerDetail, setMarkerDetail] = useState<{
    photos: string[];
    place_url: string;
    phone: string;
  } | null>(null);

  // 사용자가 변경될 때마다 여행 일정 페이지를 0으로 초기화
  useEffect(() => {
    setPlanPage(0);
    setSelectedDay(null); // 선택된 Day도 초기화
    setSearchedMarkers({}); // 검색된 마커 캐시도 초기화
  }, [currentIndex]);

  // 더미 사용자 데이터 (JSON 파일에서 import)
  const allUsers: MatchingUser[] = mockUsers as MatchingUser[];

  // 키워드로 장소를 검색하는 함수
  const searchPlaceByKeyword = (
    keyword: string,
    centerCoords: { lat: number; lng: number },
    activityId: string,
  ): Promise<MarkerData | null> => {
    return new Promise((resolve) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.warn('카카오맵 서비스가 로드되지 않았습니다.');
        resolve(null);
        return;
      }

      const places: KakaoPlacesService =
        new window.kakao.maps.services.Places();
      const centerLocation = new window.kakao.maps.LatLng(
        centerCoords.lat,
        centerCoords.lng,
      );

      places.keywordSearch(
        keyword,
        (result: PlaceSearchResult[], status: any) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            const place = result[0]; // 첫 번째 검색 결과 사용
            const marker: MarkerData = {
              id: activityId,
              position: {
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
              },
              title: place.place_name,
              description: place.address_name,
              category: getCategoryFromPlace(place.category_name),
            };
            resolve(marker);
          } else {
            console.warn(`장소 검색 실패: ${keyword}`);
            resolve(null);
          }
        },
        {
          location: centerLocation,
          radius: 20000, // 20km 반경 내에서 검색
          size: 1, // 첫 번째 결과만 가져오기
        },
      );
    });
  };

  // 카카오맵 카테고리를 우리 카테고리로 변환
  const getCategoryFromPlace = (
    categoryName: string,
  ): MarkerData['category'] => {
    if (categoryName.includes('음식점') || categoryName.includes('카페')) {
      return 'food';
    } else if (categoryName.includes('숙박')) {
      return 'accommodation';
    } else if (categoryName.includes('관광') || categoryName.includes('명소')) {
      return 'attraction';
    } else {
      return 'other';
    }
  };

  // 모든 마커들이 보이도록 지도 뷰를 조정하는 함수
  const fitMapToMarkers = (markers: MarkerData[]) => {
    if (!mapInstance || !window.kakao || markers.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    // 모든 마커의 좌표를 bounds에 추가
    markers.forEach((marker) => {
      bounds.extend(
        new window.kakao.maps.LatLng(marker.position.lat, marker.position.lng),
      );
    });

    // 지도를 bounds에 맞게 조정
    mapInstance.setBounds(bounds);
  };

  // 장소 상세 정보를 가져오는 함수
  const fetchPlaceDetail = async (
    placeName: string,
    position: { lat: number; lng: number },
  ) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      return null;
    }

    return new Promise<any>((resolve) => {
      const places = new window.kakao.maps.services.Places();

      places.keywordSearch(
        placeName,
        (result: any[], status: any) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            // 가장 가까운 장소 찾기
            const closestPlace = result.reduce((closest, current) => {
              const closestDistance =
                Math.abs(parseFloat(closest.y) - position.lat) +
                Math.abs(parseFloat(closest.x) - position.lng);
              const currentDistance =
                Math.abs(parseFloat(current.y) - position.lat) +
                Math.abs(parseFloat(current.x) - position.lng);
              return currentDistance < closestDistance ? current : closest;
            });

            resolve(closestPlace);
          } else {
            resolve(null);
          }
        },
        {
          location: new window.kakao.maps.LatLng(position.lat, position.lng),
          radius: 1000,
          size: 5,
        },
      );
    });
  };

  // 마커 클릭 핸들러
  const handleMarkerClick = async (marker: MarkerData) => {
    setSelectedMarker(marker);
    setMarkerDetail(null); // 이전 정보 초기화

    // 장소 상세 정보 가져오기
    const placeDetail = await fetchPlaceDetail(marker.title, marker.position);

    if (placeDetail) {
      const photos: string[] = [];

      try {
        // 먼저 백엔드 Google Places API 시도
        const backendImageUrl = await getPlaceImageFromBackend(
          marker.title,
          marker.position.lat,
          marker.position.lng,
        );

        if (backendImageUrl) {
          // 이미지가 없는 경우 처리
          if (backendImageUrl === 'NO_IMAGE') {
            photos.push(
              'https://via.placeholder.com/400x300/cccccc/666666?text=이미지+없음',
            );
          } else {
            photos.push(backendImageUrl);
          }
        } else {
          // 백엔드에서 이미지를 가져오지 못한 경우 Unsplash API 사용
          const unsplashImageUrl = await getPlaceImageByCategory(
            marker.title,
            placeDetail.category_name,
          );
          photos.push(unsplashImageUrl);
        }
      } catch (error) {
        console.error('이미지 로드 중 오류:', error);
        // 오류 발생 시 기본 이미지 사용
        photos.push(
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80',
        );
      }

      setMarkerDetail({
        photos,
        place_url: placeDetail.place_url,
        phone: placeDetail.phone || '정보 없음',
      });
    }
  };

  // 선택된 Day의 장소들을 지도 마커로 변환하는 함수
  const getMarkersForSelectedDay = (user: MatchingUser): MarkerData[] => {
    if (selectedDay === null) {
      // Day가 선택되지 않았으면 마커를 표시하지 않음
      return [];
    }

    // 캐시된 마커가 있으면 반환
    const cacheKey = `${user.id}-${selectedDay}`;
    if (searchedMarkers[cacheKey]) {
      // 캐시된 마커들이 있을 때도 지도 뷰 조정
      setTimeout(() => {
        if (searchedMarkers[cacheKey].length > 0) {
          fitMapToMarkers(searchedMarkers[cacheKey]);
        }
      }, 100); // 약간의 지연을 주어 렌더링 완료 후 실행
      return searchedMarkers[cacheKey];
    }

    // 검색 중일 때는 마커를 표시하지 않음
    return [];
  };

  // 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesDestination =
        filters.destination === '' || user.destination === filters.destination;
      const matchesDuration =
        filters.duration === '' || user.duration === filters.duration;
      const matchesStyle =
        filters.style === '' ||
        user.travelStyle.some((style) => style === filters.style);
      const matchesGroupSize =
        filters.groupSize === '' ||
        user.maxMembers.toString() === filters.groupSize;
      const matchesBudget =
        filters.budget === '' || user.budget === filters.budget;
      const matchesGender =
        filters.gender === '' || user.gender === filters.gender;
      const matchesAge =
        filters.age === '' || user.age.toString() === filters.age;

      return (
        matchesDestination &&
        matchesDuration &&
        matchesStyle &&
        matchesGroupSize &&
        matchesBudget &&
        matchesGender &&
        matchesAge
      );
    });
  }, [allUsers, filters]);

  const currentUser =
    filteredUsers.length > 0 ? filteredUsers[currentIndex] : null;

  // 선택된 Day가 변경될 때 장소 검색 수행
  useEffect(() => {
    if (selectedDay === null || !currentUser) return;

    const cacheKey = `${currentUser.id}-${selectedDay}`;

    // 이미 캐시된 결과가 있으면 검색하지 않음
    if (searchedMarkers[cacheKey]) return;

    // 선택된 Day의 활동들을 찾음
    const selectedDayPlan = currentUser.travelPlan.find(
      (plan) => plan.day === selectedDay,
    );
    if (!selectedDayPlan) return;

    // 검색 시작
    setIsSearchingPlaces(true);

    // 키워드 검색으로 실제 장소 좌표를 찾아서 마커 생성
    const searchPromises = selectedDayPlan.activities.map((activity, index) => {
      const activityId = `activity-${currentUser.id}-${selectedDay}-${index}`;

      // 검색 키워드 최적화: 불필요한 단어 제거 및 목적지 추가
      let searchKeyword = activity.title
        .replace(/^(점심:|저녁:|아침:|브런치:)/g, '') // 시간 관련 접두사 제거
        .replace(/\s+/g, ' ') // 여러 공백을 하나로
        .trim();

      // 목적지와 함께 검색하여 정확도 향상
      searchKeyword = `${currentUser.destination} ${searchKeyword}`;

      return searchPlaceByKeyword(
        searchKeyword,
        currentUser.coordinates,
        activityId,
      );
    });

    // 모든 검색이 완료되면 마커 업데이트
    Promise.all(searchPromises)
      .then((results) => {
        const validMarkers = results.filter(
          (marker): marker is MarkerData => marker !== null,
        );

        // 실제 방문 장소들만 마커로 표시 (기본 목적지 마커 제외)
        const allMarkers = validMarkers;

        // 캐시에 저장
        setSearchedMarkers((prev) => ({
          ...prev,
          [cacheKey]: allMarkers,
        }));

        // 검색 완료
        setIsSearchingPlaces(false);

        // 모든 마커들이 보이도록 지도 뷰 조정
        if (allMarkers.length > 0) {
          fitMapToMarkers(allMarkers);
        }
      })
      .catch(() => {
        // 검색 실패 시에도 로딩 상태 해제
        setIsSearchingPlaces(false);
      });
  }, [selectedDay, currentUser, searchedMarkers]);

  // 함수 정의들을 여기로 이동
  const toggleFilterModal = () => {
    setIsFilterOpen(!isFilterOpen);
  };

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
    setCurrentIndex(0);
  };

  // 빈 상태 처리
  if (!currentUser) {
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

        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>매칭 가능한 사용자가 없습니다</h2>
          <p>필터 조건을 변경하여 더 많은 사용자를 찾아보세요.</p>
          <button onClick={resetFilters} className="reset-filters-btn">
            필터 초기화
          </button>
        </div>

        {/* 필터 모달 */}
        {isFilterOpen && (
          <div className="filter-modal">
            <div className="filter-content">
              <div className="filter-header">
                <h3>필터</h3>
                <button onClick={toggleFilterModal} className="close-button">
                  ×
                </button>
              </div>

              <div className="filter-body">
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
                    <option value="경주">경주</option>
                    <option value="강릉">강릉</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>기간</label>
                  <select
                    value={filters.duration}
                    onChange={(e) =>
                      handleFilterChange('duration', e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="2박 3일">2박 3일</option>
                    <option value="3박 4일">3박 4일</option>
                    <option value="4박 5일">4박 5일</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>여행 스타일</label>
                  <select
                    value={filters.style}
                    onChange={(e) =>
                      handleFilterChange('style', e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="힐링">힐링</option>
                    <option value="액티비티">액티비티</option>
                    <option value="문화">문화</option>
                    <option value="자연">자연</option>
                    <option value="맛집탐방">맛집탐방</option>
                    <option value="바다">바다</option>
                    <option value="카페">카페</option>
                    <option value="역사">역사</option>
                    <option value="모험">모험</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>인원</label>
                  <select
                    value={filters.groupSize}
                    onChange={(e) =>
                      handleFilterChange('groupSize', e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="2">2명</option>
                    <option value="3">3명</option>
                    <option value="4">4명</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>성별</label>
                  <select
                    value={filters.gender}
                    onChange={(e) =>
                      handleFilterChange('gender', e.target.value)
                    }
                  >
                    <option value="">전체</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
              </div>

              <div className="filter-footer">
                <button onClick={resetFilters} className="reset-button">
                  초기화
                </button>
                <button onClick={toggleFilterModal} className="apply-button">
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
    setCurrentIndex((prev) => (prev + 1) % filteredUsers.length);
  };

  // 이전 사용자로 이동
  const prevUser = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length,
    );
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

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    // 필터 변경 시 인덱스 초기화
    setCurrentIndex(0);
  };

  // 거절 처리
  const handleReject = () => {
    console.log(`${currentUser.name}님을 거절`);
    nextUser();
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
                    {currentUser.name} {currentUser.age}세
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
                  level={8}
                  markers={getMarkersForSelectedDay(currentUser)}
                  style={{ width: '100%', height: '100%' }}
                  onCreate={setMapInstance}
                  onMarkerClick={handleMarkerClick}
                />
                <div className="tags-overlay">
                  {currentUser.travelStyle.map((style, index) => (
                    <span key={index} className="tag">
                      #{style}
                    </span>
                  ))}
                  {selectedDay && (
                    <div className="selected-day-info">
                      <span className="selected-day-text">
                        📍 DAY {selectedDay} 일정
                        {isSearchingPlaces && (
                          <span className="loading-dots">...</span>
                        )}
                      </span>
                    </div>
                  )}
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
                          <button
                            className={`day-badge ${selectedDay === plan.day ? 'selected' : ''}`}
                            onClick={() =>
                              setSelectedDay(
                                selectedDay === plan.day ? null : plan.day,
                              )
                            }
                          >
                            DAY {plan.day}
                          </button>
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

      {/* 마커 정보 모달 */}
      {selectedMarker && (
        <div
          className="marker-info-modal"
          onClick={() => setSelectedMarker(null)}
        >
          <div
            className="marker-info-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="marker-info-header">
              <h3>{selectedMarker.title}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedMarker(null)}
              >
                ×
              </button>
            </div>

            <div className="marker-info-body">
              {markerDetail ? (
                <>
                  {markerDetail.photos.length > 0 && (
                    <div className="marker-images">
                      {markerDetail.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={selectedMarker.title}
                          className="marker-image"
                        />
                      ))}
                    </div>
                  )}

                  <div className="marker-details">
                    <p>
                      <strong>📍 위치:</strong>{' '}
                      {selectedMarker.description || '정보 없음'}
                    </p>
                    <p>
                      <strong>📞 전화:</strong> {markerDetail.phone}
                    </p>
                    {markerDetail.place_url && (
                      <a
                        href={markerDetail.place_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="place-link"
                      >
                        카카오맵에서 보기 →
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="loading-detail">
                  <p>장소 정보를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchRecommendPage;
