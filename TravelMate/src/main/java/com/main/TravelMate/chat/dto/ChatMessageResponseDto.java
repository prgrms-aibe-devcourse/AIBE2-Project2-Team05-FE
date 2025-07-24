package com.main.TravelMate.chat.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponseDto {
    private Long id;
    private String senderNickname;
    private String message;
    private LocalDateTime sentAt;
}