package com.main.TravelMate.admin.repository;

import com.main.TravelMate.admin.entity.ManagedMatchingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagedMatchingRequestRepository extends JpaRepository<ManagedMatchingRequest, Long> {
    Optional<ManagedMatchingRequest> findByMatchingId(Long matchingId);
}
