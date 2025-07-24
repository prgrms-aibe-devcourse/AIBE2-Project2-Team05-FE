package com.main.TravelMate.matching.dto;

import com.main.TravelMate.matching.domain.MatchingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MatchingResponseDto {
    private Long id;
    private String senderNickname;
    private String receiverNickname;
    private String planLocation;
    private MatchingStatus status;
    private LocalDateTime createdAt;
}
