import styled from 'styled-components';

// 메인 컨테이너
export const PlanPageContainer = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 100vh;
`;

// 여행 정보 섹션
export const TripInfoSection = styled.div`
  padding: 40px;
  text-align: center;
  background-color: #ffffff;
`;

export const TripTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333333;
`;

export const TripDate = styled.div`
  font-size: 18px;
  color: #666666;
  margin-bottom: 30px;
`;

export const SummaryCards = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
`;

export const SummaryCard = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

export const CardTitle = styled.div`
  font-size: 16px;
  color: #888888;
  margin-bottom: 10px;
`;

export const CardValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333333;
`;

// 타임라인 섹션
export const TimelineSection = styled.div`
  padding: 0 40px 40px;
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
  background-color: #3388ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 15px;
`;

export const DayTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: #333333;
`;

export const DayDate = styled.span`
  color: #888888;
  margin-left: 10px;
  font-size: 16px;
`;

export const TimelineEvents = styled.div`
  margin-left: 20px;
  border-left: 2px solid #e0e0e0;
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
    background-color: #3388ff;
    border-radius: 50%;
    left: -36px;
    top: 10px;
  }
`;

export const EventTime = styled.div`
  font-weight: 500;
  color: #3388ff;
  margin-bottom: 5px;
`;

export const EventTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333333;
`;

export const EventLocation = styled.div`
  display: flex;
  align-items: center;
  color: #666666;
  margin-bottom: 10px;

  i {
    margin-right: 5px;
    color: #888888;
  }
`;

export const EventDescription = styled.p`
  color: #333333;
  line-height: 1.6;
  margin-bottom: 10px;
`;

export const EventDetails = styled.div`
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  margin-top: 10px;
`;

export const EventImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888888;
  font-size: 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const EventTags = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background-color: #e8f1ff;
  color: #3388ff;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
`;

export const PriceTag = styled.span`
  background-color: #f0f0f0;
  color: #666666;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
`;

// 푸터
export const PlanFooter = styled.footer`
  padding: 20px 40px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LikesSection = styled.div`
  display: flex;
  align-items: center;
`;

export const LikeButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 15px;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  i {
    color: ${(props) =>
      props.className?.includes('liked') ? '#ff4d4d' : '#cccccc'};
    margin-right: 5px;
    font-size: 22px;
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
  background-color: #e0e0e0;
  border: 2px solid white;
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888888;
  font-size: 12px;
  overflow: hidden;

  &:first-child {
    margin-left: 0;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const LikeText = styled.div`
  color: #3388ff;
  font-weight: 500;
`;
