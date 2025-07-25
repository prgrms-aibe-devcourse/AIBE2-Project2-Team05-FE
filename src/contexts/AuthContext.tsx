import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/user';

// AuthContext에서 제공할 값들의 타입을 정의합니다.
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (newToken: string, userData: User) => void;
  logout: () => void;
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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if(parsedUser.role === 'ADMIN') {
            setIsAdmin(true);
        }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    if (userData.role === 'ADMIN') {
        setIsAdmin(true);
    } else {
        setIsAdmin(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isAdmin, login, logout }}>
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
