package com.main.TravelMate.places.controller;

import com.main.TravelMate.places.dto.PlaceImageRequest;
import com.main.TravelMate.places.dto.PlaceImageResponse;
import com.main.TravelMate.places.dto.PlaceDetailRequest;
import com.main.TravelMate.places.dto.PlaceDetailResponse;
import com.main.TravelMate.places.service.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 장소 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // 개발 시에만 사용, 운영에서는 특정 도메인으로 제한
public class PlacesController {
    
    private final GooglePlacesService googlePlacesService;
    
    /**
     * 장소 상세 정보 조회 API (새로운 API)
     * GET /api/places/details?placeName=장소명&region=지역&latitude=위도&longitude=경도
     */
    @GetMapping("/details")
    public ResponseEntity<PlaceDetailResponse> getPlaceDetails(
            @RequestParam String placeName,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "5000") Integer radius,
            @RequestParam(defaultValue = "ko-KR") String languageCode) {
        
        log.info("장소 상세 정보 요청 - 장소명: {}, 지역: {}, 위도: {}, 경도: {}", 
                placeName, region, latitude, longitude);
        
        try {
            PlaceDetailRequest request = new PlaceDetailRequest();
            request.setPlaceName(placeName);
            request.setRegion(region);
            request.setLatitude(latitude);
            request.setLongitude(longitude);
            request.setRadius(radius);
            request.setLanguageCode(languageCode);
            
            PlaceDetailResponse response = googlePlacesService.getPlaceDetails(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("장소 상세 정보 조회 중 오류 발생", e);
            PlaceDetailResponse errorResponse = PlaceDetailResponse.failure(
                placeName, 
                "서버 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 장소 상세 정보 조회 API (POST 방식)
     * POST /api/places/details
     */
    @PostMapping("/details")
    public ResponseEntity<PlaceDetailResponse> getPlaceDetailsPost(@RequestBody PlaceDetailRequest request) {
        
        log.info("장소 상세 정보 요청 (POST) - 장소명: {}, 지역: {}", 
                request.getPlaceName(), request.getRegion());
        
        try {
            PlaceDetailResponse response = googlePlacesService.getPlaceDetails(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("장소 상세 정보 조회 중 오류 발생", e);
            PlaceDetailResponse errorResponse = PlaceDetailResponse.failure(
                request.getPlaceName(), 
                "서버 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 장소 이미지 검색 API
     * GET /api/places/image?placeName=장소명&latitude=위도&longitude=경도
     */
    @GetMapping("/image")
    public ResponseEntity<PlaceImageResponse> getPlaceImage(
            @RequestParam String placeName,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "5000") Integer radius) {
        
        log.info("장소 이미지 요청 - 장소명: {}, 위도: {}, 경도: {}", placeName, latitude, longitude);
        
        try {
            PlaceImageRequest request = new PlaceImageRequest(placeName, latitude, longitude);
            request.setRadius(radius);
            
            PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("장소 이미지 검색 중 오류 발생", e);
            PlaceImageResponse errorResponse = PlaceImageResponse.failure(
                placeName, 
                "서버 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 장소 이미지 검색 API (POST 방식)
     * POST /api/places/image
     */
    @PostMapping("/image")
    public ResponseEntity<PlaceImageResponse> getPlaceImagePost(@RequestBody PlaceImageRequest request) {
        
        log.info("장소 이미지 요청 (POST) - 장소명: {}", request.getPlaceName());
        
        try {
            PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("장소 이미지 검색 중 오류 발생", e);
            PlaceImageResponse errorResponse = PlaceImageResponse.failure(
                request.getPlaceName(), 
                "서버 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 목적지별 대표 이미지 조회
     * 목적지명을 받아서 해당 지역의 대표적인 명소 이미지를 반환합니다.
     * 
     * @param destination 목적지명 (예: "제주 성산일출봉", "부산 감천문화마을")
     * @return PlaceImageResponse 이미지 URL과 성공/실패 정보
     */
    @GetMapping("/destination-image")
    public ResponseEntity<PlaceImageResponse> getDestinationImage(@RequestParam String destination) {
        try {
            log.info("목적지별 대표 이미지 요청: {}", destination);
            
            // PlaceImageRequest 생성
            PlaceImageRequest request = new PlaceImageRequest();
            request.setPlaceName(destination);
            // 위도/경도는 선택사항이므로 null로 설정
            request.setLatitude(null);
            request.setLongitude(null);
            
            // Google Places API를 통해 목적지 이미지 검색
            PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
            
            if (response.isSuccess()) {
                log.info("목적지 대표 이미지 조회 성공: {} -> {}", destination, response.getImageUrl());
                return ResponseEntity.ok(response);
            } else {
                log.warn("목적지 대표 이미지를 찾을 수 없음: {} - {}", destination, response.getErrorMessage());
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("목적지 대표 이미지 조회 중 오류 발생: {}", destination, e);
            PlaceImageResponse errorResponse = PlaceImageResponse.failure(destination, "서버 오류: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * API 상태 확인용 엔드포인트
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Places API is working!");
    }
} 