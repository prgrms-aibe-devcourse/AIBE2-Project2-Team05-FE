import React from 'react';
import styled from 'styled-components';
import { Feed, FeedStatus, FEED_STATUS_LABELS } from '../../types/feed';
import { filterFeedsByStatus } from '../../services/feedStatusService';

interface FeedStatusFilterProps {
  feeds: Feed[];
  selectedStatus: FeedStatus | 'all';
  onStatusChange: (status: FeedStatus | 'all') => void;
  showCounts?: boolean;
  compact?: boolean;
  className?: string;
}

const FeedStatusFilter: React.FC<FeedStatusFilterProps> = ({
  feeds,
  selectedStatus,
  onStatusChange,
  showCounts = true,
  compact = false,
  className,
}) => {
  const statusOptions: Array<{ key: FeedStatus | 'all'; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'recruiting', label: FEED_STATUS_LABELS.recruiting },
    { key: 'matched', label: FEED_STATUS_LABELS.matched },
    { key: 'traveling', label: FEED_STATUS_LABELS.traveling },
    { key: 'completed', label: FEED_STATUS_LABELS.completed },
  ];

  const getStatusCount = (status: FeedStatus | 'all'): number => {
    if (status === 'all') return feeds.length;
    return filterFeedsByStatus(feeds, status).length;
  };

  return (
    <Container className={className} $compact={compact}>
      {!compact && <FilterLabel>상태별 필터:</FilterLabel>}
      <FilterButtonGroup $compact={compact}>
        {statusOptions.map((option) => (
          <FilterButton
            key={option.key}
            $active={selectedStatus === option.key}
            $compact={compact}
            onClick={() => onStatusChange(option.key)}
          >
            {option.label}
            {showCounts && (
              <CountBadge $active={selectedStatus === option.key}>
                {getStatusCount(option.key)}
              </CountBadge>
            )}
          </FilterButton>
        ))}
      </FilterButtonGroup>
    </Container>
  );
};

export default FeedStatusFilter;

const Container = styled.div<{ $compact: boolean }>`
  display: flex;
  ${({ $compact }) =>
    $compact
      ? 'align-items: center; gap: 8px;'
      : 'flex-direction: column; gap: 12px;'}
  margin-bottom: ${({ $compact }) => ($compact ? '0' : '20px')};
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FilterButtonGroup = styled.div<{ $compact: boolean }>`
  display: flex;
  gap: ${({ $compact }) => ($compact ? '6px' : '8px')};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean; $compact: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${({ $compact }) => ($compact ? '6px 12px' : '8px 16px')};
  border: 2px solid ${({ $active }) => ($active ? '#007bff' : '#e1e5e9')};
  background-color: ${({ $active }) => ($active ? '#007bff' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#666')};
  border-radius: ${({ $compact }) => ($compact ? '16px' : '20px')};
  font-size: ${({ $compact }) => ($compact ? '12px' : '14px')};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #007bff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CountBadge = styled.span<{ $active: boolean }>`
  background-color: ${({ $active }) => ($active ? '#ffffff' : '#f8f9fa')};
  color: ${({ $active }) => ($active ? '#007bff' : '#666')};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
`;
