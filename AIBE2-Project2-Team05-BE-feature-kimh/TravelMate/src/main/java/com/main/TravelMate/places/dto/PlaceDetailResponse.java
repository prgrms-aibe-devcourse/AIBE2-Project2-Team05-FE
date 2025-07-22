package com.main.TravelMate.places.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 장소 상세 정보 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceDetailResponse {
    
    /**
     * 성공 여부
     */
    private boolean success;
    
    /**
     * 오류 메시지 (실패 시)
     */
    private String errorMessage;
    
    /**
     * 장소 ID
     */
    private String placeId;
    
    /**
     * 장소명
     */
    private String name;
    
    /**
     * 주소
     */
    private String formattedAddress;
    
    /**
     * 위치 정보
     */
    private Location geometry;
    
    /**
     * 사진 목록
     */
    private List<Photo> photos;
    
    /**
     * 평점
     */
    private Double rating;
    
    /**
     * 리뷰 목록
     */
    private List<Review> reviews;
    
    /**
     * 전화번호
     */
    private String formattedPhoneNumber;
    
    /**
     * 웹사이트
     */
    private String website;
    
    /**
     * 운영시간
     */
    private OpeningHours openingHours;
    
    /**
     * 장소 유형
     */
    private List<String> types;
    
    /**
     * 위치 정보 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Location {
        private double lat;
        private double lng;
    }
    
    /**
     * 사진 정보 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Photo {
        private String photoReference;
        private String photoUrl;
        private int height;
        private int width;
        private List<String> htmlAttributions;
    }
    
    /**
     * 리뷰 정보 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Review {
        private String authorName;
        private int rating;
        private String text;
        private long time;
        private String relativeTimeDescription;
    }
    
    /**
     * 운영시간 정보 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OpeningHours {
        private boolean openNow;
        private List<String> weekdayText;
    }
    
    /**
     * 성공 응답 생성
     */
    public static PlaceDetailResponse success(String placeId, String name, String address, 
                                            Location location, List<Photo> photos, Double rating) {
        return PlaceDetailResponse.builder()
                .success(true)
                .placeId(placeId)
                .name(name)
                .formattedAddress(address)
                .geometry(location)
                .photos(photos)
                .rating(rating)
                .build();
    }
    
    /**
     * 실패 응답 생성
     */
    public static PlaceDetailResponse failure(String placeName, String errorMessage) {
        return PlaceDetailResponse.builder()
                .success(false)
                .name(placeName)
                .errorMessage(errorMessage)
                .build();
    }
} 