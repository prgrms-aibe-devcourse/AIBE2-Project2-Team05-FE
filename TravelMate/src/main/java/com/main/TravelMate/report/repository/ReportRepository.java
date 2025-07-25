package com.main.TravelMate.report.repository;

import com.main.TravelMate.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // User 정보를 함께 로드하는 쿼리
    @Query("SELECT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.reportedUser " +
           "WHERE r.reporter IS NOT NULL AND r.reportedUser IS NOT NULL " +
           "ORDER BY r.createdAt DESC")
    List<Report> findAllWithUsers();
    
    // 특정 신고의 User 정보를 함께 로드하는 쿼리
    @Query("SELECT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.reportedUser " +
           "WHERE r.id = :reportId")
    Optional<Report> findByIdWithUsers(@Param("reportId") Long reportId);
}
