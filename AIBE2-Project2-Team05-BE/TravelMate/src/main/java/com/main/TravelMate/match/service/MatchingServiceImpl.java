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
        System.out.println("🔍 [매칭 추천] 시작 - 사용자 ID: " + userId);
        
        User me = userRepository.findById(userId).orElseThrow();
        System.out.println("👤 [사용자 정보] " + me.getNickname() + " (ID: " + me.getId() + ")");
        
        // 🔧 수정: 내 계획이 없어도 다른 사람 계획을 둘러볼 수 있도록 변경
        TravelPlan myPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(userId)
                .orElse(null);
        
        if (myPlan != null) {
            System.out.println("📋 [내 플랜] " + myPlan.getLocation() + " (" + myPlan.getStartDate() + "~" + myPlan.getEndDate() + ")");
        } else {
            System.out.println("📋 [내 플랜] 없음 - 다른 사람 계획 둘러보기 모드");
        }

        List<Long> excludedPlanIds = new ArrayList<>();
        
        // 🔧 수정: 거절되지 않은 매칭(PENDING, ACCEPTED)만 제외
        // 거절 취소된 사용자가 다시 추천에 나타날 수 있도록 REJECTED 상태는 제외하지 않음
        List<Matching> pendingMatches = matchingRepository.findBySenderIdAndStatus(userId, MatchingStatus.PENDING);
        List<Matching> acceptedMatches = matchingRepository.findBySenderIdAndStatus(userId, MatchingStatus.ACCEPTED);
        
        excludedPlanIds.addAll(pendingMatches.stream()
                .map(m -> m.getPlan().getId())
                .toList());
        excludedPlanIds.addAll(acceptedMatches.stream()
                .map(m -> m.getPlan().getId())
                .toList());
                
        System.out.println("🚫 [제외된 플랜 ID들] " + excludedPlanIds + " (PENDING: " + pendingMatches.size() + "개, ACCEPTED: " + acceptedMatches.size() + "개)");

        List<TravelPlan> allPlans = travelPlanRepository.findRecruitingPlansExcludingUser(userId);
        System.out.println("🌍 [전체 모집중 플랜 수] " + allPlans.size() + "개");
        
        for (TravelPlan plan : allPlans) {
            System.out.println("   - 플랜 ID " + plan.getId() + ": " + plan.getUser().getNickname() + 
                " | " + plan.getLocation() + " | " + plan.getStartDate() + "~" + plan.getEndDate());
        }

        List<TravelPlan> candidates = allPlans.stream()
                .filter(p -> {
                    boolean notExcluded = !excludedPlanIds.contains(p.getId());
                    System.out.println("   🚫 플랜 ID " + p.getId() + " - 제외여부: " + !notExcluded);
                    return notExcluded;
                })
                .filter(p -> {
                    // 🔧 수정: 내 플랜이 없으면 기본 1명으로 가정 (나 혼자 참여)
                    int myPeople = (myPlan != null) ? myPlan.getCurrentPeople() : 1;
                    int totalPeople = p.getCurrentPeople() + myPeople;
                    boolean hasEnoughSpace = totalPeople <= p.getNumberOfPeople();
                    System.out.println("   👥 플랜 ID " + p.getId() + " - 인원체크: " + p.getCurrentPeople() + 
                        "명(현재) + " + myPeople + "명(참여예정) = " + totalPeople + 
                        "명 / " + p.getNumberOfPeople() + "명(총정원) → " + (hasEnoughSpace ? "✅가능" : "❌불가"));
                    return hasEnoughSpace;
                })
                .filter(p -> {
                    // 🔍 travel_feed.travel_status가 RECRUITING(모집중)인지 확인
                    Optional<TravelFeed> feedOpt = travelFeedRepository.findByTravelPlan_Id(p.getId());
                    boolean hasRecruitingFeed = feedOpt.isPresent() && feedOpt.get().getTravelStatus() == TravelStatus.RECRUITING;
                    System.out.println("   📊 플랜 ID " + p.getId() + " - 피드 존재: " + feedOpt.isPresent() + 
                        ", 모집중: " + hasRecruitingFeed);
                    return hasRecruitingFeed;
                })
                .toList();
                
        System.out.println("✅ [최종 후보] " + candidates.size() + "개");

        return candidates.stream()
                .map(p -> {
                    // 🧪 테스트용: 유사도 계산 주석처리, 모든 플랜 포함
                    // int score = calculateCompatibilityScore(myPlan, p);
                    int score = 100; // 고정 점수로 모든 플랜 포함
                    
                    // if (score >= 60) { // 유사도 필터링 주석처리
                        return new MatchRecommendationDto(
                                p.getUser().getId(),
                                p.getUser().getNickname(),
                                p.getLocation(),
                                p.getStartDate(),
                                p.getEndDate(),
                                p.getId(),
                                score
                        );
                    // } else {
                    //     return null; // 점수 낮으면 추천 제외
                    // }
                })
                // .filter(Objects::nonNull) // null 필터링도 주석처리
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

            // 🔧 개선된 로직: 수신자의 여행계획에 참여자 1명 추가
            User receiver = match.getReceiver();
            
            // 매칭 요청된 여행계획 찾기 (수신자의 계획)
            TravelPlan receiverPlan = travelPlanRepository.findFirstByUserIdOrderByStartDateDesc(receiver.getId())
                    .orElse(null);

            if (receiverPlan != null) {
                System.out.println("🎯 [매칭 수락] 여행계획 ID: " + receiverPlan.getId() + 
                    " - 현재인원: " + receiverPlan.getCurrentPeople() + 
                    " / 총정원: " + receiverPlan.getNumberOfPeople());

                // 1. 현재 참여 인원수 +1 증가
                int updatedPeople = receiverPlan.getCurrentPeople() + 1;
                receiverPlan.setCurrentPeople(updatedPeople);
                
                System.out.println("✅ [매칭 수락] 인원 증가 완료: " + updatedPeople + "명");

                // 2. 정원이 찬 경우 모집 종료
                if (updatedPeople >= receiverPlan.getNumberOfPeople()) {
                    receiverPlan.setRecruiting(false);
                    System.out.println("🚫 [매칭 수락] 정원 마감 - 모집 종료");
                }

                travelPlanRepository.save(receiverPlan);
                System.out.println("💾 [매칭 수락] 여행계획 업데이트 완료");
            } else {
                System.out.println("⚠️ [매칭 수락] 수신자의 여행계획을 찾을 수 없음");
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
        TravelPlan plan = match.getPlan();
        return new MatchResponseDto(
                match.getId(),
                match.getStatus(),
                // 🔧 요청을 보낸 사람 정보 추가
                match.getSender().getId(),       // senderId
                match.getSender().getNickname(), // senderNickname
                // 🔧 요청을 받은 사람 정보
                match.getReceiver().getId(),       // receiverId
                match.getReceiver().getNickname(), // receiverNickname
                plan.getId(),
                plan.getTitle(),
                plan.getLocation(),
                plan.getStartDate(),
                plan.getEndDate(),
                plan.getNumberOfPeople(),
                (int) plan.getBudget() // 🔧 long을 int로 캐스팅
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

    // 🔧 새로 추가: 내가 거절한 매칭 목록 조회
    @Override
    public List<MatchResponseDto> getMyRejectedMatches(Long userId) {
        return matchingRepository.findBySenderIdAndStatus(userId, MatchingStatus.REJECTED).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 🔧 새로 추가: 거절한 매칭 취소 (다시 추천 목록에 나오게)
    @Override
    public void unrejectMatch(Long matchingId, Long userId) {
        // 해당 거절 기록 조회
        Matching rejectedMatch = matchingRepository.findById(matchingId)
                .orElseThrow(() -> new RuntimeException("거절 기록을 찾을 수 없습니다."));
        
        // 요청한 사용자가 거절한 당사자인지 확인
        if (!rejectedMatch.getSender().getId().equals(userId)) {
            throw new RuntimeException("본인이 거절한 매칭만 취소할 수 있습니다.");
        }
        
        // 거절 상태인지 확인
        if (rejectedMatch.getStatus() != MatchingStatus.REJECTED) {
            throw new RuntimeException("거절 상태가 아닌 매칭은 취소할 수 없습니다.");
        }
        
        // 거절 기록 삭제 (이제 다시 추천 목록에 나타날 수 있음)
        matchingRepository.delete(rejectedMatch);
        
        System.out.println("🗑️ 거절 취소 완료 - 매칭 ID: " + matchingId + ", 사용자 ID: " + userId);
    }
}
