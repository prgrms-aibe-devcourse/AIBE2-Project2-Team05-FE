// 정교한 여행 계획 더미데이터
// 실제 한국의 유명 여행지를 기반으로 한 상세한 여행 계획들

export interface MockTravelEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  price: string;
  category:
    | 'transport'
    | 'food'
    | 'sightseeing'
    | 'activity'
    | 'accommodation'
    | 'shopping';
}

export interface MockTravelDay {
  id: string;
  dayNumber: number;
  date: string;
  events: MockTravelEvent[];
}

export interface MockTravelPlan {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  startDate: string;
  endDate: string;
  destination: string;
  budget: string;
  people: string;
  period: string;
  days: MockTravelDay[];
  likes: number;
  likedUsers: string[];
  isLiked: boolean;
  styles: string[];
  styleLabels: string[];
  matchingInfo?: {
    preferredGender: string;
    preferredAge: string;
    preferredLanguage: string;
    matchingMemo: string;
  };
  accommodation?: string;
  transportation?: string;
  extraMemo?: string;
  createdAt: string;
  imageUrl?: string;
}

export const mockTravelPlans: MockTravelPlan[] = [
  {
    id: 'plan_jeju_luxury',
    title: '제주도 럭셔리 힐링 여행',
    author: {
      id: 'user_1',
      name: '여행러버',
      profileImage: '🌺',
    },
    startDate: '2024-12-15',
    endDate: '2024-12-17',
    destination: '제주도',
    budget: '80만원',
    people: '2명',
    period: '2박 3일',
    matchingInfo: {
      preferredGender: 'any',
      preferredAge: '20s',
      preferredLanguage: 'korean',
      matchingMemo:
        '제주도 힐링 여행을 함께 할 여행 메이트를 찾아요! 🌺 렌터카 함께 타고 맛집 탐방하실 분 환영합니다.',
    },
    days: [
      {
        id: 'day1_jeju',
        dayNumber: 1,
        date: '2024-12-15',
        events: [
          {
            id: 'event1_jeju',
            time: '09:00',
            title: '제주공항 도착',
            location: '제주국제공항',
            description:
              '김포공항에서 출발하여 제주공항 도착. 렌터카 픽업 후 여행 시작!',
            tags: ['공항', '렌터카'],
            price: '항공료 포함',
            category: 'transport',
          },
          {
            id: 'event2_jeju',
            time: '11:00',
            title: '성산일출봉 등반',
            location: '성산일출봉',
            description:
              '제주도의 대표 명소인 성산일출봉 등반. 아름다운 분화구와 바다 전망을 감상할 수 있습니다.',
            tags: ['등산', '명소', '사진'],
            price: '5,000원',
            category: 'sightseeing',
          },
          {
            id: 'event3_jeju',
            time: '13:00',
            title: '성산 맛집 점심',
            location: '성산포구 횟집',
            description:
              '신선한 제주도 해산물로 만든 회정식. 성게미역국과 갈치조림이 유명합니다.',
            tags: ['해산물', '현지맛집', '회'],
            price: '4만원',
            category: 'food',
          },
          {
            id: 'event4_jeju',
            time: '15:30',
            title: '우도 페리 여행',
            location: '우도',
            description:
              '제주도 옆 작은 섬인 우도를 탐방. 우도 땅콩 아이스크림과 아름다운 해변을 즐깁니다.',
            tags: ['섬여행', '페리', '아이스크림', '해변'],
            price: '2만원',
            category: 'activity',
          },
          {
            id: 'event5_jeju',
            time: '19:00',
            title: '제주시내 숙박',
            location: '제주시 호텔',
            description:
              '제주시내 4성급 호텔에서 숙박. 바다가 보이는 오션뷰 객실입니다.',
            tags: ['호텔', '오션뷰', '휴식'],
            price: '15만원',
            category: 'accommodation',
          },
        ],
      },
      {
        id: 'day2_jeju',
        dayNumber: 2,
        date: '2024-12-16',
        events: [
          {
            id: 'event6_jeju',
            time: '09:00',
            title: '한라산 어리목 코스',
            location: '한라산 어리목탐방로',
            description:
              '제주도 최고봉인 한라산 등반. 어리목 코스로 윗세오름까지 트레킹합니다.',
            tags: ['등산', '한라산', '트레킹', '자연'],
            price: '무료',
            category: 'activity',
          },
          {
            id: 'event7_jeju',
            time: '14:00',
            title: '흑돼지 맛집',
            location: '제주 흑돼지 전문점',
            description:
              '제주도 특산품인 흑돼지 구이 정식. 두툼하고 고소한 맛이 일품입니다.',
            tags: ['흑돼지', '제주특산', '고기'],
            price: '5만원',
            category: 'food',
          },
          {
            id: 'event8_jeju',
            time: '16:00',
            title: '쇠소깍 투명카약',
            location: '쇠소깍',
            description:
              '맑은 바다에서 투명카약 체험. 바닥이 유리로 된 카약으로 바다 속을 관찰할 수 있습니다.',
            tags: ['카약', '바다', '체험', '투명카약'],
            price: '3만원',
            category: 'activity',
          },
        ],
      },
    ],
    likes: 89,
    likedUsers: [],
    isLiked: false,
    styles: ['자연', '액티비티', '맛집'],
    styleLabels: ['자연 힐링', '액티비티', '맛집 탐방'],
    createdAt: '2024-11-20T10:00:00Z',
  },

  {
    id: 'plan_busan_culture',
    title: '부산 문화&해변 만끽 여행',
    author: {
      id: 'user_2',
      name: '문화탐험가',
      profileImage: '🎭',
    },
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    destination: '부산',
    budget: '60만원',
    people: '3명',
    period: '2박 3일',
    matchingInfo: {
      preferredGender: 'female',
      preferredAge: '30s',
      preferredLanguage: 'korean',
      matchingMemo:
        '부산의 문화와 맛을 함께 탐험할 여성 여행 메이트 찾습니다! 🎭 감천문화마을, 해운대, 현지 맛집 투어 예정이에요.',
    },
    days: [
      {
        id: 'day1_busan',
        dayNumber: 1,
        date: '2024-12-20',
        events: [
          {
            id: 'event1_busan',
            time: '10:00',
            title: 'KTX 부산역 도착',
            location: '부산역',
            description:
              'KTX를 이용하여 부산 도착. 지하철 1일권 구매 후 여행 시작.',
            tags: ['KTX', '부산역', '교통'],
            price: 'KTX 요금',
            category: 'transport',
          },
          {
            id: 'event2_busan',
            time: '11:30',
            title: '감천문화마을 탐방',
            location: '감천문화마을',
            description:
              '부산의 마추픽추라 불리는 감천문화마을. 알록달록한 집들과 골목 예술을 감상합니다.',
            tags: ['문화마을', '예술', '포토스팟', '골목'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event3_busan',
            time: '13:30',
            title: '국제시장 먹거리 투어',
            location: '국제시장',
            description:
              '부산의 전통시장인 국제시장에서 씨앗호떡, 비빔당면, 어묵 등 부산 대표 먹거리 체험.',
            tags: ['전통시장', '씨앗호떡', '어묵', '먹거리'],
            price: '2만원',
            category: 'food',
          },
          {
            id: 'event4_busan',
            time: '16:00',
            title: '해운대해수욕장 산책',
            location: '해운대해수욕장',
            description:
              '부산 최고의 해변인 해운대에서 바다 산책과 휴식. 겨울 바다의 색다른 매력을 느껴보세요.',
            tags: ['해변', '바다', '산책', '휴식'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event5_busan',
            time: '18:30',
            title: '해운대 회센터 저녁',
            location: '해운대 회센터',
            description:
              '신선한 회와 매운탕으로 유명한 해운대 회센터에서 저녁식사.',
            tags: ['회', '매운탕', '해산물'],
            price: '6만원',
            category: 'food',
          },
        ],
      },
      {
        id: 'day2_busan',
        dayNumber: 2,
        date: '2024-12-21',
        events: [
          {
            id: 'event6_busan',
            time: '09:00',
            title: '해동 용궁사 참배',
            location: '해동 용궁사',
            description:
              '바다 위에 세워진 아름다운 사찰. 소원을 빌면 하나는 꼭 이뤄진다는 전설이 있습니다.',
            tags: ['사찰', '바다', '소원', '불교문화'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event7_busan',
            time: '12:00',
            title: '기장시장 대게 점심',
            location: '기장시장',
            description:
              '기장 대게로 유명한 기장시장에서 대게찜과 대게라면을 맛봅니다.',
            tags: ['대게', '해산물', '기장', '시장'],
            price: '8만원',
            category: 'food',
          },
          {
            id: 'event8_busan',
            time: '15:00',
            title: '광안리해수욕장 & 광안대교',
            location: '광안리해수욕장',
            description:
              '부산의 야경 명소인 광안대교를 바라보며 해변 카페에서 여유를 즐깁니다.',
            tags: ['광안대교', '야경', '카페', '해변'],
            price: '1만원',
            category: 'sightseeing',
          },
        ],
      },
    ],
    likes: 124,
    likedUsers: [],
    isLiked: false,
    styles: ['문화', '해변', '맛집'],
    styleLabels: ['문화 체험', '해변 힐링', '맛집 탐방'],
    createdAt: '2024-11-19T14:30:00Z',
  },

  {
    id: 'plan_seoul_trendy',
    title: '서울 트렌디 핫플레이스 투어',
    author: {
      id: 'user_3',
      name: '트렌드세터',
      profileImage: '✨',
    },
    startDate: '2024-12-25',
    endDate: '2024-12-26',
    destination: '서울',
    budget: '40만원',
    people: '2명',
    period: '1박 2일',
    days: [
      {
        id: 'day1_seoul',
        dayNumber: 1,
        date: '2024-12-25',
        events: [
          {
            id: 'event1_seoul',
            time: '10:00',
            title: '성수동 카페거리',
            location: '성수동 카페거리',
            description:
              '서울의 힙한 동네 성수동에서 독특한 컨셉의 카페들을 탐방합니다.',
            tags: ['카페', '힙플레이스', '성수동', '브런치'],
            price: '2만원',
            category: 'food',
          },
          {
            id: 'event2_seoul',
            time: '12:00',
            title: '서울숲 산책',
            location: '서울숲공원',
            description:
              '도심 속 자연 공간인 서울숲에서 산책과 휴식. 계절마다 다른 아름다움을 보여줍니다.',
            tags: ['공원', '산책', '자연', '휴식'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event3_seoul',
            time: '14:30',
            title: '한강공원 피크닉',
            location: '한강공원 뚝섬지구',
            description:
              '한강공원에서 치킨과 맥주로 유명한 치맥 피크닉을 즐깁니다.',
            tags: ['한강', '피크닉', '치맥', '여유'],
            price: '3만원',
            category: 'activity',
          },
          {
            id: 'event4_seoul',
            time: '17:00',
            title: '홍대 쇼핑&거리공연',
            location: '홍익대학교 주변',
            description:
              '젊음의 거리 홍대에서 쇼핑과 거리공연 관람. 다양한 예술과 문화를 체험합니다.',
            tags: ['홍대', '쇼핑', '거리공연', '젊음'],
            price: '5만원',
            category: 'shopping',
          },
          {
            id: 'event5_seoul',
            time: '19:30',
            title: '강남 고급 한정식',
            location: '강남역 한정식집',
            description: '강남의 유명 한정식집에서 정통 한국 요리를 맛봅니다.',
            tags: ['한정식', '강남', '고급', '한식'],
            price: '12만원',
            category: 'food',
          },
        ],
      },
      {
        id: 'day2_seoul',
        dayNumber: 2,
        date: '2024-12-26',
        events: [
          {
            id: 'event6_seoul',
            time: '09:30',
            title: '경복궁 & 한복 체험',
            location: '경복궁',
            description:
              '조선 왕조의 법궁인 경복궁에서 한복을 입고 전통문화를 체험합니다.',
            tags: ['궁궐', '한복', '전통문화', '역사'],
            price: '8만원',
            category: 'sightseeing',
          },
          {
            id: 'event7_seoul',
            time: '12:00',
            title: '북촌한옥마을 투어',
            location: '북촌한옥마을',
            description:
              '서울의 전통 가옥들이 잘 보존된 북촌한옥마을에서 한국의 전통 건축을 감상합니다.',
            tags: ['한옥', '전통건축', '북촌', '포토존'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event8_seoul',
            time: '14:00',
            title: '인사동 전통차 & 쇼핑',
            location: '인사동',
            description:
              '전통 문화거리 인사동에서 전통차를 마시며 전통 공예품과 기념품을 쇼핑합니다.',
            tags: ['인사동', '전통차', '공예품', '기념품'],
            price: '4만원',
            category: 'shopping',
          },
        ],
      },
    ],
    likes: 203,
    likedUsers: [],
    isLiked: false,
    styles: ['문화', '트렌드', '쇼핑'],
    styleLabels: ['문화 체험', '트렌드 탐방', '쇼핑'],
    createdAt: '2024-11-18T09:15:00Z',
  },

  {
    id: 'plan_gangneung_nature',
    title: '강릉 자연&바다 힐링 여행',
    author: {
      id: 'user_4',
      name: '바다사랑',
      profileImage: '🌊',
    },
    startDate: '2024-12-28',
    endDate: '2024-12-30',
    destination: '강릉',
    budget: '45만원',
    people: '2명',
    period: '2박 3일',
    matchingInfo: {
      preferredGender: 'any',
      preferredAge: '',
      preferredLanguage: 'korean',
      matchingMemo:
        '강릉의 아름다운 바다와 자연을 함께 힐링하며 즐길 분을 찾습니다! 🌊 정동진 일출, 경포대 산책, 커피투어 예정입니다.',
    },
    days: [
      {
        id: 'day1_gangneung',
        dayNumber: 1,
        date: '2024-12-28',
        events: [
          {
            id: 'event1_gangneung',
            time: '08:00',
            title: 'KTX 강릉역 도착',
            location: '강릉역',
            description:
              'KTX를 이용하여 강릉 도착. 렌터카 픽업 후 동해안 여행 시작.',
            tags: ['KTX', '강릉역', '렌터카'],
            price: 'KTX 요금',
            category: 'transport',
          },
          {
            id: 'event2_gangneung',
            time: '10:00',
            title: '정동진해수욕장 일출',
            location: '정동진해수욕장',
            description:
              '세계에서 바다와 가장 가까운 기차역으로 유명한 정동진에서 동해 바다의 웅장함을 감상합니다.',
            tags: ['정동진', '바다', '기차역', '일출'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event3_gangneung',
            time: '12:30',
            title: '강릉 순두부 맛집',
            location: '강릉 순두부촌',
            description: '강릉의 대표 음식인 순두부백반과 모듬전을 맛봅니다.',
            tags: ['순두부', '백반', '강릉특산', '전통음식'],
            price: '2만원',
            category: 'food',
          },
          {
            id: 'event4_gangneung',
            time: '14:30',
            title: '오죽헌 & 시립박물관',
            location: '오죽헌',
            description:
              '신사임당과 율곡 이이의 생가인 오죽헌에서 조선시대 문화를 체험합니다.',
            tags: ['오죽헌', '신사임당', '율곡이이', '역사'],
            price: '3,000원',
            category: 'sightseeing',
          },
          {
            id: 'event5_gangneung',
            time: '17:00',
            title: '경포대 해변 산책',
            location: '경포해수욕장',
            description:
              '강릉의 대표 해변인 경포대에서 석양을 감상하며 해변 산책을 즐깁니다.',
            tags: ['경포대', '해변', '석양', '산책'],
            price: '무료',
            category: 'sightseeing',
          },
        ],
      },
      {
        id: 'day2_gangneung',
        dayNumber: 2,
        date: '2024-12-29',
        events: [
          {
            id: 'event6_gangneung',
            time: '09:00',
            title: '주문진수산시장',
            location: '주문진수산시장',
            description:
              '동해안 최대 수산시장에서 싱싱한 해산물을 구매하고 즉석에서 회를 맛봅니다.',
            tags: ['수산시장', '회', '해산물', '주문진'],
            price: '5만원',
            category: 'food',
          },
          {
            id: 'event7_gangneung',
            time: '11:30',
            title: '소금강 트레킹',
            location: '소금강',
            description:
              '금강산의 축소판이라 불리는 소금강에서 아름다운 계곡과 폭포를 감상합니다.',
            tags: ['소금강', '트레킹', '계곡', '폭포'],
            price: '5,000원',
            category: 'activity',
          },
          {
            id: 'event8_gangneung',
            time: '15:00',
            title: '강릉 커피거리',
            location: '강릉 커피거리',
            description:
              '커피의 도시 강릉에서 다양한 로스터리 카페를 탐방하며 커피를 즐깁니다.',
            tags: ['커피', '로스터리', '카페투어', '강릉특산'],
            price: '2만원',
            category: 'food',
          },
        ],
      },
    ],
    likes: 156,
    likedUsers: [],
    isLiked: false,
    styles: ['자연', '바다', '힐링'],
    styleLabels: ['자연 체험', '바다 힐링', '여유로운 휴식'],
    createdAt: '2024-11-17T16:45:00Z',
  },

  {
    id: 'plan_jeonju_traditional',
    title: '전주 한옥마을 전통문화 여행',
    author: {
      id: 'user_5',
      name: '전통문화애호가',
      profileImage: '🏮',
    },
    startDate: '2025-01-03',
    endDate: '2025-01-04',
    destination: '전주',
    budget: '35만원',
    people: '4명',
    period: '1박 2일',
    days: [
      {
        id: 'day1_jeonju',
        dayNumber: 1,
        date: '2025-01-03',
        events: [
          {
            id: 'event1_jeonju',
            time: '10:00',
            title: 'KTX 전주역 도착',
            location: '전주역',
            description:
              'KTX를 이용하여 전주 도착. 시내버스로 한옥마을까지 이동.',
            tags: ['KTX', '전주역', '시내버스'],
            price: 'KTX 요금',
            category: 'transport',
          },
          {
            id: 'event2_jeonju',
            time: '11:30',
            title: '전주한옥마을 투어',
            location: '전주한옥마을',
            description:
              '700여 채의 한옥이 보존된 전주한옥마을에서 전통 건축의 아름다움을 감상합니다.',
            tags: ['한옥마을', '전통건축', '문화유산', '포토존'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event3_jeonju',
            time: '13:00',
            title: '전주비빔밥 원조집',
            location: '중앙회관',
            description:
              '전주비빔밥의 원조집에서 정통 전주비빔밥과 콩나물국밥을 맛봅니다.',
            tags: ['비빔밥', '콩나물국밥', '전주특산', '원조집'],
            price: '4만원',
            category: 'food',
          },
          {
            id: 'event4_jeonju',
            time: '15:00',
            title: '한지공예 체험',
            location: '한지문화관',
            description:
              '전통 한지를 이용한 공예품 만들기 체험. 나만의 한지 작품을 만들어 보세요.',
            tags: ['한지', '공예체험', '전통문화', '만들기'],
            price: '3만원',
            category: 'activity',
          },
          {
            id: 'event5_jeonju',
            time: '17:30',
            title: '경기전 & 조선왕조실록 관람',
            location: '경기전',
            description:
              '조선 태조 이성계의 어진이 모셔진 경기전과 조선왕조실록을 관람합니다.',
            tags: ['경기전', '조선왕조실록', '태조', '역사'],
            price: '3,000원',
            category: 'sightseeing',
          },
          {
            id: 'event6_jeonju',
            time: '19:00',
            title: '전주 막걸리 골목',
            location: '전주 막걸리골목',
            description:
              '전주의 전통주인 막걸리와 다양한 안주를 즐기며 전통 주점 문화를 체험합니다.',
            tags: ['막걸리', '전통주', '안주', '주점문화'],
            price: '6만원',
            category: 'food',
          },
        ],
      },
      {
        id: 'day2_jeonju',
        dayNumber: 2,
        date: '2025-01-04',
        events: [
          {
            id: 'event7_jeonju',
            time: '09:00',
            title: '한복 체험 & 촬영',
            location: '한복 대여점',
            description:
              '전통 한복을 입고 한옥마을을 배경으로 아름다운 사진을 촬영합니다.',
            tags: ['한복체험', '전통의상', '촬영', '추억'],
            price: '5만원',
            category: 'activity',
          },
          {
            id: 'event8_jeonju',
            time: '11:00',
            title: '전동성당 관람',
            location: '전동성당',
            description:
              '서양식 건축의 아름다움을 간직한 전동성당에서 역사와 문화를 체험합니다.',
            tags: ['전동성당', '서양건축', '역사', '문화'],
            price: '무료',
            category: 'sightseeing',
          },
          {
            id: 'event9_jeonju',
            time: '12:30',
            title: '전통찻집에서 점심',
            location: '승광재',
            description:
              '한옥을 개조한 전통찻집에서 한정식과 전통차를 즐깁니다.',
            tags: ['전통찻집', '한정식', '전통차', '한옥'],
            price: '5만원',
            category: 'food',
          },
          {
            id: 'event10_jeonju',
            time: '14:30',
            title: '남부시장 & 청년몰',
            location: '남부시장',
            description:
              '전통시장과 현대적인 청년몰이 결합된 남부시장에서 쇼핑과 먹거리를 즐깁니다.',
            tags: ['전통시장', '청년몰', '쇼핑', '먹거리'],
            price: '3만원',
            category: 'shopping',
          },
        ],
      },
    ],
    likes: 98,
    likedUsers: [],
    isLiked: false,
    styles: ['전통문화', '체험', '한식'],
    styleLabels: ['전통문화 체험', '한식 탐방', '역사 탐방'],
    createdAt: '2024-11-16T11:20:00Z',
  },
];

// 특정 여행 계획을 ID로 찾는 함수
export const getMockTravelPlanById = (
  id: string,
): MockTravelPlan | undefined => {
  return mockTravelPlans.find((plan) => plan.id === id);
};

// 목적지별 여행 계획을 찾는 함수
export const getMockTravelPlansByDestination = (
  destination: string,
): MockTravelPlan[] => {
  return mockTravelPlans.filter((plan) =>
    plan.destination.includes(destination),
  );
};

// 여행 스타일별 여행 계획을 찾는 함수
export const getMockTravelPlansByStyle = (style: string): MockTravelPlan[] => {
  return mockTravelPlans.filter(
    (plan) =>
      plan.styles.some((s) => s.includes(style)) ||
      plan.styleLabels.some((label) => label.includes(style)),
  );
};

export default mockTravelPlans;
