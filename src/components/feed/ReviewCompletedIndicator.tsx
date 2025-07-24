import React from 'react';
import styled from 'styled-components';
import { Feed } from '../../types/feed';

interface ReviewCompletedIndicatorProps {
  feed: Feed;
  variant?: 'badge' | 'overlay' | 'banner';
  showRating?: boolean;
  onClick?: () => void;
  className?: string;
}

const ReviewCompletedIndicator: React.FC<ReviewCompletedIndicatorProps> = ({
  feed,
  variant = 'badge',
  showRating = false,
  onClick,
  className,
}) => {
  if (!feed.review || feed.status !== 'completed') {
    return null;
  }

  switch (variant) {
    case 'overlay':
      return (
        <OverlayContainer className={className} onClick={onClick}>
          <OverlayContent>
            <CompletedIcon>🏆</CompletedIcon>
            <CompletedText>여행 완료!</CompletedText>
            <ReviewText>후기가 작성되었습니다</ReviewText>
            {showRating && feed.review.rating && (
              <RatingDisplay>
                {'⭐'.repeat(feed.review.rating)}{' '}
                <span>({feed.review.rating}/5)</span>
              </RatingDisplay>
            )}
          </OverlayContent>
        </OverlayContainer>
      );

    case 'banner':
      return (
        <BannerContainer className={className} onClick={onClick}>
          <BannerContent>
            <BannerIcon>✅</BannerIcon>
            <BannerTextContainer>
              <BannerTitle>여행 완료 - 후기 작성됨</BannerTitle>
              {feed.review.title && (
                <BannerSubtitle>"{feed.review.title}"</BannerSubtitle>
              )}
              {showRating && feed.review.rating && (
                <BannerRating>
                  {'⭐'.repeat(feed.review.rating)} ({feed.review.rating}/5)
                </BannerRating>
              )}
            </BannerTextContainer>
          </BannerContent>
        </BannerContainer>
      );

    case 'badge':
    default:
      return (
        <BadgeContainer className={className} onClick={onClick}>
          <Badge>
            <BadgeIcon>✅</BadgeIcon>
            <BadgeText>후기 완료</BadgeText>
            {showRating && feed.review.rating && (
              <BadgeRating>⭐{feed.review.rating}</BadgeRating>
            )}
          </Badge>
        </BadgeContainer>
      );
  }
};

export default ReviewCompletedIndicator;

// Badge 스타일
const BadgeContainer = styled.div`
  display: inline-block;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);

  &:hover {
    ${({ onClick }) =>
      onClick &&
      `
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
    `}
  }
`;

const BadgeIcon = styled.span`
  font-size: 10px;
`;

const BadgeText = styled.span``;

const BadgeRating = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 4px;
  border-radius: 6px;
  font-size: 10px;
`;

// Overlay 스타일
const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(40, 167, 69, 0.9),
    rgba(32, 201, 151, 0.9)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  transition: all 0.3s ease;

  &:hover {
    ${({ onClick }) =>
      onClick &&
      `
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(32, 201, 151, 0.95));
    `}
  }
`;

const OverlayContent = styled.div`
  text-align: center;
  color: white;
`;

const CompletedIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const CompletedText = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ReviewText = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const RatingDisplay = styled.div`
  margin-top: 8px;
  font-size: 16px;

  span {
    font-size: 12px;
    opacity: 0.8;
  }
`;

// Banner 스타일
const BannerContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  &:hover {
    ${({ onClick }) =>
      onClick &&
      `
      background: linear-gradient(135deg, #218838, #1e9ba4);
    `}
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
`;

const BannerIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const BannerTextContainer = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const BannerSubtitle = styled.div`
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
`;

const BannerRating = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;
