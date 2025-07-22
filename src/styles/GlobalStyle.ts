import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* 브라우저 스크롤만 막습니다. */
  }

  #root {
    height: 100%; /* 높이만 100%로 설정합니다. */
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