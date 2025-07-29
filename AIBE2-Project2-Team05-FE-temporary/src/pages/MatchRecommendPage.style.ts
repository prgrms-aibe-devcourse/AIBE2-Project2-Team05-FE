import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
const loadingDots = keyframes`
  0%, 20% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// 메인 컨테이너
export const MatchRecommendPage = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

// 페이지 헤더
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    color: white;
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  }
`;

// 필터 아이콘 버튼
export const FilterIconButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// 메인 콘텐츠
export const MainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
`;

// 빈 상태 스타일
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 400px;
  max-width: 500px;
  margin: 0 auto;
`;

export const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.7;
`;

export const EmptyStateTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
`;

export const EmptyStateText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
`;

export const ResetFiltersButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(238, 90, 36, 0.4);
  }
`;

// 카드 컨테이너
export const CardContainer = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  flex: 1 !important;
`;

// 사용자 카드
export const UserCard = styled.div`
  width: 1020px !important;
  height: 900px !important;
  max-width: 1020px !important;
  background: white !important;
  border-radius: 20px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-8px);
  }

  @media (max-width: 1100px) {
    width: 95% !important;
    max-width: 900px !important;
  }

  @media (max-width: 768px) {
    width: 95% !important;
    height: 600px !important;
  }
`;

// 카드 헤더
export const CardHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 15px 25px !important;
  min-height: 90px !important;
`;

export const HeaderProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const HeaderProfileImage = styled.img`
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  border: 3px solid white !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
`;

export const HeaderProfileInfo = styled.div`
  h2 {
    color: white !important;
    font-size: 22px !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  p {
    color: rgba(255, 255, 255, 0.85) !important;
    font-size: 14px !important;
    margin: 0 !important;
  }
`;

export const HeaderLeft = styled.div`
  h2 {
    font-size: 24px !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  p {
    font-size: 16px !important;
    margin: 5px 0 0 0 !important;
    opacity: 0.9 !important;
  }
`;

export const HeaderRight = styled.div`
  .recruitment-status {
    font-size: 18px !important;
    font-weight: 600 !important;
  }

  .current-members {
    color: #4caf50 !important;
  }
`;

// 카드 콘텐츠
export const CardContent = styled.div`
  padding: 20px 25px !important;
  flex-grow: 1 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 18px !important;

  @media (max-width: 768px) {
    padding: 15px !important;
    gap: 15px !important;
  }
`;

// 지도 섹션
export const MapSection = styled.div`
  height: 260px !important;
  min-height: 260px !important;
  border-radius: 15px !important;
  overflow: hidden !important;
  position: relative !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  background-color: #e9ecef;

  > div {
    width: 100% !important;
    height: 100% !important;
  }

  @media (max-width: 768px) {
    height: 200px !important;
  }
`;

// 정보 섹션
export const InfoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin: 0 25px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .info-icon {
    font-size: 24px;
    color: #555;
  }

  .info-value {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
`;

// 프로필 섹션
export const ProfileSection = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: 15px !important;
  padding: 15px !important;
  background: #f8f9fa !important;
  border-radius: 15px !important;
`;

export const ProfileImage = styled.div`
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
  border: 3px solid #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;

  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
`;

export const ProfileInfo = styled.div`
  h3 {
    margin: 0 !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #333 !important;
  }

  p {
    margin: 5px 0 0 0 !important;
    color: #666 !important;
    font-size: 14px !important;
  }
`;

// 여행 정보 섹션
export const TravelInfoSection = styled.div`
  text-align: center !important;
  padding: 20px !important;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  border-radius: 15px !important;
  border: 1px solid #e9ecef !important;
`;

export const DestinationInfo = styled.div`
  h3 {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #333 !important;
    margin: 0 0 15px 0 !important;
  }
`;

export const TravelDetails = styled.div`
  display: flex !important;
  justify-content: center !important;
  gap: 30px !important;
  flex-wrap: wrap !important;

  @media (max-width: 1100px) {
    flex-direction: column !important;
    gap: 15px !important;
  }
`;

export const DetailItem = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 15px !important;
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  min-width: 180px !important;

  .icon {
    font-size: 18px !important;
  }

  .text {
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #333 !important;
  }

  @media (max-width: 1100px) {
    min-width: auto !important;
  }
`;

// 액션 버튼
export const ActionButtons = styled.div`
  position: absolute !important;
  bottom: 30px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  display: flex !important;
  gap: 40px !important;
  z-index: 1000 !important;
`;

export const ActionButton = styled.button<{ variant?: 'reject' | 'like' }>`
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 24px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  
  ${({ variant }) => variant === 'reject' && `
    background: #ff4757 !important;
    color: white !important;
  `}
  
  ${({ variant }) => variant === 'like' && `
    background: #2ed573 !important;
    color: white !important;
  `}

  &:hover {
    transform: scale(1.1) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
  }
`;

// 필터 버튼
export const FilterButton = styled.button`
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
  background: white !important;
  border: none !important;
  border-radius: 50% !important;
  width: 50px !important;
  height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;

  &:hover {
    transform: scale(1.05) !important;
  }
`;

// 로딩 애니메이션
export const LoadingDots = styled.span`
  animation: ${loadingDots} 1.5s infinite;
  margin-left: 4px;
`;

// 마커 정보 모달
export const MarkerInfoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

export const MarkerInfoContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: ${modalSlideIn} 0.3s ease-out;
`;

export const MarkerInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const MarkerInfoBody = styled.div`
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
`;

// 필터 모달
export const FilterModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

export const FilterModal = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  animation: ${slideDown} 0.3s ease-out;

  h2 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 25px;
    color: #333;
  }
`;

export const FilterOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  select {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: #f8f9fa;
    font-size: 15px;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

export const ResetButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #e9ecef;
  color: #495057;

  &:hover {
    background-color: #ced4da;
  }
`;

export const ApplyButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #6c5ce7;
  color: white;

  &:hover {
    background-color: #5849d1;
  }
`; 