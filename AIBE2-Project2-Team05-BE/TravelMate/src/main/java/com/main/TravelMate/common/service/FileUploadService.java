package com.main.TravelMate.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 파일 업로드 서비스
 * 이미지 파일을 서버에 저장하고 접근 가능한 URL을 반환합니다.
 */
@Service
@Slf4j
public class FileUploadService {

    @Value("${file.upload.path:/uploads}")
    private String uploadPath;

    @Value("${file.upload.url-prefix:/api/upload/images}")
    private String urlPrefix;

    /**
     * 여러 이미지 파일을 업로드합니다.
     * 
     * @param files 업로드할 이미지 파일들
     * @return 업로드된 이미지들의 URL 리스트
     */
    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> imageUrls = new ArrayList<>();
        
        // 업로드 디렉토리 생성
        createUploadDirectory();
        
        for (MultipartFile file : files) {
            try {
                String imageUrl = uploadSingleImage(file);
                imageUrls.add(imageUrl);
                log.info("✅ 이미지 업로드 성공: {}", imageUrl);
            } catch (Exception e) {
                log.error("❌ 이미지 업로드 실패: {}", e.getMessage(), e);
                // 실패한 파일은 빈 문자열로 추가 (프론트엔드에서 처리)
                imageUrls.add("");
            }
        }
        
        return imageUrls;
    }

    /**
     * 단일 이미지 파일을 업로드합니다.
     * 
     * @param file 업로드할 이미지 파일
     * @return 업로드된 이미지의 URL
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    private String uploadSingleImage(MultipartFile file) throws IOException {
        // 파일 유효성 검사
        validateImageFile(file);
        
        // 고유한 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // 파일 저장 경로
        Path filePath = Paths.get(uploadPath, uniqueFilename);
        
        // 파일 저장
        Files.copy(file.getInputStream(), filePath);
        
        // 접근 가능한 URL 반환
        return urlPrefix + "/" + uniqueFilename;
    }

    /**
     * 이미지 파일의 유효성을 검사합니다.
     * 
     * @param file 검사할 파일
     * @throws IllegalArgumentException 유효하지 않은 파일인 경우
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드된 파일이 비어있습니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        // 파일 크기 제한 (5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("파일 크기는 5MB 이하여야 합니다.");
        }
    }

    /**
     * 파일 확장자를 추출합니다.
     * 
     * @param filename 파일명
     * @return 파일 확장자 (점 포함)
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".jpg"; // 기본 확장자
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * 업로드 디렉토리를 생성합니다.
     */
    private void createUploadDirectory() {
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                log.info("📁 업로드 디렉토리 생성: {}", uploadPath);
            }
        } catch (IOException e) {
            log.error("❌ 업로드 디렉토리 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("업로드 디렉토리를 생성할 수 없습니다.", e);
        }
    }
} 