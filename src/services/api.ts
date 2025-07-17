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
    // localStorage에서 'accessToken'이라는 이름으로 저장된 토큰을 가져옵니다.
    const token = localStorage.getItem('accessToken');

    // 토큰이 존재한다면,
    if (token) {
      // 모든 요청의 Authorization 헤더에 'Bearer [토큰]' 형태로 토큰을 추가합니다.
      // 'Bearer'는 JWT(JSON Web Token)를 사용한다는 표준 방식입니다.
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 수정된 설정(config)으로 요청을 보냅니다.
    return config;
  },
  (error) => {
    // 요청 설정 중 에러가 발생하면 여기서 처리합니다.
    return Promise.reject(error);
  },
);

// 3. 생성하고 설정한 api 인스턴스를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default api;
