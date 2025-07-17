import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { KakaoMapProps, MarkerData, PlaceSearchResult } from '../types/kakao';

/**
 * KakaoMap 래퍼 컴포넌트
 * 마커 생성, 위치 검색, 드래그 앤 드롭 기능을 포함합니다.
 */
interface KakaoMapComponentProps extends KakaoMapProps {
  markers?: MarkerData[];
  onMarkerAdd?: (marker: MarkerData) => void;
  onMarkerUpdate?: (marker: MarkerData) => void;
  onMarkerDelete?: (markerId: string) => void;
  showSearch?: boolean;
}

const KakaoMap: React.FC<KakaoMapComponentProps> = ({
  center = { lat: 37.5665, lng: 126.978 }, // 서울 시청 기본 위치
  level = 3,
  style = { width: '100%', height: '400px' },
  markers = [],
  onMarkerAdd,
  onMarkerUpdate,
  onMarkerDelete,
  showSearch = false,
  onCreate,
  onClick,
  ...props
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const markersRef = useRef<any[]>([]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;

    const { kakao } = window;
    const mapOption = {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: level,
    };

    const kakaoMap = new kakao.maps.Map(mapRef.current, mapOption);
    setMap(kakaoMap);

    // 지도 클릭 이벤트
    if (onClick) {
      kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent: any) => {
        onClick(kakaoMap, mouseEvent);
      });
    }

    // onCreate 콜백 실행
    if (onCreate) {
      onCreate(kakaoMap);
    }

    return () => {
      // 기존 마커들 정리
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [center.lat, center.lng, level]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !window.kakao) return;

    const { kakao } = window;

    // 기존 마커들 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커들 추가
    markers.forEach((markerData) => {
      const markerPosition = new kakao.maps.LatLng(
        markerData.position.lat,
        markerData.position.lng,
      );

      const marker = new kakao.maps.Marker({
        position: markerPosition,
        title: markerData.title,
        draggable: true, // 드래그 가능
      });

      marker.setMap(map);
      markersRef.current.push(marker);

      // 마커 드래그 이벤트
      kakao.maps.event.addListener(marker, 'dragend', () => {
        const position = marker.getPosition();
        const updatedMarker = {
          ...markerData,
          position: {
            lat: position.getLat(),
            lng: position.getLng(),
          },
        };
        onMarkerUpdate?.(updatedMarker);
      });

      // 마커 클릭 이벤트 (삭제용)
      kakao.maps.event.addListener(marker, 'rightclick', () => {
        if (window.confirm('이 마커를 삭제하시겠습니까?')) {
          onMarkerDelete?.(markerData.id);
        }
      });

      // 인포윈도우 생성
      const infoWindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding: 5px; font-size: 12px;">
            <strong>${markerData.title}</strong><br/>
            ${markerData.description || ''}<br/>
            <small>카테고리: ${getCategoryName(markerData.category)}</small>
          </div>
        `,
      });

      // 마커 클릭 시 인포윈도우 표시
      kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [map, markers]);

  // 위치 검색 함수
  const searchPlaces = async (keyword: string) => {
    if (!map || !window.kakao || !keyword.trim()) return;

    setIsSearching(true);
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: any[], status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const results: PlaceSearchResult[] = data.map((place) => ({
          id: place.id,
          place_name: place.place_name,
          address_name: place.address_name,
          road_address_name: place.road_address_name,
          x: place.x,
          y: place.y,
          category_name: place.category_name,
          phone: place.phone,
          place_url: place.place_url,
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    });
  };

  // 검색 결과 클릭 시 마커 추가
  const handleSearchResultClick = (result: PlaceSearchResult) => {
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      position: {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      },
      title: result.place_name,
      description: result.address_name,
      category: getCategoryFromKakao(result.category_name),
    };

    onMarkerAdd?.(newMarker);
    setSearchResults([]);
    setSearchKeyword('');

    // 지도 중심을 해당 위치로 이동
    if (map && window.kakao) {
      const moveLatLon = new window.kakao.maps.LatLng(
        parseFloat(result.y),
        parseFloat(result.x),
      );
      map.setCenter(moveLatLon);
    }
  };

  return (
    <Container>
      {showSearch && (
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="장소를 검색하세요..."
            value={searchKeyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchKeyword(e.target.value)
            }
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                searchPlaces(searchKeyword);
              }
            }}
          />
          <SearchButton
            onClick={() => searchPlaces(searchKeyword)}
            disabled={isSearching}
          >
            {isSearching ? '검색 중...' : '검색'}
          </SearchButton>

          {searchResults.length > 0 && (
            <SearchResults>
              {searchResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  onClick={() => handleSearchResultClick(result)}
                >
                  <ResultTitle>{result.place_name}</ResultTitle>
                  <ResultAddress>{result.address_name}</ResultAddress>
                  <ResultCategory>{result.category_name}</ResultCategory>
                </SearchResultItem>
              ))}
            </SearchResults>
          )}
        </SearchContainer>
      )}

      <MapContainer ref={mapRef} style={style} />

      <MapInfo>
        <InfoText>
          • 지도를 클릭하여 마커를 추가할 수 있습니다 • 마커를 드래그하여 위치를
          변경할 수 있습니다 • 마커를 우클릭하여 삭제할 수 있습니다
        </InfoText>
      </MapInfo>
    </Container>
  );
};

// 카테고리 이름 변환 함수
const getCategoryName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    food: '음식점',
    attraction: '관광지',
    accommodation: '숙박',
    other: '기타',
  };
  return categoryMap[category] || '기타';
};

// 카카오 카테고리를 우리 카테고리로 변환
const getCategoryFromKakao = (
  kakaoCategory: string,
): MarkerData['category'] => {
  if (kakaoCategory.includes('음식')) return 'food';
  if (kakaoCategory.includes('관광') || kakaoCategory.includes('여행'))
    return 'attraction';
  if (kakaoCategory.includes('숙박')) return 'accommodation';
  return 'other';
};

// 스타일 컴포넌트
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchResultItem = styled.div`
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const ResultAddress = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const ResultCategory = styled.div`
  font-size: 11px;
  color: #999;
`;

const MapContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
`;

const MapInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const InfoText = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

export default KakaoMap;
