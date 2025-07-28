package com.main.TravelMate.chat.controller;

import com.main.TravelMate.chat.domain.ChatRoom;
import com.main.TravelMate.chat.dto.ChatMessageRequestDTO;
import com.main.TravelMate.chat.dto.ChatMessageResponseDTO;
import com.main.TravelMate.chat.dto.ChatRoomInfoDTO;
import com.main.TravelMate.chat.dto.CreateChatRoomRequestDto;
import com.main.TravelMate.chat.service.ChatService;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // CORS 허용
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(@RequestBody ChatMessageRequestDTO request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUserId();
        request.setSenderId(currentUserId);
        
        return ResponseEntity.ok(chatService.saveMessage(request));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponseDTO>> getMessages(
            @PathVariable Long roomId,
            @RequestParam(required = false, defaultValue = "0") Long lastMessageId) {

        return ResponseEntity.ok(chatService.getNewMessages(roomId, lastMessageId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomInfoDTO>> getChatRooms(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUserId();
        
        return ResponseEntity.ok(chatService.getChatRoomsForUser(currentUserId));
    }

    /**
     * 채팅방 생성 또는 기존 채팅방 반환 API
     * @param request 채팅방 생성 요청 (상대방 사용자 ID 포함)
     * @return 생성되거나 기존의 채팅방 정보
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomInfoDTO> createOrGetChatRoom(@RequestBody CreateChatRoomRequestDto request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            // 인증된 사용자 ID를 사용
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long currentUserId = userDetails.getUserId();
            
            // 채팅방 생성 또는 기존 채팅방 반환
            ChatRoom chatRoom = chatService.createOrGetChatRoom(
                currentUserId, 
                request.getTargetUserId(), 
                request.getMatchingId()
            );
            
            // 상대방 사용자 정보 조회
            User targetUser = userRepository.findById(request.getTargetUserId())
                    .orElseThrow(() -> new RuntimeException("상대방 사용자를 찾을 수 없습니다."));
            
            // ChatRoomInfoDTO로 변환하여 반환
            ChatRoomInfoDTO chatRoomInfo = ChatRoomInfoDTO.builder()
                    .id(chatRoom.getId())
                    .name(targetUser.getNickname()) // 상대방 닉네임으로 설정
                    .time(chatRoom.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))) // 시간 형식 변경
                    .preview("아직 메시지가 없습니다.") // 초기 메시지
                    .unread(0)
                    .build();
            
            return ResponseEntity.ok(chatRoomInfo);
        } catch (Exception e) {
            // 에러 로그 출력
            System.err.println("채팅방 생성 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}