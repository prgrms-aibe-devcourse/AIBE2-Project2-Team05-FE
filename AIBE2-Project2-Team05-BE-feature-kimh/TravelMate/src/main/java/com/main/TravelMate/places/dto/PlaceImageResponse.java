package com.main.TravelMate.places.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 장소 이미지 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceImageResponse {
    
    /**
     * 장소명
     */
    private String placeName;
    
    /**
     * 이미지 URL
     */
    private String imageUrl;
    
    /**
     * 장소 ID (Google Places API에서 제공)
     */
    private String placeId;
    
    /**
     * 평점 (선택사항)
     */
    private Double rating;
    
    /**
     * 성공 여부
     */
    private boolean success;
    
    /**
     * 오류 메시지 (실패 시)
     */
    private String errorMessage;
    
    /**
     * 성공 응답 생성자
     */
    public static PlaceImageResponse success(String placeName, String imageUrl, String placeId, Double rating) {
        PlaceImageResponse response = new PlaceImageResponse();
        response.placeName = placeName;
        response.imageUrl = imageUrl;
        response.placeId = placeId;
        response.rating = rating;
        response.success = true;
        return response;
    }
    
    /**
     * 실패 응답 생성자
     */
    public static PlaceImageResponse failure(String placeName, String errorMessage) {
        PlaceImageResponse response = new PlaceImageResponse();
        response.placeName = placeName;
        response.errorMessage = errorMessage;
        response.success = false;
        return response;
    }
} 