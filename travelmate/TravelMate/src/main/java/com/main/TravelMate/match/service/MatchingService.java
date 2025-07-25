package com.main.TravelMate.match.service;

import com.main.TravelMate.match.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 여행 파트너 매칭 서비스 인터페이스
 * 매칭 검색, 요청 관리, 통계 제공 등의 핵심 비즈니스 로직을 정의
 */
public interface MatchingService {
    
    /**
     * 호환 가능한 여행자 검색
     * @param criteria 검색 조건
     * @param currentUserId 현재 사용자 ID (자신 제외용)
     * @return 호환성 점수와 함께 정렬된 여행자 목록
     */
    List<UserMatchDto> searchCompatibleTravelers(MatchSearchCriteria criteria, Long currentUserId);
    
    /**
     * 매칭 요청 전송
     * @param requesterId 요청자 ID
     * @param receiverId 수신자 ID
     * @param travelPlanId 관련 여행 계획 ID
     * @param message 매칭 요청 메시지
     * @return 생성된 매칭 요청 정보
     */
    MatchRequestDto sendMatchRequest(Long requesterId, Long receiverId, Long travelPlanId, String message);
    
    /**
     * 매칭 요청에 응답 (수락/거절)
     * @param requestId 매칭 요청 ID
     * @param userId 응답하는 사용자 ID
     * @param accept 수락 여부 (true: 수락, false: 거절)
     * @return 업데이트된 매칭 요청 정보
     */
    MatchRequestDto respondToMatchRequest(Long requestId, Long userId, boolean accept);
    
    /**
     * 받은 매칭 요청 목록 조회
     * @param userId 사용자 ID
     * @return 받은 매칭 요청 목록
     */
    List<MatchRequestDto> getReceivedRequests(Long userId);
    
    /**
     * 보낸 매칭 요청 목록 조회
     * @param userId 사용자 ID
     * @return 보낸 매칭 요청 목록
     */
    List<MatchRequestDto> getSentRequests(Long userId);
    
    /**
     * 활성 매칭 목록 조회 (수락된 매칭)
     * @param userId 사용자 ID
     * @return 활성 매칭 목록
     */
    List<UserMatchDto> getActiveMatches(Long userId);
    
    /**
     * 매칭 시스템 통계 조회 (관리자용)
     * @return 매칭 통계 정보
     */
    MatchStatisticsDto getMatchingStatistics();
}