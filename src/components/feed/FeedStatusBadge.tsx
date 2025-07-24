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
  // 🚨 임시 안전 모드: 모든 상황에서 에러 방지
  try {
    console.log('🔍 FeedStatusBadge 호출됨:', { status, type: typeof status });

    // 안전한 기본값 사용
    const safeStatus = status || 'recruiting';
    const statusMap = {
      recruiting: {
        icon: '👥',
        statusLabel: '모집중',
        color: '#3B82F6',
        backgroundColor: '#DBEAFE',
      },
      traveling: {
        icon: '✈️',
        statusLabel: '여행을 시작합니다',
        color: '#F59E0B',
        backgroundColor: '#FEF3C7',
      },
      completed: {
        icon: '✅',
        statusLabel: '여행을 완료합니다',
        color: '#10B981',
        backgroundColor: '#D1FAE5',
      },
    };

    const safeStatusInfo =
      statusMap[safeStatus as keyof typeof statusMap] || statusMap.recruiting;

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: size === 'small' ? '4px' : '6px',
          padding: size === 'small' ? '4px 8px' : '6px 12px',
          backgroundColor: safeStatusInfo.backgroundColor,
          color: safeStatusInfo.color,
          borderRadius: size === 'small' ? '12px' : '16px',
          fontWeight: '600',
          fontSize: size === 'small' ? '11px' : '12px',
          whiteSpace: 'nowrap' as const,
          border: `1px solid ${safeStatusInfo.color}33`,
        }}
        className={className}
      >
        {showIcon && <span>{safeStatusInfo.icon}</span>}
        <span>{safeStatusInfo.statusLabel}</span>
        {showDescription && (
          <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: '4px' }}>
            {safeStatus === 'recruiting' && '여행 메이트를 모집하고 있어요'}
            {safeStatus === 'traveling' && '현재 여행을 즐기고 있어요'}
            {safeStatus === 'completed' && '여행이 완료되었어요'}
          </span>
        )}
      </div>
    );
  } catch (error) {
    console.error('❌ FeedStatusBadge 치명적 에러:', error);
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        🔧 상태 오류
      </div>
    );
  }
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
