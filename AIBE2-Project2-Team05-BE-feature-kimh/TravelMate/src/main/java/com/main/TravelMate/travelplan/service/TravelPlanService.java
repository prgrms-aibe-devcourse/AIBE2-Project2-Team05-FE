package com.main.TravelMate.travelplan.service;

import com.main.TravelMate.travelplan.entity.TravelPlan;
import com.main.TravelMate.travelplan.repository.TravelPlanRepository;
import com.main.TravelMate.travelplan.dto.TravelPlanRequest;
import com.main.TravelMate.travelplan.dto.TravelPlanResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 여행 계획 서비스
 * 여행 계획 관련 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TravelPlanService {
    
    private final TravelPlanRepository travelPlanRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 여행 계획 저장 (생성 또는 업데이트)
     */
    public TravelPlanResponse saveTravelPlan(TravelPlanRequest request) {
        try {
            // planId가 없으면 새로운 ID 생성
            String planId = request.getPlanId() != null ? request.getPlanId() : UUID.randomUUID().toString();
            
            // 기존 계획이 있는지 확인
            Optional<TravelPlan> existingPlan = travelPlanRepository.findByPlanId(planId);
            
            TravelPlan travelPlan;
            if (existingPlan.isPresent()) {
                // 업데이트
                travelPlan = existingPlan.get();
                updateTravelPlanFromRequest(travelPlan, request);
            } else {
                // 신규 생성
                travelPlan = createTravelPlanFromRequest(request, planId);
            }
            
            TravelPlan savedPlan = travelPlanRepository.save(travelPlan);
            return convertToResponse(savedPlan);
            
        } catch (Exception e) {
            throw new RuntimeException("여행 계획 저장 중 오류 발생: " + e.getMessage(), e);
        }
    }
    
    /**
     * planId로 여행 계획 조회
     */
    @Transactional(readOnly = true)
    public Optional<TravelPlanResponse> getTravelPlan(String planId) {
        return travelPlanRepository.findByPlanId(planId)
            .map(this::convertToResponse);
    }
    
    /**
     * 사용자의 모든 여행 계획 조회
     */
    @Transactional(readOnly = true)
    public List<TravelPlanResponse> getUserTravelPlans(String userId) {
        return travelPlanRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * 매칭 활성화된 여행 계획 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TravelPlanResponse> getMatchingEnabledTravelPlans() {
        return travelPlanRepository.findByMatchingEnabledTrueOrderByCreatedAtDesc()
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * 여행 계획 삭제
     */
    public boolean deleteTravelPlan(String planId, String userId) {
        Optional<TravelPlan> travelPlan = travelPlanRepository.findByPlanId(planId);
        
        if (travelPlan.isPresent() && travelPlan.get().getUserId().equals(userId)) {
            travelPlanRepository.delete(travelPlan.get());
            return true;
        }
        return false;
    }
    
    /**
     * 요청에서 새로운 여행 계획 엔티티 생성
     */
    private TravelPlan createTravelPlanFromRequest(TravelPlanRequest request, String planId) throws JsonProcessingException {
        return TravelPlan.builder()
            .planId(planId)
            .userId(request.getUserId())
            .title(request.getTitle())
            .destination(request.getDestination())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .period(request.getPeriod())
            .budget(request.getBudget())
            .people(request.getPeople())
            .styles(objectMapper.writeValueAsString(request.getStyles()))
            .styleLabels(objectMapper.writeValueAsString(request.getStyleLabels()))
            .preferredGender(request.getMatchingInfo() != null ? request.getMatchingInfo().getPreferredGender() : null)
            .preferredAge(request.getMatchingInfo() != null ? request.getMatchingInfo().getPreferredAge() : null)
            .preferredLanguage(request.getMatchingInfo() != null ? request.getMatchingInfo().getPreferredLanguage() : null)
            .matchingMemo(request.getMatchingInfo() != null ? request.getMatchingInfo().getMatchingMemo() : null)
            .matchingEnabled(request.getMatchingInfo() != null)
            .authorName(request.getAuthor() != null ? request.getAuthor().getName() : "사용자")
            .authorProfileImage(request.getAuthor() != null ? request.getAuthor().getProfileImage() : null)
            .schedules(objectMapper.writeValueAsString(request.getSchedules()))
            .aiHashtags(objectMapper.writeValueAsString(request.getAiHashtags()))
            .nearbyRecommendations(objectMapper.writeValueAsString(request.getNearbyRecommendations()))
            .imageUrl(request.getImageUrl())
            .build();
    }
    
    /**
     * 기존 여행 계획 엔티티 업데이트
     */
    private void updateTravelPlanFromRequest(TravelPlan travelPlan, TravelPlanRequest request) throws JsonProcessingException {
        travelPlan.setTitle(request.getTitle());
        travelPlan.setDestination(request.getDestination());
        travelPlan.setStartDate(request.getStartDate());
        travelPlan.setEndDate(request.getEndDate());
        travelPlan.setPeriod(request.getPeriod());
        travelPlan.setBudget(request.getBudget());
        travelPlan.setPeople(request.getPeople());
        travelPlan.setStyles(objectMapper.writeValueAsString(request.getStyles()));
        travelPlan.setStyleLabels(objectMapper.writeValueAsString(request.getStyleLabels()));
        
        if (request.getMatchingInfo() != null) {
            travelPlan.setPreferredGender(request.getMatchingInfo().getPreferredGender());
            travelPlan.setPreferredAge(request.getMatchingInfo().getPreferredAge());
            travelPlan.setPreferredLanguage(request.getMatchingInfo().getPreferredLanguage());
            travelPlan.setMatchingMemo(request.getMatchingInfo().getMatchingMemo());
            travelPlan.setMatchingEnabled(true);
        } else {
            travelPlan.setMatchingEnabled(false);
        }
        
        if (request.getAuthor() != null) {
            travelPlan.setAuthorName(request.getAuthor().getName());
            travelPlan.setAuthorProfileImage(request.getAuthor().getProfileImage());
        }
        
        travelPlan.setSchedules(objectMapper.writeValueAsString(request.getSchedules()));
        travelPlan.setAiHashtags(objectMapper.writeValueAsString(request.getAiHashtags()));
        travelPlan.setNearbyRecommendations(objectMapper.writeValueAsString(request.getNearbyRecommendations()));
        travelPlan.setImageUrl(request.getImageUrl());
    }
    
    /**
     * 엔티티를 응답 DTO로 변환
     */
    private TravelPlanResponse convertToResponse(TravelPlan travelPlan) {
        try {
            // 매칭 정보 생성
            TravelPlanResponse.MatchingInfo matchingInfo = null;
            if (travelPlan.getMatchingEnabled()) {
                matchingInfo = new TravelPlanResponse.MatchingInfo(
                    travelPlan.getPreferredGender(),
                    travelPlan.getPreferredAge(),
                    travelPlan.getPreferredLanguage(),
                    travelPlan.getMatchingMemo()
                );
            }
            
            // 작성자 정보 생성
            TravelPlanResponse.AuthorInfo authorInfo = new TravelPlanResponse.AuthorInfo(
                travelPlan.getUserId(),
                travelPlan.getAuthorName(),
                travelPlan.getAuthorProfileImage()
            );
            
            return TravelPlanResponse.builder()
                .planId(travelPlan.getPlanId())
                .userId(travelPlan.getUserId())
                .title(travelPlan.getTitle())
                .destination(travelPlan.getDestination())
                .startDate(travelPlan.getStartDate())
                .endDate(travelPlan.getEndDate())
                .period(travelPlan.getPeriod())
                .budget(travelPlan.getBudget())
                .people(travelPlan.getPeople())
                .styles(objectMapper.readValue(travelPlan.getStyles(), List.class))
                .styleLabels(objectMapper.readValue(travelPlan.getStyleLabels(), List.class))
                .matchingInfo(matchingInfo)
                .matchingEnabled(travelPlan.getMatchingEnabled())
                .author(authorInfo)
                .schedules(objectMapper.readValue(travelPlan.getSchedules(), java.util.Map.class))
                .aiHashtags(objectMapper.readValue(travelPlan.getAiHashtags(), List.class))
                .nearbyRecommendations(objectMapper.readValue(travelPlan.getNearbyRecommendations(), List.class))
                .imageUrl(travelPlan.getImageUrl())
                .createdAt(travelPlan.getCreatedAt())
                .updatedAt(travelPlan.getUpdatedAt())
                .build();
                
        } catch (JsonProcessingException e) {
            throw new RuntimeException("여행 계획 응답 변환 중 오류 발생: " + e.getMessage(), e);
        }
    }
} 