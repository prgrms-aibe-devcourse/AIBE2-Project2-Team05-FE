import axios from 'axios';

// 1. axios 인스턴스 생성
// 이 인스턴스는 앞으로 우리 앱의 모든 API 요청을 담당합니다.
const api = axios.create({
  // 백엔드 서버의 기본 URL을 설정합니다.
  // 만약 백엔드 서버 주소가 다르다면 이 부분만 수정하면 됩니다.
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 요청 인터셉터(interceptor) 설정
// '요청 인터셉터'는 모든 API 요청이 서버로 전송되기 전에 가로채서
// 특정 작업을 수행하게 해주는 기능입니다.
// 여기서는 localStorage에서 토큰을 꺼내 헤더에 담아주는 역할을 합니다.
api.interceptors.request.use(
  (config) => {
    // 🔓 토큰이 필요하지 않은 공개 API 목록
    const publicPaths = [
      '/api/users/signup',        // 회원가입
      '/api/auth/login',          // 로그인
      '/api/auth/signup',         // 기존 회원가입  
      '/api/admin/login',         // 관리자 로그인
      '/api/admin/signup',        // 관리자 회원가입
      '/api/auth/oauth',          // OAuth 관련
      '/api/places',              // 장소 검색
      '/api/profile/user',        // 공개 프로필 조회
      '/uploads',                 // 파일 접근
      // 🔧 매칭 API 제거: 이제 실제 인증이 필요함
    ];

    // 정확한 경로 매칭을 위한 공개 API 패턴
    const publicPatterns = [
      ...publicPaths,
      /^\/api\/feed$/,            // 피드 목록 조회만 공개 (GET /api/feed)
      /^\/api\/feed\?/,           // 피드 목록 쿼리 조회 (GET /api/feed?...)
      /^\/api\/feed\//,           // 🔧 모든 피드 하위 API 공개 (GET /api/feed/cursor, /api/feed/123 등)
    ];

    // 현재 요청 URL이 공개 API인지 확인
    const isPublicAPI = publicPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return config.url?.includes(pattern);
      } else {
        return pattern.test(config.url || '');
      }
    });

    // ✅ accessToken을 우선적으로 사용
    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token'); // 하위 호환성

    // ✅ 사용할 토큰 결정 (accessToken이 우선)
    const finalToken = accessToken || token;

    // 공개 API가 아니고 토큰이 존재한다면 토큰을 추가
    if (!isPublicAPI && finalToken) {
      // 모든 요청의 Authorization 헤더에 'Bearer [토큰]' 형태로 토큰을 추가합니다.
      config.headers['Authorization'] = `Bearer ${finalToken}`;

      // ✅ 상세한 토큰 디버깅 로그
      console.log('🔐 API 요청에 토큰 포함:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        tokenSource: accessToken ? 'accessToken' : 'token',
        tokenLength: finalToken?.length || 0,
      });
    } else if (!isPublicAPI && !finalToken) {
      // 비공개 API인데 토큰이 없는 경우만 경고
      console.warn('⚠️ 인증이 필요한 API에 토큰 없음:', {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    } else if (isPublicAPI) {
      // 공개 API인 경우 토큰 없이 요청
      console.log('🔓 공개 API 요청 (토큰 불필요):', {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }

    // 수정된 설정(config)으로 요청을 보냅니다.
    return config;
  },
  (error) => {
    // 요청 설정 중 에러가 발생하면 여기서 처리합니다.
    return Promise.reject(error);
  },
);

// 3. 응답 인터셉터 설정
// 응답을 받은 후 처리하는 로직입니다.
api.interceptors.response.use(
  (response) => {
    // 정상 응답은 그대로 반환
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 시 로그아웃 처리
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ 토큰이 만료되었습니다. 로그아웃합니다.');
      // ✅ 모든 토큰 관련 데이터 제거
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentTravelPlan');
      // 페이지 새로고침하여 로그인 페이지로 이동
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

// 4. 생성하고 설정한 api 인스턴스를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default api;
