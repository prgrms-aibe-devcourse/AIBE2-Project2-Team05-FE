package com.main.TravelMate.chat.service;

import com.main.TravelMate.chat.domain.ChatMessage;
import com.main.TravelMate.chat.domain.ChatRoom;
import com.main.TravelMate.chat.dto.ChatMessageRequestDTO;
import com.main.TravelMate.chat.dto.ChatMessageResponseDTO;
import com.main.TravelMate.chat.dto.ChatRoomInfoDTO;
import com.main.TravelMate.chat.repository.ChatMessageRepository;
import com.main.TravelMate.chat.repository.ChatRoomRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    public ChatRoom createRoom(Long matchingId) {
        ChatRoom room = ChatRoom.builder()
                .matchingId(matchingId)
                .createdAt(LocalDateTime.now())
                .build();
        return chatRoomRepository.save(room);
    }

    /**
     * 두 사용자 간의 1:1 채팅방 생성 또는 기존 채팅방 반환
     * @param currentUserId 현재 사용자 ID
     * @param targetUserId 상대방 사용자 ID
     * @param matchingId 매칭 ID (선택사항)
     * @return 생성되거나 기존의 채팅방
     */
    @Transactional
    public ChatRoom createOrGetChatRoom(Long currentUserId, Long targetUserId, Long matchingId) {
        // 1. 두 사용자 조회
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("현재 사용자를 찾을 수 없습니다."));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("상대방 사용자를 찾을 수 없습니다."));

        // 2. 기존 채팅방이 있는지 확인 (두 사용자가 모두 참여한 채팅방)
        Optional<ChatRoom> existingRoom = chatRoomRepository.findByParticipantsContaining(currentUser)
                .stream()
                .filter(room -> room.getParticipants().contains(targetUser))
                .findFirst();

        if (existingRoom.isPresent()) {
            // 기존 채팅방이 있으면 반환
            return existingRoom.get();
        }

        // 3. 새 채팅방 생성
        ChatRoom newRoom = ChatRoom.builder()
                .matchingId(matchingId)
                .createdAt(LocalDateTime.now())
                .participants(new HashSet<>()) // participants 초기화
                .build();

        // 4. 두 사용자를 채팅방에 참여시키기
        newRoom.getParticipants().add(currentUser);
        newRoom.getParticipants().add(targetUser);

        // 5. 채팅방 저장
        return chatRoomRepository.save(newRoom);
    }

    public ChatRoom getRoom(Long id) {
        return chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));
    }

    public ChatMessageResponseDTO saveMessage(ChatMessageRequestDTO dto) {
        ChatRoom chatRoom = chatRoomRepository.findById(dto.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        
        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(dto.getMessage())
                .sentAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        return ChatMessageResponseDTO.builder()
                .id(saved.getId())
                .senderId(saved.getSender().getId())
                .message(saved.getMessage())
                .sentAt(saved.getSentAt())
                .build();
    }

    public List<ChatMessageResponseDTO> getNewMessages(Long chatRoomId, Long lastMessageId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));
        
        return chatMessageRepository.findByChatRoomAndIdGreaterThanOrderByIdAsc(chatRoom, lastMessageId)
                .stream()
                .map(m -> ChatMessageResponseDTO.builder()
                        .id(m.getId())
                        .senderId(m.getSender().getId())
                        .message(m.getMessage())
                        .sentAt(m.getSentAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomInfoDTO> getChatRoomsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<ChatRoom> chatRooms = chatRoomRepository.findByParticipantsContaining(user);

        return chatRooms.stream().map(room -> {
            // 1. 상대방 찾기
            User opponent = room.getParticipants().stream()
                    .filter(p -> !p.getId().equals(userId))
                    .findFirst()
                    .orElse(null); // 1:1 채팅이 아닐 경우 로직 수정 필요

            // 2. 마지막 메시지 가져오기
            ChatMessage lastMessage = room.getMessages().isEmpty() ? null : room.getMessages().get(0);

            // 3. 읽지 않은 메시지 수 계산 (예시: 현재는 0으로 고정)
            // TODO: 실제 읽음 처리 기능 구현 필요
            int unreadCount = 0; 
            
            return ChatRoomInfoDTO.builder()
                    .id(room.getId())
                    .name(opponent != null ? opponent.getNickname() : "알 수 없는 사용자")
                    .time(lastMessage != null ? 
                        lastMessage.getSentAt().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")) : 
                        room.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")))
                    .preview(lastMessage != null ? lastMessage.getMessage() : "아직 메시지가 없습니다.")
                    .unread(unreadCount)
                    .build();
        }).collect(Collectors.toList());
    }
}