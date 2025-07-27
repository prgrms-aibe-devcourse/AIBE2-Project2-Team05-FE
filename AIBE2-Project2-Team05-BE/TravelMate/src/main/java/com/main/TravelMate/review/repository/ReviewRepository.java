package com.main.TravelMate.review.repository;

import com.main.TravelMate.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * 특정 피드에 작성된 모든 후기 조회 (최신순)
     */
    @Query("SELECT r FROM Review r WHERE r.travelFeed.id = :feedId AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findByTravelFeedIdAndStatusActive(@Param("feedId") Long feedId);

    /**
     * 특정 사용자가 특정 피드에 작성한 후기 조회
     */
    @Query("SELECT r FROM Review r WHERE r.travelFeed.id = :feedId AND r.user.id = :userId AND r.status = 'ACTIVE'")
    List<Review> findByTravelFeedIdAndUserIdAndStatusActive(@Param("feedId") Long feedId, @Param("userId") Long userId);

    /**
     * 특정 피드의 평균 평점 계산
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.travelFeed.id = :feedId AND r.status = 'ACTIVE'")
    Double findAverageRatingByTravelFeedId(@Param("feedId") Long feedId);

    /**
     * 특정 피드의 후기 개수 조회
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.travelFeed.id = :feedId AND r.status = 'ACTIVE'")
    Long countByTravelFeedIdAndStatusActive(@Param("feedId") Long feedId);

    /**
     * 특정 사용자가 작성한 모든 후기 조회
     */
    @Query("SELECT r FROM Review r WHERE r.user.id = :userId AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findByUserIdAndStatusActive(@Param("userId") Long userId);
} 