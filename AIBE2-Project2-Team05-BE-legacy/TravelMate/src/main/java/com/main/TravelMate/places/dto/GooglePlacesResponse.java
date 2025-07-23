package com.main.TravelMate.places.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

/**
 * Google Places API 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class GooglePlacesResponse {
    
    private List<GooglePlace> results;
    private String status;
    private String errorMessage;
    
    /**
     * Google Place 정보
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class GooglePlace {
        private String placeId;
        private String name;
        private Double rating;
        private Integer priceLevel;
        private List<String> types;
        private List<Photo> photos;
        private Geometry geometry;
        
        /**
         * 장소 사진 정보
         */
        @Getter
        @Setter
        @NoArgsConstructor
        public static class Photo {
            private String photoReference;
            private Integer height;
            private Integer width;
            private List<String> htmlAttributions;
        }
        
        /**
         * 장소 위치 정보
         */
        @Getter
        @Setter
        @NoArgsConstructor
        public static class Geometry {
            private Location location;
            
            @Getter
            @Setter
            @NoArgsConstructor
            public static class Location {
                private Double lat;
                private Double lng;
            }
        }
    }
} 