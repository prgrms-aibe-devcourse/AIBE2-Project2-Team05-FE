import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import backendPlacesApiService, {
  PlaceDetails,
} from '../services/backendPlacesApi';
import { 
  getSafeImageUrl,
  loadImageWithFallbacks,
  createPlaceholderImage 
} from '../utils/imageUtils';

// 카카오맵 타입 선언 (기존 파일에서 가져오기)
declare global {
  interface Window {
    kakao: any;
  }
}

interface PlaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  region?: string; // 검색할 지역 정보
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isOpen,
  onClose,
  placeName,
  region,
}) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 장소 상세 정보 가져오기 (백엔드 API 사용) - useCallback으로 감싸서 의존성 문제 해결
  const fetchPlaceDetails = useCallback(async () => {
    if (!placeName) return;

    setLoading(true);
    try {
      console.log('🔍 백엔드를 통한 장소 상세 정보 조회:', placeName, region);

      // 백엔드 API 호출 (fallback 포함)
      const details = await backendPlacesApiService.getPlaceDetailsWithFallback(
        placeName,
        region,
      );

      console.log('📊 백엔드 API 응답 데이터:', details);

      if (details) {
        console.log('✅ 장소 정보 수신 성공:');
        console.log('  - 장소명:', details.name);
        console.log('  - 주소:', details.formattedAddress);
        console.log('  - 좌표:', details.geometry);
        console.log('  - 사진 개수:', details.photos?.length || 0);
        if (details.photos && details.photos.length > 0) {
          console.log('  - 사진 개수:', details.photos.length);
          console.log('  - 첫 번째 사진 URL:', details.photos[0].photoUrl);

          // 안전한 이미지 URL 검증 및 fallback 준비
          const primaryUrl = details.photos[0].photoUrl;
          const fallbackUrls = [
            primaryUrl,
            getSafeImageUrl(null, details.name, 'unsplash'),
            getSafeImageUrl(null, details.name, 'local'),
            getSafeImageUrl(null, details.name, 'placeholder')
          ].filter(Boolean);

          // 비동기로 사용 가능한 이미지 URL 찾기
          loadImageWithFallbacks(fallbackUrls, details.name)
            .then(validUrl => {
              console.log('✅ 사용 가능한 이미지 URL 확인:', validUrl);
            })
            .catch(err => {
              console.warn('⚠️ 모든 이미지 URL 실패, placeholder 사용');
            });
        }

        setPlaceDetails(details);

        // 카카오맵 로드
        console.log(
          '🗺️ 카카오맵 로드 시작:',
          details.geometry.lat,
          details.geometry.lng,
        );
        setTimeout(() => {
          loadKakaoMap(details.geometry.lat, details.geometry.lng);
        }, 100);
      } else {
        console.error('❌ 장소 상세 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 장소 상세 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [placeName, region]); // 의존성 배열에 필요한 값들 포함

  // 카카오맵 로드 - useCallback으로 감싸서 의존성 문제 해결
  const loadKakaoMap = useCallback((lat: number, lng: number) => {
    console.log(`🗺️ 카카오맵 로드 함수 호출: lat=${lat}, lng=${lng}`);

    if (!mapContainerRef.current) {
      console.error('❌ 지도 컨테이너 ref가 없습니다');
      return;
    }

    if (!window.kakao?.maps) {
      console.error('❌ 카카오맵 API가 로드되지 않았습니다');
      return;
    }

    console.log('✅ 카카오맵 API 및 컨테이너 확인 완료');

    try {
      const mapOptions = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3, // 확대 레벨
      };

      console.log('🗺️ 지도 생성 시작...');
      const map = new window.kakao.maps.Map(
        mapContainerRef.current,
        mapOptions,
      );
      console.log('✅ 지도 생성 성공');

      // 마커 추가
      console.log('📍 마커 생성 시작...');
      const markerPosition = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);
      console.log('✅ 마커 생성 및 추가 완료');

      // 정보창 추가
      if (placeDetails) {
        console.log('💬 정보창 생성 시작...');
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px; font-size:12px; text-align:center;">${placeDetails.name}</div>`,
        });
        infoWindow.open(map, marker);
        console.log('✅ 정보창 생성 및 표시 완료');
      }

      console.log('🎉 카카오맵 전체 로드 완료!');
    } catch (error) {
      console.error('❌ 카카오맵 로드 실패:', error);
    }
  }, [placeDetails]); // useCallback 의존성 배열 추가

  // 모달이 열릴 때 데이터 fetch
  useEffect(() => {
    if (isOpen && placeName) {
      fetchPlaceDetails();
    }
  }, [isOpen, placeName, region, fetchPlaceDetails]);

  // 안전한 사진 URL 처리 함수 - 구글 이미지 우선, 실패시 Unsplash fallback
  const getPhotoUrl = (photoUrl: string): string => {
    // 구글 플레이스 이미지 URL이면 우선 시도, 실패시 자동으로 fallback 처리됨
    if (photoUrl && photoUrl.includes('places.googleapis.com')) {
      return photoUrl; // 원본 URL 반환, onError에서 fallback 처리
    }
    // 기타 경우는 기존 로직 사용
    return getSafeImageUrl(photoUrl, placeDetails?.name, 'unsplash');
  };

  // 이미지 로드 실패 시 순차적 fallback 처리 - 개선된 버전
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>, 
    placeName: string,
    isMainImage: boolean = false
  ) => {
    const img = e.target as HTMLImageElement;
    const currentSrc = img.src;
    
    console.warn('🖼️ 이미지 로드 실패:', currentSrc);
    
    // 이미 시도한 URL들을 추적하여 무한 루프 방지
    const attemptedUrls = img.dataset.attemptedUrls ? 
      JSON.parse(img.dataset.attemptedUrls) : [];
    
    if (!attemptedUrls.includes(currentSrc)) {
      attemptedUrls.push(currentSrc);
      img.dataset.attemptedUrls = JSON.stringify(attemptedUrls);
    }
    
    // 구글 플레이스 이미지 실패 시 더 나은 fallback 순서
    const fallbackUrls = [
      getSafeImageUrl(null, placeName, 'unsplash'),     // Unsplash 이미지 (품질 좋음)
      getSafeImageUrl(null, placeName, 'local'),        // 로컬 기본 이미지
      createPlaceholderImage(placeName)                 // SVG placeholder
    ];
    
    // 다음 시도할 URL 찾기
    for (const fallbackUrl of fallbackUrls) {
      if (!attemptedUrls.includes(fallbackUrl)) {
        console.warn(`🔄 ${isMainImage ? '메인' : '썸네일'} 이미지 fallback 시도:`, fallbackUrl);
        img.src = fallbackUrl;
        return;
      }
    }
    
    // 모든 fallback 실패 시 최종 placeholder
    console.error('❌ 모든 이미지 fallback 실패, 최종 placeholder 사용');
    img.src = createPlaceholderImage('이미지 없음');
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setPlaceDetails(null);
    setActivePhotoIndex(0);
    onClose();
  };

  // 평점 별표시
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i}>⭐</Star>);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half">⭐</Star>);
    }
    return stars;
  };

  // 시간 포맷팅
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={handleClose}>×</CloseButton>

          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>장소 정보를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : placeDetails ? (
            <ContentContainer>
              {/* 헤더 영역 */}
              <Header>
                <PlaceName>{placeDetails.name}</PlaceName>
                <PlaceAddress>{placeDetails.formattedAddress}</PlaceAddress>
                {placeDetails.rating && (
                  <RatingContainer>
                    <RatingStars>
                      {renderStars(placeDetails.rating)}
                    </RatingStars>
                    <RatingText>{placeDetails.rating.toFixed(1)}</RatingText>
                  </RatingContainer>
                )}
              </Header>

              {/* 사진 영역 */}
              {placeDetails.photos && placeDetails.photos.length > 0 && (
                <PhotoSection>
                  <MainPhoto>
                    <img
                      src={getPhotoUrl(
                        placeDetails.photos[activePhotoIndex].photoUrl,
                      )}
                      alt={placeDetails.name}
                      onError={(e) => handleImageError(e, placeDetails.name, true)}
                    />
                  </MainPhoto>
                  {placeDetails.photos.length > 1 && (
                    <PhotoThumbnails>
                      {placeDetails.photos.slice(0, 4).map((photo, index) => (
                        <Thumbnail
                          key={index}
                          active={index === activePhotoIndex}
                          onClick={() => setActivePhotoIndex(index)}
                        >
                          <img
                            src={getPhotoUrl(photo.photoUrl)}
                            alt={`${placeDetails.name} ${index + 1}`}
                            onError={(e) => handleImageError(e, placeDetails.name, false)}
                          />
                        </Thumbnail>
                      ))}
                    </PhotoThumbnails>
                  )}
                </PhotoSection>
              )}

              {/* 정보 영역 */}
              <InfoSection>
                <InfoGrid>
                  {/* 연락처 정보 */}
                  {placeDetails.formattedPhoneNumber && (
                    <InfoItem>
                      <InfoLabel>📞 전화번호</InfoLabel>
                      <InfoValue>{placeDetails.formattedPhoneNumber}</InfoValue>
                    </InfoItem>
                  )}

                  {/* 웹사이트 */}
                  {placeDetails.website && (
                    <InfoItem>
                      <InfoLabel>🌐 웹사이트</InfoLabel>
                      <InfoValue>
                        <a
                          href={placeDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          홈페이지 방문
                        </a>
                      </InfoValue>
                    </InfoItem>
                  )}

                  {/* 운영시간 */}
                  {placeDetails.openingHours && (
                    <InfoItem>
                      <InfoLabel>🕒 운영시간</InfoLabel>
                      <InfoValue>
                        <OpeningStatus open={placeDetails.openingHours.openNow}>
                          {placeDetails.openingHours.openNow
                            ? '영업 중'
                            : '영업 종료'}
                        </OpeningStatus>
                        <OpeningHours>
                          {placeDetails.openingHours.weekdayText
                            .slice(0, 3)
                            .map((time, index) => (
                              <div key={index}>{time}</div>
                            ))}
                        </OpeningHours>
                      </InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </InfoSection>

              {/* 카카오맵 영역 */}
              <MapSection>
                <MapLabel>📍 위치</MapLabel>
                <MapContainer ref={mapContainerRef} />
                <MapAddress>{placeDetails.formattedAddress}</MapAddress>
              </MapSection>

              {/* 리뷰 영역 */}
              {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                <ReviewSection>
                  <ReviewLabel>💬 리뷰</ReviewLabel>
                  <ReviewList>
                    {placeDetails.reviews.slice(0, 2).map((review, index) => (
                      <ReviewItem key={index}>
                        <ReviewHeader>
                          <ReviewAuthor>{review.authorName}</ReviewAuthor>
                          <ReviewRating>
                            {renderStars(review.rating)}
                          </ReviewRating>
                          <ReviewDate>
                            {review.relativeTimeDescription ||
                              formatTime(review.time)}
                          </ReviewDate>
                        </ReviewHeader>
                        <ReviewText>{review.text}</ReviewText>
                      </ReviewItem>
                    ))}
                  </ReviewList>
                </ReviewSection>
              )}
            </ContentContainer>
          ) : (
            <ErrorContainer>
              <ErrorText>장소 정보를 불러올 수 없습니다.</ErrorText>
              <RetryButton onClick={fetchPlaceDetails}>다시 시도</RetryButton>
            </ErrorContainer>
          )}
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 85%; /* 95%에서 85%로 10% 더 줄임 */
  max-width: 1080px; /* 1200px에서 1080px로 10% 더 축소 */
  max-height: 85vh; /* 90vh에서 85vh로 조금 줄임 */
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background: white;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #666;
  font-size: 14px;
`;

const ContentContainer = styled.div`
  /* 전체 컨텐츠 컨테이너 */
`;

const Header = styled.div`
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
`;

const PlaceName = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
`;

const PlaceAddress = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  font-size: 16px;
`;

const RatingText = styled.span`
  font-weight: bold;
  color: #3682f8;
`;

const PhotoSection = styled.div`
  padding: 0 24px 24px 24px;
`;

const MainPhoto = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: auto; /* 원본 비율 유지 */
    max-height: 500px; /* 너무 클 경우를 대비한 최대 높이 */
    object-fit: contain; /* 원본 비율 유지하면서 전체 이미지 표시 */
    border-radius: 12px;
  }
`;

const PhotoThumbnails = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Thumbnail = styled.div<{ active: boolean }>`
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${(props) => (props.active ? '#3682F8' : 'transparent')};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoSection = styled.div`
  padding: 0 24px 24px 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #666;

  a {
    color: #3682f8;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const OpeningStatus = styled.span<{ open: boolean }>`
  color: ${(props) => (props.open ? '#22c55e' : '#ef4444')};
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
`;

const OpeningHours = styled.div`
  font-size: 12px;
  line-height: 1.4;
`;

const MapSection = styled.div`
  padding: 0 24px 24px 24px;
`;

const MapLabel = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const MapAddress = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: center;
`;

const ReviewSection = styled.div`
  padding: 0 24px 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 24px;
  padding-top: 24px;
`;

const ReviewLabel = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReviewItem = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ReviewAuthor = styled.span`
  font-weight: bold;
  color: #333;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewDate = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

const ReviewText = styled.p`
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const ErrorText = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

export default PlaceDetailModal;
