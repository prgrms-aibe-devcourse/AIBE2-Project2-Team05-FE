import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/user';

// AuthContext에서 제공할 값들의 타입을 정의합니다.
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean; // 로딩 상태 추가
  login: (newToken: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void; // 사용자 정보 업데이트 함수 추가
}

// React.createContext를 사용하여 AuthContext를 생성합니다.
// 이 컨텍스트는 앱의 다른 부분에서 인증 상태에 접근할 수 있게 해줍니다.
// undefined로 초기화하여, Provider 외부에서 사용할 때 에러를 발생시킬 수 있도록 합니다.
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// AuthProvider 컴포넌트를 정의합니다.
// 이 컴포넌트는 인증 상태를 관리하고, 하위 컴포넌트에 AuthContext를 제공합니다.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기에는 로딩 중

  useEffect(() => {
    console.log('🚀 앱 시작 - localStorage 토큰 검증 시작');
    console.log('🔍 useEffect 실행됨 - AuthContext 초기화');

    try {
      const validationResult = validateAndCleanTokens();
      console.log('📋 토큰 검증 결과:', validationResult);

      if (validationResult.hasValidToken) {
        // 정리 후 남은 유효한 토큰으로 로그인 상태 복원
        const cleanToken =
          localStorage.getItem('token') || localStorage.getItem('accessToken');
        const cleanUser = localStorage.getItem('user');

        console.log('🔍 토큰 복원 시도:', {
          hasToken: !!cleanToken,
          hasUser: !!cleanUser,
          tokenLength: cleanToken?.length || 0,
        });

        if (cleanToken && cleanUser) {
          try {
            console.log('✅ 정리된 토큰으로 로그인 상태 복원');
            const userData = JSON.parse(cleanUser);
            setToken(cleanToken);
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'ADMIN');

            console.log('👤 복원된 사용자 정보:', {
              email: userData.email,
              role: userData.role,
              tokenEmail: validationResult.tokenEmail,
            });
          } catch (error) {
            console.error('❌ 저장된 사용자 정보 파싱 실패:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setIsAdmin(false);
          }
        } else {
          console.log('❌ 토큰 또는 사용자 정보 누락');
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setIsAdmin(false);
        }
      } else {
        console.log('❌ 유효한 토큰이 없음 - 로그아웃 상태 유지');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ AuthContext 초기화 중 오류:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setIsAdmin(false);
    } finally {
      // 모든 경우에 로딩 완료
      setIsLoading(false);
      console.log('🏁 AuthContext 초기화 완료');
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    console.log('🔐 로그인 시작:', {
      email: userData.email,
      role: userData.role,
    });
    setIsLoading(true); // 로그인 중 로딩 시작

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('accessToken', newToken); // ✅ token → accessToken으로 변경
    localStorage.setItem('user', JSON.stringify(userData));

    if (userData.role === 'ADMIN') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    setIsLoading(false); // 로그인 완료 후 로딩 종료
    console.log('✅ 로그인 완료:', {
      email: userData.email,
      role: userData.role,
    });
  };

  const logout = () => {
    console.log('🚪 로그아웃 시작');
    setIsLoading(true); // 로그아웃 중 로딩 시작

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    // ✅ 모든 사용자 관련 localStorage 데이터 정리
    localStorage.removeItem('accessToken'); // ✅ token → accessToken으로 변경
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile'); // ✅ MyPage 프로필 데이터 정리
    localStorage.removeItem('currentTravelPlan'); // ✅ 여행 계획 데이터 정리

    console.log('🧹 사용자 데이터 완전 정리 완료');

    setIsLoading(false); // 로그아웃 완료 후 로딩 종료
    console.log('✅ 로그아웃 완료');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('👤 AuthContext 사용자 정보 업데이트:', updatedUser);
    }
  };

  /**
   * JWT 토큰에서 이메일 추출 (디코딩)
   */
  const decodeTokenEmail = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null; // JWT의 sub 필드가 이메일
    } catch {
      return null;
    }
  };

  /**
   * localStorage 토큰 검증 및 정리
   */
  const validateAndCleanTokens = () => {
    console.log('🧹 localStorage 토큰 검증 및 정리 시작');

    // 앱 버전 확인 (선택사항)
    const APP_VERSION = '1.0.0';
    const savedVersion = localStorage.getItem('appVersion');

    if (!savedVersion || savedVersion !== APP_VERSION) {
      console.log('🔄 앱 버전 변경 감지, localStorage 전체 정리');
      localStorage.clear();
      localStorage.setItem('appVersion', APP_VERSION);
      return {
        hasValidToken: false,
        tokenEmail: null,
        userEmail: null,
      };
    }

    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    let userEmail: string | null = null;
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        userEmail = parsedUser.email?.toLowerCase();
      } catch (e) {
        console.warn('⚠️ 저장된 사용자 정보 파싱 실패, 정리합니다.');
        localStorage.removeItem('user');
      }
    }

    const currentTime = Math.floor(Date.now() / 1000);
    let validToken: string | null = null;
    let validTokenEmail: string | null = null;

    // token 검증
    if (token) {
      const tokenEmail = decodeTokenEmail(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp < currentTime;

        console.log('🔍 token 검증:', {
          email: tokenEmail,
          expired: isExpired,
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        });

        if (!isExpired && tokenEmail) {
          validToken = token;
          validTokenEmail = tokenEmail.toLowerCase();
        } else {
          console.warn('⚠️ token 만료됨, 제거합니다.');
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.warn('⚠️ token 디코딩 실패, 제거합니다.');
        localStorage.removeItem('token');
      }
    }

    // accessToken 검증
    if (accessToken) {
      const accessTokenEmail = decodeTokenEmail(accessToken);
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const isExpired = payload.exp < currentTime;

        console.log('🔍 accessToken 검증:', {
          email: accessTokenEmail,
          expired: isExpired,
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        });

        if (isExpired) {
          console.warn('⚠️ accessToken 만료됨, 제거합니다.');
          localStorage.removeItem('accessToken');
        } else if (
          validToken &&
          accessTokenEmail?.toLowerCase() !== validTokenEmail
        ) {
          console.warn('⚠️ accessToken이 다른 계정용입니다, 제거합니다.');
          localStorage.removeItem('accessToken');
        } else if (!validToken && accessTokenEmail) {
          // token이 없고 accessToken만 유효한 경우
          validToken = accessToken;
          validTokenEmail = accessTokenEmail.toLowerCase();
        }
      } catch (e) {
        console.warn('⚠️ accessToken 디코딩 실패, 제거합니다.');
        localStorage.removeItem('accessToken');
      }
    }

    // 사용자 정보와 토큰 일치성 검증
    if (userEmail && validTokenEmail && userEmail !== validTokenEmail) {
      console.warn(
        '⚠️ 사용자 정보와 토큰이 일치하지 않습니다. 모든 데이터를 정리합니다.',
        {
          userEmail,
          validTokenEmail,
        },
      );

      // 모든 데이터 정리
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      validToken = null;
      validTokenEmail = null;
      userEmail = null;
    }

    console.log('✅ localStorage 정리 완료:', {
      hasValidToken: !!validToken,
      tokenEmail: validTokenEmail,
      userEmail: userEmail,
      isConsistent:
        !validTokenEmail || !userEmail || validTokenEmail === userEmail,
    });

    return {
      hasValidToken: !!validToken,
      tokenEmail: validTokenEmail,
      userEmail: userEmail,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isAdmin,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 커스텀 훅을 정의합니다.
// 이 훅은 AuthContext의 값을 쉽게 사용할 수 있도록 도와줍니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
