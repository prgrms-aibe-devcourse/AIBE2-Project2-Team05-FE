package com.main.TravelMate.user.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GoogleOAuthService {

    private final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

    public String verifyIdTokenAndGetEmail(String idToken) {
        try {
            String url = GOOGLE_TOKEN_INFO_URL + "?id_token=" + idToken;
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return (String) response.getBody().get("email");
            } else {
                throw new RuntimeException("Google 인증 실패");
            }

        } catch (Exception e) {
            throw new RuntimeException("유효하지 않은 Google ID 토큰", e);
        }
    }
}
