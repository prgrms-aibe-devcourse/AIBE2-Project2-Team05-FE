package com.main.TravelMate.chat.controller;

import com.main.TravelMate.chat.domain.ChatRoom;
import com.main.TravelMate.chat.dto.ChatMessageRequestDTO;
import com.main.TravelMate.chat.dto.ChatMessageResponseDTO;
import com.main.TravelMate.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;

    @PostMapping("/room")
    public ResponseEntity<ChatRoom> createRoom(@RequestParam Long matchingId) {
        return ResponseEntity.ok(chatService.createRoom(matchingId));
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(@RequestBody ChatMessageRequestDTO dto) {
        return ResponseEntity.ok(chatService.saveMessage(dto));
    }

    @GetMapping("/room/{chatRoomId}/messages")
    public ResponseEntity<List<ChatMessageResponseDTO>> getNewMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0") Long lastMessageId) {
        return ResponseEntity.ok(chatService.getNewMessages(chatRoomId, lastMessageId));
    }
}
