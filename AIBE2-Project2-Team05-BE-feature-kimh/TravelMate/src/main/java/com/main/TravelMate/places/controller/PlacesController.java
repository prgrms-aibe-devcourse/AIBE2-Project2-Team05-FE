package com.main.TravelMate.places.controller;

import com.main.TravelMate.places.dto.PlaceImageRequest;
import com.main.TravelMate.places.dto.PlaceImageResponse;
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
     * API 상태 확인용 엔드포인트
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Places API is working!");
    }
} 