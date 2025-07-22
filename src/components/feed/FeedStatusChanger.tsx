import React, { useState } from 'react';
import styled from 'styled-components';
import { FeedStatus, FEED_STATUS_LABELS, Feed } from '../../types/feed';
import {
  getNextAvailableStatuses,
  changeFeedStatus,
  hasStatusChangePermission,
} from '../../services/feedStatusService';
import {
  canChangeFeedStatus,
  getPermissionMessage,
} from '../../services/reviewPermissionService';
import FeedStatusBadge from './FeedStatusBadge';

interface FeedStatusChangerProps {
  feed: Feed;
  userId: string;
  onStatusChange?: (updatedFeed: Feed) => void;
  onError?: (error: string) => void;
}

const FeedStatusChanger: React.FC<FeedStatusChangerProps> = ({
  feed,
  userId,
  onStatusChange,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentStatus = feed.status || 'recruiting';
  const availableStatuses = getNextAvailableStatuses(currentStatus);

  // 상태 변경 권한 체크 (새로운 시스템 사용)
  const canChangeStatusResult = canChangeFeedStatus(
    feed,
    userId,
    availableStatuses[0],
  );

  // 상태 변경 권한이 없으면 배지만 표시
  if (!canChangeStatusResult.canWrite || availableStatuses.length === 0) {
    return (
      <Container>
        <FeedStatusBadge status={currentStatus} />
        {!canChangeStatusResult.canWrite && canChangeStatusResult.reason && (
          <PermissionTooltip title={canChangeStatusResult.reason}>
            ⓘ
          </PermissionTooltip>
        )}
      </Container>
    );
  }

  const handleStatusChange = async (newStatus: FeedStatus) => {
    setIsChanging(true);

    try {
      // 개별 상태 변경 권한 체크
      const statusPermission = canChangeFeedStatus(feed, userId, newStatus);

      if (!statusPermission.canWrite) {
        const errorMsg =
          statusPermission.reason || '상태 변경 권한이 없습니다.';
        onError?.(errorMsg);
        alert(errorMsg);
        return;
      }

      // 새로운 비동기 API 호출
      const updatedFeed = await changeFeedStatus(feed.id, newStatus, userId);

      if (updatedFeed) {
        onStatusChange?.(updatedFeed);
        setIsOpen(false);

        // 성공 메시지 표시 (선택적)
        console.log(
          `피드 상태가 "${FEED_STATUS_LABELS[newStatus]}"로 변경되었습니다.`,
        );
      } else {
        const errorMsg = '상태 변경에 실패했습니다.';
        onError?.(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('상태 변경 중 오류:', error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : '상태 변경 중 오류가 발생했습니다.';
      onError?.(errorMsg);
      alert(errorMsg);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Container>
      <CurrentStatusButton
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging || availableStatuses.length === 0}
      >
        <FeedStatusBadge status={currentStatus} />
        {availableStatuses.length > 0 && (
          <Arrow $isOpen={isOpen}>{isChanging ? '⏳' : '▼'}</Arrow>
        )}
      </CurrentStatusButton>

      {isOpen && availableStatuses.length > 0 && (
        <Dropdown>
          {availableStatuses.map((status) => (
            <DropdownItem
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isChanging}
            >
              <FeedStatusBadge status={status} size="small" />
              <StatusDescription>
                {getStatusDescription(status)}
              </StatusDescription>
              {isChanging && <LoadingSpinner>⏳</LoadingSpinner>}
            </DropdownItem>
          ))}
        </Dropdown>
      )}

      {/* 로딩 오버레이 */}
      {isChanging && (
        <LoadingOverlay>
          <LoadingText>상태 변경 중...</LoadingText>
        </LoadingOverlay>
      )}
    </Container>
  );
};

// 상태별 설명 텍스트
const getStatusDescription = (status: FeedStatus): string => {
  switch (status) {
    case 'matched':
      return '매칭이 성사되었습니다';
    case 'traveling':
      return '여행을 시작했습니다';
    case 'completed':
      return '여행을 완료하고 후기를 작성합니다';
    default:
      return '';
  }
};

export default FeedStatusChanger;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const CurrentStatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  &:not(:disabled):hover {
    opacity: 0.8;
  }
`;

const Arrow = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  min-width: 200px;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  position: relative;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f4;
  }
`;

const StatusDescription = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

const LoadingSpinner = styled.span`
  font-size: 14px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  z-index: 1001;
`;

const LoadingText = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const PermissionTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  background-color: #f0f2f5;
  color: #666;
  font-size: 10px;
  border-radius: 50%;
  cursor: help;

  &:hover {
    background-color: #e4e6ea;
  }

  &::before {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 1000;
    margin-bottom: 4px;
  }

  &:hover::before {
    opacity: 1;
  }
`;
