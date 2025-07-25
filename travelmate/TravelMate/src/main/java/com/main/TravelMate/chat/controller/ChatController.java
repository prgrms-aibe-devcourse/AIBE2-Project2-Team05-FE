package com.main.TravelMate.chat.controller;

import com.main.TravelMate.chat.entity.ChatRoom;
import com.main.TravelMate.chat.dto.ChatMessageRequestDTO;
import com.main.TravelMate.chat.dto.ChatMessageResponseDto;
import com.main.TravelMate.chat.service.ChatMessageService;
import com.main.TravelMate.chat.service.ChatRoomService;
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
        // TODO: matchingId로 MatchingRequest를 조회해서 createRoom에 전달해야 함
        return ResponseEntity.ok().build();
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponseDto> sendMessage(@RequestBody ChatMessageRequestDTO dto) {
        // TODO: ChatMessageService에 sendMessage 메서드 구현 필요
        return ResponseEntity.ok().build();
    }

    @GetMapping("/room/{chatRoomId}/messages")
    public ResponseEntity<List<ChatMessageResponseDto>> getNewMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0") Long lastMessageId) {
        List<ChatMessageResponseDto> messages = chatMessageService.getMessages(chatRoomId);
        return ResponseEntity.ok(messages);
    }
}
