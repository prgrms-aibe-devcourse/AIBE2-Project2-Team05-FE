package com.main.TravelMate.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP 클라이언트 설정
 * Google Places API 등 외부 API 호출을 위한 RestTemplate 설정
 */
@Configuration
public class HttpClientConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
} 