import React from 'react';
import styled from 'styled-components';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '프로필을 불러오는 중...' 
}) => {
  return (
    <Container>
      <Spinner />
      <Message>{message}</Message>
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
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.div`
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
`;

export default LoadingSpinner; 