package com.main.TravelMate.match.service;

import com.main.TravelMate.match.dto.*;
import com.main.TravelMate.match.entity.Match;
import com.main.TravelMate.match.entity.MatchStatus;
import com.main.TravelMate.match.exception.DuplicateMatchRequestException;
import com.main.TravelMate.match.exception.MatchRequestNotFoundException;
import com.main.TravelMate.match.exception.SelfMatchRequestException;
import com.main.TravelMate.match.repository.MatchRepository;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 여행 파트너 매칭 서비스 구현체
 * 호환성 점수 계산, 매칭 요청 관리, 통계 제공 등의 핵심 비즈니스 로직 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchingServiceImpl implements MatchingService {
    
    private final MatchRepository matchRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    
    @Override
    public List<UserMatchDto> searchCompatibleTravelers(MatchSearchCriteria criteria, Long currentUserId) {
        log.info("호환 가능한 여행자 검색 시작 - 사용자: {}, 목적지: {}", currentUserId, criteria.getDestination());
        
        Pageable pageable = PageRequest.of(
            criteria.getPage() != null ? criteria.getPage() : 0,
            criteria.getSize() != null ? criteria.getSize() : 20
        );
        
        // 호환 가능한 여행 계획 검색
        Page<TravelPlan> compatiblePlans = travelPlanRepository.findCompatibleTravelPlansByStyle(
            criteria.getDestination(),
            criteria.getStartDate(),
            criteria.getEndDate(),
            currentUserId,
            criteria.getTravelStyle(),
            pageable
        );
        
        // 호환성 점수 계산 및 DTO 변환
        List<UserMatchDto> results = compatiblePlans.getContent().stream()
            .map(plan -> {
                int compatibilityScore = calculateCompatibilityScore(criteria, plan);
                int overlappingDays = calculateOverlappingDays(
                    criteria.getStartDate(), criteria.getEndDate(),
                    plan.getStartDate(), plan.getEndDate()
                );
                
                return UserMatchDto.builder()
                    .userId(plan.getUser().getId())
                    .nickname(plan.getUser().getNickname())
                    .travelPlanId(plan.getId())
                    .destination(plan.getDestination())
                    .startDate(plan.getStartDate())
                    .endDate(plan.getEndDate())
                    .travelStyle(plan.getTravelStyle())
                    .description(plan.getDescription())
                    .budget(plan.getBudget())
                    .numberOfPeople(plan.getNumberOfPeople())
                    .compatibilityScore(compatibilityScore)
                    .overlappingDays(overlappingDays)
                    .build();
            })
            // 호환성 점수 50점 이상만 필터링
            .filter(dto -> dto.getCompatibilityScore() >= 50)
            // 호환성 점수 높은 순으로 정렬
            .sorted((a, b) -> Integer.compare(b.getCompatibilityScore(), a.getCompatibilityScore()))
            .collect(Collectors.toList());
        
        log.info("호환 가능한 여행자 검색 완료 - 결과 수: {}", results.size());
        return results;
    }
    
    @Override
    @Transactional
    public MatchRequestDto sendMatchRequest(Long requesterId, Long receiverId, Long travelPlanId, String message) {
        log.info("매칭 요청 전송 시작 - 요청자: {}, 수신자: {}, 여행계획: {}", requesterId, receiverId, travelPlanId);
        
        // 자기 자신에게 요청 방지
        if (requesterId.equals(receiverId)) {
            throw new SelfMatchRequestException(requesterId);
        }
        
        // 중복 요청 확인
        matchRepository.findPendingMatchBetweenUsers(requesterId, receiverId)
            .ifPresent(existingMatch -> {
                throw new DuplicateMatchRequestException(requesterId, receiverId);
            });
        
        // 엔티티 조회
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다: " + requesterId));
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다: " + receiverId));
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
            .orElseThrow(() -> new IllegalArgumentException("여행 계획을 찾을 수 없습니다: " + travelPlanId));
        
        // 매칭 요청 생성
        Match match = Match.builder()
            .requester(requester)
            .receiver(receiver)
            .travelPlan(travelPlan)
            .status(MatchStatus.PENDING)
            .message(message)
            .createdAt(LocalDateTime.now())
            .build();
        
        Match savedMatch = matchRepository.save(match);
        
        log.info("매칭 요청 전송 완료 - 매칭 ID: {}", savedMatch.getId());
        return convertToMatchRequestDto(savedMatch);
    }
    
    @Override
    @Transactional
    public MatchRequestDto respondToMatchRequest(Long requestId, Long userId, boolean accept) {
        log.info("매칭 요청 응답 시작 - 요청 ID: {}, 사용자: {}, 수락: {}", requestId, userId, accept);
        
        Match match = matchRepository.findById(requestId)
            .orElseThrow(() -> new MatchRequestNotFoundException(requestId));
        
        // 수신자만 응답 가능
        if (!match.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("매칭 요청에 응답할 권한이 없습니다.");
        }
        
        // 이미 응답된 요청인지 확인
        if (match.getStatus() != MatchStatus.PENDING) {
            throw new IllegalStateException("이미 응답된 매칭 요청입니다.");
        }
        
        // 상태 업데이트
        match.setStatus(accept ? MatchStatus.ACCEPTED : MatchStatus.REJECTED);
        match.setRespondedAt(LocalDateTime.now());
        
        Match updatedMatch = matchRepository.save(match);
        
        log.info("매칭 요청 응답 완료 - 매칭 ID: {}, 상태: {}", updatedMatch.getId(), updatedMatch.getStatus());
        return convertToMatchRequestDto(updatedMatch);
    }
    
    @Override
    public List<MatchRequestDto> getReceivedRequests(Long userId) {
        log.info("받은 매칭 요청 조회 - 사용자: {}", userId);
        
        List<Match> matches = matchRepository.findByReceiverIdAndStatus(userId, MatchStatus.PENDING);
        return matches.stream()
            .map(this::convertToMatchRequestDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MatchRequestDto> getSentRequests(Long userId) {
        log.info("보낸 매칭 요청 조회 - 사용자: {}", userId);
        
        List<Match> matches = matchRepository.findByRequesterId(userId);
        return matches.stream()
            .map(this::convertToMatchRequestDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UserMatchDto> getActiveMatches(Long userId) {
        log.info("활성 매칭 조회 - 사용자: {}", userId);
        
        List<Match> activeMatches = matchRepository.findActiveMatchesByUserId(userId);
        
        return activeMatches.stream()
            .map(match -> {
                // 상대방 정보 가져오기
                User partner = match.getRequester().getId().equals(userId) 
                    ? match.getReceiver() 
                    : match.getRequester();
                
                TravelPlan travelPlan = match.getTravelPlan();
                
                return UserMatchDto.builder()
                    .userId(partner.getId())
                    .nickname(partner.getNickname())
                    .travelPlanId(travelPlan.getId())
                    .destination(travelPlan.getDestination())
                    .startDate(travelPlan.getStartDate())
                    .endDate(travelPlan.getEndDate())
                    .travelStyle(travelPlan.getTravelStyle())
                    .description(travelPlan.getDescription())
                    .budget(travelPlan.getBudget())
                    .numberOfPeople(travelPlan.getNumberOfPeople())
                    .compatibilityScore(100) // 이미 매칭된 상태이므로 100점
                    .overlappingDays(calculateOverlappingDays(
                        travelPlan.getStartDate(), travelPlan.getEndDate(),
                        travelPlan.getStartDate(), travelPlan.getEndDate()
                    ))
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    @Override
    public MatchStatisticsDto getMatchingStatistics() {
        log.info("매칭 통계 조회 시작");
        
        Long totalRequests = matchRepository.countTotalRequests();
        Long acceptedRequests = matchRepository.countAcceptedRequests();
        Long rejectedRequests = matchRepository.count() - acceptedRequests - 
            matchRepository.findAll().stream()
                .mapToLong(m -> m.getStatus() == MatchStatus.PENDING ? 1 : 0)
                .sum();
        Long pendingRequests = totalRequests - acceptedRequests - rejectedRequests;
        Long activeMatches = matchRepository.countActiveMatches();
        
        Double successRate = totalRequests > 0 
            ? (acceptedRequests.doubleValue() / totalRequests.doubleValue()) * 100 
            : 0.0;
        
        return MatchStatisticsDto.builder()
            .totalMatchRequests(totalRequests)
            .acceptedMatchRequests(acceptedRequests)
            .rejectedMatchRequests(rejectedRequests)
            .pendingMatchRequests(pendingRequests)
            .activeMatches(activeMatches)
            .successRate(successRate)
            .generatedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 호환성 점수 계산 알고리즘
     * 목적지(40점) + 날짜 겹침(30점) + 여행 스타일(20점) + 그룹 크기(10점)
     */
    private int calculateCompatibilityScore(MatchSearchCriteria criteria, TravelPlan plan) {
        int score = 0;
        
        // 1. 목적지 매칭 (40점)
        if (criteria.getDestination() != null && plan.getDestination() != null) {
            if (plan.getDestination().toLowerCase().contains(criteria.getDestination().toLowerCase()) ||
                criteria.getDestination().toLowerCase().contains(plan.getDestination().toLowerCase())) {
                score += 40;
            }
        }
        
        // 2. 날짜 겹침 (30점)
        int overlappingDays = calculateOverlappingDays(
            criteria.getStartDate(), criteria.getEndDate(),
            plan.getStartDate(), plan.getEndDate()
        );
        if (overlappingDays > 0) {
            long totalDays = ChronoUnit.DAYS.between(criteria.getStartDate(), criteria.getEndDate()) + 1;
            double overlapRatio = (double) overlappingDays / totalDays;
            score += (int) (overlapRatio * 30);
        }
        
        // 3. 여행 스타일 매칭 (20점)
        if (criteria.getTravelStyle() != null && plan.getTravelStyle() != null) {
            if (criteria.getTravelStyle().equals(plan.getTravelStyle())) {
                score += 20;
            }
        }
        
        // 4. 그룹 크기 호환성 (10점)
        if (criteria.getMaxGroupSize() != null && plan.getNumberOfPeople() != null) {
            int sizeDiff = Math.abs(criteria.getMaxGroupSize() - plan.getNumberOfPeople());
            if (sizeDiff == 0) {
                score += 10;
            } else if (sizeDiff <= 2) {
                score += 5;
            }
        }
        
        return Math.min(score, 100); // 최대 100점
    }
    
    /**
     * 두 날짜 범위의 겹치는 일수 계산
     */
    private int calculateOverlappingDays(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
        if (start1 == null || end1 == null || start2 == null || end2 == null) {
            return 0;
        }
        
        LocalDate overlapStart = start1.isAfter(start2) ? start1 : start2;
        LocalDate overlapEnd = end1.isBefore(end2) ? end1 : end2;
        
        if (overlapStart.isAfter(overlapEnd)) {
            return 0;
        }
        
        return (int) ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
    }
    
    /**
     * Match 엔티티를 MatchRequestDto로 변환
     */
    private MatchRequestDto convertToMatchRequestDto(Match match) {
        return MatchRequestDto.builder()
            .id(match.getId())
            .requester(UserSummaryDto.builder()
                .id(match.getRequester().getId())
                .nickname(match.getRequester().getNickname())
                .email(match.getRequester().getEmail())
                .role(match.getRequester().getRole())
                .build())
            .receiver(UserSummaryDto.builder()
                .id(match.getReceiver().getId())
                .nickname(match.getReceiver().getNickname())
                .email(match.getReceiver().getEmail())
                .role(match.getReceiver().getRole())
                .build())
            .travelPlanId(match.getTravelPlan().getId())
            .travelPlanTitle(match.getTravelPlan().getTitle())
            .destination(match.getTravelPlan().getDestination())
            .status(match.getStatus())
            .message(match.getMessage())
            .createdAt(match.getCreatedAt())
            .respondedAt(match.getRespondedAt())
            .build();
    }
}