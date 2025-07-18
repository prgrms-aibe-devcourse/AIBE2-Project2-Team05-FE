// Google Places API 서비스
interface GooglePlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface GooglePlace {
  place_id: string;
  name: string;
  photos?: GooglePlacePhoto[];
  rating?: number;
  price_level?: number;
  types?: string[];
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
}

const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Google Places API를 사용하여 장소 정보를 검색합니다
 * @param query 검색할 장소명
 * @param location 위도,경도 (예: "37.5665,126.9780")
 * @param radius 검색 반경 (미터)
 */
export const searchGooglePlaces = async (
  query: string,
  location?: string,
  radius: number = 5000,
): Promise<GooglePlace[]> => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key가 설정되지 않았습니다.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query,
      key: GOOGLE_PLACES_API_KEY,
      language: 'ko',
      region: 'kr',
    });

    // 위치 정보가 있으면 추가
    if (location) {
      params.append('location', location);
      params.append('radius', radius.toString());
    }

    const response = await fetch(
      `${GOOGLE_PLACES_BASE_URL}/textsearch/json?${params}`,
    );

    if (!response.ok) {
      throw new Error(`Google Places API 오류: ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK') {
      console.warn(`Google Places API 상태: ${data.status}`);
      return [];
    }

    return data.results;
  } catch (error) {
    console.error('Google Places API 호출 중 오류:', error);
    return [];
  }
};

/**
 * Google Places Photo API를 사용하여 이미지 URL을 생성합니다
 * @param photoReference 사진 참조 ID
 * @param maxWidth 최대 너비 (기본값: 400)
 * @param maxHeight 최대 높이 (기본값: 400)
 */
export const getGooglePlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400,
  maxHeight: number = 400,
): string => {
  if (!GOOGLE_PLACES_API_KEY) {
    return '';
  }

  const params = new URLSearchParams({
    photoreference: photoReference,
    key: GOOGLE_PLACES_API_KEY,
    maxwidth: maxWidth.toString(),
    maxheight: maxHeight.toString(),
  });

  return `${GOOGLE_PLACES_BASE_URL}/photo?${params}`;
};

/**
 * 장소명으로 Google Places에서 이미지를 검색합니다
 * @param placeName 장소명
 * @param location 위도,경도 (선택사항)
 */
export const getPlaceImageFromGoogle = async (
  placeName: string,
  location?: string,
): Promise<string | null> => {
  try {
    const places = await searchGooglePlaces(placeName, location);

    if (places.length === 0) {
      return null;
    }

    const place = places[0];
    if (!place.photos || place.photos.length === 0) {
      return null;
    }

    // 첫 번째 사진의 URL을 반환
    return getGooglePlacePhotoUrl(place.photos[0].photo_reference);
  } catch (error) {
    console.error('Google Places 이미지 검색 중 오류:', error);
    return null;
  }
};
