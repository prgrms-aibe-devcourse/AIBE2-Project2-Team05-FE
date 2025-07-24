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
// ======= 사용자 관련 API 함수들 =======

// 3. 회원탈퇴 API 함수
// 사용자가 회원탈퇴를 요청할 때 호출됩니다.
export const deleteUser = async () => {
  try {
    // DELETE 요청을 백엔드 '/api/user/delete' 엔드포인트로 보냅니다.
    // 토큰은 인터셉터에서 자동으로 헤더에 추가됩니다.
    const response = await api.delete('/api/user/delete');
    return response.data;
  } catch (error) {
    // 에러가 발생하면 콘솔에 출력하고 다시 던집니다.
    console.error('회원탈퇴 요청 중 오류:', error);
    throw error;
  }
};

// 4. 사용자 검색 API 함수
// 닉네임으로 사용자를 검색할 때 호출됩니다.
export const searchUsers = async (keyword: string) => {
  try {
    // GET 요청을 백엔드 '/api/user/search' 엔드포인트로 보냅니다.
    const response = await api.get(`/api/user/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    // 에러가 발생하면 콘솔에 출력하고 다시 던집니다.
    console.error('사용자 검색 중 오류:', error);
    throw error;
  }
};

// 5. 신고하기 API 함수
// 다른 사용자를 신고할 때 호출됩니다.
export const createReport = async (reportData: {
  reportedUserId: number;  // 신고당하는 사용자의 ID
  reportType: string;      // 신고 유형 (예: '욕설', '스팸', '부적절한 내용' 등)
  description: string;     // 신고 상세 설명
}) => {
  try {
    // POST 요청을 백엔드 '/api/report' 엔드포인트로 보냅니다.
    const response = await api.post('/api/report', reportData);
    return response.data;
  } catch (error) {
    // 에러가 발생하면 콘솔에 출력하고 다시 던집니다.
    console.error('신고 요청 중 오류:', error);
    throw error;
  }
};

// 6. 비밀번호 변경 API 함수
// 사용자가 비밀번호를 변경할 때 호출됩니다.
export const changePassword = async (passwordData: {
  currentPassword: string;  // 현재 비밀번호
  newPassword: string;      // 새 비밀번호
  confirmPassword?: string; // 새 비밀번호 확인 (선택적)
}) => {
  try {
    // PUT 요청을 백엔드 '/api/user/change-password' 엔드포인트로 보냅니다.
    const response = await api.put('/api/user/change-password', passwordData);
    return response.data;
  } catch (error) {
    // 에러가 발생하면 콘솔에 출력하고 다시 던집니다.
    console.error('비밀번호 변경 중 오류:', error);
    throw error;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/api/profile/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.text(); // 이미지 URL 반환
};

// 5. 생성하고 설정한 api 인스턴스를 다른 파일에서 사용할 수 있도록 내보냅니다.
export default api;
