package com.main.TravelMate.alarm.repository;

import com.main.TravelMate.alarm.domain.Alarm;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    List<Alarm> findByUserOrderByCreatedAtDesc(User user);
    List<Alarm> findByUserAndIsReadFalse(User user);
}
