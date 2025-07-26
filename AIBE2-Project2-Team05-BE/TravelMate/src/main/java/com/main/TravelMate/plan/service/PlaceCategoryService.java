package com.main.TravelMate.plan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 장소 카테고리 분류 서비스
 * OpenAI API를 사용하여 개별 장소의 카테고리를 자동으로 분류합니다.
 */
@Service
@Slf4j
public class PlaceCategoryService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public PlaceCategoryService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 장소 카테고리 정보를 담는 클래스
     */
    public static class PlaceCategoryInfo {
        public String category;
        public String icon;
        public String background;
        public String textColor;
        public String borderColor;

        public PlaceCategoryInfo(String category, String icon, String background, String textColor, String borderColor) {
            this.category = category;
            this.icon = icon;
            this.background = background;
            this.textColor = textColor;
            this.borderColor = borderColor;
        }
    }

    /**
     * 장소명으로 카테고리를 분류합니다.
     */
    public PlaceCategoryInfo classifyPlace(String placeName) {
        try {
            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                log.warn("⚠️ OpenAI API 키가 설정되지 않았습니다. 기본 카테고리를 반환합니다.");
                return getDefaultCategory(placeName);
            }

            log.info("🏷️ 장소 카테고리 분류 시작: {}", placeName);

            // OpenAI API 요청 구성
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("max_tokens", 150);
            requestBody.put("temperature", 0.3);

            // 메시지 구성
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", 
                "당신은 여행 장소 분류 전문가입니다. 주어진 장소명을 분석하여 가장 적합한 카테고리로 분류해주세요.\n\n" +
                "사용 가능한 카테고리 (4개만):\n" +
                "- 식당: 레스토랑, 음식점, 한식, 중식, 일식, 양식 등 식사 장소\n" +
                "- 카페: 카페, 커피숍, 디저트카페, 베이커리 등\n" +
                "- 관광: 관광명소, 전망대, 해변, 산, 공원, 테마파크, 박물관, 아쿠아리움 등\n" +
                "- 문화체험: 체험활동, 전통문화, 공연장, 액티비티, 스포츠, 워크숍 등\n\n" +
                "응답 형식 (JSON):\n" +
                "{\n" +
                "  \"category\": \"카테고리명\",\n" +
                "  \"reasoning\": \"분류 근거\"\n" +
                "}"
            );

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "다음 장소를 분석하여 가장 적합한 카테고리로 분류해주세요: \"" + placeName + "\"");

            requestBody.put("messages", List.of(systemMessage, userMessage));

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            // API 호출
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL, 
                HttpMethod.POST, 
                entity, 
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                // 응답 파싱
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                String content = responseJson.path("choices").get(0).path("message").path("content").asText();
                
                // JSON 응답에서 카테고리 추출
                JsonNode categoryJson = objectMapper.readTree(content);
                String category = categoryJson.path("category").asText();
                
                log.info("✅ 장소 '{}' 카테고리 분류 완료: {}", placeName, category);
                return getCategoryStyle(category);
            } else {
                log.error("❌ OpenAI API 호출 실패: {}", response.getStatusCode());
                return getDefaultCategory(placeName);
            }

        } catch (Exception e) {
            log.error("❌ 장소 카테고리 분류 중 오류 발생: {}", e.getMessage());
            return getDefaultCategory(placeName);
        }
    }

    /**
     * 카테고리에 따른 스타일 정보를 반환합니다. (4개 카테고리만)
     */
    private PlaceCategoryInfo getCategoryStyle(String category) {
        String categoryLower = category.toLowerCase();
        
        // 식당 - 빨간색 계열
        if (categoryLower.contains("식당") || categoryLower.contains("레스토랑") || categoryLower.contains("음식점") || 
            categoryLower.contains("한식") || categoryLower.contains("중식") || categoryLower.contains("일식") || categoryLower.contains("양식")) {
            return new PlaceCategoryInfo("식당", "🍽️", 
                "linear-gradient(135deg, #FF6B6B, #FF8E53)", "#FFFFFF", "#FF6B6B");
        }
        
        // 카페 - 갈색 계열
        if (categoryLower.contains("카페") || categoryLower.contains("커피") || categoryLower.contains("디저트") || categoryLower.contains("베이커리")) {
            return new PlaceCategoryInfo("카페", "☕", 
                "linear-gradient(135deg, #8D6E63, #A1887F)", "#FFFFFF", "#8D6E63");
        }
        
        // 문화체험 - 보라색 계열
        if (categoryLower.contains("문화체험") || categoryLower.contains("체험") || categoryLower.contains("액티비티") || 
            categoryLower.contains("스포츠") || categoryLower.contains("공연") || categoryLower.contains("워크숍")) {
            return new PlaceCategoryInfo("문화체험", "🎭", 
                "linear-gradient(135deg, #9C27B0, #E91E63)", "#FFFFFF", "#9C27B0");
        }
        
        // 관광 - 파란색 계열 (기본값)
        return new PlaceCategoryInfo("관광", "📍", 
            "linear-gradient(135deg, #45B7D1, #3682F8)", "#FFFFFF", "#45B7D1");
    }

    /**
     * 기본 카테고리 (API 실패 시 키워드 기반 분류) - 4개 카테고리만
     */
    private PlaceCategoryInfo getDefaultCategory(String placeName) {
        String nameLower = placeName.toLowerCase();
        
        // 키워드 기반 간단 분류 (4개 카테고리만)
        if (nameLower.contains("레스토랑") || nameLower.contains("식당") || nameLower.contains("음식점") || 
            nameLower.contains("한식") || nameLower.contains("중식") || nameLower.contains("일식") || nameLower.contains("양식")) {
            return getCategoryStyle("식당");
        }
        if (nameLower.contains("카페") || nameLower.contains("커피") || nameLower.contains("베이커리") || nameLower.contains("디저트")) {
            return getCategoryStyle("카페");
        }
        if (nameLower.contains("체험") || nameLower.contains("액티비티") || nameLower.contains("문화") || 
            nameLower.contains("공연") || nameLower.contains("스포츠") || nameLower.contains("워크숍")) {
            return getCategoryStyle("문화체험");
        }
        
        // 기본값은 관광
        return getCategoryStyle("관광");
    }
} 