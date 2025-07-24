package com.main.TravelMate.feed.repository;

import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelFeedRepository extends JpaRepository<TravelFeed, Long> {
    List<TravelFeed> findAllByOrderByCreatedAtDesc();
    List<TravelFeed> findByUser(User user);
    
    // 디버깅용: 사용자별 피드 수 조회
    int countByUser(User user);
    
    // 디버깅용: 사용자별 피드 조회 (TravelPlan 포함)
    @EntityGraph(attributePaths = {"user", "travelPlan"})
    List<TravelFeed> findByUserOrderByCreatedAtDesc(User user);

    @EntityGraph(attributePaths = {"user"})
    List<TravelFeed> findAll();

    // 이미지 URL이 없는 피드 찾기
    @EntityGraph(attributePaths = {"user", "travelPlan"})
    List<TravelFeed> findByImageUrlIsNull();

}
