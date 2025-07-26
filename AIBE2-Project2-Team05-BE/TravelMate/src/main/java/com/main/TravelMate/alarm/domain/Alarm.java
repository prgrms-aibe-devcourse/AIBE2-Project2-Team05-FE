package com.main.TravelMate.alarm.domain;

import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 받는 사람
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 알림을 발생시킨 사람 (예: 팔로우, 댓글 작성자)
    private String senderName;

    // 알림 유형
    @Enumerated(EnumType.STRING)
    private AlarmType type;

    private String message;

    private boolean isRead;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public enum AlarmType {
        FOLLOW, COMMENT, MATCH_REQUEST
    }
}
