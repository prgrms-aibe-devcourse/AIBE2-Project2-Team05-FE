import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  // 팀원 프로젝트의 폰트 및 스타일 통합
  @import url('https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css');
  
  // MiSans 폰트 정의 (팀원 프로젝트에서 가져온 폰트)
  @font-face {
    font-family: 'MiSans';
    src: url('https://assets-persist.lovart.ai/agent-static-assets/MiSans-Regular.ttf')
      format('truetype');
    font-weight: normal;
  }
  
  @font-face {
    font-family: 'MiSans';
    src: url('https://assets-persist.lovart.ai/agent-static-assets/MiSans-Medium.ttf')
      format('truetype');
    font-weight: 500;
  }
  
  @font-face {
    font-family: 'MiSans';
    src: url('https://assets-persist.lovart.ai/agent-static-assets/MiSans-Bold.ttf')
      format('truetype');
    font-weight: bold;
  }

  // 기본 리셋 스타일
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  // 기본 폰트 및 스타일
  body {
    background: ${({ theme }) => theme?.body || '#ffffff'};
    color: ${({ theme }) => theme?.text || '#333333'};
    transition: all 0.50s linear;
    // 폰트 우선순위: Noto Sans KR > MiSans > 시스템 폰트
    font-family: 'Noto Sans KR', 'MiSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  // 코드 폰트
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  // 링크 기본 스타일
  a {
    color: inherit;
    text-decoration: none;
  }

  // 버튼 기본 스타일 리셋
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }

  // 리스트 스타일 리셋
  ul, ol {
    list-style: none;
  }

  // 이미지 기본 스타일
  img {
    max-width: 100%;
    height: auto;
  }

  // 로딩 스핀 애니메이션
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 페이드인 애니메이션 (기존 프로젝트에서 사용)
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // 스크롤바 커스터마이징
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  // 포커스 스타일
  *:focus {
    outline: 2px solid #3682F8;
    outline-offset: 2px;
  }

  // 선택 텍스트 스타일
  ::selection {
    background-color: #3682F8;
    color: white;
  }
`;
