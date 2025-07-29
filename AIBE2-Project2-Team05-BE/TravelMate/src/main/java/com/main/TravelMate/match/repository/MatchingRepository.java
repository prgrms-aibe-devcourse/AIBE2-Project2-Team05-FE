package com.main.TravelMate.match.repository;

import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.match.entity.Matching;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchingRepository extends JpaRepository<Matching, Long> {
    List<Matching> findByReceiverIdAndStatus(Long receiverId, MatchingStatus status);
    boolean existsBySenderIdAndReceiverIdAndPlanId(Long senderId, Long receiverId, Long planId);
    List<Matching> findAllBySenderId(Long senderId);
    
    // 🔧 새로 추가: 특정 발신자의 특정 상태 매칭 조회
    List<Matching> findBySenderIdAndStatus(Long senderId, MatchingStatus status);
    
    // 🔧 새로 추가: 특정 여행계획에 대한 특정 상태 매칭 수 조회
    long countByPlanIdAndStatus(Long planId, MatchingStatus status);
    
    // 🔧 새로 추가: 특정 여행계획에 대한 특정 발신자의 특정 상태 매칭 존재 여부 확인 (후기 작성 권한용)
    boolean existsByPlanIdAndSenderIdAndStatus(Long planId, Long senderId, MatchingStatus status);
}
