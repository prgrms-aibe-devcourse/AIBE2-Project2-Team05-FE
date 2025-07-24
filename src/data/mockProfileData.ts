// 프로필 페이지용 정교한 더미데이터
// 실제 여행지 이미지와 상세한 여행 정보를 포함

export interface UserFeed {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  type?: string;
  planId?: string;
  createdAt?: string;
  travelType?: 'created' | 'joined'; // 백엔드에서 피드 권한에 따라 설정
  // created: 내가 여행 계획자인 경우
  // joined: 타인이 만든 여행에 참여한 경우
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isCurrentUser: boolean;
  createdTripsCount: number; // 내가 계획자로 만든 여행 수
  joinedTripsCount: number; // 타인의 여행에 참여한 여행 수
}

// 사용자 프로필 더미데이터 생성
export const generateMockUserProfile = (
  userId: string,
  isCurrentUser: boolean = true,
): UserProfile => {
  return {
    id: userId,
    name: isCurrentUser ? '나' : 'Lotusrious',
    username: isCurrentUser ? 'travel_lover' : 'Lotusrious',
    avatar: isCurrentUser ? '👨‍💻' : '👤',
    bio: isCurrentUser
      ? 'My name is Minjae, Nice to meet you.'
      : 'My name is Minjae, Nice to meet you.',
    postsCount: 7,
    followersCount: isCurrentUser ? 1200 : 1200,
    followingCount: isCurrentUser ? 345 : 345,
    isCurrentUser,
    createdTripsCount: 5, // 백엔드에서 계산된 값으로 교체 예정
    joinedTripsCount: 2, // 백엔드에서 계산된 값으로 교체 예정
  };
};

// 정교한 피드 데이터 생성 - 사용자별로 구분
export const generateMockUserFeeds = (userId: string): UserFeed[] => {
  console.log('🔄 Mock 피드 생성 for userId:', userId);

  // ⚠️ 임시: 사용자별로 구분하기 위해 특정 조건에서만 Mock 데이터 반환
  // 실제로는 백엔드에서 사용자별 피드를 제대로 받아와야 함

  // 'test' 계정에만 Mock 데이터 제공, 다른 계정은 빈 배열
  if (userId !== 'test@test.com') {
    console.log('📭 다른 사용자 계정 - 빈 피드 반환');
    return []; // test 계정 외에는 빈 배열 반환
  }

  // 현재 사용자가 실제로 만든 여행들 (localStorage에서 가져오기)
  const currentUserCreatedTrips: UserFeed[] = [];

  try {
    const myFeedsStr = localStorage.getItem('myFeeds');
    if (myFeedsStr) {
      const myFeeds = JSON.parse(myFeedsStr);
      myFeeds.forEach((feed: any) => {
        if (feed.type === 'travel-plan' && feed.planId) {
          currentUserCreatedTrips.push({
            id: feed.id,
            author: '나', // 현재 사용자
            avatar: '👤',
            image: feed.image || '',
            likes: feed.likes || 0,
            caption: feed.caption || '',
            type: 'travel-plan',
            createdAt: feed.createdAt,
            travelType: 'created',
            planId: feed.planId,
          });
        }
      });
    }
  } catch (error) {
    console.warn('내 피드 로드 실패:', error);
  }

  // 다른 사용자들이 만든 여행에 참여한 경우들 (실제 mock 데이터 기반)
  const joinedTrips: UserFeed[] = [
    {
      id: Date.now() + 1,
      author: '여행러버', // mockTravelPlans의 실제 작성자
      avatar: '🌺',
      image: '', // 구글 플레이스 API에서 가져올 예정
      likes: Math.floor(Math.random() * 200) + 150,
      caption:
        '제주도 럭셔리 힐링 여행 🌺\n성산일출봉과 우도 페리 여행\n📅 2024.12.15 - 12.17 (2박 3일)\n💰 예산: 80만원\n👥 인원: 2명\n\n✨ 여행러버님이 계획한 여행에 참여했어요!',
      type: 'travel-plan',
      createdAt: '2024-11-20T10:00:00Z',
      travelType: 'joined', // 다른 사람이 만든 여행에 참여
      planId: `plan_jeju_luxury`,
    },
    {
      id: Date.now() + 2,
      author: '문화탐험가', // mockTravelPlans의 실제 작성자
      avatar: '🎭',
      image: '', // 구글 플레이스 API에서 가져올 예정
      likes: Math.floor(Math.random() * 150) + 120,
      caption:
        '부산 문화&해변 만끽 여행 🎭\n감천문화마을과 해운대 탐방\n📅 2024.12.20 - 12.22 (2박 3일)\n💰 예산: 60만원\n👥 인원: 3명\n\n✨ 문화탐험가님이 계획한 여행에 참여했어요!',
      type: 'travel-plan',
      createdAt: '2024-11-19T14:30:00Z',
      travelType: 'joined',
      planId: `plan_busan_culture`,
    },
    {
      id: Date.now() + 3,
      author: '바다사랑', // mockTravelPlans의 실제 작성자
      avatar: '🌊',
      image: '', // 구글 플레이스 API에서 가져올 예정
      likes: Math.floor(Math.random() * 120) + 100,
      caption:
        '강릉 자연&바다 힐링 여행 🌊\n정동진 일출과 경포대 산책\n📅 2024.12.28 - 12.30 (2박 3일)\n💰 예산: 45만원\n👥 인원: 2명\n\n✨ 바다사랑님이 계획한 여행에 참여했어요!',
      type: 'travel-plan',
      createdAt: '2024-11-17T16:45:00Z',
      travelType: 'joined',
      planId: `plan_gangneung_nature`,
    },
    {
      id: Date.now() + 4,
      author: '친구1', // 가상의 다른 사용자
      avatar: '👩',
      image: '', // 구글 플레이스 API에서 가져올 예정 (도쿄 스카이트리)
      likes: Math.floor(Math.random() * 200) + 150,
      caption:
        '친구와 함께하는 일본 도쿄 여행 🗾\n아사쿠사, 시부야, 하라주쿠 탐방\n📅 2024.11.05 - 11.08 (3박 4일)\n💰 예산: 120만원\n👥 인원: 3명\n\n✨ 친구1님이 계획한 여행에 참여했어요!',
      type: 'travel-plan',
      createdAt: '2024-10-20T08:30:00Z',
      travelType: 'joined',
      planId: `plan_tokyo_friends`,
    },
    {
      id: Date.now() + 5,
      author: '여행친구', // 가상의 다른 사용자
      avatar: '👨',
      image: '', // 구글 플레이스 API에서 가져올 예정 (파리 에펠탑)
      likes: Math.floor(Math.random() * 150) + 100,
      caption:
        '그룹 유럽 배낭여행 🎒\n파리 → 런던 → 암스테르담\n📅 2024.09.15 - 09.25 (10박 11일)\n💰 예산: 300만원\n👥 인원: 6명\n\n✨ 여행친구님이 계획한 여행에 참여했어요!',
      type: 'travel-plan',
      createdAt: '2024-08-25T14:20:00Z',
      travelType: 'joined',
      planId: `plan_europe_backpack`,
    },
  ];

  return [...currentUserCreatedTrips, ...joinedTrips];
};

// caption에서 목적지 추출하는 헬퍼 함수
export const extractDestinationFromCaption = (caption: string): string => {
  const destinations = [
    '제주도',
    '부산',
    '강릉',
    '서울',
    '경주',
    '일본',
    '유럽',
    '전주',
    '도쿄',
    '파리',
  ];
  for (const dest of destinations) {
    if (caption.includes(dest)) {
      return dest;
    }
  }
  return '여행지'; // 기본값
};

// 각 피드에 대한 더미 계획 데이터를 localStorage에 생성하는 함수
export const generateMockPlanDataForFeed = (feed: UserFeed): any => {
  if (!feed.planId) return null;

  const destination = extractDestinationFromCaption(feed.caption);

  // 일부 계획에만 matchingInfo 추가 (매칭 활성화)
  const shouldHaveMatching =
    ['제주도', '부산', '서울', '강릉'].includes(destination) &&
    feed.travelType === 'created' &&
    Math.random() > 0.3; // 70% 확률로 매칭 활성화

  const planData: any = {
    id: feed.planId,
    title: feed.caption?.split('\n')[0] || `${destination} 여행 계획`,
    author: {
      id: feed.travelType === 'created' ? 'current-user' : 'other-user',
      name: feed.author,
      profileImage: feed.avatar,
    },
    startDate: feed.createdAt
      ? new Date(feed.createdAt).toISOString().split('T')[0]
      : '2024-12-01',
    endDate: feed.createdAt
      ? new Date(new Date(feed.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      : '2024-12-03',
    destination: destination,
    budget: extractBudgetFromCaption(feed.caption),
    people: extractPeopleFromCaption(feed.caption),
    period: extractPeriodFromCaption(feed.caption),
    days: generateMockDaysForDestination(destination),
    likes: feed.likes,
    likedUsers: [],
    isLiked: false,
    styles: generateStylesForDestination(destination),
    styleLabels: generateStyleLabelsForDestination(destination),
    imageUrl: feed.image, // 피드의 고화질 이미지 사용
  };

  // 매칭 정보 추가 (조건부)
  if (shouldHaveMatching) {
    planData.matchingInfo = generateMatchingInfoForDestination(destination);
    planData.matchingEnabled = true;
    console.log(`✅ "${planData.title}" 계획에 매칭 정보 추가됨`);
  }

  return planData;
};

// caption에서 예산 추출
const extractBudgetFromCaption = (caption: string): string => {
  const budgetMatch = caption.match(/예산:\s*(\d+만원)/);
  return budgetMatch ? budgetMatch[1] : '50만원';
};

// caption에서 인원 추출
const extractPeopleFromCaption = (caption: string): string => {
  const peopleMatch = caption.match(/인원:\s*(\d+명)/);
  return peopleMatch ? peopleMatch[1] : '2명';
};

// caption에서 기간 추출
const extractPeriodFromCaption = (caption: string): string => {
  const periodMatch = caption.match(/\(([^)]+)\)/);
  return periodMatch ? periodMatch[1] : '2박 3일';
};

// 목적지별 스타일 생성
const generateStylesForDestination = (destination: string): string[] => {
  const styleMap: { [key: string]: string[] } = {
    제주도: ['자연', '액티비티', '맛집'],
    부산: ['문화', '해변', '맛집'],
    서울: ['문화', '트렌드', '쇼핑'],
    강릉: ['자연', '바다', '힐링'],
    전주: ['전통문화', '체험', '한식'],
    일본: ['문화', '음식', '쇼핑'],
    유럽: ['역사', '문화', '예술'],
  };

  return styleMap[destination] || ['관광', '맛집'];
};

// 목적지별 스타일 라벨 생성
const generateStyleLabelsForDestination = (destination: string): string[] => {
  const labelMap: { [key: string]: string[] } = {
    제주도: ['자연 힐링', '액티비티', '맛집 탐방'],
    부산: ['문화 체험', '해변 힐링', '맛집 탐방'],
    서울: ['문화 체험', '트렌드 탐방', '쇼핑'],
    강릉: ['자연 체험', '바다 힐링', '여유로운 휴식'],
    전주: ['전통문화 체험', '한식 탐방', '역사 탐방'],
    일본: ['일본문화 체험', '일식 탐방', '쇼핑'],
    유럽: ['유럽 역사', '문화 예술', '건축 탐방'],
  };

  return labelMap[destination] || ['관광', '맛집 탐방'];
};

// 목적지별 간단한 일정 생성
const generateMockDaysForDestination = (destination: string) => {
  return [
    {
      id: 'day1',
      dayNumber: 1,
      date: '2024-12-01',
      events: [
        {
          id: 'event1',
          time: '09:00',
          title: `${destination} 도착`,
          location: destination,
          description: `${destination}에서의 첫날을 시작합니다!`,
          tags: ['여행', destination],
          price: '무료',
          category: 'transport',
        },
        {
          id: 'event2',
          time: '12:00',
          title: '현지 맛집 탐방',
          location: `${destination} 맛집`,
          description: '현지의 유명한 음식을 맛보세요.',
          tags: ['맛집', '점심'],
          price: '3만원',
          category: 'food',
        },
        {
          id: 'event3',
          time: '15:00',
          title: '관광명소 탐방',
          location: `${destination} 명소`,
          description: '유명한 관광지를 둘러보세요.',
          tags: ['관광', '사진'],
          price: '2만원',
          category: 'sightseeing',
        },
      ],
    },
  ];
};

// 목적지별 매칭 정보 생성
const generateMatchingInfoForDestination = (destination: string) => {
  const matchingTemplates: { [key: string]: any } = {
    제주도: {
      preferredGender: 'any',
      preferredAge: '20s',
      preferredLanguage: 'korean',
      matchingMemo: `제주도의 아름다운 자연과 맛을 함께 즐길 여행 메이트를 찾습니다! 🌺 렌터카 함께 타고 힐링 여행 어떠세요?`,
    },
    부산: {
      preferredGender: 'female',
      preferredAge: '30s',
      preferredLanguage: 'korean',
      matchingMemo:
        '부산의 바다와 문화를 함께 탐험할 여행 메이트 찾아요! 🌊 해운대, 감천문화마을, 맛집 투어 함께해요.',
    },
    서울: {
      preferredGender: 'any',
      preferredAge: '',
      preferredLanguage: 'korean',
      matchingMemo:
        '서울의 트렌디한 명소들을 함께 둘러볼 분을 찾습니다! ✨ 홍대, 명동, 강남 등 핫플레이스 투어!',
    },
    강릉: {
      preferredGender: 'any',
      preferredAge: '',
      preferredLanguage: 'korean',
      matchingMemo:
        '강릉의 바다와 커피로 힐링하실 분 모집! ☕ 정동진 일출, 경포대, 커피거리 투어 예정입니다.',
    },
  };

  return (
    matchingTemplates[destination] || {
      preferredGender: 'any',
      preferredAge: '',
      preferredLanguage: 'korean',
      matchingMemo: `${destination}에서의 즐거운 여행을 함께할 메이트를 찾습니다! 🎒`,
    }
  );
};

export default {
  generateMockUserProfile,
  generateMockUserFeeds,
  generateMockPlanDataForFeed,
  extractDestinationFromCaption,
};
