package com.main.TravelMate.admin.entity;

import com.main.TravelMate.matching.entity.MatchingRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ManagedMatchingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "matching_id", unique = true)
    private MatchingRequest matching;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(nullable = false)
    private String status; // APPROVED, REJECTED_BY_ADMIN, UNDER_REVIEW

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime updatedAt;
}
