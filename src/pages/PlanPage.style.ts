import styled from 'styled-components';

// 전체 컨테이너
export const Container = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  background-color: #ffffff;
  color: #333333;
  line-height: 1.6;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
`;

// 헤더 스타일
export const Header = styled.header`
  background-color: #3682f8;
  color: white;
  padding: 20px 40px;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    font-size: 28px;
  }
`;

export const NavMenu = styled.div`
  display: flex;
  gap: 30px;
`;

export const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

// 메인 정보 섹션
export const MainInfo = styled.div`
  padding: 40px;
  text-align: center;
  background-color: #ffffff;
`;

export const TripTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

export const TripDate = styled.p`
  font-size: 18px;
  color: #666666;
  margin-bottom: 30px;
`;

export const SummaryCards = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SummaryCard = styled.div`
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
`;

export const CardTitle = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 10px;
  font-weight: 500;
`;

export const CardValue = styled.p`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

// 타임라인 섹션
export const Timeline = styled.div`
  padding: 0 40px 40px;
  background-color: #ffffff;
`;

export const DaySection = styled.div`
  margin-bottom: 40px;
  position: relative;
`;

export const DayMarker = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const DayCircle = styled.div`
  width: 40px;
  height: 40px;
  background-color: #3682f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 15px;
  font-size: 18px;
`;

export const DayTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

export const DayDate = styled.span`
  color: #6c757d;
  font-size: 16px;
`;

export const TimelineEvents = styled.div`
  margin-left: 20px;
  border-left: 2px solid #e9ecef;
  padding-left: 30px;
`;

export const Event = styled.div`
  position: relative;
  margin-bottom: 30px;

  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #3682f8;
    border-radius: 50%;
    left: -36px;
    top: 10px;
  }
`;

export const EventTime = styled.div`
  font-weight: 500;
  color: #3682f8;
  margin-bottom: 5px;
  font-size: 16px;
`;

export const EventTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
`;

export const EventLocation = styled.div`
  display: flex;
  align-items: center;
  color: #6c757d;
  margin-bottom: 10px;
  font-size: 14px;

  i {
    margin-right: 5px;
    color: #6c757d;
  }
`;

export const EventDescription = styled.p`
  color: #333;
  margin-bottom: 10px;
  line-height: 1.6;
`;

export const EventDetails = styled.div`
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-top: 10px;
  border: 1px solid #e9ecef;
`;

export const EventImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: #e9ecef;
  border-radius: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 14px;

  i {
    margin-right: 8px;
  }
`;

export const EventTags = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background-color: #e7f3ff;
  color: #3682f8;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

export const PriceTag = styled.span`
  background-color: #f1f3f4;
  color: #5f6368;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

// 푸터 섹션
export const Footer = styled.footer`
  padding: 20px 40px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

export const Likes = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const LikeButton = styled.button<{ $isLiked: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: ${(props) => (props.$isLiked ? '#ff4d4d' : '#6c757d')};
  transition: all 0.2s ease;

  i {
    font-size: 22px;
    color: ${(props) => (props.$isLiked ? '#ff4d4d' : '#6c757d')};
  }

  &:hover {
    color: #ff4d4d;

    i {
      color: #ff4d4d;
    }
  }
`;

export const ProfileImages = styled.div`
  display: flex;
  margin-right: 10px;
`;

export const ProfileImage = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e9ecef;
  border: 2px solid white;
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 12px;
  font-weight: bold;

  &:first-child {
    margin-left: 0;
  }
`;

export const LikeText = styled.span`
  color: #3682f8;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

export const ShareButton = styled.button`
  background-color: #3682f8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2c5aa0;
  }

  i {
    font-size: 16px;
  }
`;

// 후기 섹션 스타일
export const ReviewSection = styled.section`
  margin: 40px 40px;
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
`;

export const SectionTitle = styled.div`
  margin-bottom: 24px;
  text-align: center;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

export const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ReviewCard = styled.div`
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const ReviewContent = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
`;

export const ReviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const ReviewTag = styled.span`
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;
