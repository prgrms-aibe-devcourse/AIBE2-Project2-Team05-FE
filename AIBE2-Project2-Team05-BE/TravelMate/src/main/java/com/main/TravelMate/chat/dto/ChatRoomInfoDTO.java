package com.main.TravelMate.chat.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ChatRoomInfoDTO {
    private Long id;
    private String name; // 상대방 이름
    private String time; // 마지막 메시지 시간 (HH:mm 형식)
    private String preview; // 마지막 메시지 내용
    private int unread; // 읽지 않은 메시지 수
} 