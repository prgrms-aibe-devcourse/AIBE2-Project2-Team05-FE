package com.main.TravelMate.admin.entity;

import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ManagedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(nullable = false)
    private String status; // 예: ACTIVE, BLOCKED, DELETED_BY_ADMIN

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime updatedAt;
}
