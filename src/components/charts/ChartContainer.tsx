import React from 'react';
import styled from 'styled-components';

// 차트 공통 컨테이너 스타일
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.body};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px; /* 최소 높이 설정 */
  
  /* 차트가 컨테이너를 벗어나지 않도록 */
  overflow: hidden;
`;

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

/**
 * 차트 공통 컨테이너 컴포넌트
 * - 반응형 디자인 지원
 * - 테마 적용
 * - 그림자 효과
 */
const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  className,
  minHeight = '300px'
}) => {
  return (
    <Container className={className}>
      <ChartWrapper style={{ minHeight }}>
        {children}
      </ChartWrapper>
    </Container>
  );
};

export default ChartContainer; 