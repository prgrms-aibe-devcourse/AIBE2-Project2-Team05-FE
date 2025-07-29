import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    min-height: 100vh; /* 최소 높이를 100vh로 설정하여 스크롤 가능 */
  }

  #root {
    min-height: 100vh; /* 최소 높이를 100vh로 설정 */
  }
  
  * {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
    font-family: 'Noto Sans KR', sans-serif;
    line-height: 1.5;
  }
`;
