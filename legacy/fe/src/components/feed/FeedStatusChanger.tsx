import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TravelStatus, TRAVEL_STATUS_MAP } from '../../types/feed';
import feedStatusService from '../../services/feedStatusService';

interface FeedStatusChangerProps {
  feedId: number;
  currentStatus: TravelStatus;
  onStatusChange: (newStatus: TravelStatus) => void;
  disabled?: boolean;
}

const FeedStatusChanger: React.FC<FeedStatusChangerProps> = ({
  feedId,
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const statusOrder: TravelStatus[] = ['recruiting', 'traveling', 'completed'];

  const handleStatusChange = async (newStatus: TravelStatus) => {
    if (disabled || isChanging || newStatus === currentStatus) return;

    try {
      setIsChanging(true);

      // 상태 변경 확인 메시지
      const statusInfo = TRAVEL_STATUS_MAP[newStatus];
      const confirmed = window.confirm(
        `여행 상태를 '${statusInfo.statusLabel}'로 변경하시겠습니까?\n\n${statusInfo.description}`,
      );

      if (!confirmed) {
        setIsChanging(false);
        return;
      }

      console.log(
        `🔄 피드 ${feedId} 상태 변경: ${currentStatus} → ${newStatus}`,
      );

      // 서비스를 통해 상태 업데이트
      const success = feedStatusService.updateFeedStatus(feedId, newStatus);

      if (success) {
        onStatusChange(newStatus);
        console.log(`✅ 피드 ${feedId} 상태 변경 성공: ${newStatus}`);
      } else {
        throw new Error('상태 변경 실패');
      }
    } catch (error) {
      console.error('상태 변경 중 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsChanging(false);
    }
  };

  const getNextStatus = (): TravelStatus | null => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  const getPreviousStatus = (): TravelStatus | null => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      return statusOrder[currentIndex - 1];
    }
    return null;
  };

  const nextStatus = getNextStatus();
  const previousStatus = getPreviousStatus();

  return (
    <ChangerContainer>
      <StatusIndicator>
        <CurrentStatusBadge status={currentStatus}>
          {TRAVEL_STATUS_MAP[currentStatus].icon}{' '}
          {TRAVEL_STATUS_MAP[currentStatus].statusLabel}
        </CurrentStatusBadge>
      </StatusIndicator>

      <ButtonGroup>
        {/* 이전 상태로 되돌리기 버튼 */}
        {previousStatus && (
          <StatusButton
            status={previousStatus}
            disabled={disabled || isChanging}
            onClick={() => handleStatusChange(previousStatus)}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← {TRAVEL_STATUS_MAP[previousStatus].statusLabel}
          </StatusButton>
        )}

        {/* 다음 상태로 진행 버튼 */}
        {nextStatus && (
          <StatusButton
            status={nextStatus}
            disabled={disabled || isChanging}
            onClick={() => handleStatusChange(nextStatus)}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            $primary // $ 접두사 추가로 DOM에 전달 방지
          >
            {TRAVEL_STATUS_MAP[nextStatus].statusLabel}{' '}
            {TRAVEL_STATUS_MAP[nextStatus].icon}
          </StatusButton>
        )}

        {/* 완료 상태일 때는 완료 메시지 */}
        {currentStatus === 'completed' && (
          <CompletedMessage>
            🎉 여행이 완료되었습니다! 후기를 작성해보세요.
          </CompletedMessage>
        )}
      </ButtonGroup>

      {isChanging && <LoadingSpinner>상태 변경 중...</LoadingSpinner>}
    </ChangerContainer>
  );
};

const ChangerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentStatusBadge = styled.div<{ status: TravelStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: ${(props) =>
    TRAVEL_STATUS_MAP[props.status].backgroundColor};
  color: ${(props) => TRAVEL_STATUS_MAP[props.status].color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid ${(props) => TRAVEL_STATUS_MAP[props.status].color};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusButton = styled.button<{
  status: TravelStatus;
  $primary?: boolean;
}>`
  padding: 8px 16px;
  border: 1px solid ${(props) => TRAVEL_STATUS_MAP[props.status].color};
  background-color: ${(props) =>
    props.$primary ? TRAVEL_STATUS_MAP[props.status].color : 'white'};
  color: ${(props) =>
    props.$primary ? 'white' : TRAVEL_STATUS_MAP[props.status].color};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => TRAVEL_STATUS_MAP[props.status].color};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${(props) => TRAVEL_STATUS_MAP[props.status].color}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CompletedMessage = styled.div`
  padding: 12px 16px;
  background-color: #d1fae5;
  color: #047857;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
`;

export default FeedStatusChanger;
