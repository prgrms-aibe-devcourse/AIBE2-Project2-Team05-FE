package com.main.TravelMate.chat.entity;

// 임시 비활성화 - 매칭 기능 개발 중
// import com.main.TravelMate.matching.dto.MatchingRequestDto;
// import com.main.TravelMate.matching.entity.MatchingRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 임시 비활성화 - 매칭 기능 개발 중
    // @OneToOne
    // @JoinColumn(name = "matching_id")
    // private MatchingRequest matching;

    private LocalDateTime createdAt;
}