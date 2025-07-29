package com.main.TravelMate.feed.repository;

import com.main.TravelMate.feed.entity.FeedLike;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedLikeRepository extends JpaRepository<FeedLike, Long> {

    /**
     * 특정 피드에 대한 특정 사용자의 좋아요 찾기
     */
    Optional<FeedLike> findByTravelFeedIdAndUser(Long travelFeedId, User user);

    /**
     * 특정 피드에 대한 특정 사용자의 좋아요 존재 여부 확인
     */
    boolean existsByTravelFeedIdAndUser(Long travelFeedId, User user);

    /**
     * 특정 피드의 총 좋아요 개수 조회
     */
    long countByTravelFeedId(Long travelFeedId);

    /**
     * 특정 피드에 대한 특정 사용자의 좋아요 삭제
     */
    void deleteByTravelFeedIdAndUser(Long travelFeedId, User user);

    /**
     * 사용자가 좋아요한 피드 ID 목록 조회 (선택사항)
     */
    @Query("SELECT fl.travelFeedId FROM FeedLike fl WHERE fl.user = :user")
    java.util.List<Long> findTravelFeedIdsByUser(@Param("user") User user);

    /**
     * 특정 피드에 좋아요한 사용자 목록 조회 (생성일 기준 최신순)
     */
    @Query("SELECT fl FROM FeedLike fl JOIN FETCH fl.user WHERE fl.travelFeedId = :travelFeedId ORDER BY fl.createdAt DESC")
    java.util.List<FeedLike> findByTravelFeedIdOrderByCreatedAtDesc(@Param("travelFeedId") Long travelFeedId);
} 