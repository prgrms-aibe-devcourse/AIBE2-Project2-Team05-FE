package com.main.TravelMate.plan.service;

import com.main.TravelMate.feed.service.TravelFeedService;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelPlanCreateRequestDto;
import com.main.TravelMate.plan.dto.TravelPlanResponseDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.plan.entity.TravelDay;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.entity.TravelSchedule;
import com.main.TravelMate.plan.repository.TravelDayRepository;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.plan.repository.TravelScheduleRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    private final TravelDayRepository travelDayRepository;
    private final TravelScheduleRepository travelScheduleRepository;
    private final TravelFeedService travelFeedService;

    public void createPlan(String email, TravelPlanCreateRequestDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        TravelPlan plan = TravelPlan.builder()
                .user(user)
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
                .build();

        TravelPlan savedPlan = travelPlanRepository.save(plan);

        // ✅ Day, Schedule 저장
        for (TravelDayDto dayDto : request.getDays()) {
            TravelDay day = TravelDay.builder()
                    .travelPlan(savedPlan)
                    .dayNumber(dayDto.getDayNumber())
                    .date(dayDto.getDate())
                    .build();

            TravelDay savedDay = travelDayRepository.save(day);

            for (TravelScheduleDto scheduleDto : dayDto.getSchedules()) {
                TravelSchedule schedule = TravelSchedule.builder()
                        .travelDay(savedDay)
                        .time(scheduleDto.getTime())
                        .place(scheduleDto.getPlace())
                        .activity(scheduleDto.getActivity())
                        .memo(scheduleDto.getMemo())
                        .cost(scheduleDto.getCost())
                        .build();

                travelScheduleRepository.save(schedule);
            }
        }

        // ✅ 피드 자동 생성
        travelFeedService.createFeedFromPlan(savedPlan);
    }

    public List<TravelPlanResponseDto> getUserPlans(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        List<TravelPlan> plans = travelPlanRepository.findByUser(user);

        return plans.stream()
                .map(plan -> TravelPlanResponseDto.builder()
                        .id(plan.getId())
                        .title(plan.getTitle())
                        .location(plan.getLocation())
                        .startDate(plan.getStartDate())
                        .endDate(plan.getEndDate())
                        .budget(plan.getBudget())
                        .numberOfPeople(plan.getNumberOfPeople())
                        .interests(plan.getInterests())
                        .description(plan.getDescription())
                        .build())
                .toList();
    }
}
