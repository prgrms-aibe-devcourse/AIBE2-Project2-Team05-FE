package com.main.TravelMate.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 설정 클래스
 * 업로드된 파일들의 정적 리소스 서빙을 위한 설정
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 파일에 대한 정적 리소스 핸들러 추가
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
    
    // CORS 설정은 SecurityConfig에서 통합 관리하므로 여기서는 제거
    // RestTemplate은 HttpClientConfig에서 이미 정의됨
} 