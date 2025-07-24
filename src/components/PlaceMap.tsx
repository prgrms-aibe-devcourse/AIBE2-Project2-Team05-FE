import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface PlaceMapProps {
  placeName: string;
  width?: string;
  height?: string;
}

const PlaceMap: React.FC<PlaceMapProps> = ({
  placeName,
  width = '100%',
  height = '200px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName) return;

    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setError('카카오맵을 로드할 수 없습니다.');
        return;
      }

      try {
        // 지도를 표시할 컨테이너 확인
        if (!mapRef.current) return;

        // 지도 생성
        const mapContainer = mapRef.current;
        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청 좌표 (기본값)
          level: 2, // 지도 확대 레벨 (더 가까이)
        };

        const map = new window.kakao.maps.Map(mapContainer, mapOption);

        // 장소 검색 서비스 생성
        const ps = new window.kakao.maps.services.Places();

        // 키워드로 장소를 검색
        ps.keywordSearch(placeName, (data: any[], status: any) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            data.length > 0
          ) {
            // 첫 번째 검색 결과 사용
            const place = data[0];
            const coords = new window.kakao.maps.LatLng(place.y, place.x);

            // 지도 중심을 결과값으로 받은 위치로 이동
            map.setCenter(coords);

            // 커스텀 마커 이미지 생성
            const imageSrc =
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
            const imageSize = new window.kakao.maps.Size(35, 42); // 마커 크기 증가
            const imageOption = { offset: new window.kakao.maps.Point(17, 42) };

            const markerImage = new window.kakao.maps.MarkerImage(
              imageSrc,
              imageSize,
              imageOption,
            );

            // 마커 생성
            const marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
              image: markerImage,
            });

            // 인포윈도우 생성
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="
                  padding: 8px 12px; 
                  font-size: 14px; 
                  font-weight: 500; 
                  text-align: center;
                  min-width: 100px;
                ">
                  📍 ${place.place_name || placeName}
                </div>
              `,
              removable: false,
            });

            // 마커 위에 인포윈도우 표시
            infoWindow.open(map, marker);

            setIsMapLoaded(true);
            setError(null);
          } else {
            setError(`"${placeName}" 장소를 찾을 수 없습니다.`);
          }
        });
      } catch (err) {
        console.error('카카오맵 로드 중 오류:', err);
        setError('지도를 불러오는 중 오류가 발생했습니다.');
      }
    };

    // 카카오맵 스크립트 로드 확인
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        loadKakaoMap();
      } else {
        // 1초 후 다시 확인
        setTimeout(checkKakaoLoaded, 1000);
      }
    };

    checkKakaoLoaded();
  }, [placeName]);

  if (error) {
    return (
      <MapContainer $width={width} $height={height}>
        <ErrorMessage>
          <div>🗺️</div>
          <div>{error}</div>
        </ErrorMessage>
      </MapContainer>
    );
  }

  return (
    <MapContainer $width={width} $height={height}>
      <MapElement ref={mapRef} />
      {!isMapLoaded && (
        <LoadingOverlay>
          <div>🔄</div>
          <div>지도를 불러오는 중...</div>
        </LoadingOverlay>
      )}
    </MapContainer>
  );
};

export default PlaceMap;

// 스타일 컴포넌트들
const MapContainer = styled.div<{ $width: string; $height: string }>`
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 14px;
  text-align: center;

  div:first-child {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  color: #666;
  font-size: 14px;

  div:first-child {
    font-size: 24px;
    margin-bottom: 8px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
