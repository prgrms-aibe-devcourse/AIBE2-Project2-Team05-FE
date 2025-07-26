package com.main.TravelMate.places.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 장소 상세 정보 조회 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDetailRequest {
    
    /**
     * 장소명 (필수)
     */
    private String placeName;
    
    /**
     * 검색 지역 (선택사항)
     */
    private String region;
    
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
    private Integer radius = 5000;
    
    /**
     * 언어 코드 (기본값: ko-KR)
     */
    private String languageCode = "ko-KR";
    
    public PlaceDetailRequest(String placeName, String region) {
        this.placeName = placeName;
        this.region = region;
    }
    
    public PlaceDetailRequest(String placeName, Double latitude, Double longitude) {
        this.placeName = placeName;
        this.latitude = latitude;
        this.longitude = longitude;
    }
} 