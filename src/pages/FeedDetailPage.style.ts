import styled, { css } from 'styled-components';

const getCategoryColor = (category: string) => {
    switch (category) {
      case '교통': return '#6D9EEB';
      case '식사': return '#F6B26B';
      case '관광': return '#A2C4C9';
      case '숙박': return '#8E7CC3';
      case '카페': return '#C27BA0';
      default: return '#B7B7B7';
    }
  };

// --- 전체 페이지 컨테이너 ---
export const PageContainer = styled.div`
  background-color: #F8F9FA;
  font-family: 'Pretendard', sans-serif;
`;

// --- 1. 게시물 섹션 ---
export const PostSection = styled.section`
  background-color: #FFFFFF;
  padding-bottom: 20px;
`;

export const BlueHeader = styled.header`
  background-color: #3682F8;
  color: white;
  padding: 15px 20px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export const ShareIcon = styled.div`
  position: absolute;
  right: 20px;
  font-size: 22px;
  cursor: pointer;
`;

export const PostContentWrapper = styled.div`
  padding: 20px;
`;

export const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const AuthorAvatar = styled.img<{ isComment?: boolean }>`
  width: ${props => props.isComment ? '40px' : '50px'};
  height: ${props => props.isComment ? '40px' : '50px'};
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
`;

export const AuthorName = styled.span<{ isComment?: boolean }>`
  font-weight: 700;
  font-size: ${props => props.isComment ? '14px' : '16px'};
  margin-bottom: 5px;
  display: block;
`;

export const AuthorTag = styled.span`
  background-color: #F1F3F5;
  color: #868E96;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  margin-right: 5px;
`;

export const FollowButton = styled.button`
  margin-left: auto;
  background-color: #3682F8;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 8px 15px;
  font-weight: 700;
  cursor: pointer;
`;

export const PostTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 10px;
  line-height: 1.4;
`;

export const PostMeta = styled.div`
  color: #868E96;
  font-size: 14px;
  margin-bottom: 20px;
  span {
    margin-right: 5px;
  }
`;

export const PostImageSlider = styled.div`
  background-color: #F1F3F5;
  height: 250px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ADB5BD;
  font-size: 16px;
  margin-bottom: 20px;
`;

export const PostText = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: #343A40;
  margin-bottom: 20px;
`;

export const HashtagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

export const Hashtag = styled.span`
  color: #3682F8;
  background-color: #E7F5FF;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 14px;
`;

export const InteractionStats = styled.div`
  color: #868E96;
  font-size: 14px;
  span {
    margin-right: 15px;
  }
`;

export const Divider = styled.div`
  height: 10px;
  background-color: #F1F3F5;
`;

// --- 2. 상세 일정 섹션 ---
export const PlanSection = styled.section`
  background-color: #FFFFFF;
  padding: 20px;
`;

export const PlanHeader = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
`;

export const InfoCards = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  background-color: #FAFAFA;
  padding: 20px;
  border-radius: 12px;
`;

export const InfoCard = styled.div`
  background-color: white;
  padding: 15px 25px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex: 1;
  margin: 0 10px;
  min-width: 120px;
`;

export const CardLabel = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0 0 5px;
`;

export const CardValue = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

export const TimelineContainer = styled.div`
  position: relative;
`;

export const DayHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0 20px;
`;

export const DayBadge = styled.span`
  background-color: #3A8DFF;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-right: 15px;
  flex-shrink: 0;
`;

export const DayTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

export const DayDate = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #888;
    margin-left: 10px;
`;

export const EventRow = styled.div`
  display: flex;
  position: relative;
  margin-bottom: 20px;
`;

export const TimelineLine = styled.div`
  position: absolute;
  left: 14px;
  top: 15px;
  bottom: -20px;
  width: 2px;
  background-color: #EAEAEA;
`;

export const TimelineDot = styled.div`
    position: absolute;
    left: 8px;
    top: 5px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #3A8DFF;
    z-index: 1;
`;

export const EventTime = styled.span`
    font-size: 14px;
    color: #888;
    width: 60px;
    flex-shrink: 0;
    position: relative;
    top: 5px;
    left: 35px;
`;

export const EventCard = styled.div`
  background-color: #FAFAFA;
  border-radius: 10px;
  padding: 20px;
  flex-grow: 1;
  margin-left: 25px; /* Adjust based on dot and time width */
`;

export const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

export const CategoryBadge = styled.span<{ category: string }>`
  background-color: ${props => getCategoryColor(props.category)};
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

export const EventLocation = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 10px;
  &::before {
    content: '📍';
    margin-right: 5px;
  }
`;

export const EventDescription = styled.p`
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0;
`;

export const ImagePlaceholder = styled.div`
  background-color: #EAEAEA;
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #AAA;
  font-size: 14px;
  margin-top: 15px;
`;

export const CostBadge = styled.span`
  display: inline-block;
  background-color: #E6F3FF;
  color: #3A8DFF;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 15px;
  float: right;
`;

// --- 3. 댓글 섹션 ---
export const CommentsSection = styled.section`
  background-color: #FFFFFF;
  padding: 20px;
`;

export const CommentsTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
`;

export const Comment = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
`;

export const CommentContent = styled.div``;

export const CommentText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 5px;
`;

export const CommentTime = styled.span`
  font-size: 12px;
  color: #868E96;
`;

export const CommentInputWrapper = styled.div`
  display: flex;
  padding: 10px;
  background-color: #F8F9FA;
  border-radius: 25px;
`;

export const CommentInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  padding: 0 10px;
  font-size: 14px;
`;

export const CommentSubmitButton = styled.button`
  background-color: #3682F8;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  font-weight: 700;
  cursor: pointer;
`;