package com.main.TravelMate.chat.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequestDTO {
    private Long chatRoomId;
    private Long senderId;
    private String message;
}
