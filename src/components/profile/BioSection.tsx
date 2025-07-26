import React from 'react';
import styled from 'styled-components';

// 타입 정의
interface BioSectionProps {
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  return (
    <Container>
      <BioTitle>자기소개</BioTitle>
      <BioContent>{bio}</BioContent>
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  background: linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  border: 1px solid #e8ecf0;

  @media (max-width: 768px) {
    padding: 20px;
    margin: 16px 0;
  }
`;

const BioTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
`;

const BioContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export default BioSection; 