package com.main.TravelMate.alarm.controller;

import com.main.TravelMate.alarm.dto.AlarmResponseDTO;
import com.main.TravelMate.alarm.service.AlarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<AlarmResponseDTO>> getAlarms(@PathVariable Long userId) {
        return ResponseEntity.ok(alarmService.getUserAlarms(userId));
    }

    @PostMapping("/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        alarmService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
