package com.main.TravelMate.match.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.main.TravelMate.alarm.domain.Alarm;
import com.main.TravelMate.alarm.service.AlarmService;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.domain.TravelStatus;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.match.dto.MatchRecommendationDto;
import com.main.TravelMate.match.dto.MatchRequestDto;
import com.main.TravelMate.match.dto.MatchResponseDto;
import com.main.TravelMate.match.entity.Matching;
import com.main.TravelMate.match.repository.MatchingRepository;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {

    private final UserRepository userRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final MatchingRepository matchingRepository;
    private final AlarmService alarmService;
    private final TravelFeedRepository travelFeedRepository;

    @Override
    public List<MatchRecommendationDto> getRecommendations(Long userId) {
        User me = userRepository.findById(userId).orElseThrow();
        TravelPlan myPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(userId)
                .orElseThrow(() -> new RuntimeException("플랜 없음"));

        List<Long> excludedPlanIds = matchingRepository.findAllBySenderId(userId).stream()
                .map(m -> m.getPlan().getId())
                .toList();


        List<TravelPlan> candidates = travelPlanRepository
                .findRecruitingPlansExcludingUser(userId)
                .stream()
                .filter(p -> !excludedPlanIds.contains(p.getId()))
                .filter(p -> p.getCurrentPeople() + myPlan.getCurrentPeople() <= p.getNumberOfPeople())
                .filter(p -> {
                    // 🔍 travel_feed.travel_status가 RECRUITING(모집중)인지 확인
                    Optional<TravelFeed> feedOpt = travelFeedRepository.findByTravelPlan_Id(p.getId());
                    return feedOpt.isPresent() && feedOpt.get().getTravelStatus() == TravelStatus.RECRUITING;
                })
                .toList();

        return candidates.stream()
                .map(p -> {
                    int score = calculateCompatibilityScore(myPlan, p);
                    if (score >= 60) {
                        return new MatchRecommendationDto(
                                p.getUser().getId(),
                                p.getUser().getNickname(),
                                p.getLocation(),
                                p.getStartDate(),
                                p.getEndDate(),
                                p.getId(),
                                score
                        );
                    } else {
                        return null; // 점수 낮으면 추천 제외
                    }
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(MatchRecommendationDto::getCompatibilityScore).reversed()) // 높은 점수 우선
                .toList();
    }

    private int calculateCompatibilityScore(TravelPlan myPlan, TravelPlan target) {
        int score = 0;

        System.out.println("============== 유사도 계산 시작 ==============");
        System.out.println("👉 대상 플랜 ID: " + target.getId() + ", 유저: " + target.getUser().getNickname());

        // 목적지
        if (target.getLocation().equalsIgnoreCase(myPlan.getLocation())) {
            score += 50;
            System.out.println("✅ 목적지 일치 +50");
        } else if (isSimilarRegion(myPlan.getLocation(), target.getLocation())) {
            score += 30;
            System.out.println("✅ 지역 유사 +30");
        }

        // 일정 겹침
        int overlap = calculateOverlappingDays(myPlan.getStartDate(), myPlan.getEndDate(),
                target.getStartDate(), target.getEndDate());
        if (overlap > 0) {
            long myDays = ChronoUnit.DAYS.between(myPlan.getStartDate(), myPlan.getEndDate()) + 1;
            long otherDays = ChronoUnit.DAYS.between(target.getStartDate(), target.getEndDate()) + 1;

            double myRatio = (double) overlap / myDays;
            double otherRatio = (double) overlap / otherDays;
            double avgRatio = (myRatio + otherRatio) / 2;

            int overlapScore = (int) (avgRatio * 25);
            score += overlapScore;
            System.out.println("✅ 일정 겹침 + " + overlapScore);
        }

        // 여행일수 차이
        long myDays = ChronoUnit.DAYS.between(myPlan.getStartDate(), myPlan.getEndDate()) + 1;
        long otherDays = ChronoUnit.DAYS.between(target.getStartDate(), target.getEndDate()) + 1;
        long diffDays = Math.abs(myDays - otherDays);
        if (diffDays <= 2) {
            score += 10;
            System.out.println("✅ 일수차이 ±2일 이내 +10");
        } else if (diffDays <= 4) {
            score += 5;
            System.out.println("✅ 일수차이 ±4일 이내 +5");
        }

        // 인원수
        int diffPeople = Math.abs(myPlan.getNumberOfPeople() - target.getNumberOfPeople());
        if (diffPeople == 0) {
            score += 15;
            System.out.println("✅ 인원수 일치 +15");
        } else if (diffPeople == 1) {
            score += 10;
            System.out.println("✅ 인원수 ±1 +10");
        } else if (diffPeople == 2) {
            score += 5;
            System.out.println("✅ 인원수 ±2 +5");
        }

        // 스타일
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<String> myStyles = mapper.readValue(myPlan.getStyles(), new TypeReference<>() {});
            List<String> targetStyles = mapper.readValue(target.getStyles(), new TypeReference<>() {});
            long common = myStyles.stream().filter(targetStyles::contains).count();
            if (common > 0) {
                int styleScore = (int) Math.min(common * 5, 15);
                score += styleScore;
                System.out.println("✅ 스타일 공통 " + common + "개 + " + styleScore);
            }
        } catch (Exception e) {
            System.out.println("⚠️ 스타일 비교 실패: " + e.getMessage());
        }

        System.out.println("➡️ 총 유사도 점수: " + score);
        System.out.println("==============================================");

        return Math.min(score, 100);
    }
    private int calculateOverlappingDays(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        LocalDate overlapStart = aStart.isAfter(bStart) ? aStart : bStart;
        LocalDate overlapEnd = aEnd.isBefore(bEnd) ? aEnd : bEnd;
        if (overlapStart.isAfter(overlapEnd)) return 0;
        return (int) ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
    }


    private boolean isSimilarRegion(String loc1, String loc2) {
        Map<String, String> regionMap = Map.ofEntries(
                Map.entry("서울", "수도권"), Map.entry("경기", "수도권"), Map.entry("인천", "수도권"),
                Map.entry("부산", "영남"), Map.entry("대구", "영남"), Map.entry("경남", "영남"),
                Map.entry("광주", "호남"), Map.entry("전북", "호남"), Map.entry("전남", "호남")
                // 필요시 더 추가
        );

        String r1 = regionMap.getOrDefault(loc1, loc1);
        String r2 = regionMap.getOrDefault(loc2, loc2);

        return r1.equals(r2);
    }




    @Override
    public Long sendRequest(Long senderId, MatchRequestDto request) {
        User sender = userRepository.findById(senderId).orElseThrow();
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow();
        TravelPlan plan = travelPlanRepository.findById(request.getPlanId()).orElseThrow();

        if (matchingRepository.existsBySenderIdAndReceiverIdAndPlanId(senderId, receiver.getId(), plan.getId())) {
            throw new IllegalStateException("이미 요청한 사용자입니다.");
        }

        Matching matching = Matching.builder()
                .sender(sender)
                .receiver(receiver)
                .plan(plan)
                .status(MatchingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        matchingRepository.save(matching);

        // 🔔 알림 전송 (receiver에게)
        alarmService.sendAlarm(
                receiver.getId(),
                sender.getNickname(),
                Alarm.AlarmType.MATCH_REQUEST,
                sender.getNickname() + " 님이 매칭 요청을 보냈습니다."
        );

        return matching.getId();
    }

    @Override
    public void respondToRequest(Long matchId, MatchingStatus status) {
        Matching match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("매칭 요청 없음"));

        if (match.getStatus() != MatchingStatus.PENDING) {
            throw new IllegalStateException("이미 응답 처리된 요청입니다.");
        }

        match.updateStatus(status);

        if (status == MatchingStatus.ACCEPTED) {
            // 알림 전송
            alarmService.sendAlarm(
                    match.getSender().getId(),
                    match.getReceiver().getNickname(),
                    Alarm.AlarmType.MATCH_REQUEST,
                    match.getReceiver().getNickname() + " 님이 매칭을 수락했습니다. 채팅을 시작해보세요!"
            );

            User sender = match.getSender();
            User receiver = match.getReceiver();

            TravelPlan senderPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(sender.getId())
                    .orElse(null);
            TravelPlan receiverPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(receiver.getId())
                    .orElse(null);

            if (senderPlan != null && receiverPlan != null) {

                // 1. senderPlan 모집 종료 (매칭 요청했으므로 더 이상 안 받음)
                senderPlan.setRecruiting(false);

                // 2. receiverPlan의 현재 인원 += senderPlan의 현재 인원
                int updatedReceiverPeople = receiverPlan.getCurrentPeople() + senderPlan.getCurrentPeople();
                receiverPlan.setCurrentPeople(updatedReceiverPeople);

                // 3. receiverPlan도 마감되었는지 확인
                if (updatedReceiverPeople >= receiverPlan.getNumberOfPeople()) {
                    receiverPlan.setRecruiting(false);
                }

                travelPlanRepository.save(senderPlan);
                travelPlanRepository.save(receiverPlan);
            }

            // 💬 채팅방 생성 등 추가 로직 가능
        }

    }


    @Override
    public void cancelRequest(Long matchId, Long senderId) {
        Matching match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("매칭 없음"));

        if (!match.getSender().getId().equals(senderId)) {
            throw new IllegalStateException("본인이 보낸 요청만 취소할 수 있습니다.");
        }

        if (match.getStatus() != MatchingStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 매칭은 취소할 수 없습니다.");
        }

        // 🔔 알림 추가: 받는 사람에게 알림
        alarmService.sendAlarm(
                match.getReceiver().getId(),
                match.getSender().getNickname(),
                Alarm.AlarmType.MATCH_REQUEST,
                match.getSender().getNickname() + " 님이 보낸 매칭 요청이 취소되었습니다."
        );

        matchingRepository.delete(match);
    }



    @Override
    public void rejectPlan(Long senderId, Long planId) {
        TravelPlan plan = travelPlanRepository.findById(planId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();
        User receiver = plan.getUser();

        // 이미 거절한 이력이 있으면 중복 저장 안 하게 처리
        boolean alreadyExists = matchingRepository
                .existsBySenderIdAndReceiverIdAndPlanId(senderId, receiver.getId(), planId);
        if (alreadyExists) return;

        Matching reject = Matching.builder()
                .sender(sender)
                .receiver(receiver)
                .plan(plan)
                .status(MatchingStatus.REJECTED)
                .createdAt(LocalDateTime.now())
                .build();

        matchingRepository.save(reject);
    }

    @Override
    public void cancelAcceptedMatch(Long matchId, Long userId) {
        Matching match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("매칭 없음"));

        if (match.getStatus() != MatchingStatus.ACCEPTED) {
            throw new IllegalStateException("수락된 매칭만 취소할 수 있습니다.");
        }

        if (!match.getSender().getId().equals(userId) && !match.getReceiver().getId().equals(userId)) {
            throw new IllegalStateException("본인만 취소할 수 있습니다.");
        }

        TravelPlan senderPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(match.getSender().getId())
                .orElseThrow();
        TravelPlan receiverPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(match.getReceiver().getId())
                .orElseThrow();

        receiverPlan.setCurrentPeople(receiverPlan.getCurrentPeople() - senderPlan.getCurrentPeople());
        senderPlan.setRecruiting(true);
        if (receiverPlan.getCurrentPeople() < receiverPlan.getNumberOfPeople()) {
            receiverPlan.setRecruiting(true);
        }

        // 🔔 알림 추가
        Long opponentId = match.getSender().getId().equals(userId)
                ? match.getReceiver().getId()
                : match.getSender().getId();
        User cancelUser = userRepository.findById(userId).orElseThrow();
        alarmService.sendAlarm(
                opponentId,
                cancelUser.getNickname(),
                Alarm.AlarmType.MATCH_REQUEST,
                cancelUser.getNickname() + " 님이 매칭 수락을 취소했습니다."
        );

        matchingRepository.delete(match);
        travelPlanRepository.save(senderPlan);
        travelPlanRepository.save(receiverPlan);
    }


    private MatchResponseDto toDto(Matching match) {
        return new MatchResponseDto(
                match.getId(),
                match.getStatus()
        );
    }



    @Override
    public void updateTravelStatus(Long userId, Long travelPlanId, String status) {
        TravelPlan plan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new RuntimeException("해당 여행 계획을 찾을 수 없습니다."));

        if (!plan.getUser().getId().equals(userId)) {
            throw new IllegalStateException("여행 작성자만 여행 상태를 변경할 수 있습니다.");
        }

        TravelFeed feed = travelFeedRepository.findByTravelPlan_Id(travelPlanId)
                .orElseThrow(() -> new RuntimeException("해당 여행 계획에 연결된 피드를 찾을 수 없습니다."));

        try {
            // 입력된 문자열을 대문자로 변환 후 enum으로
            TravelStatus travelStatus = TravelStatus.valueOf(status.toUpperCase());

            feed.setTravelStatus(travelStatus);
            travelFeedRepository.save(feed);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다. (RECRUITING, TRAVELING, COMPLETED 중 하나여야 합니다)");
        }
    }


    @Override
    public List<MatchResponseDto> getMySentRequests(Long userId) {
        return matchingRepository.findAllBySenderId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchResponseDto> getMyReceivedRequests(Long userId) {
        return matchingRepository.findByReceiverIdAndStatus(userId, MatchingStatus.PENDING).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchResponseDto> getMyAcceptedMatches(Long userId) {
        return matchingRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchingStatus.ACCEPTED &&
                        (m.getSender().getId().equals(userId) || m.getReceiver().getId().equals(userId)))
                .map(this::toDto)
                .collect(Collectors.toList());
    }




}
