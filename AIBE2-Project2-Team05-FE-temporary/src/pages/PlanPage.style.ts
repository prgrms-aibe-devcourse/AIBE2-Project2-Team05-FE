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
  position: relative; /* 절대 위치 삭제 버튼을 위해 추가 */
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
  gap: 16px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SummaryCard = styled.div`
  flex: 1;
  background: #f8f9ff;
  border: 1px solid #e8ebff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    border-color: #d0d5ff;
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.08);
  }
`;

export const CardTitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

export const CardValue = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #333;

  &.clickable {
    color: #3682f8;
    text-decoration: underline;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      opacity: 0.7;
      transform: translateY(-1px);
    }

    i {
      color: #888;
      font-size: 16px;
    }
  }
`;

// 여행 스타일 섹션 추가
export const StyleSection = styled.div`
  margin-top: 30px;
`;

export const StyleTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

export const StyleCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8f9ff;
  border: 1px solid #e8ebff;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s;
  cursor: default;

  &:hover {
    background-color: #f0f2ff;
    border-color: #d0d5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.1);
  }
`;

export const StyleEmoji = styled.span`
  font-size: 20px;
`;

export const StyleLabel = styled.span`
  color: #3682f8;
  font-size: 14px;
  font-weight: 500;
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
  gap: 15px;
`;

export const DayCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3682f8 0%, #5a9bff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(54, 130, 248, 0.2);
`;

export const DayTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

export const DayDate = styled.span`
  font-size: 14px;
  color: #888;
`;

export const TimelineEvents = styled.div`
  margin-left: 20px;
  border-left: 2px solid #e9ecef;
  padding-left: 30px;
`;

export const Event = styled.div`
  position: relative;
  margin-bottom: 32px;
  padding: 24px;
  background-color: #fafbfc;
  border-radius: 16px;
  border: 1px solid #f0f2f5;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #3682f8;
    border-radius: 50%;
    left: -42px;
    top: 28px;
    border: 3px solid #ffffff;
    box-shadow: 0 0 0 1px #e9ecef;
  }
`;

export const EventTime = styled.div`
  font-weight: 700;
  color: #000;
  margin-bottom: 10px;
  font-size: 15px;
  background-color: #f0f2f8;
  padding: 6px 14px;
  border-radius: 16px;
  display: inline-block;
  border: 2px solid #3682f8;
  letter-spacing: 0.5px;
`;

export const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #3682f8;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }

  i {
    color: #888;
    font-size: 16px;
  }
`;

export const EventLocation = styled.div`
  display: flex;
  align-items: center;
  color: #555;
  margin: 0;
  font-size: 14px;

  span {
    cursor: pointer;
    color: #3682f8;
    text-decoration: underline;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      opacity: 0.7;
    }

    i {
      color: #888;
      font-size: 14px;
    }
  }
`;

export const EventDescription = styled.p`
  color: #333;
  margin: 12px 0 10px 0;
  line-height: 1.7;
  font-size: 14px;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #3682f8;

  strong {
    color: #3682f8;
    font-weight: 600;
    margin-right: 8px;
  }
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
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
  color: #2d3436;
  padding: 6px 12px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid #fdcb6e;
  box-shadow: 0 2px 6px rgba(253, 203, 110, 0.3);
  transition: all 0.2s ease;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(253, 203, 110, 0.4);
  }
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

// 목적지 컨테이너 (여행지 중앙정렬을 위함)
export const DestinationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

// 소개글 섹션
export const IntroSection = styled.section`
  margin: 40px 40px;
  padding: 30px;
  background-color: #f8f9ff;
  border-radius: 16px;
  border: 1px solid #e8ebff;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #3682f8 0%, #5a9bff 100%);
    border-radius: 4px 0 0 4px;
  }
`;

export const IntroTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const IntroContent = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: #555;
  white-space: pre-wrap;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  box-shadow: 0 2px 8px rgba(54, 130, 248, 0.06);
`;

// 목적지 카테고리 배지
interface CategoryStyle {
  icon: string;
  background: string;
  textColor: string;
  borderColor: string;
}

export const DestinationCategoryBadge = styled.span<{
  categoryStyle: CategoryStyle;
}>`
  background: ${(props) => props.categoryStyle.background};
  color: ${(props) => props.categoryStyle.textColor};
  border: 2px solid ${(props) => props.categoryStyle.borderColor};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

// 카테고리 아이콘
export const CategoryIcon = styled.span`
  font-size: 12px;
  line-height: 1;
`;

// 이벤트 장소 카테고리 배지
export const CategoryBadge = styled.span<{
  categoryStyle: CategoryStyle;
}>`
  background: ${(props) => props.categoryStyle.background};
  color: ${(props) => props.categoryStyle.textColor};
  border: 2px solid ${(props) => props.categoryStyle.borderColor};
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }
`;

// 이벤트 헤더 (장소명, 카테고리, 금액 한 줄 배치)
export const EventHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

// 장소 정보 컨테이너 (제목 + 위치)
export const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 이벤트 정보 (카테고리 + 금액)
export const EventInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// ✅ 작성자 정보 섹션 스타일 (피드 모달용)
export const AuthorSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #efefef;
  background-color: #fafafa;
`;

export const AuthorProfile = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

export const AuthorAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3682f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const AuthorName = styled.span`
  font-weight: 600;
  font-size: 18px;
  color: #333;
`;

export const AuthorAge = styled.span`
  font-size: 14px;
  color: #666;
`;

export const AuthorDescription = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #888;
  text-align: center;
  font-style: italic;
`;
