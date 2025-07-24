import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import KakaoMap from '../components/KakaoMap';
import {
  MarkerData,
  PlaceSearchResult,
  KakaoPlacesService,
} from '../types/kakao';

import { getPlaceImageFromBackend } from '../services/backendPlacesApi';
import feedStatusService from '../services/feedStatusService';
// import { generateMockUserFeeds } from '../data/mockProfileData'; // Mock 데이터 생성 비활성화로 제거
import matePostService from '../services/matePostService'; // 추가
import travelPlanApiService from '../services/travelPlanApi'; // 백엔드 API 연결

interface Activity {
  time: string;
  title: string;
  description?: string;
  place?: string; // 실제 장소명 추가 (지도 검색용)
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

// 목적지별 기본 좌표 (대한민국 주요 도시)
const getDestinationCoordinates = (
  destination: string,
): { lat: number; lng: number } => {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    서울: { lat: 37.5665, lng: 126.978 },
    부산: { lat: 35.1796, lng: 129.0756 },
    대구: { lat: 35.8714, lng: 128.6014 },
    인천: { lat: 37.4563, lng: 126.7052 },
    광주: { lat: 35.1595, lng: 126.8526 },
    대전: { lat: 36.3504, lng: 127.3845 },
    울산: { lat: 35.5384, lng: 129.3114 },
    제주도: { lat: 33.4996, lng: 126.5312 },
    제주: { lat: 33.4996, lng: 126.5312 },
    강릉: { lat: 37.7519, lng: 128.8761 },
    전주: { lat: 35.8242, lng: 127.148 },
    경주: { lat: 35.8562, lng: 129.2247 },
    여수: { lat: 34.7604, lng: 127.6622 },
    포항: { lat: 36.019, lng: 129.3435 },
    춘천: { lat: 37.8813, lng: 127.7298 },
  };

  return coordinates[destination] || coordinates['서울']; // 기본값은 서울
};

// Mock 여행 계획 생성 함수
const generateMockTravelPlan = (destination: string): DayPlan[] => {
  const destinationActivities: { [key: string]: string[] } = {
    제주도: [
      '성산일출봉 등반',
      '한라산 트레킹',
      '우도 페리 여행',
      '제주 맛집 탐방',
      '애월 카페거리',
    ],
    부산: [
      '해운대 해변 산책',
      '감천문화마을 탐방',
      '자갈치 시장',
      '광안리 야경',
      '태종대 관광',
    ],
    서울: [
      '경복궁 관람',
      '홍대 거리 탐방',
      '명동 쇼핑',
      '한강 공원',
      '이태원 맛집',
    ],
    강릉: [
      '정동진 일출',
      '경포대 산책',
      '커피거리 투어',
      '오죽헌 관광',
      '안목해변',
    ],
    전주: [
      '한옥마을 탐방',
      '전주비빔밥',
      '한복 체험',
      '오목대 관광',
      '전주천 산책',
    ],
    경주: [
      '불국사 관람',
      '석굴암 탐방',
      '안압지 야경',
      '첨성대 관광',
      '황리단길',
    ],
  };

  const activities = destinationActivities[destination] || [
    '관광지 탐방',
    '맛집 투어',
    '카페 투어',
    '쇼핑',
    '휴식',
  ];

  return [
    {
      day: 1,
      activities: activities.slice(0, 3).map((activity, index) => ({
        time: `${9 + index * 3}:00`,
        title: activity,
        description: `${destination}에서의 ${activity} 일정입니다.`,
      })),
    },
    {
      day: 2,
      activities: activities.slice(2, 5).map((activity, index) => ({
        time: `${10 + index * 3}:00`,
        title: activity,
        description: `${destination}에서의 ${activity} 일정입니다.`,
      })),
    },
  ];
};

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

const MatchRecommendPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<MatchingUser | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 서울 기본 좌표
  const [visibleUsers, setVisibleUsers] = useState<MatchingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 데이터 새로고침을 위한 트리거
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

  // 패스/좋아요한 사용자 ID를 추적하는 상태
  const [processedUserIds, setProcessedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [likedUserIds, setLikedUserIds] = useState<Set<number>>(new Set());
  const [passedUserIds, setPassedUserIds] = useState<Set<number>>(new Set());

  // localStorage 변화를 감지하는 useEffect
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📡 localStorage 변화 감지, 데이터 새로고침...');
      setRefreshTrigger((prev) => prev + 1);
    };

    // 수동으로 localStorage 변화 감지 (interval 사용)
    const interval = setInterval(() => {
      const currentData = localStorage.getItem('myFeeds');
      if (currentData !== localStorage.getItem('lastKnownMyFeeds')) {
        localStorage.setItem('lastKnownMyFeeds', currentData || '');
        handleStorageChange();
      }
    }, 2000); // 2초마다 체크

    return () => clearInterval(interval);
  }, []);

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
  // 카카오맵 로딩 상태
  const [kakaoMapLoaded, setKakaoMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  // 선택된 마커 정보 (정보창 표시용)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  // 선택된 마커의 상세 정보
  const [markerDetail, setMarkerDetail] = useState<{
    photos: string[];
    place_url: string;
    phone: string;
  } | null>(null);

  // 카카오맵 로드 상태 확인
  useEffect(() => {
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('✅ 카카오맵이 성공적으로 로드되었습니다!');
        setKakaoMapLoaded(true);
        setMapError(null);
      } else {
        console.warn(
          '⚠️ 카카오맵이 로드되지 않았습니다. API 키를 확인해주세요.',
        );
        setMapError('카카오맵을 로드할 수 없습니다. API 키를 확인해주세요.');
        // 1초 후 다시 시도
        setTimeout(checkKakaoMap, 1000);
      }
    };

    // 즉시 체크하고, 로드되지 않은 경우 재시도
    checkKakaoMap();
  }, []);

  // 사용자가 변경될 때마다 여행 일정 페이지를 0으로 초기화
  useEffect(() => {
    setPlanPage(0);
    setSelectedDay(null); // 선택된 Day도 초기화
    setSearchedMarkers({}); // 검색된 마커 캐시도 초기화
  }, [currentIndex]);

  // 피드와 계획 데이터를 MatchingUser로 변환하는 함수
  const convertFeedToMatchingUser = (
    feed: any,
    planData: any,
    defaultUserName: string,
  ): MatchingUser | null => {
    try {
      const destination = planData.destination || '여행지';
      const userName = feed.author || defaultUserName;

      // 기간 계산
      const startDate = new Date(planData.startDate || '2024-01-01');
      const endDate = new Date(planData.endDate || '2024-01-03');
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const duration = `${daysDiff - 1}박${daysDiff}일`;

      // 예산 범위 계산
      const budgetAmount = parseInt(
        (planData.budget || '50만원').replace(/[^0-9]/g, ''),
      );
      const budgetRange =
        budgetAmount >= 100 ? '고가' : budgetAmount >= 50 ? '중가' : '저가';

      // 인원수 추출
      const peopleNum = parseInt(
        (planData.people || '2명').replace(/[^0-9]/g, ''),
      );
      const maxMembers = peopleNum || 2;

      // 여행 스타일
      const travelStyles = planData.styleLabels || planData.styles || ['관광'];

      // 좌표 설정
      const coordinates = getDestinationCoordinates(destination);

      // Mock 여행 계획 생성
      const mockTravelPlan: DayPlan[] = generateMockTravelPlan(destination);

      return {
        id: parseInt(feed.planId) + 50000, // 고유 ID 생성
        name: userName,
        age: Math.floor(Math.random() * 15) + 22, // 22-36세 랜덤
        location: destination,
        profileImage:
          feed.avatar ||
          'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image',
        destination: destination,
        duration: duration,
        budget: budgetRange,
        travelStyle: travelStyles.slice(0, 3), // 최대 3개
        coordinates: coordinates,
        maxMembers: maxMembers,
        currentMembers: 1, // 작성자 본인
        travelPlan: mockTravelPlan,
        gender: 'any', // 기본값
      };
    } catch (error) {
      console.error('매칭 사용자 변환 실패:', error);
      return null;
    }
  };

  // 모집중인 피드들을 MatchingUser로 변환하는 헬퍼 함수
  const processRecruitingFeeds = (
    feeds: any[],
    matchingUsers: MatchingUser[],
    defaultUserName: string,
  ): number => {
    let addedCount = 0;

    feeds.forEach((feed) => {
      try {
        if (feed.type === 'travel-plan' && feed.planId) {
          // feedStatusService로 피드 상태 확인
          const feedStatus = feedStatusService.getFeedStatus(
            feed.id || parseInt(feed.planId),
          );

          // 모집중인 피드만 처리
          if (feedStatus === 'recruiting') {
            console.log(
              `🔍 모집중인 피드 발견: ${feed.planId} (${feed.author || defaultUserName})`,
            );

            // localStorage에서 계획 데이터 가져오기
            const planDataStr = localStorage.getItem(`plan_${feed.planId}`);
            if (planDataStr) {
              const planData = JSON.parse(planDataStr);

              // MatchingUser 형식으로 변환
              const matchingUser = convertFeedToMatchingUser(
                feed,
                planData,
                defaultUserName,
              );
              if (matchingUser) {
                matchingUsers.push(matchingUser);
                addedCount++;
                console.log(
                  `✅ 매칭 사용자 추가: ${matchingUser.name} - ${matchingUser.destination}`,
                );
              }
            } else {
              console.warn(`⚠️ 계획 데이터 없음: plan_${feed.planId}`);
            }
          } else {
            console.log(
              `⏸️ 모집중이 아닌 피드: ${feed.planId} (상태: ${feedStatus})`,
            );
          }
        }
      } catch (error) {
        console.warn('피드 처리 중 오류:', error);
      }
    });

    return addedCount;
  };

  // 📡 백엔드 API에서 매칭 사용자 데이터 로드 (상태 관리)
  const [allUsers, setAllUsers] = useState<MatchingUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // 🚀 백엔드 API에서 매칭 데이터 로드
  useEffect(() => {
    const loadMatchingUsersFromBackend = async () => {
      setIsLoadingUsers(true);
      console.log('🔄 백엔드에서 매칭 사용자 데이터 로드 시작...');

      try {
        // 🎯 백엔드 API에서 매칭 활성화된 여행 계획 조회
        const backendPlans =
          await travelPlanApiService.getMatchingTravelPlans();
        console.log(
          `📡 백엔드에서 매칭 계획 ${backendPlans.length}개 로드 성공`,
        );

        const matchingUsers: MatchingUser[] = [];

        // 백엔드 데이터를 MatchingUser 형식으로 변환
        backendPlans.forEach((plan, index) => {
          try {
            // 여행 계획을 DayPlan 형식으로 변환
            let travelPlan: DayPlan[] = [];
            if (plan.schedules && typeof plan.schedules === 'object') {
              // schedules 객체를 DayPlan 배열로 변환
              Object.keys(plan.schedules).forEach((dayKey) => {
                const dayNumber = parseInt(dayKey.replace('day', '')) || 1;
                const activities = (plan.schedules[dayKey] || []).map(
                  (schedule: any) => ({
                    time: schedule.time || '00:00',
                    title: `${schedule.place} - ${schedule.activity}`,
                    description: schedule.memo || '',
                    place: schedule.place || '', // 🎯 실제 장소명 별도 저장
                  }),
                );

                if (activities.length > 0) {
                  travelPlan.push({
                    day: dayNumber,
                    activities,
                  });
                }
              });
            }

            // 실제 계획이 없으면 Mock 계획 생성
            if (travelPlan.length === 0) {
              travelPlan = generateMockTravelPlan(plan.destination);
            }

            const matchingUser: MatchingUser = {
              id: parseInt(plan.planId) || index + 1000,
              name: plan.author.name,
              age: 25, // 기본값, 실제 나이 정보가 있다면 사용
              location: plan.destination,
              profileImage: plan.author.profileImage || '👤',
              destination: plan.destination,
              duration: plan.period,
              budget: plan.budget,
              travelStyle:
                plan.styleLabels?.slice(0, 3) || plan.styles?.slice(0, 3) || [],
              coordinates: getDestinationCoordinates(plan.destination),
              maxMembers: parseInt(plan.people.replace(/[^0-9]/g, '')) || 2,
              currentMembers: 1, // 작성자 본인
              travelPlan: travelPlan,
              gender:
                plan.matchingInfo?.preferredGender === '남성'
                  ? 'male'
                  : plan.matchingInfo?.preferredGender === '여성'
                    ? 'female'
                    : 'any',
            };

            matchingUsers.push(matchingUser);
            console.log(
              `✅ 백엔드 데이터 변환 성공: ${plan.author.name} - ${plan.destination}`,
            );
          } catch (error) {
            console.warn(`❌ 계획 변환 실패: ${plan.planId}`, error);
          }
        });

        if (matchingUsers.length > 0) {
          setAllUsers(matchingUsers);
          console.log(
            `🎉 백엔드에서 ${matchingUsers.length}개의 매칭 사용자 로드 완료`,
          );
        } else {
          console.log('📝 백엔드에 매칭 활성화된 여행 계획이 없습니다.');
          await loadLocalFallbackData(); // 로컬 데이터 폴백
        }
      } catch (error) {
        console.error('❌ 백엔드 매칭 데이터 로드 실패:', error);
        await loadLocalFallbackData(); // 로컬 데이터 폴백
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // 🔄 로컬 데이터 폴백 함수 (기존 로직)
    const loadLocalFallbackData = async () => {
      console.log('🔄 로컬 데이터 폴백 시작...');

      // 🔍 현재 localStorage 상태 디버깅
      console.log('=== 📊 현재 localStorage 상태 ===');
      const myFeedsStr = localStorage.getItem('myFeeds');
      const matePostsStr = localStorage.getItem('matePosts');
      console.log(
        'myFeeds:',
        myFeedsStr ? JSON.parse(myFeedsStr).length : 0,
        '개',
      );
      console.log(
        'matePosts:',
        matePostsStr ? JSON.parse(matePostsStr).length : 0,
        '개',
      );

      // 개별 계획 파일들 확인
      const planKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith('plan_'),
      );
      console.log('저장된 여행 계획들:', planKeys.length, '개', planKeys);

      const matchingUsers: MatchingUser[] = [];
      let processedCount = 0;

      try {
        // 1. matePostService에서 등록된 여행메이트 포스트 가져오기 (우선 처리)
        try {
          const matePostList = matePostService.getAllMatePosts();
          console.log('🎯 여행메이트 포스트 로드:', matePostList.length, '개');

          if (matePostList.length > 0) {
            console.log('📋 로드된 여행메이트 포스트 목록:');
            matePostList.forEach((post, index) => {
              console.log(
                `  ${index + 1}. ${post.userName} - ${post.destination} (${post.period})`,
              );
            });
          }

          matePostList.forEach((matePost) => {
            try {
              // 🔍 원본 여행 계획 데이터 가져오기
              let originalPlanData = null;
              let actualAge = 25; // 기본값
              let actualTravelPlan: DayPlan[] = [];

              if (matePost.planId) {
                try {
                  const planDataStr = localStorage.getItem(
                    `plan_${matePost.planId}`,
                  );
                  if (planDataStr) {
                    originalPlanData = JSON.parse(planDataStr);
                    console.log(
                      `📋 원본 계획 데이터 로드 성공: ${matePost.planId}`,
                    );

                    // 실제 여행 계획 사용
                    if (
                      originalPlanData.days &&
                      Array.isArray(originalPlanData.days)
                    ) {
                      actualTravelPlan = originalPlanData.days;
                    }

                    // 작성자 정보에서 실제 나이 추출 (있다면)
                    if (
                      originalPlanData.author &&
                      originalPlanData.author.age
                    ) {
                      actualAge = originalPlanData.author.age;
                    }
                  } else {
                    console.warn(
                      `⚠️ 원본 계획 데이터 없음: plan_${matePost.planId}`,
                    );
                  }
                } catch (error) {
                  console.warn(
                    `❌ 원본 계획 데이터 로드 실패: ${matePost.planId}`,
                    error,
                  );
                }
              }

              // MatePost를 MatchingUser로 정확히 변환
              const matchingUser: MatchingUser = {
                id: matePost.id,
                name: matePost.userName,
                age: actualAge, // 실제 나이 사용 (기본값: 25)
                location: matePost.destination,
                profileImage: matePost.userAvatar,
                destination: matePost.destination,
                duration: matePost.period,
                budget: matePost.budget,
                travelStyle: matePost.styles.slice(0, 3),
                coordinates: getDestinationCoordinates(matePost.destination),
                maxMembers: matePost.maxPeople,
                currentMembers: matePost.currentPeople,
                travelPlan:
                  actualTravelPlan.length > 0
                    ? actualTravelPlan
                    : generateMockTravelPlan(matePost.destination), // 실제 계획 우선 사용
                gender:
                  matePost.preferences.gender === '남성'
                    ? 'male'
                    : matePost.preferences.gender === '여성'
                      ? 'female'
                      : 'any',
              };

              matchingUsers.push(matchingUser);
              processedCount++;
              console.log(
                `✅ 여행메이트 포스트 추가: ${matchingUser.name} - ${matchingUser.destination} (실제 데이터 사용: ${originalPlanData ? 'O' : 'X'})`,
              );
            } catch (error) {
              console.warn('여행메이트 포스트 변환 중 오류:', error);
            }
          });
        } catch (error) {
          console.warn('여행메이트 포스트 로드 실패:', error);
        }

        // 2. 내 피드들 가져오기 (matePostService에 없는 추가 피드들)
        const myFeedsStr = localStorage.getItem('myFeeds');
        if (myFeedsStr) {
          const myFeeds = JSON.parse(myFeedsStr);
          console.log('📱 내 피드 로드:', myFeeds.length, '개');
          processedCount += processRecruitingFeeds(
            myFeeds,
            matchingUsers,
            '나',
          );
        }

        // 🚫 Mock 데이터 생성 비활성화됨 (실제 사용자 데이터만 사용)
        console.log(
          '❌ Mock 사용자 피드 생성이 비활성화되었습니다. 실제 사용자 데이터만 표시됩니다.',
        );

        /* Mock 데이터 생성 코드 비활성화
      const userIds = [
        'user_001',
        'user_002',
        'user_003',
        'user_004',
        'user_005',
      ];
      userIds.forEach((userId) => {
        try {
          const userFeeds = generateMockUserFeeds(userId);
          if (userFeeds && userFeeds.length > 0) {
            console.log(`👤 사용자 ${userId} 피드:`, userFeeds.length, '개');
            processedCount += processRecruitingFeeds(
              userFeeds,
              matchingUsers,
              userId,
            );
          }
        } catch (error) {
          console.warn(`사용자 ${userId} 피드 처리 실패:`, error);
        }
      });
      */
      } catch (error) {
        console.error('피드 데이터 처리 중 오류:', error);
      }

      console.log(
        `🎉 총 ${matchingUsers.length}개의 모집중인 매칭 사용자 생성 (처리된 피드: ${processedCount}개)`,
      );

      // 실제 매칭 사용자들의 상세 정보 출력
      if (matchingUsers.length > 0) {
        console.log('📋 모집중인 매칭 사용자 목록:');
        matchingUsers.forEach((user, index) => {
          console.log(
            `  ${index + 1}. ${user.name} - ${user.destination} (${user.duration})`,
          );
        });
      }

      // 기존 로컬 데이터 로드 로직 (Mock 데이터 생성 비활성화됨)
      const localUsers: MatchingUser[] = [];
      console.log(
        '📝 로컬 데이터에서 실제 사용자 데이터가 없어 빈 상태로 설정',
      );
      setAllUsers(localUsers);
    };

    // 백엔드 데이터 로드 실행
    loadMatchingUsersFromBackend();
  }, [refreshTrigger]); // refreshTrigger 변경시 다시 로드

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
          // 백엔드에서 이미지를 가져오지 못한 경우 기본 이미지 사용
          console.log(
            '⚠️ 백엔드에서 이미지 없음, 기본 이미지 사용:',
            marker.title,
          );
          photos.push('/default-place-image.jpg');
        }
      } catch (error) {
        console.error('이미지 로드 중 오류:', error);
        // 오류 발생 시 기본 이미지 사용
        photos.push('/default-place-image.jpg');
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
    const filtered = allUsers.filter((user) => {
      // 이미 처리한 사용자는 제외
      if (processedUserIds.has(user.id)) {
        return false;
      }

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

    console.log(
      `🔍 필터링 결과: ${filtered.length}명 (전체: ${allUsers.length}명, 처리완료: ${processedUserIds.size}명)`,
    );
    console.log(
      '📊 필터링된 사용자들:',
      filtered.map((u) => `${u.name}(${u.destination})`),
    );
    console.log('🔧 현재 필터:', filters);

    return filtered;
  }, [allUsers, filters, processedUserIds]);

  const currentUser =
    filteredUsers.length > 0 ? filteredUsers[currentIndex] : null;

  // 선택된 Day가 변경될 때 장소 검색 수행
  useEffect(() => {
    if (selectedDay === null || !currentUser) return;

    const cacheKey = `${currentUser.id}-${selectedDay}`;

    // 이미 캐시된 결과가 있으면 검색하지 않음
    if (searchedMarkers[cacheKey]) return;

    // 선택된 Day의 활동들을 찾음
    console.log(
      `🔍 Day ${selectedDay} 검색 시작 - 사용자: ${currentUser.name}`,
    );
    console.log('📋 전체 여행 계획:', currentUser.travelPlan);

    const selectedDayPlan = currentUser.travelPlan.find(
      (plan) => plan.day === selectedDay,
    );

    if (!selectedDayPlan) {
      console.warn(`❌ Day ${selectedDay} 계획을 찾을 수 없음`);
      return;
    }

    console.log(`✅ Day ${selectedDay} 계획 발견:`, selectedDayPlan);

    // 검색 시작
    setIsSearchingPlaces(true);

    // 키워드 검색으로 실제 장소 좌표를 찾아서 마커 생성
    const searchPromises = (selectedDayPlan.activities || []).map(
      (activity, index) => {
        const activityId = `activity-${currentUser.id}-${selectedDay}-${index}`;

        // 🎯 실제 장소명 우선 사용 (백엔드 데이터의 place 필드)
        let searchKeyword = '';

        if (activity.place && activity.place.trim()) {
          // place 필드가 있으면 이를 우선 사용 (더 정확한 검색)
          searchKeyword = activity.place.trim();
          console.log(`🎯 장소명으로 검색: ${searchKeyword}`);
        } else {
          // place 필드가 없으면 title에서 추출
          searchKeyword = activity.title
            .replace(/^(점심:|저녁:|아침:|브런치:)/g, '') // 시간 관련 접두사 제거
            .replace(/\s+/g, ' ') // 여러 공백을 하나로
            .trim();
          console.log(`📝 제목에서 추출: ${searchKeyword}`);
        }

        // 목적지와 함께 검색하여 정확도 향상
        searchKeyword = `${currentUser.destination} ${searchKeyword}`;

        return searchPlaceByKeyword(
          searchKeyword,
          currentUser.coordinates,
          activityId,
        );
      },
    );

    // 모든 검색이 완료되면 마커 업데이트
    Promise.all(searchPromises)
      .then((results) => {
        console.log(`📊 Day ${selectedDay} 검색 결과:`, results);

        const validMarkers = results.filter(
          (marker): marker is MarkerData => marker !== null,
        );
        console.log(`✅ 유효한 마커 ${validMarkers.length}개 발견`);

        // 실제 방문 장소들만 마커로 표시 (기본 목적지 마커 제외)
        const allMarkers = validMarkers;

        // 캐시에 저장
        setSearchedMarkers((prev) => ({
          ...prev,
          [cacheKey]: allMarkers,
        }));
        console.log(`💾 마커 캐시 저장 완료: ${cacheKey}`);

        // 검색 완료
        setIsSearchingPlaces(false);

        // 모든 마커들이 보이도록 지도 뷰 조정
        if (allMarkers.length > 0) {
          console.log(`🗺️ 지도에 ${allMarkers.length}개 마커 표시 및 뷰 조정`);
          fitMapToMarkers(allMarkers);
        } else {
          console.warn('⚠️ 표시할 마커가 없습니다');
        }
      })
      .catch((error) => {
        console.error(`❌ Day ${selectedDay} 장소 검색 실패:`, error);
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
    (currentUser?.travelPlan?.length || 0) / plansPerPage,
  );
  // currentUser가 null인지 체크하여 안전하게 처리
  const paginatedPlans =
    currentUser?.travelPlan?.slice(
      planPage * plansPerPage,
      (planPage + 1) * plansPerPage,
    ) || [];

  // 지도 마커 데이터 생성 (currentUser가 null이면 빈 배열 반환)
  const markerData: MarkerData[] = currentUser
    ? [
        {
          id: currentUser.id?.toString() || '0', // id가 null일 경우 기본값 '0' 사용
          position: {
            lat: currentUser.coordinates?.lat || 37.5665, // 기본 좌표 (서울)
            lng: currentUser.coordinates?.lng || 126.978,
          },
          title: currentUser.destination || '알 수 없음',
          description: currentUser.name || '익명',
          category: 'attraction' as const,
        },
      ]
    : [];

  // 다음 사용자로 이동
  const nextUser = () => {
    console.log(
      `➡️ 다음 사용자로 이동 요청 (현재 처리가능: ${filteredUsers.length}명)`,
    );
    // 현재 인덱스를 0으로 유지 (항상 첫 번째 미처리 사용자를 표시)
    setCurrentIndex(0);
  };

  // 이전 사용자로 이동
  const prevUser = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length,
    );
  };

  // 좋아요 처리
  const handleLike = () => {
    if (!currentUser) return;

    console.log(`💖 ${currentUser.name}님을 좋아요!`);

    // 사용자를 처리완료 목록에 추가
    setProcessedUserIds(
      (prev) => new Set([...Array.from(prev), currentUser.id]),
    );
    setLikedUserIds((prev) => new Set([...Array.from(prev), currentUser.id]));

    nextUser();
  };

  // 패스 처리
  const handlePass = () => {
    if (!currentUser) return;

    console.log(`⏭️ ${currentUser.name}님을 패스`);

    // 사용자를 처리완료 목록에 추가
    setProcessedUserIds(
      (prev) => new Set([...Array.from(prev), currentUser.id]),
    );
    setPassedUserIds((prev) => new Set([...Array.from(prev), currentUser.id]));

    nextUser();
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    // 필터 변경 시 인덱스와 처리완료 목록 초기화
    setCurrentIndex(0);
    setProcessedUserIds(new Set());
    setLikedUserIds(new Set());
    setPassedUserIds(new Set());
  };

  // 거절 처리
  const handleReject = () => {
    if (!currentUser) return;

    console.log(`❌ ${currentUser.name}님을 거절`);

    // 사용자를 처리완료 목록에 추가 (거절은 패스와 동일하게 처리)
    setProcessedUserIds(
      (prev) => new Set([...Array.from(prev), currentUser.id]),
    );
    setPassedUserIds((prev) => new Set([...Array.from(prev), currentUser.id]));

    nextUser();
  };

  // 더 이상 매칭할 사용자가 없을 때 표시할 컴포넌트
  const NoMoreUsersView = () => (
    <Container
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
        margin: '20px',
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: '4rem', marginBottom: '20px' }}
      >
        🎯
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        모든 매칭을 완료했어요! 🎉
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: '1.1rem',
          opacity: 0.9,
          marginBottom: '32px',
          lineHeight: '1.6',
        }}
      >
        현재 조건에 맞는 모든 여행메이트를 확인하셨습니다.
        <br />
        새로운 매칭을 기다리거나 필터를 변경해보세요!
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%',
          maxWidth: '300px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💖</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {likedUserIds.size}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>좋아요</div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏭️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {passedUserIds.size}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>패스</div>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // 처리한 사용자 목록 초기화 (다시 시작)
          setProcessedUserIds(new Set());
          setLikedUserIds(new Set());
          setPassedUserIds(new Set());
          setCurrentIndex(0);
        }}
        style={{
          background: 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: '50px',
          padding: '16px 32px',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        🔄 다시 시작하기
      </motion.button>
    </Container>
  );

  // currentUser가 null인 경우 로딩 표시
  if (!currentUser) {
    return (
      <Container
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>
            추천할 사용자를 찾는 중...
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* 로딩 상태 및 사용자 없음 처리 */}
      {isLoadingUsers ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            백엔드에서 매칭 데이터 로드 중...
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            잠시만 기다려주세요
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✈️</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            아직 매칭 활성화된 여행 계획이 없어요
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            여행 계획을 작성하고 메이트를 찾아보세요!
          </div>
        </div>
      ) : (
        <>
          <div className="page-header">
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
              <button
                onClick={handlePass}
                className="action-button pass-button"
              >
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
                    {mapError ? (
                      <div className="map-error">
                        <div>🗺️ {mapError}</div>
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                          환경변수 REACT_APP_KAKAO_MAP_API_KEY를 확인해주세요
                        </div>
                      </div>
                    ) : !kakaoMapLoaded ? (
                      <div className="map-loading">
                        <div>🗺️ 지도 로딩 중...</div>
                      </div>
                    ) : (
                      <KakaoMap
                        center={currentUser.coordinates}
                        level={8}
                        markers={getMarkersForSelectedDay(currentUser)}
                        style={{ width: '100%', height: '100%' }}
                        onCreate={setMapInstance}
                        onMarkerClick={handleMarkerClick}
                      />
                    )}
                    <div className="tags-overlay">
                      {(currentUser.travelStyle || []).map((style, index) => (
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
                      <span className="info-value">
                        {currentUser.destination}
                      </span>
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
                              {(plan.activities || []).map(
                                (activity, actIndex) => (
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
                                ),
                              )}
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
              <button
                onClick={handleLike}
                className="action-button like-button"
              >
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
              <div
                className="filter-modal"
                onClick={(e) => e.stopPropagation()}
              >
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
                      onChange={(e) =>
                        handleFilterChange('style', e.target.value)
                      }
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
                      onChange={(e) =>
                        handleFilterChange('budget', e.target.value)
                      }
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
                      onChange={(e) =>
                        handleFilterChange('gender', e.target.value)
                      }
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
                      onChange={(e) =>
                        handleFilterChange('age', e.target.value)
                      }
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
                      {(markerDetail.photos || []).length > 0 && (
                        <div className="marker-images">
                          {(markerDetail.photos || []).map((photo, index) => (
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
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  padding: 0;
  margin: 0;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;

  /* 기존 CSS 클래스들을 styled-components로 변환 */
  .page-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 30px 20px 20px 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .filter-icon-button {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    padding: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  }

  .main-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 60px;
    width: 100%;
    height: 100vh;
    padding: 100px 20px 20px 20px;
    box-sizing: border-box;
  }

  .side-action {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .action-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    &:active {
      transform: translateY(-2px) scale(0.95);
    }
  }

  .pass-button {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .like-button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .card-container {
    position: relative;
    width: 800px;
    height: 850px;
  }

  .user-card {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(54, 130, 248, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }

  .map-section {
    position: relative;
    height: 250px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    background: rgba(54, 130, 248, 0.05);
    /* KakaoMap이 제대로 렌더링되도록 flex 제거 */
  }

  .map-section > div:first-child {
    /* KakaoMap 컴포넌트가 전체 영역을 차지하도록 */
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
  }

  .map-section > div:first-child > div {
    /* 실제 카카오맵 div */
    width: 100% !important;
    height: 100% !important;
    border-radius: 16px;
  }

  .map-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #64748b;
    font-size: 14px;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    z-index: 100;
  }

  .map-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ef4444;
    font-size: 14px;
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    z-index: 100;
    max-width: 200px;
  }

  .tags-overlay {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    z-index: 1000;
    pointer-events: none; /* 태그가 지도 조작을 방해하지 않도록 */
  }

  .tags-overlay > * {
    pointer-events: auto; /* 태그 자체는 클릭 가능하도록 */
  }

  .tag {
    background: rgba(54, 130, 248, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
  }

  .selected-day-info {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .selected-day-text {
    color: #1e293b;
    font-weight: 600;
    font-size: 12px;
  }

  .info-section {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: rgba(54, 130, 248, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(54, 130, 248, 0.1);
  }

  .info-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .info-icon {
    font-size: 20px;
  }

  .info-value {
    color: #1e293b;
    font-weight: 600;
    font-size: 13px;
    text-align: center;
  }

  .plan-section {
    flex: 1;
    min-height: 0;
  }

  .plan-section h3 {
    margin: 0 0 16px 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 600;
  }

  .timeline-horizontal-scroll {
    height: 280px;
    overflow-y: auto;
    border-radius: 12px;
    background: rgba(248, 250, 252, 0.8);
    border: 1px solid rgba(54, 130, 248, 0.1);
  }

  .timeline-container {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 16px;
    min-height: 100%;
  }

  .day-column {
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .day-header {
    display: flex;
    justify-content: center;
  }

  .day-badge {
    background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(54, 130, 248, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(54, 130, 248, 0.4);
    }

    &.selected {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
  }

  .activity-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .activity-item {
    background: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(54, 130, 248, 0.1);
  }

  .activity-time {
    color: #3682f8;
    font-weight: 600;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .activity-title {
    color: #1e293b;
    font-weight: 500;
    font-size: 13px;
    line-height: 1.3;
  }

  .activity-description {
    color: #64748b;
    font-size: 11px;
    margin-top: 4px;
    line-height: 1.3;
  }

  .plan-pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .page-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(54, 130, 248, 0.3);
    background: white;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(54, 130, 248, 0.1);
      border-color: #3682f8;
    }

    &.active {
      background: #3682f8;
      color: white;
      border-color: #3682f8;
    }
  }

  .card-header {
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(54, 130, 248, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-profile {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-profile-image {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #3682f8;
  }

  .header-profile-info h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
  }

  .header-profile-info p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 14px;
  }

  .recruitment-status {
    background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
  }

  /* 필터 모달 스타일 */
  .filter-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .filter-modal {
    background: white;
    border-radius: 20px;
    padding: 32px;
    min-width: 400px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .filter-modal h3 {
    margin: 0 0 24px;
    color: #1e293b;
    font-size: 24px;
    font-weight: 600;
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-group label {
    display: block;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 500;
  }

  .filter-group select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(54, 130, 248, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
    color: #1e293b;
    font-size: 14px;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #3682f8;
      box-shadow: 0 0 0 3px rgba(54, 130, 248, 0.1);
    }
  }

  .filter-footer {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .reset-button {
    flex: 1;
    padding: 12px;
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #e2e8f0;
    }
  }

  .apply-button {
    flex: 1;
    padding: 12px;
    background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(54, 130, 248, 0.3);
    }
  }

  .loading-dots {
    animation: dots 1.5s steps(5, end) infinite;
  }

  @keyframes dots {
    0%,
    20% {
      color: transparent;
      text-shadow:
        0.25em 0 0 transparent,
        0.5em 0 0 transparent;
    }
    40% {
      color: white;
      text-shadow:
        0.25em 0 0 transparent,
        0.5em 0 0 transparent;
    }
    60% {
      text-shadow:
        0.25em 0 0 white,
        0.5em 0 0 transparent;
    }
    80%,
    100% {
      text-shadow:
        0.25em 0 0 white,
        0.5em 0 0 white;
    }
  }

  /* 빈 상태 스타일 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
  }

  .empty-state .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.7;
  }

  .empty-state h3 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: white;
  }

  .empty-state p {
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
  }

  /* 마커 정보 모달 스타일 */
  .marker-info-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-width: 400px;
    width: 90%;
  }

  .marker-info-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .marker-info-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
  }

  .marker-info-body {
    padding: 20px;
  }

  .marker-images {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
  }

  .marker-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .marker-details p {
    margin: 0 0 8px 0;
    color: #374151;
    font-size: 14px;
    line-height: 1.5;
  }

  .marker-details strong {
    color: #1e293b;
  }

  .place-link {
    display: inline-block;
    margin-top: 12px;
    color: #3682f8;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: color 0.3s ease;

    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }

  .loading-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #64748b;
  }

  /* 카드 액션 버튼 영역 */
  .card-actions {
    padding: 20px;
    background: rgba(248, 250, 252, 0.8);
    border-top: 1px solid rgba(54, 130, 248, 0.1);
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .action-button-card {
    flex: 1;
    max-width: 120px;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .reject-button {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }
  }

  .match-button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }
  }
`;

export default MatchRecommendPage;
