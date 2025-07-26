package com.main.TravelMate.plan.service;

import com.main.TravelMate.feed.service.TravelFeedService;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelPlanCreateRequestDto;
import com.main.TravelMate.plan.dto.TravelPlanResponseDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.plan.entity.TravelDay;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.entity.TravelSchedule;
import com.main.TravelMate.plan.entity.PlanStatus;
import com.main.TravelMate.plan.repository.TravelDayRepository;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.plan.repository.TravelScheduleRepository;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
// ✅ Google Places API 관련 import 추가
import com.main.TravelMate.places.service.GooglePlacesService;
import com.main.TravelMate.places.dto.PlaceImageRequest;
import com.main.TravelMate.places.dto.PlaceImageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    private final TravelDayRepository travelDayRepository;
    private final TravelScheduleRepository travelScheduleRepository;
    private final TravelFeedService travelFeedService;
    private final PlaceCategoryService placeCategoryService;
    // ✅ Google Places API 서비스 의존성 추가
    private final GooglePlacesService googlePlacesService;

    public void createPlan(String email, TravelPlanCreateRequestDto request) {
        log.info("🚀 여행 계획 생성 시작 - 사용자: {}, 제목: '{}'", email, request.getTitle());
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        // Legacy 호환: planId 생성 (타임스탬프 + 사용자ID 조합)
        String planId = "plan_" + System.currentTimeMillis() + "_" + user.getId();
        
        log.info("📝 여행 계획 상세 정보:");
        log.info("  - Plan ID: {}", planId);
        log.info("  - 목적지: {}", request.getLocation());
        log.info("  - 여행 기간: {} ~ {}", request.getStartDate(), request.getEndDate());
        log.info("  - 인원: {}명, 예산: {}원", request.getNumberOfPeople(), request.getBudget());
        log.info("  - 매칭 활성화: {}", request.getMatchingEnabled());
        log.info("  - AI 해시태그: {}", request.getAiHashtags() != null ? "포함됨" : "없음");
        log.info("  - AI 추천 장소: {}", request.getNearbyRecommendations() != null ? "포함됨" : "없음");
        log.info("  - 이미지 URL: {}", request.getImageUrl() != null ? "포함됨" : "없음");
        
        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .planId(planId) // Legacy 호환 필드
                .title(request.getTitle())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .interests(request.getInterests())
                .numberOfPeople(request.getNumberOfPeople())
                .budget(request.getBudget())
                .createdAt(LocalDateTime.now())
                .preferredGender(request.getPreferredGender())
                .preferredAgeRange(request.getPreferredAgeRange())
                .preferredLanguage(request.getPreferredLanguage())
                .matchingNote(request.getMatchingNote())
                .accommodationInfo(request.getAccommodationInfo())
                .transportationInfo(request.getTransportationInfo())
                .extraMemo(request.getExtraMemo())
                .matchingEnabled(request.getMatchingEnabled() != null ? request.getMatchingEnabled() : true)
                .recruiting(true) // ✅ 매칭 모집 상태 추가
                // ✅ Google Places & OpenAI API 결과 저장
                .styles(request.getStyles())
                .styleLabels(request.getStyleLabels())
                .schedules(request.getSchedules())
                .aiHashtags(request.getAiHashtags())
                .nearbyRecommendations(request.getNearbyRecommendations())
                .imageUrl(request.getImageUrl())
                .authorName(user.getNickname()) // ✅ 작성자 이름 추가
                .build();

        TravelPlan savedPlan = travelPlanRepository.save(plan);
        log.info("💾 여행 계획 DB 저장 완료 - Plan ID: {}, DB ID: {}", savedPlan.getPlanId(), savedPlan.getId());

        // ✅ Day, Schedule 저장
        for (TravelDayDto dayDto : request.getDays()) {
            TravelDay day = TravelDay.builder()
                    .travelPlan(savedPlan)
                    .dayNumber(dayDto.getDayNumber())
                    .date(dayDto.getDate())
                    .build();

            TravelDay savedDay = travelDayRepository.save(day);

            for (TravelScheduleDto scheduleDto : dayDto.getSchedules()) {
                // 장소 카테고리 자동 분류
                PlaceCategoryService.PlaceCategoryInfo categoryInfo = null;
                if (scheduleDto.getPlace() != null && !scheduleDto.getPlace().trim().isEmpty()) {
                    try {
                        log.info("🏷️ 장소 '{}' 카테고리 분류 중...", scheduleDto.getPlace());
                        categoryInfo = placeCategoryService.classifyPlace(scheduleDto.getPlace());
                        log.info("✅ 장소 '{}' → 카테고리: {} {}", 
                            scheduleDto.getPlace(), categoryInfo.icon, categoryInfo.category);
                    } catch (Exception e) {
                        log.warn("⚠️ 장소 '{}' 카테고리 분류 실패: {}", scheduleDto.getPlace(), e.getMessage());
                    }
                }

                TravelSchedule.TravelScheduleBuilder scheduleBuilder = TravelSchedule.builder()
                        .travelDay(savedDay)
                        .time(scheduleDto.getTime())
                        .place(scheduleDto.getPlace())
                        .activity(scheduleDto.getActivity())
                        .memo(scheduleDto.getMemo())
                        .cost(scheduleDto.getCost());

                // 카테고리 정보가 있으면 추가
                if (categoryInfo != null) {
                    scheduleBuilder
                        .category(categoryInfo.category)
                        .categoryIcon(categoryInfo.icon)
                        .categoryBackground(categoryInfo.background)
                        .categoryTextColor(categoryInfo.textColor)
                        .categoryBorderColor(categoryInfo.borderColor);
                }

                TravelSchedule schedule = scheduleBuilder.build();
                travelScheduleRepository.save(schedule);
            }
        }

        // ✅ 피드 자동 생성
        log.info("🔄 여행 계획 '{}' 저장 완료, 피드 생성 시작...", savedPlan.getTitle());
        travelFeedService.createFeedFromPlan(savedPlan);
        log.info("✅ 여행 계획 '{}'에 대한 피드 생성 완료", savedPlan.getTitle());
        
        // ✅ 매칭 자동 활성화
        if (savedPlan.getMatchingEnabled()) {
            log.info("🤝 여행 계획 '{}'에 대한 매칭이 활성화되었습니다! (Plan ID: {}, 사용자: {})", 
                    savedPlan.getTitle(), savedPlan.getPlanId(), savedPlan.getUser().getEmail());
            log.info("📋 매칭 활성화 상세 정보:");
            log.info("  - 선호 성별: {}", savedPlan.getPreferredGender());
            log.info("  - 선호 연령대: {}", savedPlan.getPreferredAgeRange());
            log.info("  - 선호 언어: {}", savedPlan.getPreferredLanguage());
            log.info("  - 매칭 노트: {}", savedPlan.getMatchingNote());
            log.info("  - 모집 인원: {}명", savedPlan.getNumberOfPeople());
        } else {
            log.info("❌ 여행 계획 '{}'는 매칭이 비활성화되었습니다.", savedPlan.getTitle());
        }
    }

    public List<TravelPlanResponseDto> getUserPlans(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        List<TravelPlan> plans = travelPlanRepository.findByUser(user);

        return plans.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * 매칭 활성화된 여행 계획 목록 조회
     */
    public List<TravelPlanResponseDto> getMatchingEnabledTravelPlans() {
        List<TravelPlan> plans = travelPlanRepository.findByMatchingEnabledTrue();
        log.info("🔍 매칭 활성화된 여행계획 조회: {}개 발견", plans.size());
        
        for (TravelPlan plan : plans) {
            log.info("  📋 매칭 가능한 계획: '{}' (사용자: {}, 모집인원: {}명, Plan ID: {})", 
                    plan.getTitle(), plan.getUser().getEmail(), plan.getNumberOfPeople(), plan.getPlanId());
        }
        
        return plans.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * planId로 여행 계획 조회
     */
    public Optional<TravelPlanResponseDto> getTravelPlanByPlanId(String planId) {
        return travelPlanRepository.findByPlanId(planId)
                .map(this::convertToDto);
    }
    
    /**
     * ID로 여행 계획 조회
     */
    public Optional<TravelPlanResponseDto> getTravelPlanById(Long id) {
        return travelPlanRepository.findById(id)
                .map(this::convertToDto);
    }
    
    /**
     * 여행 계획 삭제 (소프트 삭제 - 상태를 DELETED로 변경)
     */
    @Transactional
    public void deleteTravelPlan(Long id, String email) {
        log.info("🗑️ 여행 계획 삭제 요청 - ID: {}, 사용자: {}", id, email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));
        
        TravelPlan plan = travelPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("여행 계획을 찾을 수 없습니다"));
        
        // 작성자 권한 확인
        if (!plan.getUser().getId().equals(user.getId())) {
            log.warn("❌ 삭제 권한 없음 - 계획 작성자: {}, 요청자: {}", plan.getUser().getEmail(), email);
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        
        // 소프트 삭제: 상태를 DELETED로 변경
        plan.setStatus(PlanStatus.DELETED);
        travelPlanRepository.save(plan);
        
        log.info("✅ 여행 계획 소프트 삭제 완료 - ID: {}", id);
    }
    
    /**
     * ✅ Google Places API를 사용해서 모든 travel_plan의 image_url 업데이트
     */
    @Transactional
    public void updateAllPlanImages() {
        log.info("🔄 모든 여행 계획의 이미지 URL 업데이트 시작");
        
        try {
            List<TravelPlan> allPlans = travelPlanRepository.findAll();
            log.info("📊 전체 여행 계획 수: {}", allPlans.size());
            
            int successCount = 0;
            int failCount = 0;
            
            for (TravelPlan plan : allPlans) {
                try {
                    if (plan.getLocation() != null && !plan.getLocation().trim().isEmpty()) {
                        log.info("🌍 계획 ID {} '{}' 이미지 검색 중... (위치: {})", 
                                plan.getId(), plan.getTitle(), plan.getLocation());
                        
                        PlaceImageRequest request = PlaceImageRequest.builder()
                                .placeName(plan.getLocation())
                                .build();
                        
                        PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
                        
                        if (response.isSuccess() && response.getImageUrl() != null && 
                            !response.getImageUrl().equals("이미지 없음")) {
                            plan.setImageUrl(response.getImageUrl());
                            travelPlanRepository.save(plan);
                            
                            log.info("✅ 계획 ID {} 이미지 URL 업데이트 성공: {}", 
                                    plan.getId(), response.getImageUrl());
                            successCount++;
                        } else {
                            log.warn("⚠️ 계획 ID {} 이미지 없음 또는 실패: {}", 
                                    plan.getId(), response.getErrorMessage());
                            failCount++;
                        }
                    } else {
                        log.warn("⚠️ 계획 ID {} 위치 정보 없음", plan.getId());
                        failCount++;
                    }
                    
                    // API 요청 간격 조절 (Rate Limiting 방지)
                    Thread.sleep(100);
                    
                } catch (Exception e) {
                    log.error("❌ 계획 ID {} 이미지 업데이트 실패: {}", plan.getId(), e.getMessage());
                    failCount++;
                }
            }
            
            log.info("🎯 여행 계획 이미지 업데이트 완료 - 성공: {}개, 실패: {}개", successCount, failCount);
            
        } catch (Exception e) {
            log.error("❌ 여행 계획 이미지 업데이트 중 전체 오류 발생: {}", e.getMessage());
            throw new RuntimeException("여행 계획 이미지 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * ✅ 특정 여행 계획의 image_url 업데이트
     */
    @Transactional
    public void updatePlanImage(Long planId) {
        log.info("🔄 여행 계획 ID {} 이미지 URL 업데이트 시작", planId);
        
        try {
            TravelPlan plan = travelPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("여행 계획을 찾을 수 없습니다"));
            
            if (plan.getLocation() == null || plan.getLocation().trim().isEmpty()) {
                throw new RuntimeException("여행 계획에 위치 정보가 없습니다");
            }
            
            log.info("🌍 계획 '{}' 이미지 검색 중... (위치: {})", plan.getTitle(), plan.getLocation());
            
            PlaceImageRequest request = PlaceImageRequest.builder()
                    .placeName(plan.getLocation())
                    .build();
            
            PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
            
            if (response.isSuccess() && response.getImageUrl() != null && 
                !response.getImageUrl().equals("이미지 없음")) {
                plan.setImageUrl(response.getImageUrl());
                travelPlanRepository.save(plan);
                
                log.info("✅ 계획 ID {} 이미지 URL 업데이트 성공: {}", 
                        plan.getId(), response.getImageUrl());
            } else {
                throw new RuntimeException("이미지를 찾을 수 없습니다: " + response.getErrorMessage());
            }
            
        } catch (Exception e) {
            log.error("❌ 계획 ID {} 이미지 업데이트 실패: {}", planId, e.getMessage());
            throw new RuntimeException("여행 계획 이미지 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * ✅ 이미지 URL이 없는 여행 계획들만 업데이트
     */
    @Transactional
    public void updatePlansWithoutImages() {
        log.info("🔄 이미지 URL이 없는 여행 계획들의 이미지 업데이트 시작");
        
        try {
            // 이미지 URL이 null이거나 빈 문자열인 계획들 찾기
            List<TravelPlan> plansWithoutImages = travelPlanRepository.findAll()
                    .stream()
                    .filter(plan -> plan.getImageUrl() == null || plan.getImageUrl().trim().isEmpty())
                    .collect(Collectors.toList());
            
            log.info("📊 이미지 URL이 없는 여행 계획 수: {}", plansWithoutImages.size());
            
            int successCount = 0;
            int failCount = 0;
            
            for (TravelPlan plan : plansWithoutImages) {
                try {
                    if (plan.getLocation() != null && !plan.getLocation().trim().isEmpty()) {
                        log.info("🌍 계획 ID {} '{}' 이미지 검색 중... (위치: {})", 
                                plan.getId(), plan.getTitle(), plan.getLocation());
                        
                        PlaceImageRequest request = PlaceImageRequest.builder()
                                .placeName(plan.getLocation())
                                .build();
                        
                        PlaceImageResponse response = googlePlacesService.getPlaceImage(request);
                        
                        if (response.isSuccess() && response.getImageUrl() != null && 
                            !response.getImageUrl().equals("이미지 없음")) {
                            plan.setImageUrl(response.getImageUrl());
                            travelPlanRepository.save(plan);
                            
                            log.info("✅ 계획 ID {} 이미지 URL 업데이트 성공: {}", 
                                    plan.getId(), response.getImageUrl());
                            successCount++;
                        } else {
                            log.warn("⚠️ 계획 ID {} 이미지 없음 또는 실패: {}", 
                                    plan.getId(), response.getErrorMessage());
                            failCount++;
                        }
                    } else {
                        log.warn("⚠️ 계획 ID {} 위치 정보 없음", plan.getId());
                        failCount++;
                    }
                    
                    // API 요청 간격 조절 (Rate Limiting 방지)
                    Thread.sleep(100);
                    
                } catch (Exception e) {
                    log.error("❌ 계획 ID {} 이미지 업데이트 실패: {}", plan.getId(), e.getMessage());
                    failCount++;
                }
            }
            
            log.info("🎯 이미지 없는 여행 계획 업데이트 완료 - 성공: {}개, 실패: {}개", successCount, failCount);
            
        } catch (Exception e) {
            log.error("❌ 이미지 없는 여행 계획 업데이트 중 전체 오류 발생: {}", e.getMessage());
            throw new RuntimeException("이미지 없는 여행 계획 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * TravelPlan을 DTO로 변환하는 헬퍼 메서드
     */
    private TravelPlanResponseDto convertToDto(TravelPlan plan) {
        return TravelPlanResponseDto.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .location(plan.getLocation())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .budget(plan.getBudget())
                .numberOfPeople(plan.getNumberOfPeople())
                .interests(plan.getInterests())
                .description(plan.getDescription())
                .createdAt(plan.getCreatedAt())
                // Legacy 호환 필드
                .planId(plan.getPlanId())
                .matchingEnabled(plan.getMatchingEnabled())
                .imageUrl(plan.getImageUrl())
                .aiHashtags(plan.getAiHashtags())
                .nearbyRecommendations(plan.getNearbyRecommendations())
                .schedules(plan.getSchedules())
                // 사용자 관련 필드 추가
                .participants(plan.getParticipants())
                .introduction(plan.getIntroduction())
                // 작성자 정보 추가
                .authorId(plan.getUser() != null ? plan.getUser().getId() : null)
                .authorNickname(plan.getUser() != null ? plan.getUser().getNickname() : plan.getAuthorName())
                .authorProfileImage(plan.getUser() != null && plan.getUser().getProfile() != null ? 
                    plan.getUser().getProfile().getProfileImage() : null)
                .build();
    }
    
    /**
     * author_name이 null이거나 빈 문자열인 여행 계획들을 사용자 닉네임으로 업데이트
     */
    public void updateMissingAuthorNames() {
        log.info("🔄 author_name이 없는 여행 계획들 업데이트 시작");
        
        try {
            // author_name이 null이거나 빈 문자열인 여행 계획들 조회
            List<TravelPlan> plansWithoutAuthorName = travelPlanRepository.findAll().stream()
                    .filter(plan -> plan.getAuthorName() == null || plan.getAuthorName().trim().isEmpty())
                    .toList();
            
            log.info("📊 author_name 업데이트 대상: {}개", plansWithoutAuthorName.size());
            
            int updatedCount = 0;
            
            for (TravelPlan plan : plansWithoutAuthorName) {
                try {
                    // 사용자 정보에서 닉네임 가져오기
                    if (plan.getUser() != null && plan.getUser().getNickname() != null) {
                        plan.setAuthorName(plan.getUser().getNickname());
                        travelPlanRepository.save(plan);
                        updatedCount++;
                        
                        log.info("✅ 여행 계획 ID: {} - author_name 업데이트: '{}'", 
                                plan.getId(), plan.getUser().getNickname());
                    } else {
                        log.warn("⚠️ 여행 계획 ID: {} - 사용자 닉네임이 없어서 업데이트 불가", plan.getId());
                    }
                } catch (Exception e) {
                    log.error("❌ 여행 계획 ID: {} author_name 업데이트 실패: {}", 
                            plan.getId(), e.getMessage());
                }
            }
            
            log.info("🎉 author_name 업데이트 완료: {}개 성공", updatedCount);
            
        } catch (Exception e) {
            log.error("❌ author_name 업데이트 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("author_name 업데이트 실패", e);
        }
    }
    
    /**
     * 디버깅용: 모든 여행 계획의 author_name과 사용자 닉네임 정보 확인
     */
    public String getAuthorNamesDebugInfo() {
        log.info("🔍 author_name 디버깅 정보 수집 시작");
        
        try {
            List<TravelPlan> allPlans = travelPlanRepository.findAll();
            StringBuilder debugInfo = new StringBuilder();
            
            debugInfo.append("=== 🔍 여행 계획 author_name 디버깅 정보 ===\n\n");
            debugInfo.append(String.format("총 %d개의 여행 계획\n\n", allPlans.size()));
            
            for (TravelPlan plan : allPlans) {
                debugInfo.append(String.format("📋 여행 계획 ID: %d\n", plan.getId()));
                debugInfo.append(String.format("  제목: %s\n", plan.getTitle()));
                debugInfo.append(String.format("  author_name: '%s'\n", plan.getAuthorName()));
                
                if (plan.getUser() != null) {
                    debugInfo.append(String.format("  사용자 ID: %d\n", plan.getUser().getId()));
                    debugInfo.append(String.format("  사용자 email: %s\n", plan.getUser().getEmail()));
                    debugInfo.append(String.format("  사용자 nickname: '%s'\n", plan.getUser().getNickname()));
                    
                    // 매칭 여부 확인
                    boolean matches = plan.getAuthorName() != null && 
                                    plan.getAuthorName().equals(plan.getUser().getNickname());
                    debugInfo.append(String.format("  🎯 author_name과 nickname 일치: %s\n", matches ? "✅" : "❌"));
                } else {
                    debugInfo.append("  ⚠️ 사용자 정보 없음\n");
                }
                debugInfo.append("\n");
            }
            
            String result = debugInfo.toString();
            log.info("📊 디버깅 정보 수집 완료");
            return result;
            
        } catch (Exception e) {
            log.error("❌ 디버깅 정보 수집 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("디버깅 정보 수집 실패", e);
        }
    }
}
