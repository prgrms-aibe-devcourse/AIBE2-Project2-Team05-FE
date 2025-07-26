package com.main.TravelMate.plan.repository;

import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.match.entity.TravelStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {
    List<TravelPlan> findByUserId(Long userId);
    List<TravelPlan> findByUser(User user);
    
    // Legacy 호환 메서드
    Optional<TravelPlan> findByPlanId(String planId);
    List<TravelPlan> findByMatchingEnabledTrue();
    
    // 매칭 관련 메서드
    @Query("SELECT p FROM TravelPlan p WHERE p.location = :location " +
           "AND p.startDate <= :endDate AND p.endDate >= :startDate " +
           "AND p.user.id != :excludeUserId " +
           "AND (:travelStyle IS NULL OR p.travelStyle = :travelStyle)")
    Page<TravelPlan> findCompatibleTravelPlansByStyle(
        @Param("location") String location,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("excludeUserId") Long excludeUserId,
        @Param("travelStyle") TravelStyle travelStyle,
        Pageable pageable
    );
}