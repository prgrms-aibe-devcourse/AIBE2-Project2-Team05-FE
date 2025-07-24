package com.main.TravelMate.matching.repository;

import com.main.TravelMate.matching.entity.MatchingRequest;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchingRequestRepository extends JpaRepository<MatchingRequest, Long> {
    List<MatchingRequest> findBySender(User sender);
    List<MatchingRequest> findByReceiver(User receiver);
}
