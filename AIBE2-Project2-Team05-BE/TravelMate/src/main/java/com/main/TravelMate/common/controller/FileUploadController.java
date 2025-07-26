package com.main.TravelMate.common.controller;

import com.main.TravelMate.common.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 파일 업로드 컨트롤러
 * 이미지 파일 업로드를 처리하는 API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // 개발 시에만 사용, 운영에서는 특정 도메인으로 제한
public class FileUploadController {

    private final FileUploadService fileUploadService;

    /**
     * 이미지 파일들을 업로드합니다.
     * POST /api/upload/images
     * 
     * @param images 업로드할 이미지 파일들
     * @return 업로드된 이미지들의 URL 리스트
     */
    @PostMapping("/images")
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("images") List<MultipartFile> images) {
        log.info("📤 이미지 업로드 요청 시작 - 파일 수: {}", images.size());
        
        try {
            // 파일 업로드 처리
            List<String> imageUrls = fileUploadService.uploadImages(images);
            
            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "이미지 업로드가 완료되었습니다.");
            response.put("imageUrls", imageUrls);
            response.put("uploadedCount", imageUrls.size());
            
            log.info("✅ 이미지 업로드 성공 - 업로드된 파일 수: {}", imageUrls.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 이미지 업로드 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "이미지 업로드에 실패했습니다: " + e.getMessage());
            errorResponse.put("imageUrls", List.of());
            errorResponse.put("uploadedCount", 0);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 단일 이미지 파일을 업로드합니다.
     * POST /api/upload/image
     * 
     * @param image 업로드할 이미지 파일
     * @return 업로드된 이미지의 URL
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadSingleImage(@RequestParam("image") MultipartFile image) {
        log.info("📤 단일 이미지 업로드 요청 - 파일명: {}", image.getOriginalFilename());
        
        try {
            // 단일 파일을 리스트로 변환하여 처리
            List<String> imageUrls = fileUploadService.uploadImages(List.of(image));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "이미지 업로드가 완료되었습니다.");
            response.put("imageUrl", imageUrls.get(0));
            
            log.info("✅ 단일 이미지 업로드 성공: {}", imageUrls.get(0));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 단일 이미지 업로드 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "이미지 업로드에 실패했습니다: " + e.getMessage());
            errorResponse.put("imageUrl", "");
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 업로드된 이미지 파일을 조회합니다.
     * GET /api/upload/images/{filename}
     * 
     * @param filename 조회할 파일명
     * @return 이미지 파일
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        log.info("📖 이미지 파일 조회 요청: {}", filename);
        
        try {
            // 파일 경로 구성
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", filename);
            
            // 파일이 존재하는지 확인
            if (!java.nio.file.Files.exists(filePath)) {
                log.warn("⚠️ 요청된 이미지 파일이 존재하지 않음: {}", filename);
                return ResponseEntity.notFound().build();
            }
            
            // 파일 읽기
            byte[] imageBytes = java.nio.file.Files.readAllBytes(filePath);
            
            // Content-Type 결정
            String contentType = determineContentType(filename);
            
            log.info("✅ 이미지 파일 조회 성공: {} (크기: {} bytes)", filename, imageBytes.length);
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(imageBytes);
                    
        } catch (Exception e) {
            log.error("❌ 이미지 파일 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 파일명을 기반으로 Content-Type을 결정합니다.
     * 
     * @param filename 파일명
     * @return Content-Type
     */
    private String determineContentType(String filename) {
        if (filename == null) {
            return "image/jpeg";
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "image/jpeg"; // 기본값
        }
    }
} 