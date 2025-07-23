package com.main.TravelMate.feed.service;



import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.plan.entity.TravelDay;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.entity.TravelSchedule;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TravelFeedService {

    private final TravelFeedRepository feedRepository;

    public void createFeedFromPlan(TravelPlan plan) {
        TravelFeed feed = TravelFeed.builder()
                .user(plan.getUser())
                .travelPlan(plan)
                .imageUrl(null) // 썸네일 이미지는 나중에
                .caption(generateCaption(plan))
                .createdAt(LocalDateTime.now())
                .build();

        feedRepository.save(feed);
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
