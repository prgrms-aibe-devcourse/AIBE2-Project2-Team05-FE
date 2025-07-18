package com.main.TravelMate.places.service;

import com.main.TravelMate.places.dto.GooglePlacesResponse;
import com.main.TravelMate.places.dto.PlaceImageRequest;
import com.main.TravelMate.places.dto.PlaceImageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Google Places API 서비스 (New API 사용)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GooglePlacesService {
    
    private final RestTemplate restTemplate;
    
    @Value("${google.places.api.key}")
    private String googlePlacesApiKey;
    
    private static final String GOOGLE_PLACES_NEW_BASE_URL = "https://places.googleapis.com/v1/places:searchText";
    private static final String PHOTO_BASE_URL = "https://places.googleapis.com/v1";
    
    /**
     * 장소 이미지를 검색합니다 (New Places API 사용)
     */
    public PlaceImageResponse getPlaceImage(PlaceImageRequest request) {
        log.info("장소 이미지 검색 시작: {}", request.getPlaceName());
        
        // Google Places API 키가 설정되지 않은 경우 기본 이미지 URL 반환
        if (googlePlacesApiKey == null || googlePlacesApiKey.equals("your_google_places_api_key_here")) {
            log.warn("Google Places API 키가 설정되지 않았습니다. 기본 이미지를 반환합니다.");
            return PlaceImageResponse.success(
                request.getPlaceName(), 
                "https://via.placeholder.com/400x300?text=" + request.getPlaceName().replaceAll(" ", "+"),
                "temp_place_id",
                0.0
            );
        }
        
        try {
            Map<String, Object> response = searchPlacesNew(request);
            return extractImageUrlFromNewApi(response, request.getPlaceName());
        } catch (Exception e) {
            log.error("장소 이미지 검색 중 오류 발생: {}", e.getMessage());
            return PlaceImageResponse.failure(
                request.getPlaceName(), 
                "이미지 검색 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }
    
    /**
     * Google Places API (New)로 장소를 검색합니다
     */
    private Map<String, Object> searchPlacesNew(PlaceImageRequest request) {
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("X-Goog-Api-Key", googlePlacesApiKey);
        headers.set("X-Goog-FieldMask", "places.displayName,places.photos,places.id,places.rating");
        
        // 요청 바디 설정
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("textQuery", request.getPlaceName());
        
        // 위치 정보가 있으면 추가
        if (request.getLatitude() != null && request.getLongitude() != null) {
            Map<String, Object> locationBias = new HashMap<>();
            Map<String, Object> circle = new HashMap<>();
            Map<String, Object> center = new HashMap<>();
            center.put("latitude", request.getLatitude());
            center.put("longitude", request.getLongitude());
            circle.put("center", center);
            circle.put("radius", request.getRadius());
            locationBias.put("circle", circle);
            requestBody.put("locationBias", locationBias);
        }
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        log.info("Google Places API (New) 요청 시작");
        
        ResponseEntity<Map> response = restTemplate.exchange(
            GOOGLE_PLACES_NEW_BASE_URL,
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        log.info("Google Places API (New) 응답 받음");
        
        return response.getBody();
    }
    
    /**
     * Google Places API (New) 응답에서 이미지 URL을 추출합니다
     */
    @SuppressWarnings("unchecked")
    private PlaceImageResponse extractImageUrlFromNewApi(Map<String, Object> response, String originalPlaceName) {
        if (response == null || !response.containsKey("places")) {
            return PlaceImageResponse.failure(originalPlaceName, "검색 결과가 없습니다.");
        }
        
        java.util.List<Map<String, Object>> places = (java.util.List<Map<String, Object>>) response.get("places");
        if (places == null || places.isEmpty()) {
            return PlaceImageResponse.failure(originalPlaceName, "검색 결과가 없습니다.");
        }
        
        Map<String, Object> place = places.get(0);
        
        // 장소명 추출
        String placeName = originalPlaceName;
        if (place.containsKey("displayName")) {
            Map<String, Object> displayName = (Map<String, Object>) place.get("displayName");
            if (displayName.containsKey("text")) {
                placeName = (String) displayName.get("text");
            }
        }
        
        // 평점 추출
        Double rating = null;
        if (place.containsKey("rating")) {
            rating = (Double) place.get("rating");
        }
        
        // 장소 ID 추출
        String placeId = (String) place.get("id");
        
        // 사진이 있는 경우 첫 번째 사진의 URL 생성
        if (place.containsKey("photos")) {
            java.util.List<Map<String, Object>> photos = (java.util.List<Map<String, Object>>) place.get("photos");
            if (photos != null && !photos.isEmpty()) {
                Map<String, Object> photo = photos.get(0);
                String photoName = (String) photo.get("name");
                String imageUrl = generateNewPhotoUrl(photoName);
                
                return PlaceImageResponse.success(
                    placeName,
                    imageUrl,
                    placeId,
                    rating
                );
            }
        }
        
        // 사진이 없는 경우 - "이미지 없음"으로 성공 응답 반환
        return PlaceImageResponse.success(
            placeName,
            "이미지 없음", // 특별한 값으로 이미지가 없음을 표시
            placeId,
            rating
        );
    }
    
    /**
     * Google Places Photo API (New) URL을 생성합니다
     */
    private String generateNewPhotoUrl(String photoName) {
        return String.format(
            "%s/%s/media?key=%s&maxHeightPx=400&maxWidthPx=400",
            PHOTO_BASE_URL,
            photoName,
            googlePlacesApiKey
        );
    }
} 