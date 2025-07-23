package com.main.TravelMate.matching.service;

import com.main.TravelMate.chat.service.ChatRoomService;
import com.main.TravelMate.matching.domain.MatchingStatus;
import com.main.TravelMate.matching.dto.MatchingRequestDto;
import com.main.TravelMate.matching.dto.MatchingResponseDto;
import com.main.TravelMate.matching.entity.MatchingRequest;
import com.main.TravelMate.matching.repository.MatchingRequestRepository;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingRequestService {

    private final MatchingRequestRepository matchingRepository;
    private final UserRepository userRepository;
    private final TravelPlanRepository planRepository;
    private final ChatRoomService chatRoomService;

    public void sendMatchingRequest(String senderEmail, MatchingRequestDto requestDto) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("보낸 사람 없음"));
        User receiver = userRepository.findById(requestDto.getReceiverId())
                .orElseThrow(() -> new RuntimeException("받는 사람 없음"));
        TravelPlan plan = planRepository.findById(requestDto.getPlanId())
                .orElseThrow(() -> new RuntimeException("여행 계획 없음"));

        MatchingRequest request = MatchingRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .plan(plan)
                .status(MatchingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        matchingRepository.save(request);
    }

    public void updateStatus(Long matchingId, MatchingStatus status) {
        MatchingRequest request = matchingRepository.findById(matchingId)
                .orElseThrow(() -> new RuntimeException("매칭 없음"));
        request.setStatus(status);
        matchingRepository.save(request);

        if (status == MatchingStatus.ACCEPTED) {
            chatRoomService.createRoom(request); // 채팅방 생성
        }
    }

    public List<MatchingResponseDto> getMySentRequests(String email) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        return matchingRepository.findBySender(sender).stream()
                .map(this::toDto)
                .toList();
    }

    public List<MatchingResponseDto> getReceivedRequests(String email) {
        User receiver = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        return matchingRepository.findByReceiver(receiver).stream()
                .map(this::toDto)
                .toList();
    }

    private MatchingResponseDto toDto(MatchingRequest request) {
        return MatchingResponseDto.builder()
                .id(request.getId())
                .senderNickname(request.getSender().getNickname())
                .receiverNickname(request.getReceiver().getNickname())
                .planLocation(request.getPlan().getLocation())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
