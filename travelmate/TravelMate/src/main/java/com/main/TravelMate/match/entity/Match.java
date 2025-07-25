package com.main.TravelMate.match.entity;

import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "matches") // 'match'는 SQL 예약어일 수 있으므로 'matches'로 테이블명 지정
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester; // 요청을 보낸 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id")
    private User receiver; // 요청을 받은 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id")
    private TravelPlan travelPlan; // 관련 여행 계획

    @Enumerated(EnumType.STRING)
    private MatchStatus status; // PENDING, ACCEPTED, REJECTED

    @Column(length = 500)
    private String message; // 매칭 요청 메시지

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now(); // 요청 생성 시간

    private LocalDateTime respondedAt; // 응답 시간
}