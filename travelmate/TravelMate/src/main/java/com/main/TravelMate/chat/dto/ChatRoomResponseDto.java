package com.main.TravelMate.chat.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatRoomResponseDto {
    private Long roomId;
    private Long matchingId;
    private String otherUserNickname;
    private String planLocation;
    private LocalDateTime createdAt;
}
