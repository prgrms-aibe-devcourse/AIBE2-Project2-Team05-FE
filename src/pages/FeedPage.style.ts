import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  background-color: #f0f2f5;
  font-family: 'NotoSansHans', sans-serif;
`;

export const MainContent = styled.main`
  width: 100%;
  display: flex;
  gap: 30px;
  padding: 0 20px;
`;

export const FeedContainer = styled.div`
  width: 60%;
  margin: 0 auto;
`;

export const Sidebar = styled.aside`
  width: 293px;
  position: sticky;
  top: 100px;
  height: fit-content;

  @media (max-width: 1000px) {
    display: none;
  }
`;

export const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #8e8e8e;
`;
