package com.main.TravelMate.plan.repository;

import com.main.TravelMate.plan.entity.TravelSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelScheduleRepository extends JpaRepository<TravelSchedule, Long> {
}
