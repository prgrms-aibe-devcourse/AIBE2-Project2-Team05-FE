package com.main.TravelMate.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(nullable = false)
    private String actionType; // 예: USER_BLOCK, POST_DELETE 등

    private String targetEntityType; // user, matching_request 등

    private Long targetEntityId;

    @Column(columnDefinition = "TEXT")
    private String actionDetails;

    private LocalDateTime createdAt;

    @Builder
    public AdminActionLog(Admin admin, String actionType, String targetEntityType,
                          Long targetEntityId, String actionDetails, LocalDateTime createdAt) {
        this.admin = admin;
        this.actionType = actionType;
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
        this.actionDetails = actionDetails;
        this.createdAt = createdAt;
    }
}
