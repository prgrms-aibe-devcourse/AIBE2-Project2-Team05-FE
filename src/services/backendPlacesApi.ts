// 백엔드 Places API 서비스
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
