package com.main.TravelMate.feed.service;

import com.main.TravelMate.feed.domain.TravelStatus;
import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.plan.entity.TravelDay;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.entity.TravelSchedule;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.feed.dto.CursorFeedResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelFeedService {

    private final TravelFeedRepository feedRepository;
    private final TravelPlanRepository travelPlanRepository;

    // ✅ TravelPlan ID로 피드 조회 메서드
    public TravelFeedResponseDto getFeedByTravelPlanId(Long travelPlanId) {
        log.info("🔍 TravelPlan ID {}로 피드 조회 시작", travelPlanId);
        
        try {
            // TravelPlan ID로 피드 조회
            TravelFeed feed = feedRepository.findByTravelPlan_Id(travelPlanId)
                    .orElseThrow(() -> new RuntimeException("해당 여행 계획에 대한 피드를 찾을 수 없습니다: " + travelPlanId));
            
            log.info("✅ TravelPlan ID {}에 대한 피드 조회 성공", travelPlanId);
            
            // 기존 convertToResponseDto 메서드 재사용
            return convertToResponseDto(feed);
        } catch (Exception e) {
            log.error("❌ TravelPlan ID {}로 피드 조회 실패: {}", travelPlanId, e.getMessage(), e);
            throw new RuntimeException("피드 조회 실패: " + e.getMessage(), e);
        }
    }

    // ✅ 피드 목록 조회 메서드 추가 (페이지네이션 지원)
    public List<TravelFeedResponseDto> getAllFeeds(int page, int size) {
        log.info("🔍 ACTIVE 피드 목록 조회 요청: page={}, size={}", page, size);
        
        try {
            // 생성일시 기준 내림차순 정렬로 페이지네이션, ACTIVE 상태만 조회
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<TravelFeed> feedPage = feedRepository.findByStatusOrderByCreatedAtDesc("ACTIVE", pageable);
            
            log.info("📊 ACTIVE 피드 조회 결과: {}페이지, {}개 조회 (전체 {}개)", 
                    page, feedPage.getContent().size(), feedPage.getTotalElements());
            
            // TravelFeed를 TravelFeedResponseDto로 변환
            List<TravelFeedResponseDto> feedDtos = feedPage.getContent().stream()
                    .map(this::convertToResponseDto)
                    .collect(Collectors.toList());
            
            return feedDtos;
        } catch (Exception e) {
            log.error("❌ ACTIVE 피드 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("피드 목록 조회 실패", e);
        }
    }

    // ✅ 커서 기반 피드 목록 조회 (대용량 데이터 최적화)
    public CursorFeedResponseDto getFeedsWithCursor(Long cursor, int size) {
        log.info("🔍 커서 기반 ACTIVE 피드 조회: cursor={}, size={}", cursor, size);
        
        try {
            Pageable pageable = PageRequest.of(0, size + 1); // 하나 더 조회해서 다음 페이지 존재 확인
            List<TravelFeed> feeds;
            
            if (cursor == null) {
                // 첫 페이지: 가장 최신 피드부터
                feeds = feedRepository.findByStatusOrderByIdDesc("ACTIVE", pageable);
                log.info("📊 첫 페이지 조회: {}개 피드", feeds.size());
            } else {
                // 이후 페이지: cursor보다 작은 ID의 피드들
                feeds = feedRepository.findByStatusAndIdLessThanOrderByIdDesc("ACTIVE", cursor, pageable);
                log.info("📊 커서 {} 이후 조회: {}개 피드", cursor, feeds.size());
            }
            
            // 다음 페이지 존재 여부 확인
            boolean hasNext = feeds.size() > size;
            if (hasNext) {
                feeds = feeds.subList(0, size); // 실제 반환할 데이터만 유지
            }
            
            // 다음 커서 설정 (마지막 아이템의 ID)
            Long nextCursor = null;
            if (hasNext && !feeds.isEmpty()) {
                nextCursor = feeds.get(feeds.size() - 1).getId();
            }
            
            // DTO 변환
            List<TravelFeedResponseDto> feedDtos = feeds.stream()
                    .map(this::convertToResponseDto)
                    .collect(Collectors.toList());
            
            log.info("✅ 커서 기반 조회 완료: {}개 반환, nextCursor={}, hasNext={}", 
                    feedDtos.size(), nextCursor, hasNext);
            
            return CursorFeedResponseDto.builder()
                    .feeds(feedDtos)
                    .nextCursor(nextCursor)
                    .hasNext(hasNext)
                    .totalCount(feedDtos.size())
                    .build();
                    
        } catch (Exception e) {
            log.error("❌ 커서 기반 ACTIVE 피드 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("피드 목록 조회 실패", e);
        }
    }

    // ✅ TravelFeed를 TravelFeedResponseDto로 변환하는 헬퍼 메서드
    private TravelFeedResponseDto convertToResponseDto(TravelFeed feed) {
        TravelPlan plan = feed.getTravelPlan();
        User user = feed.getUser();
        
        // 세부 일정 파싱
        List<TravelDayDto> dayDtos = plan.getDays().stream().map(day -> {
            List<TravelScheduleDto> scheduleDtos = day.getSchedules().stream().map(schedule ->
                    TravelScheduleDto.builder()
                            .time(schedule.getTime())
                            .place(schedule.getPlace())
                            .activity(schedule.getActivity())
                            .memo(schedule.getMemo())
                            .cost(schedule.getCost())
                            .build()
            ).toList();

            return TravelDayDto.builder()
                    .dayNumber(day.getDayNumber())
                    .date(day.getDate())
                    .schedules(scheduleDtos)
                    .build();
        }).toList();

        // 피드 응답 DTO 구성
        return TravelFeedResponseDto.builder()
                .id(feed.getId()) // TravelFeed ID 추가
                .travelPlanId(plan.getId())
                .title(plan.getTitle())
                .location(plan.getLocation())
                .description(plan.getDescription())
                .interests(plan.getInterests())
                .numberOfPeople(plan.getNumberOfPeople())
                .budget(plan.getBudget())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .days(dayDtos)
                .createdBy(user.getNickname())
                .profileImage(user.getProfile() != null ? user.getProfile().getProfileImage() : null)
                .imageUrl(feed.getImageUrl())
                .caption(feed.getCaption())
                .status(feed.getStatus()) // ✅ 피드 상태 포함
                .travelStatus(feed.getTravelStatus()) // ✅ 여행 진행 상태 포함
                .authorName(plan.getAuthorName())
                .build();
    }

    // ✅ 모든 피드 상태를 ACTIVE로 업데이트하는 메서드 추가
    public void updateAllFeedsToActive() {
        log.info("🔄 모든 피드 상태를 ACTIVE로 업데이트 시작");
        
        try {
            List<TravelFeed> allFeeds = feedRepository.findAll();
            log.info("📊 전체 피드 수: {}", allFeeds.size());
            
            int updatedCount = 0;
            for (TravelFeed feed : allFeeds) {
                if (!"ACTIVE".equals(feed.getStatus())) {
                    feed.setStatus("ACTIVE");
                    feedRepository.save(feed);
                    updatedCount++;
                    log.info("✅ 피드 ID {} 상태 업데이트: ACTIVE", feed.getId());
                }
            }
            
            log.info("🎯 모든 피드 상태 업데이트 완료: {}개 업데이트됨", updatedCount);
        } catch (Exception e) {
            log.error("❌ 모든 피드 상태 업데이트 실패: {}", e.getMessage(), e);
            throw new RuntimeException("피드 상태 업데이트 실패", e);
        }
    }

    /**
     * 여행 상태 변경
     */
    @Transactional
    public TravelFeed updateTravelStatus(Long feedId, TravelStatus newStatus, String note) {
        log.info("🔄 피드 ID {} 여행 상태 변경: {}", feedId, newStatus);
        
        try {
            TravelFeed feed = feedRepository.findById(feedId)
                    .orElseThrow(() -> new RuntimeException("피드를 찾을 수 없습니다: " + feedId));

            // 상태 변경
            TravelStatus oldStatus = feed.getTravelStatus();
            feed.setTravelStatus(newStatus);
            
            TravelFeed updatedFeed = feedRepository.save(feed);
            
            log.info("✅ 피드 ID {} 여행 상태 변경 완료: {} → {}", feedId, oldStatus, newStatus);
            if (note != null && !note.trim().isEmpty()) {
                log.info("📝 변경 사유: {}", note);
            }
            
            return updatedFeed;
            
        } catch (Exception e) {
            log.error("❌ 피드 ID {} 여행 상태 변경 실패: {}", feedId, e.getMessage(), e);
            throw new RuntimeException("여행 상태 변경 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 여행 상태 변경 (작성자 권한 체크 포함)
     */
    @Transactional
    public TravelFeed updateTravelStatusWithAuth(Long feedId, Long currentUserId, TravelStatus newStatus, String note) {
        log.info("🔄 피드 ID {} 여행 상태 변경 (권한 체크): {} (사용자 ID: {})", feedId, newStatus, currentUserId);
        
        try {
            // 1. 피드 조회
            TravelFeed feed = feedRepository.findById(feedId)
                    .orElseThrow(() -> new RuntimeException("피드를 찾을 수 없습니다: " + feedId));

            // 🚨 디버깅: 피드 정보 상세 로그
            log.info("🔍 [디버깅] 피드 정보: ID={}, 캡션={}, 작성자={}", 
                    feed.getId(), 
                    feed.getCaption(), 
                    feed.getUser() != null ? feed.getUser().getEmail() + " (ID: " + feed.getUser().getId() + ")" : "NULL");

            // 2. 작성자 권한 체크
            Long feedAuthorId = feed.getUser().getId();
            
            // 🚨 디버깅: 권한 비교 상세 로그
            log.info("🔍 [권한 체크] 피드 작성자 ID: {} (타입: {})", feedAuthorId, feedAuthorId.getClass().getSimpleName());
            log.info("🔍 [권한 체크] 현재 사용자 ID: {} (타입: {})", currentUserId, currentUserId.getClass().getSimpleName());
            log.info("🔍 [권한 체크] ID 동등성 비교: {} == {} = {}", feedAuthorId, currentUserId, feedAuthorId.equals(currentUserId));
            
            if (!feedAuthorId.equals(currentUserId)) {
                log.warn("🚫 권한 거부 - 피드 ID: {}, 작성자 ID: {}, 요청자 ID: {}", feedId, feedAuthorId, currentUserId);
                throw new SecurityException("이 여행 계획의 작성자만 상태를 변경할 수 있습니다");
            }

            // 3. 상태 변경
            TravelStatus oldStatus = feed.getTravelStatus();
            feed.setTravelStatus(newStatus);
            
            TravelFeed updatedFeed = feedRepository.save(feed);
            
            log.info("✅ 피드 ID {} 여행 상태 변경 완료 (권한 확인됨): {} → {} (작성자: {})", 
                    feedId, oldStatus, newStatus, currentUserId);
            if (note != null && !note.trim().isEmpty()) {
                log.info("📝 변경 사유: {}", note);
            }
            
            return updatedFeed;
            
        } catch (SecurityException e) {
            // SecurityException은 그대로 던지기 (컨트롤러에서 403 처리)
            throw e;
        } catch (Exception e) {
            log.error("❌ 피드 ID {} 여행 상태 변경 실패 (권한 체크): {}", feedId, e.getMessage(), e);
            throw new RuntimeException("여행 상태 변경 실패: " + e.getMessage(), e);
        }
    }

    /**
     * TravelPlanId로 여행 상태 업데이트 (권한 체크 포함)
     * 사용자 제안: TravelPlan ID와 TravelFeed ID를 같게 취급
     */
    @Transactional
    public TravelFeed updateTravelStatusByPlanIdWithAuth(Long travelPlanId, Long currentUserId, TravelStatus newStatus, String note) {
        log.info("🔄 여행계획 ID {} 여행 상태 변경 (권한 체크): {} (사용자 ID: {})", travelPlanId, newStatus, currentUserId);
        
        try {
            // 1. TravelPlanId로 피드 조회 (travel_plan_id 필드 사용)
            TravelFeed feed = feedRepository.findByTravelPlan_Id(travelPlanId)
                    .orElseThrow(() -> new RuntimeException("여행 계획에 해당하는 피드를 찾을 수 없습니다: " + travelPlanId));

            // 🚨 디버깅: 피드 정보 상세 로그
            log.info("🔍 [디버깅] 피드 정보: 피드ID={}, 여행계획ID={}, 캡션={}, 작성자={}", 
                    feed.getId(),
                    feed.getTravelPlan() != null ? feed.getTravelPlan().getId() : "NULL",
                    feed.getCaption(), 
                    feed.getUser() != null ? feed.getUser().getEmail() + " (ID: " + feed.getUser().getId() + ")" : "NULL");

            // 2. 작성자 권한 체크
            Long feedAuthorId = feed.getUser().getId();
            
            // 🚨 디버깅: 권한 비교 상세 로그
            log.info("🔍 [권한 체크] 피드 작성자 ID: {} (타입: {})", feedAuthorId, feedAuthorId.getClass().getSimpleName());
            log.info("🔍 [권한 체크] 현재 사용자 ID: {} (타입: {})", currentUserId, currentUserId.getClass().getSimpleName());
            log.info("🔍 [권한 체크] ID 동등성 비교: {} == {} = {}", feedAuthorId, currentUserId, feedAuthorId.equals(currentUserId));
            
            if (!feedAuthorId.equals(currentUserId)) {
                log.warn("🚫 권한 거부 - 여행계획 ID: {}, 작성자 ID: {}, 요청자 ID: {}", travelPlanId, feedAuthorId, currentUserId);
                throw new SecurityException("이 여행 계획의 작성자만 상태를 변경할 수 있습니다");
            }

            // 3. 상태 변경
            TravelStatus oldStatus = feed.getTravelStatus();
            feed.setTravelStatus(newStatus);
            
            TravelFeed updatedFeed = feedRepository.save(feed);
            
            log.info("✅ 여행계획 ID {} 여행 상태 변경 완료 (권한 확인됨): {} → {} (작성자: {})", 
                    travelPlanId, oldStatus, newStatus, currentUserId);
            if (note != null && !note.trim().isEmpty()) {
                log.info("📝 변경 사유: {}", note);
            }
            
            return updatedFeed;
            
        } catch (SecurityException e) {
            // SecurityException은 그대로 던지기 (컨트롤러에서 403 처리)
            throw e;
        } catch (Exception e) {
            log.error("❌ 여행계획 ID {} 여행 상태 변경 실패 (권한 체크): {}", travelPlanId, e.getMessage(), e);
            throw new RuntimeException("여행 상태 변경 실패: " + e.getMessage(), e);
        }
    }

    // ✅ via.placeholder.com URL을 로컬 기본 이미지로 변경하는 메서드 추가
    public void fixPlaceholderImages() {
        log.info("🔄 placeholder 이미지 URL을 로컬 이미지로 변경 시작");
        
        try {
            List<TravelFeed> allFeeds = feedRepository.findAll();
            log.info("📊 전체 피드 수: {}", allFeeds.size());
            
            int updatedCount = 0;
            String localImageUrl = "/default-place-image.jpg";
            
            for (TravelFeed feed : allFeeds) {
                String currentImageUrl = feed.getImageUrl();
                
                // via.placeholder.com을 포함한 URL이나 null인 경우 로컬 이미지로 변경
                if (currentImageUrl == null || currentImageUrl.contains("via.placeholder.com")) {
                    feed.setImageUrl(localImageUrl);
                    feedRepository.save(feed);
                    updatedCount++;
                    log.info("✅ 피드 ID {} 이미지 URL 수정: {} → {}", 
                            feed.getId(), currentImageUrl, localImageUrl);
                }
                
                // TravelPlan의 이미지도 함께 확인하고 수정
                if (feed.getTravelPlan() != null) {
                    String planImageUrl = feed.getTravelPlan().getImageUrl();
                    if (planImageUrl != null && planImageUrl.contains("via.placeholder.com")) {
                        feed.getTravelPlan().setImageUrl(localImageUrl);
                        travelPlanRepository.save(feed.getTravelPlan());
                        log.info("✅ 여행계획 ID {} 이미지 URL 수정: {} → {}", 
                                feed.getTravelPlan().getId(), planImageUrl, localImageUrl);
                    }
                }
            }
            
            log.info("🎯 placeholder 이미지 URL 수정 완료: {}개 피드 업데이트됨", updatedCount);
        } catch (Exception e) {
            log.error("❌ placeholder 이미지 URL 수정 실패: {}", e.getMessage(), e);
            throw new RuntimeException("이미지 URL 수정 실패", e);
        }
    }

    public void createFeedFromPlan(TravelPlan plan) {
        log.info("🔄 여행 계획 '{}' (사용자: {}, ID: {})에 대한 피드 생성 시작", 
                plan.getTitle(), plan.getUser().getEmail(), plan.getUser().getId());
        
        try {
            String caption = generateCaption(plan);
            log.info("📝 생성된 캡션 (50자): {}", caption.substring(0, Math.min(50, caption.length())) + "...");
            
            // 이미지 URL이 너무 길면 NULL로 설정
            String imageUrl = plan.getImageUrl();
            if (imageUrl != null && imageUrl.length() > 255) {
                log.warn("⚠️ 이미지 URL이 너무 길어서 NULL로 설정합니다 (길이: {})", imageUrl.length());
                imageUrl = null;
            }
            
            TravelFeed feed = TravelFeed.builder()
                    .user(plan.getUser())
                    .travelPlan(plan)
                    .imageUrl(imageUrl) // ✅ 길이 체크 후 설정
                    .caption(caption)
                    .createdAt(LocalDateTime.now())
                    .build();

            TravelFeed savedFeed = feedRepository.save(feed);
            log.info("✅ 피드 생성 완료! Feed ID: {}, 사용자: {} (ID: {}), 여행 계획: '{}' (ID: {})", 
                    savedFeed.getId(), plan.getUser().getEmail(), plan.getUser().getId(), 
                    plan.getTitle(), plan.getId());
        } catch (Exception e) {
            log.error("❌ 피드 생성 실패! 사용자: {}, 여행 계획: '{}', 오류: {}", 
                    plan.getUser().getEmail(), plan.getTitle(), e.getMessage(), e);
            throw e;
        }
    }

    // ✅ 기존 피드들의 이미지 URL 업데이트 메서드 추가
    public void updateFeedImages() {
        log.info("🔄 기존 피드들의 이미지 URL 업데이트 시작");
        
        try {
            List<TravelFeed> feedsWithoutImages = feedRepository.findByImageUrlIsNull();
            log.info("📊 이미지 URL이 없는 피드 수: {}", feedsWithoutImages.size());
            
            for (TravelFeed feed : feedsWithoutImages) {
                if (feed.getTravelPlan() != null && feed.getTravelPlan().getImageUrl() != null) {
                    feed.setImageUrl(feed.getTravelPlan().getImageUrl());
                    feedRepository.save(feed);
                    log.info("✅ 피드 ID {} 이미지 URL 업데이트 완료: {}", 
                            feed.getId(), feed.getTravelPlan().getImageUrl());
                }
            }
            
            log.info("🎯 피드 이미지 URL 업데이트 완료");
        } catch (Exception e) {
            log.error("❌ 피드 이미지 URL 업데이트 실패: {}", e.getMessage(), e);
        }
    }

    // ✅ 모든 피드의 이미지 URL을 travel_plan에서 업데이트하는 메서드 추가
    public void updateAllFeedImages() {
        log.info("🔄 모든 피드의 이미지 URL을 travel_plan에서 업데이트 시작");
        
        try {
            List<TravelFeed> allFeeds = feedRepository.findAll();
            log.info("📊 전체 피드 수: {}", allFeeds.size());
            
            int updatedCount = 0;
            for (TravelFeed feed : allFeeds) {
                if (feed.getTravelPlan() != null && feed.getTravelPlan().getImageUrl() != null) {
                    String oldImageUrl = feed.getImageUrl();
                    feed.setImageUrl(feed.getTravelPlan().getImageUrl());
                    feedRepository.save(feed);
                    updatedCount++;
                    log.info("✅ 피드 ID {} 이미지 URL 업데이트: {} -> {}", 
                            feed.getId(), 
                            oldImageUrl != null ? oldImageUrl.substring(0, Math.min(50, oldImageUrl.length())) + "..." : "null",
                            feed.getTravelPlan().getImageUrl().substring(0, Math.min(50, feed.getTravelPlan().getImageUrl().length())) + "...");
                }
            }
            
            log.info("🎯 모든 피드 이미지 URL 업데이트 완료: {}/{}개 업데이트됨", updatedCount, allFeeds.size());
        } catch (Exception e) {
            log.error("❌ 모든 피드 이미지 URL 업데이트 실패: {}", e.getMessage(), e);
            throw new RuntimeException("피드 이미지 URL 업데이트 실패", e);
        }
    }
    
    // ✅ 기존 여행 계획에서 피드 생성 메서드 추가
    public void createFeedFromExistingPlan(Long planId) {
        log.info("🔄 여행 계획 ID {}에서 피드 수동 생성 시작", planId);
        
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("여행 계획을 찾을 수 없습니다: " + planId));
        
        // 이미 피드가 있는지 확인
        List<TravelFeed> existingFeeds = feedRepository.findByUser(plan.getUser());
        boolean feedExists = existingFeeds.stream()
                .anyMatch(feed -> feed.getTravelPlan() != null && feed.getTravelPlan().getId().equals(planId));
        
        if (feedExists) {
            log.warn("⚠️ 여행 계획 ID {}에 대한 피드가 이미 존재합니다", planId);
            throw new RuntimeException("이미 피드가 존재합니다");
        }
        
        createFeedFromPlan(plan);
        log.info("✅ 여행 계획 ID {}에서 피드 수동 생성 완료", planId);
    }

    private String generateCaption(TravelPlan plan) {
        StringBuilder sb = new StringBuilder();
        sb.append("📍 ").append(plan.getTitle()).append("\n")
                .append("🗓️ ").append(plan.getStartDate()).append(" ~ ").append(plan.getEndDate()).append("\n")
                .append("👥 ").append(plan.getNumberOfPeople()).append("명 / 💰 ").append(plan.getBudget()).append("만원\n")
                .append("📌 ").append(plan.getLocation()).append("\n\n");

        // 👉 plan 안에 days/schedules 정보가 이미 포함돼 있다고 전제
        if (plan.getDays() != null) {
            for (TravelDay day : plan.getDays()) {
                sb.append("Day ").append(day.getDayNumber()).append(" (").append(day.getDate()).append(")\n");

                List<TravelSchedule> schedules = day.getSchedules();
                if (schedules == null || schedules.isEmpty()) {
                    sb.append("- 일정 없음\n\n");
                } else {
                    for (TravelSchedule s : schedules) {
                        sb.append(String.format("- [%s] %s - %s (%s) 💸 %d원\n",
                                s.getTime(), s.getPlace(), s.getActivity(), s.getMemo(), s.getCost()));
                    }
                    sb.append("\n");
                }
            }
        }

        return sb.toString();
    }
    
    // ✅ 모든 travel_plan 정보를 기반으로 피드 전체 업데이트 메서드 추가
    public void updateAllFeedsFromPlans() {
        log.info("🔄 모든 travel_plan 정보를 기반으로 피드 전체 업데이트 시작");
        
        try {
            // 모든 여행 계획 조회
            List<TravelPlan> allPlans = travelPlanRepository.findAll();
            log.info("📊 전체 여행 계획 수: {}", allPlans.size());
            
            int updatedCount = 0;
            int createdCount = 0;
            
            for (TravelPlan plan : allPlans) {
                try {
                    // 해당 여행 계획에 대한 기존 피드 찾기
                    List<TravelFeed> existingFeeds = feedRepository.findByTravelPlan(plan);
                    
                    if (existingFeeds.isEmpty()) {
                        // 피드가 없으면 새로 생성
                        createFeedFromPlan(plan);
                        createdCount++;
                        log.info("✨ 새 피드 생성: 여행계획 '{}' (ID: {})", plan.getTitle(), plan.getId());
                    } else {
                        // 기존 피드가 있으면 업데이트
                        TravelFeed existingFeed = existingFeeds.get(0); // 첫 번째 피드 사용
                        
                        // 새로운 캡션 생성
                        String newCaption = generateCaption(plan);
                        
                        // 이미지 URL 설정
                        String imageUrl = plan.getImageUrl();
                        if (imageUrl != null && imageUrl.length() > 255) {
                            imageUrl = null;
                        }
                        
                        // 피드 정보 업데이트
                        existingFeed.setCaption(newCaption);
                        existingFeed.setImageUrl(imageUrl);
                        
                        feedRepository.save(existingFeed);
                        updatedCount++;
                        
                        log.info("🔄 기존 피드 업데이트: 여행계획 '{}' (Feed ID: {}, Plan ID: {})", 
                                plan.getTitle(), existingFeed.getId(), plan.getId());
                    }
                } catch (Exception e) {
                    log.error("❌ 여행 계획 '{}'(ID: {}) 피드 처리 실패: {}", 
                            plan.getTitle(), plan.getId(), e.getMessage());
                }
            }
            
            log.info("🎯 모든 피드 업데이트 완료: {}개 업데이트, {}개 새로 생성", updatedCount, createdCount);
        } catch (Exception e) {
            log.error("❌ 모든 피드 업데이트 실패: {}", e.getMessage(), e);
            throw new RuntimeException("피드 전체 업데이트 실패", e);
        }
    }
}
