package com.main.TravelMate.feed.service;

import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelFeedMigrationService {
    
    private final TravelFeedRepository feedRepository;
    
    /**
     * 기존 TravelFeed 데이터를 새로운 ID 구조로 마이그레이션
     * travel_feed.id = travel_plan.id로 통합
     */
    @Transactional
    public void migrateTravelFeedIds() {
        log.info("🔄 TravelFeed ID 마이그레이션 시작");
        
        try {
            // 1. 기존 모든 피드 조회
            List<TravelFeed> allFeeds = feedRepository.findAll();
            log.info("📊 마이그레이션 대상 피드 수: {}", allFeeds.size());
            
            // 2. 각 피드를 새로운 구조로 변환
            for (TravelFeed oldFeed : allFeeds) {
                Long oldId = oldFeed.getId();
                Long travelPlanId = oldFeed.getTravelPlan().getId();
                
                log.info("🔄 피드 마이그레이션: 기존 ID {} → 새 ID {} (TravelPlan ID)", oldId, travelPlanId);
                
                // 3. 기존 피드를 삭제하고 새로운 ID로 재생성
                feedRepository.delete(oldFeed);
                feedRepository.flush(); // 즉시 삭제 실행
                
                // 4. 새로운 ID로 피드 재생성
                TravelFeed newFeed = TravelFeed.builder()
                        .id(travelPlanId) // TravelPlan ID를 TravelFeed ID로 사용
                        .user(oldFeed.getUser())
                        .travelPlan(oldFeed.getTravelPlan())
                        .imageUrl(oldFeed.getImageUrl())
                        .caption(oldFeed.getCaption())
                        .status(oldFeed.getStatus())
                        .travelStatus(oldFeed.getTravelStatus())
                        .createdAt(oldFeed.getCreatedAt())
                        .build();
                
                feedRepository.save(newFeed);
                log.info("✅ 피드 마이그레이션 완료: 새 ID {}", newFeed.getId());
            }
            
            log.info("🎉 TravelFeed ID 마이그레이션 성공 완료!");
            
        } catch (Exception e) {
            log.error("❌ TravelFeed ID 마이그레이션 실패: {}", e.getMessage(), e);
            throw new RuntimeException("마이그레이션 실패", e);
        }
    }
    
    /**
     * 마이그레이션 상태 확인
     */
    public void checkMigrationStatus() {
        log.info("🔍 마이그레이션 상태 확인");
        
        List<TravelFeed> allFeeds = feedRepository.findAll();
        log.info("📊 현재 피드 총 개수: {}", allFeeds.size());
        
        for (TravelFeed feed : allFeeds) {
            Long feedId = feed.getId();
            Long travelPlanId = feed.getTravelPlan() != null ? feed.getTravelPlan().getId() : null;
            boolean isMatched = feedId != null && feedId.equals(travelPlanId);
            
            log.info("📋 피드: ID={}, TravelPlan ID={}, 매칭여부={}", 
                    feedId, travelPlanId, isMatched ? "✅" : "❌");
        }
    }
} 