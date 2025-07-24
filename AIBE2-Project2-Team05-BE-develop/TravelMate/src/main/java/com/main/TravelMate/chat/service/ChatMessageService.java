package com.main.TravelMate.chat.service;

import com.main.TravelMate.chat.dto.ChatMessageDto;
import com.main.TravelMate.chat.dto.ChatMessageResponseDto;
import com.main.TravelMate.chat.entity.ChatMessage;
import com.main.TravelMate.chat.entity.ChatRoom;
import com.main.TravelMate.chat.repository.ChatMessageRepository;
import com.main.TravelMate.chat.repository.ChatRoomRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    public void sendMessage(String email, ChatMessageDto dto) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        ChatRoom room = chatRoomRepository.findById(dto.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .message(dto.getMessage())
                .sentAt(LocalDateTime.now())
                .build();

        messageRepository.save(message);
    }

    public List<ChatMessageResponseDto> getMessages(Long chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySentAt(chatRoomId).stream()
                .map(msg -> ChatMessageResponseDto.builder()
                        .id(msg.getId())
                        .chatRoomId(msg.getChatRoom().getId())
                        .senderId(msg.getSender().getId())
                        .senderNickname(msg.getSender().getNickname())
                        .message(msg.getMessage())
                        .sentAt(msg.getSentAt())
                        .build())
                .toList();
    }
}
