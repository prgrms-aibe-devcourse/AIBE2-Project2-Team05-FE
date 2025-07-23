package com.main.TravelMate.chat.repository;

import com.main.TravelMate.chat.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdAndIdGreaterThanOrderByIdAsc(Long chatRoomId, Long lastMessageId);
}
