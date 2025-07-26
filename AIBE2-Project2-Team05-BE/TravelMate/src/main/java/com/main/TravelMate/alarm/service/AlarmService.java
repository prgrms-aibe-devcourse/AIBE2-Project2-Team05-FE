package com.main.TravelMate.alarm.service;

import com.main.TravelMate.alarm.domain.Alarm;
import com.main.TravelMate.alarm.dto.AlarmResponseDTO;
import com.main.TravelMate.alarm.repository.AlarmRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final UserRepository userRepository;

    public void sendAlarm(Long targetUserId, String senderName, Alarm.AlarmType type, String message) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Alarm alarm = Alarm.builder()
                .user(user)
                .senderName(senderName)
                .type(type)
                .message(message)
                .build();

        alarmRepository.save(alarm);
    }

    public List<AlarmResponseDTO> getUserAlarms(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return alarmRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(AlarmResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void markAllAsRead(Long userId) {
        List<Alarm> unreadAlarms = alarmRepository.findByUserAndIsReadFalse(
                userRepository.findById(userId).orElseThrow());

        unreadAlarms.forEach(alarm -> alarm.setRead(true));
        alarmRepository.saveAll(unreadAlarms);
    }
}
