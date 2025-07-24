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
    // ✅ accessToken을 우선적으로 사용
    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token'); // 하위 호환성

    // ✅ 사용할 토큰 결정 (accessToken이 우선)
    const finalToken = accessToken || token;

    // 토큰이 존재한다면,
    if (finalToken) {
      // 모든 요청의 Authorization 헤더에 'Bearer [토큰]' 형태로 토큰을 추가합니다.
      config.headers['Authorization'] = `Bearer ${finalToken}`;

      // ✅ 상세한 토큰 디버깅 로그
      console.log('🔐 API 요청에 토큰 포함:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        tokenSource: accessToken ? 'accessToken' : 'token',
        tokenLength: finalToken?.length || 0,
        tokenPreview: finalToken ? finalToken.substring(0, 50) + '...' : 'null',
        headers: {
          Authorization: config.headers['Authorization'],
          'Content-Type': config.headers['Content-Type'],
        },
      });
    } else {
      console.error('❌ API 요청에 토큰 없음:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        localStorage: {
          token: localStorage.getItem('token'),
          accessToken: localStorage.getItem('accessToken'),
          user: localStorage.getItem('user'),
          allKeys: Object.keys(localStorage),
        },
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 페이지 새로고침하여 로그인 페이지로 이동
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

// 4. 생성하고 설정한 api 인스턴스를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default api;
