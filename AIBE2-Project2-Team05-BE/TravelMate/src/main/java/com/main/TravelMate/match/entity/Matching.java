package com.main.TravelMate.match.entity;

import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "matching_request")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matching {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TravelPlan plan;

    @Enumerated(EnumType.STRING)
    private MatchingStatus status;



    public void updateStatus(MatchingStatus status) {
        this.status = status;
    }

    private LocalDateTime createdAt;
}
