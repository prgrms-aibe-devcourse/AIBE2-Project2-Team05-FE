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

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class TravelFeedController {

    private final TravelFeedRepository feedRepository;
    private final TravelFeedService feedService; // ✅ 서비스 추가

    // ✅ 피드 이미지 업데이트 엔드포인트 추가
    @PostMapping("/update-images")
    public ResponseEntity<String> updateFeedImages() {
        feedService.updateFeedImages();
        return ResponseEntity.ok("피드 이미지 업데이트 완료");
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
                .build();

        return ResponseEntity.ok(response);
    }
}
