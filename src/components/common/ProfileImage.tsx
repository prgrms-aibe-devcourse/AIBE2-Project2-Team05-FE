import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';

interface ProfileImageProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  borderRadius?: string;
}

/**
 * 프로필 이미지 컴포넌트
 * - 자동으로 기본 이미지 처리
 * - 로드 실패 시 SVG 기본 이미지로 폴백
 * - 일관된 스타일링
 */
const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt,
  size = 150,
  className,
  style,
  onClick,
  borderRadius = '50%',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 기본 이미지는 로딩 불필요

  // 기본 이미지 SVG를 useMemo로 캐싱 (크기별로)
  const defaultImageSrc = useMemo(() => {
    return `/default-avatar.svg`; // 고정된 SVG 파일 사용
  }, []);

  // 실제 이미지가 있는지 확인
  const hasValidSrc = useMemo(() => {
    return src && src.trim() !== '' && src !== 'null' && src !== 'undefined';
  }, [src]);

  // 프로필 이미지 URL을 useMemo로 캐싱
  const imageSrc = useMemo(() => {
    // null, undefined, 빈 문자열 등 모든 경우에 기본 이미지 사용
    if (hasError || !hasValidSrc) {
      return defaultImageSrc;
    }
    
    // 백엔드 API 경로인 경우 전체 URL로 변환
    if (src!.startsWith('/api/')) {
      return `http://localhost:8080${src}`;
    }
    
    return src!;
  }, [src, hasError, hasValidSrc, defaultImageSrc]);

  // 이미지 로드 성공
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // 이미지 로드 실패
  const handleError = useCallback(() => {
    setIsLoading(false);
    if (!hasError) { // 이미 에러 상태가 아닐 때만 상태 변경
      setHasError(true);
    }
  }, [hasError]);

  // 실제 이미지가 있을 때만 로딩 상태 설정
  useEffect(() => {
    if (hasValidSrc && !hasError) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [hasValidSrc, hasError]);

  return (
    <ImageContainer
      className={className}
      style={style}
      onClick={onClick}
      size={size}
      borderRadius={borderRadius}
    >
      <StyledImage
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        size={size}
        isLoading={isLoading}
      />
      
      {/* 로딩 상태 */}
      {isLoading && !hasError && (
        <LoadingOverlay>
          <LoadingSpinner size={Math.min(size / 4, 24)} />
        </LoadingOverlay>
      )}
    </ImageContainer>
  );
};

export default ProfileImage;

// 스타일 컴포넌트들
const ImageContainer = styled.div<{ size: number; borderRadius: string }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.borderRadius};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  
  &:hover {
    ${props => props.onClick && `
      opacity: 0.9;
      transition: opacity 0.2s ease;
    `}
  }
`;

const StyledImage = styled.img<{ size: number; isLoading: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: ${props => props.isLoading ? 0 : 1};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(248, 249, 250, 0.8);
`;

const LoadingSpinner = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`; 