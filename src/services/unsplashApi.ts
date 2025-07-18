// Unsplash API를 사용하여 고품질 이미지를 가져오는 서비스
// 무료 API이므로 API 키 없이 사용 가능

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description?: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

/**
 * Unsplash API를 사용하여 장소 관련 이미지를 검색합니다
 * @param query 검색 키워드
 * @param category 카테고리 (food, tourism, etc.)
 */
export const searchUnsplashImages = async (
  query: string,
  category?: string,
): Promise<string | null> => {
  try {
    // 카테고리별 키워드 매핑
    const categoryKeywords: { [key: string]: string } = {
      food: 'restaurant food korean',
      tourism: 'korea tourist attraction',
      cafe: 'cafe coffee shop',
      hotel: 'hotel accommodation',
      shopping: 'shopping mall korea',
      culture: 'korean culture traditional',
      nature: 'korea nature landscape',
      default: 'korea travel',
    };

    // 검색 키워드 구성
    let searchQuery = query;
    if (category && categoryKeywords[category]) {
      searchQuery = `${categoryKeywords[category]} ${query}`;
    } else {
      searchQuery = `${categoryKeywords.default} ${query}`;
    }

    // Unsplash API 호출 (API 키가 있는 경우)
    if (UNSPLASH_ACCESS_KEY) {
      const response = await fetch(
        `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        },
      );

      if (response.ok) {
        const data: UnsplashResponse = await response.json();
        if (data.results.length > 0) {
          return data.results[0].urls.regular;
        }
      }
    }

    // API 키가 없거나 실패한 경우 카테고리별 기본 이미지 반환
    return getCategoryDefaultImage(category);
  } catch (error) {
    console.error('Unsplash API 호출 중 오류:', error);
    return getCategoryDefaultImage(category);
  }
};

/**
 * 카테고리별 기본 이미지를 반환합니다
 * @param category 카테고리
 */
const getCategoryDefaultImage = (category?: string): string => {
  const defaultImages: { [key: string]: string } = {
    food: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80',
    tourism:
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&q=80',
    hotel:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80',
    shopping:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80',
    culture:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80',
    nature:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80',
    default:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop&q=80',
  };

  return defaultImages[category || 'default'];
};

/**
 * 장소 카테고리에 따른 이미지를 가져옵니다
 * @param placeName 장소명
 * @param categoryName 카카오 카테고리명
 */
export const getPlaceImageByCategory = async (
  placeName: string,
  categoryName: string,
): Promise<string> => {
  let category = 'default';

  // 카카오 카테고리를 우리 카테고리로 매핑
  if (
    categoryName.includes('음식점') ||
    categoryName.includes('한식') ||
    categoryName.includes('중식') ||
    categoryName.includes('일식')
  ) {
    category = 'food';
  } else if (categoryName.includes('카페') || categoryName.includes('디저트')) {
    category = 'cafe';
  } else if (
    categoryName.includes('관광') ||
    categoryName.includes('명소') ||
    categoryName.includes('여행')
  ) {
    category = 'tourism';
  } else if (categoryName.includes('숙박') || categoryName.includes('호텔')) {
    category = 'hotel';
  } else if (categoryName.includes('쇼핑') || categoryName.includes('마트')) {
    category = 'shopping';
  } else if (
    categoryName.includes('문화') ||
    categoryName.includes('박물관') ||
    categoryName.includes('전시')
  ) {
    category = 'culture';
  } else if (categoryName.includes('공원') || categoryName.includes('자연')) {
    category = 'nature';
  }

  const imageUrl = await searchUnsplashImages(placeName, category);
  return imageUrl || getCategoryDefaultImage(category);
};
