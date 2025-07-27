import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// 장소 검색 결과 타입
interface SearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
  category_name: string;
  phone: string;
  place_url: string;
}

interface PlaceSearchInputProps {
  value: string;
  onChange: (placeName: string, placeInfo?: SearchResult) => void;
  placeholder?: string;
  onPlaceSelect?: (place: SearchResult) => void;
}

const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
  value,
  onChange,
  placeholder = '장소를 검색하세요',
  onPlaceSelect,
}) => {
  const [searchKeyword, setSearchKeyword] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운스를 위한 타이머
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // 카카오맵 초기화
  useEffect(() => {
    if (!showMap || !mapRef.current || !window.kakao || !selectedPlace) return;

    const { kakao } = window;

    // 지도 생성
    const mapOption = {
      center: new kakao.maps.LatLng(
        parseFloat(selectedPlace.y),
        parseFloat(selectedPlace.x),
      ),
      level: 3,
    };

    const newMap = new kakao.maps.Map(mapRef.current, mapOption);
    setMap(newMap);

    // 마커 생성
    const newMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(
        parseFloat(selectedPlace.y),
        parseFloat(selectedPlace.x),
      ),
      map: newMap,
    });
    setMarker(newMarker);

    // 인포윈도우 생성
    const infowindow = new kakao.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 5px 0; font-size: 14px;">${selectedPlace.place_name}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">${selectedPlace.address_name}</p>
          ${selectedPlace.phone ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">📞 ${selectedPlace.phone}</p>` : ''}
        </div>
      `,
    });

    infowindow.open(newMap, newMarker);

    return () => {
      if (newMarker) newMarker.setMap(null);
      if (newMap) newMap.relayout();
    };
  }, [showMap, selectedPlace]);

  // 장소 검색 함수
  const searchPlaces = (keyword: string) => {
    if (!keyword.trim() || !window.kakao) return;

    setIsSearching(true);
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: any[], status: any) => {
      setIsSearching(false);

      if (status === window.kakao.maps.services.Status.OK) {
        const results: SearchResult[] = data.slice(0, 10).map((place) => ({
          id: place.id,
          place_name: place.place_name,
          address_name: place.address_name,
          road_address_name: place.road_address_name || '',
          x: place.x,
          y: place.y,
          category_name: place.category_name,
          phone: place.phone || '',
          place_url: place.place_url || '',
        }));

        setSearchResults(results);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    });
  };

  // 입력값 변경 처리 (디바운스 적용)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchKeyword(newValue);
    onChange(newValue);

    // 이전 타이머 취소
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    // 새 타이머 설정 (500ms 디바운스)
    if (newValue.trim()) {
      searchTimer.current = setTimeout(() => {
        searchPlaces(newValue.trim());
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setSelectedPlace(null);
      setShowMap(false);
    }
  };

  // 장소 선택 처리
  const handlePlaceSelect = (place: SearchResult) => {
    setSearchKeyword(place.place_name);
    setSelectedPlace(place);
    setShowResults(false);
    setShowMap(true);
    onChange(place.place_name, place);

    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  // 외부 클릭 시 검색 결과 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container>
      <SearchInputContainer ref={inputRef}>
        <SearchInput
          type="text"
          value={searchKeyword}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
        />
        <SearchIcon>🔍</SearchIcon>

        {isSearching && <LoadingIndicator>검색 중...</LoadingIndicator>}

        {showResults && searchResults.length > 0 && (
          <SearchResults>
            {searchResults.map((place) => (
              <SearchResultItem
                key={place.id}
                onClick={() => handlePlaceSelect(place)}
              >
                <PlaceName>{place.place_name}</PlaceName>
                <PlaceAddress>{place.address_name}</PlaceAddress>
                {place.phone && <PlacePhone>📞 {place.phone}</PlacePhone>}
                <PlaceCategory>{place.category_name}</PlaceCategory>
              </SearchResultItem>
            ))}
          </SearchResults>
        )}
      </SearchInputContainer>

      {showMap && selectedPlace && (
        <MapContainer>
          <MapHeader>
            <MapTitle>{selectedPlace.place_name}</MapTitle>
            <CloseMapButton onClick={() => setShowMap(false)}>✕</CloseMapButton>
          </MapHeader>
          <MapWrapper ref={mapRef} />
        </MapContainer>
      )}
    </Container>
  );
};

// 스타일드 컴포넌트들
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 3px rgba(54, 130, 248, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #6b7280;
  pointer-events: none;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-top: none;
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;
  z-index: 1000;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SearchResultItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    background-color: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PlaceName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 4px;
`;

const PlaceAddress = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const PlacePhone = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const PlaceCategory = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const MapContainer = styled.div`
  margin-top: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e1e5e9;
`;

const MapTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const CloseMapButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  padding: 4px;

  &:hover {
    color: #374151;
  }
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 250px;
`;

export default PlaceSearchInput;
