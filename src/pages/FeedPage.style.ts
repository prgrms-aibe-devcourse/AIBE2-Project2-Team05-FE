import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f0f2f5;
  font-family: 'NotoSansHans', sans-serif;
`;

export const MainContent = styled.main`
  width: 100%;
  max-width: 935px;
  display: flex;
  gap: 30px;
`;

export const FeedContainer = styled.div`
  width: 100%;
  max-width: 614px;
  
  @media (max-width: 1000px) {
    max-width: 100%;
  }
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