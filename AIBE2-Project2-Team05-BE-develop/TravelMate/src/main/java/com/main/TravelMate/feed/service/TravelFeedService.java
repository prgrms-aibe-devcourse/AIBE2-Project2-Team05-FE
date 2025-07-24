package com.main.TravelMate.feed.service;



import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.plan.entity.TravelDay;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.entity.TravelSchedule;
import com.main.TravelMate.plan.repository.TravelPlanRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelFeedService {

    private final TravelFeedRepository feedRepository;
    private final TravelPlanRepository travelPlanRepository;

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
}
