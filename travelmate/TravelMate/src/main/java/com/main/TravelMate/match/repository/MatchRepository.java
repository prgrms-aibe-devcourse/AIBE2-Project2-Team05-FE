package com.main.TravelMate.match.repository;

import com.main.TravelMate.match.entity.Match;
import com.main.TravelMate.match.entity.MatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    
    // 받은 매칭 요청 목록 (기존 메서드 - 하위 호환성)
    List<Match> findByReceiverId(Long receiverId);
    
    // 받은 매칭 요청 목록 (페이징 지원)
    Page<Match> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);
    
    // 받은 매칭 요청 목록 (상태별 필터링)
    List<Match> findByReceiverIdAndStatus(Long receiverId, MatchStatus status);

    // 보낸 매칭 요청 목록 (기존 메서드 - 하위 호환성)
    List<Match> findByRequesterId(Long requesterId);
    
    // 보낸 매칭 요청 목록 (페이징 지원)
    Page<Match> findByRequesterIdOrderByCreatedAtDesc(Long requesterId, Pageable pageable);
    
    // 보낸 매칭 요청 목록 (상태별 필터링)
    List<Match> findByRequesterIdAndStatus(Long requesterId, MatchStatus status);
    
    // 활성 매칭 목록 (수락된 매칭)
    @Query("SELECT m FROM Match m WHERE (m.requester.id = :userId OR m.receiver.id = :userId) AND m.status = 'ACCEPTED'")
    List<Match> findActiveMatchesByUserId(@Param("userId") Long userId);
    
    // 중복 매칭 요청 확인
    @Query("SELECT m FROM Match m WHERE m.requester.id = :requesterId AND m.receiver.id = :receiverId AND m.status = 'PENDING'")
    Optional<Match> findPendingMatchBetweenUsers(@Param("requesterId") Long requesterId, @Param("receiverId") Long receiverId);
    
    // 매칭 통계 - 전체 요청 수
    @Query("SELECT COUNT(m) FROM Match m")
    Long countTotalRequests();
    
    // 매칭 통계 - 수락된 요청 수
    @Query("SELECT COUNT(m) FROM Match m WHERE m.status = 'ACCEPTED'")
    Long countAcceptedRequests();
    
    // 매칭 통계 - 활성 매칭 수
    @Query("SELECT COUNT(DISTINCT CASE WHEN m.requester.id < m.receiver.id THEN CONCAT(m.requester.id, '-', m.receiver.id) ELSE CONCAT(m.receiver.id, '-', m.requester.id) END) FROM Match m WHERE m.status = 'ACCEPTED'")
    Long countActiveMatches();
    
    // 사용자별 매칭 히스토리 (보낸 요청 + 받은 요청)
    @Query("SELECT m FROM Match m WHERE m.requester.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    Page<Match> findMatchHistoryByUserId(@Param("userId") Long userId, Pageable pageable);
}