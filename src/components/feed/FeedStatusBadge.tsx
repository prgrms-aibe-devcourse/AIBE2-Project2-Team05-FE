import React from 'react';
import styled from 'styled-components';
import { TravelStatus, TRAVEL_STATUS_MAP } from '../../types/feed';

interface FeedStatusBadgeProps {
  status: TravelStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
}

const FeedStatusBadge: React.FC<FeedStatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  showDescription = false,
  className,
}) => {
  const statusInfo = TRAVEL_STATUS_MAP[status];

  return (
    <BadgeContainer status={status} size={size} className={className}>
      {showIcon && <IconSpan>{statusInfo.icon}</IconSpan>}
      <LabelSpan size={size}>{statusInfo.statusLabel}</LabelSpan>
      {showDescription && (
        <DescriptionSpan size={size}>{statusInfo.description}</DescriptionSpan>
      )}
    </BadgeContainer>
  );
};

const BadgeContainer = styled.div<{ status: TravelStatus; size: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => (props.size === 'small' ? '4px' : '6px')};
  padding: ${(props) => {
    switch (props.size) {
      case 'small':
        return '4px 8px';
      case 'large':
        return '8px 16px';
      default:
        return '6px 12px';
    }
  }};
  background-color: ${(props) =>
    TRAVEL_STATUS_MAP[props.status].backgroundColor};
  color: ${(props) => TRAVEL_STATUS_MAP[props.status].color};
  border-radius: ${(props) => (props.size === 'small' ? '12px' : '16px')};
  font-weight: 600;
  font-size: ${(props) => {
    switch (props.size) {
      case 'small':
        return '11px';
      case 'large':
        return '14px';
      default:
        return '12px';
    }
  }};
  white-space: nowrap;
  border: 1px solid ${(props) => TRAVEL_STATUS_MAP[props.status].color}33;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px ${(props) => TRAVEL_STATUS_MAP[props.status].color}20;
  }
`;

const IconSpan = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: inherit;
`;

const LabelSpan = styled.span<{ size: string }>`
  font-weight: 600;
  font-size: inherit;
`;

const DescriptionSpan = styled.span<{ size: string }>`
  font-weight: 400;
  opacity: 0.8;
  font-size: ${(props) => (props.size === 'small' ? '10px' : '11px')};
  margin-left: 4px;
`;

export default FeedStatusBadge;
