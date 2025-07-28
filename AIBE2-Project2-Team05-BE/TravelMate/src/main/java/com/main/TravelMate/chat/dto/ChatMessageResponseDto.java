package com.main.TravelMate.chat.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 클라이언트에게 전달할 채팅 메시지의 응답 형식을 정의하는 DTO(Data Transfer Object)입니다.
 * DTO는 계층 간 데이터 교환을 위해 사용하는 객체입니다.
 */
@Getter // 각 필드의 getter 메서드를 자동으로 생성해주는 Lombok 어노테이션입니다.
@Builder // 빌더 패턴을 사용하여 객체를 생성할 수 있게 해주는 Lombok 어노테이션입니다.
// 파일 이름(ChatMessageResponseDTO.java)과 클래스 이름이 일치해야 한다는 Java의 규칙에 따라
// 'ChatMessageResponseDto'에서 'ChatMessageResponseDTO'로 클래스 이름을 수정했습니다.
public class ChatMessageResponseDTO {

    /**
     * 메시지의 고유 ID 입니다.
     */
    private Long id;

    /**
     * 메시지를 보낸 사람의 ID 입니다.
     */
    private Long senderId;

    /**
     * 전송된 메시지의 내용입니다.
     */
    private String message;

    /**
     * 메시지가 보내진 시간입니다.
     */
    private LocalDateTime sentAt;
} 