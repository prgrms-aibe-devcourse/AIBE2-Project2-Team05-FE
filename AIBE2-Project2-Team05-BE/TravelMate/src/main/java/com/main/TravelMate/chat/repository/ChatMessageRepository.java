package com.main.TravelMate.chat.repository;

import com.main.TravelMate.chat.domain.ChatMessage;
import com.main.TravelMate.chat.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomAndIdGreaterThanOrderByIdAsc(ChatRoom chatRoom, Long lastMessageId);
    
    // 💬 채팅방별 메시지 조회 (시간 순 정렬)
    List<ChatMessage> findByChatRoomIdOrderBySentAt(Long chatRoomId);
}
