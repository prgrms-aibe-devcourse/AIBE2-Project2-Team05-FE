package com.main.TravelMate.match.repository;

import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.match.entity.Matching;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchingRepository extends JpaRepository<Matching, Long> {
    List<Matching> findByReceiverIdAndStatus(Long receiverId, MatchingStatus status);
    boolean existsBySenderIdAndReceiverIdAndPlanId(Long senderId, Long receiverId, Long planId);
    List<Matching> findAllBySenderId(Long senderId);
}
