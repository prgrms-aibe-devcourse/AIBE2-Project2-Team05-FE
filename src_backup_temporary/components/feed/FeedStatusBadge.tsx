import React from 'react';
import { TravelStatus } from '../../types/feed';

interface FeedStatusBadgeProps {
  status: TravelStatus | null; // 🌟 null 허용
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

    // null일 때 로딩 상태 표시
    if (status === null) {
      return (
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${className || ''}`}
          style={{
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
          }}
        >
          {showIcon && <span>⏳</span>}
          <span>로딩중...</span>
        </div>
      );
    }

    // 안전한 기본값 사용
    const safeStatus = status || 'recruiting';
    const statusMap = {
      recruiting: {
        icon: '👥',
        statusLabel: '모집중',
        color: '#3B82F6',
        backgroundColor: '#DBEAFE',
      },
      matched: {
        icon: '🤝',
        statusLabel: '매칭완료',
        color: '#8B5CF6',
        backgroundColor: '#E0E7FF',
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

// 사용되지 않는 styled components 제거됨 (경고 해결)

export default FeedStatusBadge;
