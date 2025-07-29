package com.main.TravelMate.report.repository;

import com.main.TravelMate.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
