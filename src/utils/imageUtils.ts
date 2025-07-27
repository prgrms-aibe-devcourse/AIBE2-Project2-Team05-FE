// 백엔드 주소를 자동으로 결정 (환경변수 → 아니면 기본값)
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

/**
 * 프로필 이미지 URL을 완성해주는 함수
 * @param url 이미지 URL (상대경로 또는 절대경로)
 * @returns 완성된 이미지 URL
 */
export const getProfileImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // 슬래시(/)로 시작하면 백엔드 주소를 붙여줌
  return BACKEND_URL + url;
};

/**
 * 기본 프로필 이미지 SVG를 생성하는 함수
 * @param size 이미지 크기 (기본값: 150)
 * @returns SVG 데이터 URL
 */
export const getDefaultProfileImage = (size: number = 150): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#gradient)"/>
      <circle cx="${size/2}" cy="${size/2 - size/6}" r="${size/6}" fill="white" opacity="0.9"/>
      <path d="M${size/2} ${size/2 + size/6}c-${size/6} 0-${size/3} ${size/12}-${size/3} ${size/4}v${size/6}h${size/1.5}v-${size/6}c0-${size/12}-${size/6}-${size/4}-${size/3}-${size/4}z" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea"/>
          <stop offset="100%" style="stop-color:#764ba2"/>
        </linearGradient>
      </defs>
    </svg>
  `)}`;
};

/**
 * 이미지 URL 관련 유틸리티 함수들
 */

// 기본 이미지 URL 상수
export const DEFAULT_PLACE_IMAGE = '/default-place-image.jpg';

/**
 * 유효하지 않거나 placeholder 이미지 URL을 기본 이미지로 대체
 * @param imageUrl 원본 이미지 URL
 * @returns 유효한 이미지 URL 또는 기본 이미지 URL
 */
export const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  // null, undefined, 빈 문자열 처리
  if (!imageUrl || imageUrl.trim() === '') {
    return DEFAULT_PLACE_IMAGE;
  }

  // via.placeholder.com URL 감지 및 대체
  if (imageUrl.includes('via.placeholder.com')) {
    console.log('🖼️ placeholder 이미지 감지, 기본 이미지로 대체:', imageUrl);
    return DEFAULT_PLACE_IMAGE;
  }

  // 유효한 URL인지 간단 체크
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    console.warn('⚠️ 유효하지 않은 이미지 URL:', imageUrl);
    return DEFAULT_PLACE_IMAGE;
  }
};

/**
 * 프로필 이미지 로드 실패 시 기본 이미지로 대체하는 이벤트 핸들러
 * @param e 이미지 에러 이벤트
 * @param size 기본 이미지 크기 (기본값: 150)
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, size: number = 150): void => {
  const target = e.target as HTMLImageElement;
  target.src = getDefaultProfileImage(size);
};

/**
 * 일반 이미지 로드 에러 핸들러 (장소 이미지 등)
 * @param event 이미지 로드 에러 이벤트
 */
export const handlePlaceImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== DEFAULT_PLACE_IMAGE) {
    console.log('🖼️ 장소 이미지 로드 실패, 기본 이미지로 대체:', img.src);
    img.src = DEFAULT_PLACE_IMAGE;
  }
};

/**
 * 이미지 URL 유효성을 검사하는 함수
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // 기본적인 URL 형식 검사
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // 이미지 확장자 또는 이미지 서비스 URL 체크
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
  const imageServices = /(unsplash\.com|pixabay\.com|pexels\.com|googleusercontent\.com)/i;
  
  return imageExtensions.test(url) || imageServices.test(url);
};

/**
 * 안전한 이미지 URL을 반환하는 함수
 */
export const getSafeImageUrl = (
  primaryUrl?: string | null,
  placeName?: string,
  fallbackType: 'local' | 'unsplash' | 'placeholder' = 'local'
): string => {
  try {
    // 1. 기본 URL이 유효한 경우
    if (primaryUrl && isValidImageUrl(primaryUrl)) {
      return primaryUrl;
    }
    
    // 2. Fallback 타입에 따른 처리
    switch (fallbackType) {
      case 'local':
        return '/default-place-image.jpg';
        
      case 'unsplash':
        try {
          if (placeName && placeName.trim()) {
            // 한국어 장소명을 영어 키워드로 매핑
            const koreanToEnglishMap: { [key: string]: string } = {
              '서울': 'seoul',
              '부산': 'busan',
              '인천': 'incheon',
              '대구': 'daegu',
              '대전': 'daejeon',
              '광주': 'gwangju',
              '울산': 'ulsan',
              '제주': 'jeju',
              '공항': 'airport',
              '역': 'station',
              '카페': 'cafe',
              '음식점': 'restaurant',
              '맛집': 'restaurant',
              '호텔': 'hotel',
              '박물관': 'museum',
              '공원': 'park',
              '해변': 'beach',
              '산': 'mountain',
              '다리': 'bridge',
              '시장': 'market',
              '터미널': 'terminal'
            };

            // 장소명에서 키워드 추출 (영어로 변환)
            let keywords = ['travel', 'korea'];
            const cleanName = placeName.toLowerCase().replace(/[^\w\s가-힣]/g, '');
            
            // 한국어 키워드 찾기
            for (const [korean, english] of Object.entries(koreanToEnglishMap)) {
              if (cleanName.includes(korean)) {
                keywords.push(english);
              }
            }
            
            // 영어 단어 찾기
            const englishWords = cleanName.match(/[a-zA-Z]+/g);
            if (englishWords) {
              keywords.push(...englishWords.slice(0, 2)); // 최대 2개까지만
            }
            
            // 키워드 중복 제거 및 최대 5개로 제한
            const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
            
            console.log(`🖼️ Unsplash 키워드 생성: "${placeName}" → [${uniqueKeywords.join(', ')}]`);
            
            return `https://source.unsplash.com/600x400/?${uniqueKeywords.join(',')}`;
          }
          return 'https://source.unsplash.com/600x400/?travel,korea,place';
        } catch (unsplashError) {
          console.warn('🖼️ Unsplash URL 생성 실패:', unsplashError);
          return 'https://source.unsplash.com/600x400/?travel,korea,place';
        }
        
      case 'placeholder':
      default:
        try {
          return createPlaceholderImage(placeName || '이미지 없음');
        } catch (placeholderError) {
          console.warn('🖼️ Placeholder 생성 실패:', placeholderError);
          // 최종 안전망: 간단한 회색 이미지
          return 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3C/svg%3E';
        }
    }
  } catch (error) {
    console.error('🚨 getSafeImageUrl 치명적 오류:', error);
    // 최종 fallback: 로컬 기본 이미지
    return '/default-place-image.jpg';
  }
};

/**
 * SVG placeholder 이미지를 생성하는 함수 (UTF-8 지원)
 */
export const createPlaceholderImage = (text: string): string => {
  // 한국어 텍스트를 안전하게 처리하기 위해 URL 인코딩 사용
  const cleanText = text || '이미지 없음';
  
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect x="50" y="50" width="500" height="300" fill="#e9ecef" stroke="#dee2e6" stroke-width="2" rx="8"/>
      <text x="300" y="200" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="18" fill="#6c757d">
        ${cleanText}
      </text>
      <circle cx="200" cy="150" r="20" fill="#ced4da"/>
      <polygon points="200,140 210,160 190,160" fill="#adb5bd"/>
    </svg>
  `.trim();
  
  // UTF-8을 지원하는 URL 인코딩 방식 사용 (btoa 대신)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * 이미지 로드를 Promise로 래핑하는 함수
 */
export const loadImageAsync = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${url}`));
    
    // 타임아웃 설정 (5초)
    setTimeout(() => {
      reject(new Error(`이미지 로드 타임아웃: ${url}`));
    }, 5000);
    
    img.src = url;
  });
};

/**
 * 여러 이미지 URL을 순차적으로 시도하는 함수
 */
export const loadImageWithFallbacks = async (
  urls: string[],
  placeName?: string
): Promise<string> => {
  for (const url of urls) {
    if (!url) continue;
    
    try {
      await loadImageAsync(url);
      return url;
    } catch (error) {
      console.warn(`이미지 로드 실패, 다음 옵션 시도: ${url}`);
      continue;
    }
  }
  
  // 모든 URL 실패 시 placeholder 반환
  return createPlaceholderImage(placeName || '이미지를 불러올 수 없습니다');
}; 