package com.main.TravelMate.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

/**
 * 파일 업로드 설정
 * 멀티파트 파일 업로드를 위한 설정을 제공합니다.
 */
@Configuration
public class FileUploadConfig {

    /**
     * 멀티파트 리졸버 설정
     * 파일 업로드를 처리하기 위한 MultipartResolver 빈을 생성합니다.
     */
    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
} 