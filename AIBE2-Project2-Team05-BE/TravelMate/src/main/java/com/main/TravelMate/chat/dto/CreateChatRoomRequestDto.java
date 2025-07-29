package com.main.TravelMate.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 채팅방 생성 요청 DTO
 * 두 사용자 간의 1:1 채팅방을 생성할 때 사용
 * 현재 로그인한 사용자 ID는 인증 컨텍스트에서 자동으로 가져옴
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateChatRoomRequestDto {
    
    private Long targetUserId;  // 채팅하고 싶은 상대방 사용자 ID
    private Long matchingId;    // 매칭 ID (선택사항, 매칭을 통한 채팅인 경우)
} 