package com.main.TravelMate.feed.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.feed.dto.FeedCreateRequestDto;

import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.feed.service.TravelFeedService;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.main.TravelMate.feed.dto.CursorFeedResponseDto;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class TravelFeedController {

    private final TravelFeedRepository feedRepository;
    private final TravelFeedService feedService; // ✅ 서비스 추가

    // ✅ 기존 페이지 기반 피드 목록 조회
    @GetMapping
    public ResponseEntity<List<TravelFeedResponseDto>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<TravelFeedResponseDto> feeds = feedService.getAllFeeds(page, size);
        return ResponseEntity.ok(feeds);
    }

    // ✅ 새로운 커서 기반 피드 목록 조회 (대용량 최적화)
    @GetMapping("/cursor")
    public ResponseEntity<CursorFeedResponseDto> getFeedsWithCursor(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "15") int size
    ) {
        CursorFeedResponseDto response = feedService.getFeedsWithCursor(cursor, size);
        return ResponseEntity.ok(response);
    }

    // ✅ 모든 피드 상태를 ACTIVE로 업데이트하는 엔드포인트 추가
    @PostMapping("/update-status-active")
    public ResponseEntity<String> updateAllFeedsToActive() {
        try {
            feedService.updateAllFeedsToActive();
            return ResponseEntity.ok("모든 피드 상태가 ACTIVE로 업데이트되었습니다");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("피드 상태 업데이트 실패: " + e.getMessage());
        }
    }

    // ✅ via.placeholder.com URL을 로컬 기본 이미지로 변경하는 엔드포인트 추가
    @PostMapping("/fix-placeholder-images")
    public ResponseEntity<String> fixPlaceholderImages() {
        try {
            feedService.fixPlaceholderImages();
            return ResponseEntity.ok("모든 placeholder 이미지가 안정적인 로컬 이미지로 변경되었습니다");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이미지 URL 수정 실패: " + e.getMessage());
        }
    }

    // ✅ 피드 이미지 업데이트 엔드포인트 추가
    @PostMapping("/update-images")
    public ResponseEntity<String> updateFeedImages() {
        feedService.updateFeedImages();
        return ResponseEntity.ok("피드 이미지 업데이트 완료");
    }
    
    // ✅ 모든 피드의 이미지 URL을 travel_plan에서 업데이트하는 엔드포인트 추가
    @PostMapping("/update-all-images")
    public ResponseEntity<String> updateAllFeedImages() {
        try {
            feedService.updateAllFeedImages();
            return ResponseEntity.ok("모든 피드 이미지 URL 업데이트 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("모든 피드 이미지 URL 업데이트 실패: " + e.getMessage());
        }
    }
    
    // ✅ 모든 travel_plan 정보를 기반으로 피드 전체 업데이트 엔드포인트 추가
    @PostMapping("/update-all-feeds")
    public ResponseEntity<String> updateAllFeedsFromPlans() {
        try {
            feedService.updateAllFeedsFromPlans();
            return ResponseEntity.ok("모든 피드가 여행 계획 정보로 업데이트 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("모든 피드 업데이트 실패: " + e.getMessage());
        }
    }
    
    // ✅ 특정 여행 계획에 대한 피드 수동 생성 엔드포인트 추가
    @PostMapping("/create-from-plan/{planId}")
    public ResponseEntity<String> createFeedFromPlan(@PathVariable Long planId) {
        try {
            feedService.createFeedFromExistingPlan(planId);
            return ResponseEntity.ok("피드 생성 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("피드 생성 실패: " + e.getMessage());
        }
    }

    // ✅ travelPlanId로 피드 조회 API 추가
    @GetMapping("/plan/{travelPlanId}")
    public ResponseEntity<TravelFeedResponseDto> getFeedByPlanId(@PathVariable Long travelPlanId) {
        try {
            TravelFeedResponseDto feedResponse = feedService.getFeedByTravelPlanId(travelPlanId);
            return ResponseEntity.ok(feedResponse);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{feedId}")
    public ResponseEntity<TravelFeedResponseDto> getFeed(@PathVariable Long feedId) {
        TravelFeed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new RuntimeException("피드가 존재하지 않습니다."));

        TravelPlan plan = feed.getTravelPlan();
        User user = feed.getUser();

        // ⬇️ 세부 일정 파싱
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

        // ⬇️ 피드 응답 DTO 구성
        TravelFeedResponseDto response = TravelFeedResponseDto.builder()
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
                .authorName(plan.getAuthorName()) // ✅ 여행 계획 작성자 이름 추가
                .build();

        return ResponseEntity.ok(response);
    }
}
