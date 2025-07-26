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
 * 이미지 로드 실패 시 기본 이미지로 대체하는 이벤트 핸들러
 * @param e 이미지 에러 이벤트
 * @param size 기본 이미지 크기 (기본값: 150)
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, size: number = 150): void => {
  const target = e.target as HTMLImageElement;
  target.src = getDefaultProfileImage(size);
}; 