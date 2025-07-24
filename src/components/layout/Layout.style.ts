import styled, { keyframes } from 'styled-components';

// --- 추가: 페이드 인 애니메이션 ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

export const ContentContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

export const Main = styled.main`
  flex-grow: 1;
  padding: 20px;
  background-color: #f8f9fa;
  
  // --- 추가: 애니메이션 적용 ---
  animation: ${fadeIn} 0.2s ease-in-out;
`; 