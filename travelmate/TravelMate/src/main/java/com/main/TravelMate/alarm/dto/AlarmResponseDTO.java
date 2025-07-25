package com.main.TravelMate.alarm.dto;

import com.main.TravelMate.alarm.domain.Alarm;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AlarmResponseDTO {
    private Long id;
    private String senderName;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static AlarmResponseDTO fromEntity(Alarm alarm) {
        return AlarmResponseDTO.builder()
                .id(alarm.getId())
                .senderName(alarm.getSenderName())
                .message(alarm.getMessage())
                .isRead(alarm.isRead())
                .createdAt(alarm.getCreatedAt())
                .build();
    }
}
