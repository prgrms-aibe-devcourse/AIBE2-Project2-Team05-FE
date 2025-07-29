package com.main.TravelMate.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 파일 업로드 서비스
 * 프로필 이미지 등의 파일을 로컬 디스크에 저장하고 URL을 반환합니다.
 */
@Service
@Slf4j
public class FileUploadService {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * 파일을 업로드하고 접근 가능한 URL을 반환합니다.
     * 
     * @param file 업로드할 파일
     * @param category 파일 카테고리 (예: "profile-images")
     * @return 파일 접근 URL
     * @throws IOException 파일 업로드 실패 시
     */
    public String uploadFile(MultipartFile file, String category) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 업로드 디렉토리 생성
        Path categoryPath = Paths.get(uploadDir, category);
        Files.createDirectories(categoryPath);

        // 고유한 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID() + extension;

        // 파일 저장
        Path targetPath = categoryPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // URL 반환
        String fileUrl = String.format("http://localhost:%s/uploads/%s/%s", 
                                        serverPort, category, uniqueFilename);
        
        log.info("파일 업로드 완료: {} -> {}", originalFilename, fileUrl);
        return fileUrl;
    }

    /**
     * 기존 코드와의 호환성을 위한 메서드 (legacy)
     * 여러 이미지 파일을 업로드합니다.
     * 
     * @param files 업로드할 이미지 파일들
     * @return 업로드된 이미지들의 URL 리스트
     */
    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                String imageUrl = uploadFile(file, "images");
                if (imageUrl != null) {
                    imageUrls.add(imageUrl);
                    log.info("✅ 이미지 업로드 성공: {}", imageUrl);
                } else {
                    log.warn("⚠️ 이미지 업로드 실패: 파일이 비어있음");
                    imageUrls.add("");
                }
            } catch (Exception e) {
                log.error("❌ 이미지 업로드 실패: {}", e.getMessage(), e);
                imageUrls.add("");
            }
        }
        
        return imageUrls;
    }

    /**
     * 파일 크기와 타입을 검증합니다.
     */
    public boolean validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // 파일 크기 제한 (5MB)
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            log.warn("파일 크기가 너무 큽니다: {} bytes", file.getSize());
            return false;
        }

        // 이미지 파일만 허용
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("지원하지 않는 파일 타입: {}", contentType);
            return false;
        }

        return true;
    }
} 