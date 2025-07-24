package com.main.TravelMate.feed.repository;

import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelFeedRepository extends JpaRepository<TravelFeed, Long> {
    List<TravelFeed> findAllByOrderByCreatedAtDesc();
    List<TravelFeed> findByUser(User user);

    @EntityGraph(attributePaths = {"user"})
    List<TravelFeed> findAll();

}
