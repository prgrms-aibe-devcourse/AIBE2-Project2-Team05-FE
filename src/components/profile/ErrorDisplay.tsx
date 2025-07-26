import React from 'react';
import styled from 'styled-components';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message = '프로필을 찾을 수 없습니다.',
  onRetry
}) => {
  return (
    <Container>
      <ErrorIcon>⚠️</ErrorIcon>
      <Message>{message}</Message>
      {onRetry && (
        <RetryButton onClick={onRetry}>
          다시 시도
        </RetryButton>
      )}
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 300px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Message = styled.div`
  color: #ef4444;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ErrorDisplay; 