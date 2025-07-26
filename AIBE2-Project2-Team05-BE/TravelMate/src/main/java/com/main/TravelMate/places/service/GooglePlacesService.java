package com.main.TravelMate.places.service;

import com.main.TravelMate.places.dto.GooglePlacesResponse;
import com.main.TravelMate.places.dto.PlaceImageRequest;
import com.main.TravelMate.places.dto.PlaceImageResponse;
import com.main.TravelMate.places.dto.PlaceDetailRequest;
import com.main.TravelMate.places.dto.PlaceDetailResponse;
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
import java.util.List;
import java.util.ArrayList;

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
     * 장소 상세 정보를 조회합니다 (새로운 메소드)
     */
    public PlaceDetailResponse getPlaceDetails(PlaceDetailRequest request) {
        log.info("장소 상세 정보 조회 시작: {}", request.getPlaceName());
        
        // API 키가 설정되지 않은 경우 Mock 데이터 반환
        if (googlePlacesApiKey == null || googlePlacesApiKey.equals("your_google_places_api_key_here")) {
            log.warn("Google Places API 키가 설정되지 않았습니다. Mock 데이터를 반환합니다.");
            return createMockPlaceDetails(request.getPlaceName(), request.getRegion());
        }
        
        try {
            Map<String, Object> response = searchPlacesForDetails(request);
            return extractPlaceDetailsFromResponse(response, request.getPlaceName());
        } catch (Exception e) {
            log.error("장소 상세 정보 조회 중 오류 발생: {}", e.getMessage());
            return PlaceDetailResponse.failure(
                request.getPlaceName(), 
                "장소 정보 조회 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }
    
    /**
     * 장소 상세 정보를 위한 Google Places API 검색
     */
    private Map<String, Object> searchPlacesForDetails(PlaceDetailRequest request) {
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("X-Goog-Api-Key", googlePlacesApiKey);
        headers.set("X-Goog-FieldMask", 
            "places.id,places.displayName,places.formattedAddress," +
            "places.location,places.photos,places.rating,places.reviews," +
            "places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours," +
            "places.types");
        
        // 요청 바디 설정
        Map<String, Object> requestBody = new HashMap<>();
        String searchQuery = request.getPlaceName();
        if (request.getRegion() != null && !request.getRegion().isEmpty()) {
            searchQuery += " " + request.getRegion();
        }
        requestBody.put("textQuery", searchQuery);
        requestBody.put("languageCode", request.getLanguageCode());
        
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
        
        log.info("Google Places API 상세 정보 요청 시작");
        
        ResponseEntity<Map> response = restTemplate.exchange(
            GOOGLE_PLACES_NEW_BASE_URL,
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        log.info("Google Places API 상세 정보 응답 받음");
        
        return response.getBody();
    }
    
    /**
     * API 응답에서 장소 상세 정보를 추출
     */
    @SuppressWarnings("unchecked")
    private PlaceDetailResponse extractPlaceDetailsFromResponse(Map<String, Object> response, String originalPlaceName) {
        if (response == null || !response.containsKey("places")) {
            return PlaceDetailResponse.failure(originalPlaceName, "검색 결과가 없습니다.");
        }
        
        List<Map<String, Object>> places = (List<Map<String, Object>>) response.get("places");
        if (places == null || places.isEmpty()) {
            return PlaceDetailResponse.failure(originalPlaceName, "검색 결과가 없습니다.");
        }
        
        Map<String, Object> place = places.get(0);
        
        try {
            PlaceDetailResponse.PlaceDetailResponseBuilder builder = PlaceDetailResponse.builder()
                .success(true)
                .placeId((String) place.get("id"));
            
            // 장소명 추출 (안전한 캐스팅)
            if (place.containsKey("displayName")) {
                try {
                    Object displayNameObj = place.get("displayName");
                    if (displayNameObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> displayName = (Map<String, Object>) displayNameObj;
                        if (displayName.containsKey("text")) {
                            Object textObj = displayName.get("text");
                            if (textObj instanceof String) {
                                builder.name((String) textObj);
                            }
                        }
                    }
                } catch (ClassCastException e) {
                    log.warn("displayName 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 주소 추출 (안전한 캐스팅)
            try {
                Object addressObj = place.get("formattedAddress");
                if (addressObj instanceof String) {
                    builder.formattedAddress((String) addressObj);
                }
            } catch (Exception e) {
                log.warn("formattedAddress 파싱 실패: {}", e.getMessage());
            }
            
            // 위치 정보 추출 (안전한 캐스팅)
            if (place.containsKey("location")) {
                try {
                    Object locationObj = place.get("location");
                    if (locationObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> location = (Map<String, Object>) locationObj;
                        
                        Double lat = 0.0;
                        Double lng = 0.0;
                        
                        if (location.get("latitude") instanceof Number) {
                            lat = ((Number) location.get("latitude")).doubleValue();
                        }
                        if (location.get("longitude") instanceof Number) {
                            lng = ((Number) location.get("longitude")).doubleValue();
                        }
                        
                        builder.geometry(PlaceDetailResponse.Location.builder()
                            .lat(lat)
                            .lng(lng)
                            .build());
                    }
                } catch (Exception e) {
                    log.warn("location 파싱 실패: {}", e.getMessage());
                    // 기본 좌표 설정
                    builder.geometry(PlaceDetailResponse.Location.builder()
                        .lat(0.0)
                        .lng(0.0)
                        .build());
                }
            }
            
            // 평점 추출 (안전한 캐스팅)
            try {
                Object ratingObj = place.get("rating");
                if (ratingObj instanceof Number) {
                    builder.rating(((Number) ratingObj).doubleValue());
                }
            } catch (Exception e) {
                log.warn("rating 파싱 실패: {}", e.getMessage());
            }
            
            // 사진 정보 추출 (안전한 캐스팅)
            if (place.containsKey("photos")) {
                try {
                    Object photosObj = place.get("photos");
                    if (photosObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Object> photosRaw = (List<Object>) photosObj;
                        List<PlaceDetailResponse.Photo> photoList = new ArrayList<>();
                        
                        for (Object photoObj : photosRaw) {
                            if (photoObj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> photo = (Map<String, Object>) photoObj;
                                
                                Object nameObj = photo.get("name");
                                if (nameObj instanceof String) {
                                    String photoName = (String) nameObj;
                                    String photoUrl = generateNewPhotoUrl(photoName);
                                    
                                    Integer height = 400;
                                    Integer width = 400;
                                    
                                    if (photo.get("heightPx") instanceof Number) {
                                        height = ((Number) photo.get("heightPx")).intValue();
                                    }
                                    if (photo.get("widthPx") instanceof Number) {
                                        width = ((Number) photo.get("widthPx")).intValue();
                                    }
                                    
                                    photoList.add(PlaceDetailResponse.Photo.builder()
                                        .photoReference(photoName)
                                        .photoUrl(photoUrl)
                                        .height(height)
                                        .width(width)
                                        .htmlAttributions(new ArrayList<>())
                                        .build());
                                }
                            }
                        }
                        builder.photos(photoList);
                    }
                } catch (Exception e) {
                    log.warn("photos 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 리뷰 정보 추출 (안전한 캐스팅)
            if (place.containsKey("reviews")) {
                try {
                    Object reviewsObj = place.get("reviews");
                    if (reviewsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Object> reviewsRaw = (List<Object>) reviewsObj;
                        List<PlaceDetailResponse.Review> reviewList = new ArrayList<>();
                        
                        for (Object reviewObj : reviewsRaw) {
                            if (reviewObj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> review = (Map<String, Object>) reviewObj;
                                
                                String authorName = "익명";
                                Object authorAttrObj = review.get("authorAttribution");
                                if (authorAttrObj instanceof Map) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> authorAttribution = (Map<String, Object>) authorAttrObj;
                                    Object nameObj = authorAttribution.get("displayName");
                                    if (nameObj instanceof String) {
                                        authorName = (String) nameObj;
                                    }
                                }
                                
                                Integer rating = 5;
                                if (review.get("rating") instanceof Number) {
                                    rating = ((Number) review.get("rating")).intValue();
                                }
                                
                                String reviewText = "";
                                Object textObj = review.get("text");
                                if (textObj instanceof String) {
                                    reviewText = (String) textObj;
                                } else if (textObj instanceof Map) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> textMap = (Map<String, Object>) textObj;
                                    Object innerTextObj = textMap.get("text");
                                    if (innerTextObj instanceof String) {
                                        reviewText = (String) innerTextObj;
                                    }
                                }
                                
                                String timeDescription = "최근";
                                Object timeDescObj = review.get("relativePublishTimeDescription");
                                if (timeDescObj instanceof String) {
                                    timeDescription = (String) timeDescObj;
                                }
                                
                                reviewList.add(PlaceDetailResponse.Review.builder()
                                    .authorName(authorName)
                                    .rating(rating)
                                    .text(reviewText)
                                    .time(System.currentTimeMillis())
                                    .relativeTimeDescription(timeDescription)
                                    .build());
                            }
                        }
                        builder.reviews(reviewList);
                    }
                } catch (Exception e) {
                    log.warn("reviews 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 전화번호 (안전한 캐스팅)
            try {
                Object phoneObj = place.get("nationalPhoneNumber");
                if (phoneObj instanceof String) {
                    builder.formattedPhoneNumber((String) phoneObj);
                }
            } catch (Exception e) {
                log.warn("nationalPhoneNumber 파싱 실패: {}", e.getMessage());
            }
            
            // 웹사이트 (안전한 캐스팅)
            try {
                Object websiteObj = place.get("websiteUri");
                if (websiteObj instanceof String) {
                    builder.website((String) websiteObj);
                }
            } catch (Exception e) {
                log.warn("websiteUri 파싱 실패: {}", e.getMessage());
            }
            
            // 운영시간 정보 추출 (안전한 캐스팅)
            if (place.containsKey("regularOpeningHours")) {
                try {
                    Object openingHoursObj = place.get("regularOpeningHours");
                    if (openingHoursObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> openingHours = (Map<String, Object>) openingHoursObj;
                        
                        Boolean openNow = false;
                        Object openNowObj = openingHours.get("openNow");
                        if (openNowObj instanceof Boolean) {
                            openNow = (Boolean) openNowObj;
                        }
                        
                        List<String> weekdayText = new ArrayList<>();
                        Object weekdayTextObj = openingHours.get("weekdayDescriptions");
                        if (weekdayTextObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<Object> weekdayRaw = (List<Object>) weekdayTextObj;
                            for (Object day : weekdayRaw) {
                                if (day instanceof String) {
                                    weekdayText.add((String) day);
                                }
                            }
                        }
                        
                        builder.openingHours(PlaceDetailResponse.OpeningHours.builder()
                            .openNow(openNow)
                            .weekdayText(weekdayText)
                            .build());
                    }
                } catch (Exception e) {
                    log.warn("openingHours 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 장소 유형 (안전한 캐스팅)
            try {
                Object typesObj = place.get("types");
                if (typesObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> typesRaw = (List<Object>) typesObj;
                    List<String> typesList = new ArrayList<>();
                    for (Object type : typesRaw) {
                        if (type instanceof String) {
                            typesList.add((String) type);
                        }
                    }
                    builder.types(typesList);
                }
            } catch (Exception e) {
                log.warn("types 파싱 실패: {}", e.getMessage());
            }
            
            return builder.build();
            
        } catch (Exception e) {
            log.error("장소 상세 정보 파싱 중 오류: {}", e.getMessage());
            return PlaceDetailResponse.failure(originalPlaceName, "응답 데이터 파싱 중 오류가 발생했습니다.");
        }
    }
    
    /**
     * Mock 장소 상세 정보 생성 (개발/테스트용)
     */
    private PlaceDetailResponse createMockPlaceDetails(String placeName, String region) {
        // Mock 데이터 맵
        Map<String, PlaceDetailResponse> mockData = createMockDataMap();
        
        PlaceDetailResponse mockPlace = mockData.get(placeName);
        if (mockPlace != null) {
            return mockPlace;
        }
        
        // 기본 Mock 데이터 생성
        return PlaceDetailResponse.builder()
            .success(true)
            .placeId("mock_" + placeName.replaceAll("\\s+", "_"))
            .name(placeName)
            .formattedAddress(region != null ? region + " 지역 내" : "위치 정보 확인 중")
            .geometry(PlaceDetailResponse.Location.builder()
                .lat(37.5665)
                .lng(126.9780)
                .build())
            .photos(List.of(
                PlaceDetailResponse.Photo.builder()
                    .photoReference("mock_photo_ref")
                    .photoUrl("https://source.unsplash.com/600x400/?travel,korea," + placeName.replaceAll("\\s+", "+"))
                    .height(400)
                    .width(600)
                    .htmlAttributions(new ArrayList<>())
                    .build()
            ))
            .rating(4.0)
            .reviews(List.of(
                PlaceDetailResponse.Review.builder()
                    .authorName("여행자")
                    .rating(4)
                    .text(placeName + "에 대한 리뷰입니다. 좋은 장소네요!")
                    .time(System.currentTimeMillis() - 86400000)
                    .relativeTimeDescription("1일 전")
                    .build()
            ))
            .types(List.of("establishment"))
            .build();
    }
    
    /**
     * Mock 데이터 맵 생성
     */
    private Map<String, PlaceDetailResponse> createMockDataMap() {
        Map<String, PlaceDetailResponse> mockData = new HashMap<>();
        
        // 강릉 서퍼비치
        mockData.put("강릉 서퍼비치", PlaceDetailResponse.builder()
            .success(true)
            .placeId("mock_surfbeach_gangneung")
            .name("강릉 서퍼비치")
            .formattedAddress("강원도 강릉시 사천면 진리해변길 20")
            .geometry(PlaceDetailResponse.Location.builder()
                .lat(37.8853)
                .lng(128.8493)
                .build())
            .photos(List.of(
                PlaceDetailResponse.Photo.builder()
                    .photoReference("mock_photo_ref_1")
                    .photoUrl("https://source.unsplash.com/600x400/?surf,beach,gangneung")
                    .height(400)
                    .width(600)
                    .htmlAttributions(new ArrayList<>())
                    .build()
            ))
            .rating(4.2)
            .reviews(List.of(
                PlaceDetailResponse.Review.builder()
                    .authorName("서핑 러버")
                    .rating(5)
                    .text("강릉에서 서핑하기 최고의 장소입니다. 파도도 좋고 시설도 깔끔해요!")
                    .time(System.currentTimeMillis() - 86400000)
                    .relativeTimeDescription("1일 전")
                    .build()
            ))
            .formattedPhoneNumber("033-123-4567")
            .website("http://gangneungsurfbeach.com")
            .openingHours(PlaceDetailResponse.OpeningHours.builder()
                .openNow(true)
                .weekdayText(List.of(
                    "월요일: 오전 9:00 ~ 오후 6:00",
                    "화요일: 오전 9:00 ~ 오후 6:00",
                    "수요일: 오전 9:00 ~ 오후 6:00",
                    "목요일: 오전 9:00 ~ 오후 6:00",
                    "금요일: 오전 9:00 ~ 오후 6:00",
                    "토요일: 오전 8:00 ~ 오후 7:00",
                    "일요일: 오전 8:00 ~ 오후 7:00"
                ))
                .build())
            .types(List.of("tourist_attraction", "establishment"))
            .build());
        
        // 올레국수
        mockData.put("올레국수", PlaceDetailResponse.builder()
            .success(true)
            .placeId("mock_ole_noodles")
            .name("올레국수")
            .formattedAddress("제주특별자치도 제주시 구좌읍 올레로 123")
            .geometry(PlaceDetailResponse.Location.builder()
                .lat(33.4996)
                .lng(126.531)
                .build())
            .photos(List.of(
                PlaceDetailResponse.Photo.builder()
                    .photoReference("mock_photo_ref_2")
                    .photoUrl("https://source.unsplash.com/600x400/?noodle,korean,food")
                    .height(400)
                    .width(600)
                    .htmlAttributions(new ArrayList<>())
                    .build()
            ))
            .rating(4.5)
            .reviews(List.of(
                PlaceDetailResponse.Review.builder()
                    .authorName("제주 맛집 탐험가")
                    .rating(5)
                    .text("정말 맛있는 고기국수집이에요. 제주 향토음식의 진수를 느낄 수 있습니다.")
                    .time(System.currentTimeMillis() - 172800000)
                    .relativeTimeDescription("2일 전")
                    .build()
            ))
            .formattedPhoneNumber("064-123-4567")
            .openingHours(PlaceDetailResponse.OpeningHours.builder()
                .openNow(true)
                .weekdayText(List.of(
                    "월요일: 오전 11:00 ~ 오후 8:00",
                    "화요일: 오전 11:00 ~ 오후 8:00",
                    "수요일: 휴무일",
                    "목요일: 오전 11:00 ~ 오후 8:00",
                    "금요일: 오전 11:00 ~ 오후 8:00",
                    "토요일: 오전 11:00 ~ 오후 8:00",
                    "일요일: 오전 11:00 ~ 오후 8:00"
                ))
                .build())
            .types(List.of("restaurant", "food", "establishment"))
            .build());
        
        return mockData;
    }

    /**
     * 장소 이미지를 검색합니다 (New Places API 사용) - 기존 메소드 유지
     */
    public PlaceImageResponse getPlaceImage(PlaceImageRequest request) {
        log.info("장소 이미지 검색 시작: {}", request.getPlaceName());
        
        // Google Places API 키가 설정되지 않은 경우 오류 반환
        if (googlePlacesApiKey == null || googlePlacesApiKey.equals("your_google_places_api_key_here")) {
            log.error("Google Places API 키가 설정되지 않았습니다. .env 파일에 GOOGLE_PLACES_API_KEY를 설정해주세요.");
            return PlaceImageResponse.failure(
                request.getPlaceName(), 
                "Google Places API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
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
     * Google Places API (New)로 장소를 검색합니다 - 기존 메소드 유지
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
     * Google Places API (New) 응답에서 이미지 URL을 추출합니다 - 기존 메소드 유지
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
     * Google Places Photo API (New) URL을 생성합니다 - 기존 메소드 유지
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