import React, { createContext, useState, useContext, useEffect } from 'react';

// AuthContext에서 제공할 값들의 타입을 정의합니다.
interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; role: string } | null; // role 추가
  login: (token: string, email: string, role: string) => void; // login 함수 인자 변경
  logout: () => void;
  isLoading: boolean; // 로딩 상태 추가
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    // 앱이 처음 로드될 때 localStorage에서 토큰과 사용자 정보를 확인합니다.
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    console.log('AuthProvider useEffect - token:', token);
    console.log('AuthProvider useEffect - userEmail:', userEmail);
    console.log('AuthProvider useEffect - userRole:', userRole);

    if (token && userEmail && userRole) {
      setIsAuthenticated(true);
      setUser({ email: userEmail, role: userRole });
    }

    setIsLoading(false); // 초기화 완료
  }, []);

  const login = (token: string, email: string, role: string) => {
    // 로그인 성공 시 토큰과 사용자 정보를 localStorage에 저장합니다.
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUser({ email, role });
  };

  const logout = () => {
    // 로그아웃 시 localStorage에서 토큰과 사용자 정보를 제거합니다.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
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
