import styled from 'styled-components';

// 메인 컨테이너
export const MatchContainer = styled.div`
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  background-color: #f8f9fa;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif; // 기존 프로젝트 폰트로 통일
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// 헤더
export const MatchHeader = styled.header`
  background-color: #ffffff;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

export const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #3366ff; // 기존 프로젝트 메인 색상 유지
`;

export const NavMenu = styled.nav`
  display: flex;
  gap: 30px;
  align-items: center;
`;

export const NavItem = styled.a<{ $active?: boolean }>`
  font-size: 16px;
  color: ${({ $active }) => $active ? '#3366ff' : '#666666'};
  text-decoration: none;
  transition: color 0.3s;
  font-weight: ${({ $active }) => $active ? '500' : 'normal'};

  &:hover {
    color: #3366ff;
  }
`;

export const UserIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  margin-left: 20px;
  cursor: pointer;
`;

// 메인 콘텐츠
export const MainContent = styled.main`
  display: flex;
  padding: 30px;
  gap: 30px;
  flex: 1;
`;

// 필터 사이드바
export const FilterSidebar = styled.aside`
  width: 280px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: fit-content;
`;

export const FilterTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333333;
`;

export const FilterGroup = styled.div`
  margin-bottom: 20px;
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
  display: block;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  background-color: #ffffff;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23666666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
`;

export const FilterButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #3366ff; // 메인 색상 유지
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background-color: #2952cc;
  }
`;

// 매칭 결과
export const MatchingResults = styled.section`
  flex: 1;
`;

export const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ResultsTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #333333;
`;

export const ResultsCount = styled.span`
  color: #3366ff;
`;

export const SortDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666666;
`;

// 슬라이더
export const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
`;

export const SliderWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
`;

export const Slider = styled.div<{ $transform: number }>`
  display: flex;
  height: 100%;
  transition: transform 0.5s ease;
  transform: translateX(${({ $transform }) => $transform}%);
`;

export const Slide = styled.div`
  min-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 사용자 카드
export const UserCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 95%;
`;

export const UserCardImg = styled.img`
  width: 100%;
  height: 60%;
  object-fit: cover;
`;

export const UserCardInfo = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #666666;
    margin-bottom: 16px;
  }
`;

export const UserCardTags = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  span {
    background-color: #e9ecef;
    color: #666666;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
  }
`;

// 슬라이더 네비게이션
export const SliderNav = styled.div`
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  z-index: 10;
  padding: 0 20px;
  pointer-events: none;
`;

export const SliderButton = styled.button<{ $direction: 'prev' | 'next' }>`
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  color: #333;
  font-size: 24px;
  pointer-events: auto;
  
  ${({ $direction }) => $direction === 'prev' && `
    margin-left: -70px;
  `}
  
  ${({ $direction }) => $direction === 'next' && `
    margin-right: -70px;
  `}

  &:hover {
    background-color: #ffffff;
  }
`; 