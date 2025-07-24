package com.main.TravelMate.chat.service;

import com.main.TravelMate.chat.dto.ChatRoomResponseDto;
import com.main.TravelMate.chat.entity.ChatRoom;
import com.main.TravelMate.chat.repository.ChatRoomRepository;
import com.main.TravelMate.matching.entity.MatchingRequest;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    public ChatRoom createRoom(MatchingRequest matchingRequest) {
        // 이미 존재하면 반환
        return chatRoomRepository.findByMatching(matchingRequest)
                .orElseGet(() -> {
                    ChatRoom room = ChatRoom.builder()
                            .matching(matchingRequest)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return chatRoomRepository.save(room);
                });
    }



    public List<ChatRoomResponseDto> getMyChatRooms(String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        List<ChatRoom> allRooms = chatRoomRepository.findAll(); // 전체 조회 후 필터링

        return allRooms.stream()
                .filter(room ->
                        room.getMatching().getSender().getId().equals(me.getId()) ||
                                room.getMatching().getReceiver().getId().equals(me.getId())
                )
                .map(room -> {
                    User other = room.getMatching().getSender().getId().equals(me.getId())
                            ? room.getMatching().getReceiver()
                            : room.getMatching().getSender();

                    return ChatRoomResponseDto.builder()
                            .roomId(room.getId())
                            .matchingId(room.getMatching().getId())
                            .otherUserNickname(other.getNickname())
                            .planLocation(room.getMatching().getPlan().getLocation())
                            .createdAt(room.getCreatedAt())
                            .build();
                }).toList();
    }
}
