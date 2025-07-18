import React, { useState } from 'react';
import styled from 'styled-components';
import KakaoMap from '../components/KakaoMap';
import { MarkerData } from '../types/kakao';

/**
 * KakaoMap 컴포넌트 테스트 페이지
 */
const MapTestPage: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // 마커 추가 핸들러
  const handleMarkerAdd = (marker: MarkerData) => {
    setMarkers((prev) => [...prev, marker]);
  };

  // 마커 업데이트 핸들러
  const handleMarkerUpdate = (updatedMarker: MarkerData) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === updatedMarker.id ? updatedMarker : marker,
      ),
    );
  };

  // 마커 삭제 핸들러
  const handleMarkerDelete = (markerId: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== markerId));
  };

  // 지도 클릭 시 마커 추가
  const handleMapClick = (map: any, mouseEvent: any) => {
    const latlng = mouseEvent.latLng;
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      position: {
        lat: latlng.getLat(),
        lng: latlng.getLng(),
      },
      title: `마커 ${markers.length + 1}`,
      description: '클릭으로 생성된 마커',
      category: 'other',
    };

    handleMarkerAdd(newMarker);
  };

  return (
    <Container>
      <Header>
        <Title>KakaoMap 테스트</Title>
        <Subtitle>지도 기능을 테스트해보세요</Subtitle>
      </Header>

      <Content>
        <MapSection>
          <SectionTitle>지도</SectionTitle>
          <KakaoMap
            center={{ lat: 37.5665, lng: 126.978 }}
            level={3}
            style={{ width: '100%', height: '500px' }}
            markers={markers}
            onMarkerAdd={handleMarkerAdd}
            onMarkerUpdate={handleMarkerUpdate}
            onMarkerDelete={handleMarkerDelete}
            onClick={handleMapClick}
            showSearch={true}
          />
        </MapSection>

        <MarkerSection>
          <SectionTitle>마커 목록 ({markers.length}개)</SectionTitle>
          {markers.length === 0 ? (
            <EmptyMessage>
              지도를 클릭하거나 장소를 검색하여 마커를 추가해보세요.
            </EmptyMessage>
          ) : (
            <MarkerList>
              {markers.map((marker) => (
                <MarkerItem key={marker.id}>
                  <MarkerTitle>{marker.title}</MarkerTitle>
                  <MarkerInfo>
                    <div>
                      위치: {marker.position.lat.toFixed(6)},{' '}
                      {marker.position.lng.toFixed(6)}
                    </div>
                    <div>카테고리: {getCategoryName(marker.category)}</div>
                    {marker.description && (
                      <div>설명: {marker.description}</div>
                    )}
                  </MarkerInfo>
                  <DeleteButton onClick={() => handleMarkerDelete(marker.id)}>
                    삭제
                  </DeleteButton>
                </MarkerItem>
              ))}
            </MarkerList>
          )}
        </MarkerSection>
      </Content>
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

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MapSection = styled.section`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const MarkerSection = styled.section`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
`;

const MarkerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MarkerItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
`;

const MarkerTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 10px;
`;

const MarkerInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 10px;

  div {
    margin-bottom: 4px;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #c82333;
  }
`;

export default MapTestPage;
