package com.main.TravelMate.travelplan.repository;

import com.main.TravelMate.travelplan.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 여행 계획 리포지토리
 * 여행 계획 데이터 접근 계층
 */
@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {
    
    /**
     * planId로 여행 계획 조회
     */
    Optional<TravelPlan> findByPlanId(String planId);
    
    /**
     * 사용자 ID로 여행 계획 목록 조회 (최신순)
     */
    @Query("SELECT tp FROM TravelPlan tp WHERE tp.userId = :userId ORDER BY tp.createdAt DESC")
    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);
    
    /**
     * 매칭이 활성화된 여행 계획 목록 조회 (최신순)
     */
    @Query("SELECT tp FROM TravelPlan tp WHERE tp.matchingEnabled = true ORDER BY tp.createdAt DESC")
    List<TravelPlan> findByMatchingEnabledTrueOrderByCreatedAtDesc();
    
    /**
     * 목적지별 여행 계획 조회 (매칭 활성화된 것만)
     */
    @Query("SELECT tp FROM TravelPlan tp WHERE tp.destination = :destination AND tp.matchingEnabled = true ORDER BY tp.createdAt DESC")
    List<TravelPlan> findByDestinationAndMatchingEnabledTrueOrderByCreatedAtDesc(@Param("destination") String destination);
    
    /**
     * planId 존재 여부 확인
     */
    boolean existsByPlanId(String planId);
    
    /**
     * 사용자의 여행 계획 수 조회
     */
    @Query("SELECT COUNT(tp) FROM TravelPlan tp WHERE tp.userId = :userId")
    long countByUserId(@Param("userId") String userId);
} 