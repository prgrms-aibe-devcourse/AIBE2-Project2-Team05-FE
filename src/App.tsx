import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GlobalStyle } from './styles/GlobalStyle';
import AuthPage from './pages/AuthPage';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import MatchPage from './pages/MatchPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import MyPage from './pages/MyPage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/common/ErrorFallback';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 리셋 로직, 예: 상태 초기화
        window.location.reload();
      }}
    >
      <GlobalStyle />
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
