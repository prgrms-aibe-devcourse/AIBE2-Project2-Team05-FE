import React from 'react';
import styled from 'styled-components';
import {
  FeedStatus,
  FEED_STATUS_LABELS,
  FEED_STATUS_COLORS,
} from '../../types/feed';

interface FeedStatusBadgeProps {
  status: FeedStatus;
  size?: 'small' | 'medium' | 'large';
}

const FeedStatusBadge: React.FC<FeedStatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  return (
    <StatusBadge $status={status} $size={size}>
      {FEED_STATUS_LABELS[status]}
    </StatusBadge>
  );
};

export default FeedStatusBadge;

const StatusBadge = styled.span<{ $status: FeedStatus; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 크기별 스타일 */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          padding: 2px 8px;
          font-size: 11px;
          border-radius: 12px;
        `;
      case 'large':
        return `
          padding: 8px 16px;
          font-size: 14px;
          border-radius: 20px;
        `;
      default: // medium
        return `
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 16px;
        `;
    }
  }}

  /* 상태별 색상 */
  background-color: ${({ $status }) => FEED_STATUS_COLORS[$status]};
  color: white;
  font-weight: 600;
  white-space: nowrap;

  /* 상태별 특별한 스타일 */
  ${({ $status }) => {
    switch ($status) {
      case 'recruiting':
        return `
          background: linear-gradient(135deg, #3682F8 0%, #4A90E2 100%);
          box-shadow: 0 2px 8px rgba(54, 130, 248, 0.3);
        `;
      case 'matched':
        return `
          background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
          box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
        `;
      case 'traveling':
        return `
          background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
          box-shadow: 0 2px 8px rgba(50, 205, 50, 0.3);
          animation: pulse 2s infinite;
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
          box-shadow: 0 2px 8px rgba(155, 89, 182, 0.3);
        `;
      default:
        return '';
    }
  }}

  /* 여행중 상태의 맥박 애니메이션 */
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
