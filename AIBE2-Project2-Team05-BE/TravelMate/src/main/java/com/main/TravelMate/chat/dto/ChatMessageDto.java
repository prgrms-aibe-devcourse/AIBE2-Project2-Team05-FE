package com.main.TravelMate.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDto {
    private Long chatRoomId;
    private String message;
}