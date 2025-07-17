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
import SignupPage from './pages/SignupPage';

function App() {
  const location = useLocation();

  return (
    <>
      <GlobalStyle />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
