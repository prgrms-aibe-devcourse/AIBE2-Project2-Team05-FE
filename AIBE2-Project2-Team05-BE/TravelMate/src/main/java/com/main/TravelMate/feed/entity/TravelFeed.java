package com.main.TravelMate.feed.entity;

import com.main.TravelMate.feed.domain.TravelStatus;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;


import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @OneToOne
    @JoinColumn(name = "travel_plan_id", unique = true)
    private TravelPlan travelPlan;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Lob
    private String caption;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, DEACTIVE

    // 여행 진행 상태 (매칭 서비스용)
    @Enumerated(EnumType.STRING)
    @Column(name = "travel_status")
    @Builder.Default
    private TravelStatus travelStatus = TravelStatus.RECRUITING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}