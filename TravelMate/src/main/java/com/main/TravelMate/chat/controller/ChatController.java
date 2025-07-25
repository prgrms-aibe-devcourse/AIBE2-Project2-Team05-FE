package com.main.TravelMate.chat.controller;

import com.main.TravelMate.chat.dto.ChatMessageDto;

import com.main.TravelMate.chat.dto.ChatMessageResponseDto;
import com.main.TravelMate.chat.dto.ChatRoomResponseDto;
import com.main.TravelMate.chat.entity.ChatRoom;
import com.main.TravelMate.chat.service.ChatMessageService;

import com.main.TravelMate.chat.service.ChatRoomService;
import com.main.TravelMate.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody ChatMessageDto dto,
                                  @AuthenticationPrincipal UserDetails userDetails) {
        chatMessageService.sendMessage(userDetails.getUsername(), dto);
        return ResponseEntity.ok("메시지 전송 완료");
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ChatMessageResponseDto>> getMessages(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatMessageService.getMessages(roomId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponseDto>> getMyRooms(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatRoomService.getMyChatRooms(userDetails.getUsername()));
    }
}
