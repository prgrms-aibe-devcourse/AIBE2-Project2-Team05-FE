package com.main.TravelMate.admin.repository;

import com.main.TravelMate.admin.entity.ManagedTravelFeed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagedTravelFeedRepository extends JpaRepository<ManagedTravelFeed, Long> {
    Optional<ManagedTravelFeed> findByTravelFeedId(Long travelFeedId);
}
