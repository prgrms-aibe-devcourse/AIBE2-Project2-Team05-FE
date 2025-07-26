package com.main.TravelMate.report.entity;

import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고자
    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    // 신고당한 사람
    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @Column(nullable = false)
    private String reportType;  // INAPPROPRIATE_CONTENT, HARASSMENT, SPAM, FAKE_PROFILE 등

    @Column(columnDefinition = "TEXT")
    private String description; // 신고 내용

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, REVIEWED, RESOLVED, REJECTED

    private Long reviewedByAdminId;

    private LocalDateTime reviewedAt;

    private String actionTaken;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
