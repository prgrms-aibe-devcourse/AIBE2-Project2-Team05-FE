import React, { createContext, useState, useContext, ReactNode } from 'react';

// 사용자 정보 타입을 정의합니다.
interface User {
  id: string;
  email: string;
  nickname: string;
}

// AuthContext에서 제공할 값들의 타입을 정의합니다.
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// AuthContext를 생성합니다. 초기값은 undefined로 설정합니다.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트의 props 타입을 정의합니다.
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트를 정의합니다.
// 이 컴포넌트는 인증 상태를 관리하고, 하위 컴포넌트에 AuthContext를 제공합니다.
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // 컴포넌트가 처음 렌더링될 때 localStorage에서 사용자 정보를 가져와 초기 상태를 설정합니다.
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 로그인 함수
  const login = (userData: User) => {
    setUser(userData);
    // 사용자 정보를 localStorage에 저장합니다.
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    // localStorage에서 사용자 정보를 제거합니다.
    localStorage.removeItem('user');
  };

  // 사용자가 인증되었는지 여부를 확인합니다. !! 연산자는 값을 boolean으로 변환합니다.
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 커스텀 훅을 정의합니다.
// 이 훅을 사용하면 컴포넌트에서 쉽게 AuthContext에 접근할 수 있습니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
