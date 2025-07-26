package com.main.TravelMate.places.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 장소 이미지 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceImageRequest {
    
    /**
     * 장소명 (필수)
     */
    private String placeName;
    
    /**
     * 위도 (선택사항)
     */
    private Double latitude;
    
    /**
     * 경도 (선택사항)
     */
    private Double longitude;
    
    /**
     * 검색 반경 (미터 단위, 기본값: 5000)
     */
    @Builder.Default
    private Integer radius = 5000;
    
    public PlaceImageRequest(String placeName) {
        this.placeName = placeName;
    }
    
    public PlaceImageRequest(String placeName, Double latitude, Double longitude) {
        this.placeName = placeName;
        this.latitude = latitude;
        this.longitude = longitude;
    }
} 