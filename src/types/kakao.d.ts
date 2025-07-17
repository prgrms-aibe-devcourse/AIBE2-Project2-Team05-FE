declare global {
  interface Window {
    kakao: any;
  }
}

export interface KakaoMapProps {
  center?: {
    lat: number;
    lng: number;
  };
  level?: number;
  style?: React.CSSProperties;
  onCreate?: (map: any) => void;
  onCenterChanged?: (map: any) => void;
  onZoomChanged?: (map: any) => void;
  onBoundsChanged?: (map: any) => void;
  onClick?: (map: any, mouseEvent: any) => void;
  onDoubleClick?: (map: any, mouseEvent: any) => void;
  onRightClick?: (map: any, mouseEvent: any) => void;
  onMouseMove?: (map: any, mouseEvent: any) => void;
  onDragStart?: (map: any) => void;
  onDragEnd?: (map: any) => void;
  onTileLoaded?: (map: any) => void;
}

export interface MarkerData {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  category: 'food' | 'attraction' | 'accommodation' | 'other';
  time?: string;
  icon?: string;
}

export interface PlaceSearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  category_name: string;
  phone: string;
  place_url: string;
}

export {};
