// 백엔드 Places API 서비스 - 구글 플레이스 상세 정보 포함

// 기존 호환성을 위한 인터페이스
interface BackendPlaceImageResponse {
  placeName: string;
  imageUrl: string;
  placeId: string;
  rating?: number;
  success: boolean;
  errorMessage?: string;
}

interface PlaceDetails {
  success: boolean;
  errorMessage?: string;
  placeId: string;
  name: string;
  formattedAddress: string;
  geometry: {
    lat: number;
    lng: number;
  };
  photos?: Array<{
    photoReference: string;
    photoUrl: string;
    height: number;
    width: number;
    htmlAttributions: string[];
  }>;
  rating?: number;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
    relativeTimeDescription: string;
  }>;
  formattedPhoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
  types: string[];
}

interface PlaceDetailRequest {
  placeName: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  languageCode?: string;
}

class BackendPlacesApiService {
  private baseUrl: string;

  constructor() {
    // 백엔드 서버 URL - 환경변수에서 가져오거나 기본값 사용
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  }

  /**
   * 백엔드 API를 통해 장소 상세 정보 조회
   */
  async getPlaceDetails(
    placeName: string,
    region?: string,
  ): Promise<PlaceDetails | null> {
    try {
      console.log('🔍 백엔드 API로 장소 상세 정보 조회:', placeName, region);

      const params = new URLSearchParams();
      params.append('placeName', placeName);
      if (region) {
        params.append('region', region);
      }
      params.append('languageCode', 'ko-KR');

      const response = await fetch(
        `${this.baseUrl}/api/places/details?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        // 400 오류 등 상세 정보 로깅
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(
          `백엔드 API 응답 오류: ${response.status} ${response.statusText}`,
          `URL: ${this.baseUrl}/api/places/details?${params}`,
          `Error: ${errorText}`,
        );

        // 400 오류의 경우 백엔드 서버 문제이므로 Mock 데이터로 폴백
        if (response.status === 400) {
          console.warn('⚠️ 백엔드 API 400 오류 - Mock 데이터로 폴백 처리');
          return this.createMockPlaceDetails(placeName, region);
        }
        return null;
      }

      const data: PlaceDetails = await response.json();

      if (data.success) {
        console.log('✅ 백엔드에서 장소 상세 정보 조회 성공:', data.name);
        return data;
      } else {
        console.warn('백엔드 API에서 장소를 찾지 못함:', data.errorMessage);
        return null;
      }
    } catch (error) {
      console.error('백엔드 Places API 호출 실패:', error);
      return null;
    }
  }

  /**
   * POST 방식으로 장소 상세 정보 조회
   */
  async getPlaceDetailsPost(
    request: PlaceDetailRequest,
  ): Promise<PlaceDetails | null> {
    try {
      console.log(
        '🔍 백엔드 API로 장소 상세 정보 조회 (POST):',
        request.placeName,
      );

      const response = await fetch(`${this.baseUrl}/api/places/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // 400 오류 등 상세 정보 로깅 (POST 버전)
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(
          `백엔드 API POST 응답 오류: ${response.status} ${response.statusText}`,
          `Request: ${JSON.stringify(request)}`,
          `Error: ${errorText}`,
        );

        // 400 오류의 경우 백엔드 서버 문제이므로 Mock 데이터로 폴백
        if (response.status === 400) {
          console.warn('⚠️ 백엔드 API POST 400 오류 - Mock 데이터로 폴백 처리');
          return this.createMockPlaceDetails(request.placeName, request.region);
        }
        return null;
      }

      const data: PlaceDetails = await response.json();

      if (data.success) {
        console.log('✅ 백엔드에서 장소 상세 정보 조회 성공:', data.name);
        return data;
      } else {
        console.warn('백엔드 API에서 장소를 찾지 못함:', data.errorMessage);
        return null;
      }
    } catch (error) {
      console.error('백엔드 Places API 호출 실패:', error);
      return null;
    }
  }

  /**
   * 백엔드 서버 상태 확인
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/places/health`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('백엔드 서버 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * Mock 데이터를 실제 백엔드 응답 형식으로 변환
   */
  private createMockPlaceDetails(
    placeName: string,
    region?: string,
  ): PlaceDetails {
    const mockDataMap: { [key: string]: PlaceDetails } = {
      '강릉 서퍼비치': {
        success: true,
        placeId: 'mock_surfbeach_gangneung',
        name: '강릉 서퍼비치',
        formattedAddress: '강원도 강릉시 사천면 진리해변길 20',
        geometry: {
          lat: 37.8853,
          lng: 128.8493,
        },
        photos: [
          {
            photoReference: 'mock_photo_ref_1',
            photoUrl:
              'https://source.unsplash.com/600x400/?surf,beach,gangneung',
            height: 400,
            width: 600,
            htmlAttributions: [],
          },
        ],
        rating: 4.2,
        reviews: [
          {
            authorName: '서핑 러버',
            rating: 5,
            text: '강릉에서 서핑하기 최고의 장소입니다. 파도도 좋고 시설도 깔끔해요!',
            time: Date.now() - 86400000,
            relativeTimeDescription: '1일 전',
          },
        ],
        formattedPhoneNumber: '033-123-4567',
        website: 'http://gangneungsurfbeach.com',
        openingHours: {
          openNow: true,
          weekdayText: [
            '월요일: 오전 9:00 ~ 오후 6:00',
            '화요일: 오전 9:00 ~ 오후 6:00',
            '수요일: 오전 9:00 ~ 오후 6:00',
            '목요일: 오전 9:00 ~ 오후 6:00',
            '금요일: 오전 9:00 ~ 오후 6:00',
            '토요일: 오전 8:00 ~ 오후 7:00',
            '일요일: 오전 8:00 ~ 오후 7:00',
          ],
        },
        types: ['tourist_attraction', 'establishment'],
      },
      올레국수: {
        success: true,
        placeId: 'mock_ole_noodles',
        name: '올레국수',
        formattedAddress: '제주특별자치도 제주시 구좌읍 올레로 123',
        geometry: {
          lat: 33.4996,
          lng: 126.531,
        },
        photos: [
          {
            photoReference: 'mock_photo_ref_2',
            photoUrl: 'https://source.unsplash.com/600x400/?noodle,korean,food',
            height: 400,
            width: 600,
            htmlAttributions: [],
          },
        ],
        rating: 4.5,
        reviews: [
          {
            authorName: '제주 맛집 탐험가',
            rating: 5,
            text: '정말 맛있는 고기국수집이에요. 제주 향토음식의 진수를 느낄 수 있습니다.',
            time: Date.now() - 172800000,
            relativeTimeDescription: '2일 전',
          },
        ],
        formattedPhoneNumber: '064-123-4567',
        openingHours: {
          openNow: true,
          weekdayText: [
            '월요일: 오전 11:00 ~ 오후 8:00',
            '화요일: 오전 11:00 ~ 오후 8:00',
            '수요일: 휴무일',
            '목요일: 오전 11:00 ~ 오후 8:00',
            '금요일: 오전 11:00 ~ 오후 8:00',
            '토요일: 오전 11:00 ~ 오후 8:00',
            '일요일: 오전 11:00 ~ 오후 8:00',
          ],
        },
        types: ['restaurant', 'food', 'establishment'],
      },
    };

    const mockData = mockDataMap[placeName];
    if (mockData) {
      return mockData;
    }

    // 기본 Mock 데이터
    return {
      success: true,
      placeId: `mock_${placeName.replace(/\s+/g, '_')}`,
      name: placeName,
      formattedAddress: region ? `${region} 지역 내` : '위치 정보 확인 중',
      geometry: {
        lat: 37.5665,
        lng: 126.978,
      },
      photos: [
        {
          photoReference: 'mock_default_photo',
          photoUrl: `https://source.unsplash.com/600x400/?travel,korea,${encodeURIComponent(placeName)}`,
          height: 400,
          width: 600,
          htmlAttributions: [],
        },
      ],
      rating: 4.0,
      reviews: [
        {
          authorName: '여행자',
          rating: 4,
          text: `${placeName}에 대한 리뷰입니다. 좋은 장소네요!`,
          time: Date.now() - 86400000,
          relativeTimeDescription: '1일 전',
        },
      ],
      types: ['establishment'],
    };
  }

  /**
   * 백엔드 연결 실패 시 Mock 데이터 반환
   */
  async getPlaceDetailsWithFallback(
    placeName: string,
    region?: string,
  ): Promise<PlaceDetails | null> {
    // 먼저 백엔드 API 시도
    const backendResult = await this.getPlaceDetails(placeName, region);

    if (backendResult) {
      return backendResult;
    }

    // 백엔드 실패 시 Mock 데이터 반환
    console.warn('백엔드 API 실패, Mock 데이터 사용:', placeName);
    return this.createMockPlaceDetails(placeName, region);
  }
}

// 싱글톤 인스턴스 생성
const backendPlacesApiService = new BackendPlacesApiService();

/**
 * 백엔드를 통해 Google Places API에서 장소 이미지를 가져옵니다 (기존 호환성 함수)
 * @param placeName 장소명
 * @param latitude 위도 (선택사항)
 * @param longitude 경도 (선택사항)
 */
export const getPlaceImageFromBackend = async (
  placeName: string,
  latitude?: number,
  longitude?: number,
): Promise<string | null> => {
  try {
    const params = new URLSearchParams();
    params.append('placeName', placeName);

    // 위치 정보가 있으면 추가
    if (latitude !== undefined && longitude !== undefined) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
    }

    const BACKEND_BASE_URL =
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    const response = await fetch(
      `${BACKEND_BASE_URL}/api/places/image?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      console.warn(`백엔드 Places API 오류: ${response.status}`);
      return null;
    }

    const data: BackendPlaceImageResponse = await response.json();

    if (data.success && data.imageUrl) {
      // 이미지가 없는 경우 특별한 값 반환
      if (data.imageUrl === '이미지 없음') {
        return 'NO_IMAGE'; // 특별한 값으로 이미지가 없음을 표시
      }
      return data.imageUrl;
    } else {
      console.warn(`Places API 실패: ${data.errorMessage}`);
      return null;
    }
  } catch (error) {
    console.error('백엔드 Places API 호출 중 오류:', error);
    return null;
  }
};

/**
 * POST 방식으로 백엔드 Places API를 호출합니다 (기존 호환성 함수)
 * @param placeName 장소명
 * @param latitude 위도 (선택사항)
 * @param longitude 경도 (선택사항)
 * @param radius 검색 반경 (미터)
 */
export const getPlaceImageFromBackendPost = async (
  placeName: string,
  latitude?: number,
  longitude?: number,
  radius: number = 5000,
): Promise<string | null> => {
  try {
    const requestBody = {
      placeName,
      latitude,
      longitude,
      radius,
    };

    const BACKEND_BASE_URL =
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_BASE_URL}/api/places/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn(`백엔드 Places API 오류: ${response.status}`);
      return null;
    }

    const data: BackendPlaceImageResponse = await response.json();

    if (data.success && data.imageUrl) {
      // 이미지가 없는 경우 특별한 값 반환
      if (data.imageUrl === '이미지 없음') {
        return 'NO_IMAGE'; // 특별한 값으로 이미지가 없음을 표시
      }
      return data.imageUrl;
    } else {
      console.warn(`Places API 실패: ${data.errorMessage}`);
      return null;
    }
  } catch (error) {
    console.error('백엔드 Places API 호출 중 오류:', error);
    return null;
  }
};

/**
 * 백엔드 Places API 상태를 확인합니다 (기존 호환성 함수)
 */
export const checkBackendPlacesHealth = async (): Promise<boolean> => {
  try {
    const BACKEND_BASE_URL =
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_BASE_URL}/api/places/health`);
    return response.ok;
  } catch (error) {
    console.error('백엔드 Places API 상태 확인 중 오류:', error);
    return false;
  }
};

/**
 * 목적지별 대표 이미지를 백엔드를 통해 가져옵니다
 * @param destination 목적지명 (예: 제주도, 부산, 서울)
 * @returns 대표 이미지 URL 또는 null
 */
export const getDestinationRepresentativeImage = async (
  destination: string,
): Promise<string | null> => {
  try {
    const BACKEND_BASE_URL =
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

    // 목적지별 대표적인 명소를 매핑 (국내외 포함)
    const landmarkMap: { [key: string]: string } = {
      // 국내 관광지
      제주도: '제주 성산일출봉',
      제주: '제주 성산일출봉',
      부산: '부산 감천문화마을',
      서울: '서울 경복궁',
      강릉: '강릉 경포대',
      전주: '전주 한옥마을',
      인천: '인천 차이나타운',
      경주: '경주 불국사',
      여수: '여수 해상케이블카',
      속초: '속초 설악산',
      대구: '대구 서문시장',
      광주: '광주 양림동',
      울산: '울산 대왕암공원',
      춘천: '춘천 남이섬',
      안동: '안동 하회마을',
      태백: '태백 태백산',
      포항: '포항 호미곶',
      통영: '통영 케이블카',
      거제: '거제 바람의언덕',
      남해: '남해 독일마을',

      // 해외 관광지
      일본: '도쿄 스카이트리',
      도쿄: '도쿄 스카이트리',
      오사카: '오사카성',
      교토: '교토 기요미즈데라',
      후쿠오카: '후쿠오카 하카타역',

      유럽: '파리 에펠탑',
      파리: '파리 에펠탑',
      런던: '런던 빅벤',
      로마: '로마 콜로세움',
      바르셀로나: '바르셀로나 사그라다 파밀리아',
      암스테르담: '암스테르담 운하',
      베를린: '베를린 브란덴부르크 문',
      프라하: '프라하 성',
      비엔나: '비엔나 쇤브룬 궁전',

      미국: '뉴욕 자유의 여신상',
      뉴욕: '뉴욕 자유의 여신상',
      로스앤젤레스: '로스앤젤레스 할리우드 사인',
      샌프란시스코: '샌프란시스코 골든게이트 브릿지',
      라스베이거스: '라스베이거스 스트립',

      중국: '베이징 천안문 광장',
      베이징: '베이징 천안문 광장',
      상하이: '상하이 와이탄',
      홍콩: '홍콩 빅토리아 피크',

      동남아시아: '방콕 왓 아룬',
      태국: '방콕 왓 아룬',
      방콕: '방콕 왓 아룬',
      싱가포르: '싱가포르 마리나 베이 샌즈',
      베트남: '하노이 호안키엠 호수',
      하노이: '하노이 호안키엠 호수',
      호치민: '호치민 노트르담 성당',

      호주: '시드니 오페라 하우스',
      시드니: '시드니 오페라 하우스',
      멜버른: '멜버른 페더레이션 스퀘어',
    };

    const landmark = landmarkMap[destination] || destination;

    console.log(`🏞️ 목적지별 대표 이미지 요청: ${destination} -> ${landmark}`);

    // 네트워크 연결 테스트를 위한 짧은 timeout 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 timeout

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/places/destination-image?destination=${encodeURIComponent(landmark)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 400 오류 등 상세 정보 로깅 (목적지 이미지)
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn(
        `백엔드 목적지 이미지 API 응답 오류: ${response.status} ${response.statusText}`,
        `Destination: ${destination} -> ${landmark}`,
        `Error: ${errorText}`,
      );

      // 400 오류의 경우 다른 이미지 서비스로 폴백 (이미 catch에서 처리)
      return null;
    }

    const data = await response.json();

    if (
      data.success &&
      data.imageUrl &&
      data.imageUrl !== '이미지 없음' &&
      data.imageUrl !== 'NO_IMAGE'
    ) {
      console.log(
        `🖼️ 목적지 대표 이미지 성공: ${destination} -> ${data.imageUrl}`,
      );
      return data.imageUrl;
    } else {
      console.warn(
        `목적지 대표 이미지 결과 없음: ${destination} - ${data.errorMessage || '이미지를 찾을 수 없음'}`,
      );
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(
          `⏱️ 목적지 대표 이미지 API 시간초과: ${destination} (5초 이상 소요)`,
        );
      } else if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('fetch')
      ) {
        console.warn(
          `🌐 백엔드 서버에 연결할 수 없음: ${destination} (서버가 실행 중인지 확인하세요)`,
        );
      } else {
        console.error(
          `❌ 목적지 대표 이미지 API 호출 중 오류: ${destination}`,
          error.message,
        );
      }
    } else {
      console.error(
        `❌ 목적지 대표 이미지 API 예상치 못한 오류: ${destination}`,
        error,
      );
    }
    return null;
  }
};

export default backendPlacesApiService;
export type { PlaceDetails, PlaceDetailRequest };
