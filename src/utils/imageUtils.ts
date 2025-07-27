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