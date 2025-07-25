package com.main.TravelMate.match.service;

import com.main.TravelMate.match.dto.MatchRequestDto;
import com.main.TravelMate.match.dto.MatchResponseDto;
import com.main.TravelMate.match.dto.MatchResultDto;
import com.main.TravelMate.match.entity.Match;
import com.main.TravelMate.match.entity.MatchStatus;
import com.main.TravelMate.match.repository.MatchRepository;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 기존 매칭 서비스 (하위 호환성 유지)
 * 새로운 기능은 MatchingService 인터페이스를 사용하세요
 */
@Service("legacyMatchService")
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final TravelPlanRepository travelPlanRepository;

    // 매칭 요청 보내기
    public void requestMatch(String requesterEmail, MatchRequestDto dto) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("요청자를 찾을 수 없습니다."));
        User receiver = userRepository.findById(dto.getReceiver().getId())
                .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다."));
        TravelPlan travelPlan = travelPlanRepository.findById(dto.getTravelPlanId())
                .orElseThrow(() -> new IllegalArgumentException("여행 계획을 찾을 수 없습니다."));

        Match match = Match.builder()
                .requester(requester)
                .receiver(receiver)
                .travelPlan(travelPlan)
                .status(MatchStatus.PENDING)
                .build();
        matchRepository.save(match);
    }

    // 매칭 요청 수락
    public void acceptMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("매칭 정보를 찾을 수 없습니다."));
        match.setStatus(MatchStatus.ACCEPTED);
        matchRepository.save(match);
    }

    // 매칭 요청 거절
    public void rejectMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("매칭 정보를 찾을 수 없습니다."));
        match.setStatus(MatchStatus.REJECTED);
        matchRepository.save(match);
    }

    // 받은 매칭 요청 목록
    public List<MatchResponseDto> getReceivedMatches(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
        return matchRepository.findByReceiverId(user.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 보낸 매칭 요청 목록
    public List<MatchResponseDto> getSentMatches(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
        return matchRepository.findByRequesterId(user.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 내 여행 계획과 비슷한 다른 사용자들의 여행 계획 찾기 (핵심 추천 로직)
    public List<MatchResultDto> findMatchesForPlan(Long myPlanId, String currentUserEmail) {
        TravelPlan myPlan = travelPlanRepository.findById(myPlanId)
                .orElseThrow(() -> new IllegalArgumentException("내 여행 계획을 찾을 수 없습니다."));

        return travelPlanRepository.findAll().stream()
                // 내 여행 계획과 내가 작성한 다른 계획은 제외
                .filter(otherPlan -> !otherPlan.getUser().getEmail().equals(currentUserEmail))
                // 매칭률 계산
                .map(otherPlan -> {
                    double matchRate = calculateMatchRate(myPlan, otherPlan);
                    return new MatchResultDto(
                            otherPlan.getUser().getId(),
                            otherPlan.getUser().getNickname(),
                            otherPlan.getId(),
                            otherPlan.getDestination(),
                            otherPlan.getStartDate(),
                            otherPlan.getEndDate(),
                            otherPlan.getInterests(),
                            matchRate
                    );
                })
                // 매칭률 50% 이상인 경우만 필터링
                .filter(dto -> dto.getMatchRate() >= 50.0)
                // 매칭률 높은 순으로 정렬
                .sorted((dto1, dto2) -> Double.compare(dto2.getMatchRate(), dto1.getMatchRate()))
                .collect(Collectors.toList());
    }

    // 매칭률 계산 로직 (가중치 부여)
    private double calculateMatchRate(TravelPlan myPlan, TravelPlan otherPlan) {
        double score = 0.0;

        // 1. 지역 (40점)
        if (myPlan.getDestination().equals(otherPlan.getDestination())) {
            score += 40;
        }

        // 2. 날짜 (30점) - 겹치는 일수에 따라 점수 부여
        long overlapDays = calculateOverlapDays(myPlan, otherPlan);
        long myPlanDuration = ChronoUnit.DAYS.between(myPlan.getStartDate(), myPlan.getEndDate()) + 1;
        if (overlapDays > 0) {
            score += (double) overlapDays / myPlanDuration * 30;
        }

        // 3. 관심사 (30점) - 겹치는 관심사 개수에 따라 점수 부여
        List<String> myInterests = Arrays.asList(myPlan.getInterests().split(","));
        List<String> otherInterests = Arrays.asList(otherPlan.getInterests().split(","));
        long commonInterests = myInterests.stream().filter(otherInterests::contains).count();
        if (!myInterests.isEmpty()) {
            score += (double) commonInterests / myInterests.size() * 30;
        }

        return Math.min(score, 100.0); // 100점 만점
    }

    // 겹치는 일수 계산
    private long calculateOverlapDays(TravelPlan p1, TravelPlan p2) {
        LocalDate start = p1.getStartDate().isAfter(p2.getStartDate()) ? p1.getStartDate() : p2.getStartDate();
        LocalDate end = p1.getEndDate().isBefore(p2.getEndDate()) ? p1.getEndDate() : p2.getEndDate();
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return Math.max(0, days);
    }

    private MatchResponseDto mapToResponseDto(Match match) {
        return new MatchResponseDto(
                match.getId(),
                match.getTravelPlan().getId(),
                match.getTravelPlan().getDestination(),
                match.getRequester().getNickname(),
                match.getReceiver().getNickname(),
                match.getStatus()
        );
    }
}