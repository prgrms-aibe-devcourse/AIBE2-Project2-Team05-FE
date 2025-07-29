import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  fallbackSrc?: string;
  placeholder?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number; // Intersection Observer 임계값
  rootMargin?: string; // Intersection Observer 루트 마진
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  inView: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  style,
  onClick,
  fallbackSrc = '/default-place-image.jpg',
  placeholder,
  loadingComponent,
  errorComponent,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  // via.placeholder.com URL을 안정적인 로컬 이미지로 대체
  const processedSrc = src.includes('via.placeholder.com') ? fallbackSrc : src;

  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    inView: false,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 이미지 로드 성공 핸들러
  const handleImageLoad = useCallback(() => {
    console.log('✅ 이미지 로드 성공:', {
      src: processedSrc,
      alt,
      currentSrc: imgRef.current?.src
    });
    setImageState(prev => ({ ...prev, loaded: true, error: false }));
    onLoad?.();
  }, [onLoad, processedSrc, alt]);

  // 이미지 로드 실패 핸들러
  const handleImageError = useCallback(() => {
    console.error('🖼️ 이미지 로드 실패:', {
      originalSrc: src,
      processedSrc,
      currentSrc: imgRef.current?.src,
      fallbackSrc,
      alt
    });
    
    setImageState(prev => ({ ...prev, error: true, loaded: false }));
    onError?.();
    
    // fallback 이미지로 다시 시도
    if (imgRef.current && imgRef.current.src !== fallbackSrc) {
      console.log('🔄 Fallback 이미지로 전환:', fallbackSrc);
      imgRef.current.src = fallbackSrc;
    }
  }, [onError, fallbackSrc, src, processedSrc, alt]);

  // Intersection Observer 설정
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !imageState.inView) {
          setImageState(prev => ({ ...prev, inView: true }));
          
          // 이미지가 뷰포트에 들어오면 관찰 중단
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(img);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, imageState.inView]);

  // 이미지 로딩 시작
  useEffect(() => {
    if (imageState.inView && !imageState.loaded && !imageState.error) {
      const img = imgRef.current;
      if (img && img.src !== processedSrc) {
        img.src = processedSrc;
      }
    }
  }, [imageState.inView, imageState.loaded, imageState.error, processedSrc]);

  return (
    <ImageContainer className={className} style={style} onClick={onClick}>
      {/* 이미지 요소 */}
      <StyledImage
        ref={imgRef}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loaded={imageState.loaded}
        // src는 Intersection Observer에서 설정하므로 여기서는 설정하지 않음
      />

      {/* 로딩 상태 */}
      {imageState.inView && !imageState.loaded && !imageState.error && (
        <LoadingOverlay>
          {loadingComponent || (
            <>
              <LoadingSpinner />
              <LoadingText>이미지를 불러오는 중...</LoadingText>
            </>
          )}
        </LoadingOverlay>
      )}

      {/* 플레이스홀더 (아직 뷰포트에 없는 경우) */}
      {!imageState.inView && (
        <PlaceholderOverlay>
          {placeholder ? (
            <PlaceholderText>{placeholder}</PlaceholderText>
          ) : (
            <PlaceholderIcon>🖼️</PlaceholderIcon>
          )}
        </PlaceholderOverlay>
      )}

      {/* 에러 상태 */}
      {imageState.error && (
        <ErrorOverlay>
          {errorComponent || (
            <>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>이미지를 불러올 수 없습니다</ErrorText>
            </>
          )}
        </ErrorOverlay>
      )}
    </ImageContainer>
  );
};

export default LazyImage;

// 스타일드 컴포넌트들
const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* 최소 높이 보장 */
`;

const StyledImage = styled.img.withConfig({
  shouldForwardProp: (prop) => prop !== 'loaded',
})<{ loaded: boolean }>`
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.loaded ? 1 : 0};
  
  /* 이미지가 로드되기 전에는 숨김 */
  ${props => !props.loaded && `
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
  `}
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3682f8;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 8px;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
`;

const PlaceholderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
`;

const PlaceholderIcon = styled.span`
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 8px;
`;

const PlaceholderText = styled.p`
  color: #6c757d;
  font-size: 14px;
  margin: 0;
  text-align: center;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fee;
`;

const ErrorIcon = styled.span`
  font-size: 32px;
  margin-bottom: 8px;
`;

const ErrorText = styled.p`
  color: #dc3545;
  font-size: 12px;
  margin: 0;
  text-align: center;
`; 