// 백엔드 Places API 서비스
import openaiService from './openaiApi';

interface BackendPlaceImageResponse {
  placeName: string;
  imageUrl: string;
  placeId: string;
  rating?: number;
  success: boolean;
  errorMessage?: string;
}

const BACKEND_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

/**
 * 백엔드를 통해 Google Places API에서 장소 이미지를 가져옵니다
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
 * POST 방식으로 백엔드 Places API를 호출합니다
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
 * OpenAI로 대표 랜드마크를 분석한 후, 백엔드를 통해 해당 랜드마크의 이미지를 가져옵니다
 * @param destination 여행 목적지
 * @param latitude 위도 (선택사항)
 * @param longitude 경도 (선택사항)
 */
export const getRepresentativePlaceImage = async (
  destination: string,
  latitude?: number,
  longitude?: number,
): Promise<string | null> => {
  try {
    console.log(`🤖 OpenAI로 ${destination}의 대표 랜드마크 분석 시작...`);

    // 1단계: OpenAI로 대표 랜드마크 분석
    const representativeLandmark =
      await openaiService.analyzeRepresentativeLandmark(destination);

    if (!representativeLandmark || representativeLandmark === destination) {
      console.log(`📍 분석 결과: ${destination} (원본 목적지 사용)`);
    } else {
      console.log(
        `🏛️ 분석 결과: ${representativeLandmark} (대표 랜드마크 발견)`,
      );
    }

    // 2단계: 백엔드를 통해 대표 랜드마크의 이미지 검색
    console.log(`📸 백엔드에서 "${representativeLandmark}" 이미지 검색 중...`);

    const placeImage = await getPlaceImageFromBackend(
      representativeLandmark,
      latitude,
      longitude,
    );

    if (placeImage && placeImage !== 'NO_IMAGE') {
      console.log(
        `✅ 대표 이미지 발견! ${representativeLandmark} → 이미지 URL 획득`,
      );
      return placeImage;
    }

    // 3단계: 대표 랜드마크에서 이미지를 찾지 못한 경우, 원본 목적지로 재시도
    if (representativeLandmark !== destination) {
      console.log(
        `🔄 대표 랜드마크에서 이미지를 찾지 못해 원본 목적지로 재검색...`,
      );

      const fallbackImage = await getPlaceImageFromBackend(
        destination,
        latitude,
        longitude,
      );

      if (fallbackImage && fallbackImage !== 'NO_IMAGE') {
        console.log(`✅ 원본 목적지에서 이미지 발견! ${destination}`);
        return fallbackImage;
      }
    }

    if (placeImage === 'NO_IMAGE') {
      console.log(
        `❌ ${representativeLandmark}에 사용할 수 있는 이미지가 없습니다.`,
      );
    } else {
      console.log(`❌ ${representativeLandmark}의 이미지를 찾지 못했습니다.`);
    }

    return null;
  } catch (error) {
    console.error('대표 장소 이미지 검색 중 오류:', error);

    // 오류 발생 시 기본 백엔드 API로 폴백
    console.log(`🔄 오류 발생으로 인한 기본 검색으로 전환: ${destination}`);
    return await getPlaceImageFromBackend(destination, latitude, longitude);
  }
};

/**
 * 백엔드 Places API 상태를 확인합니다
 */
export const checkBackendPlacesHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/places/health`);
    return response.ok;
  } catch (error) {
    console.error('백엔드 Places API 상태 확인 중 오류:', error);
    return false;
  }
};
