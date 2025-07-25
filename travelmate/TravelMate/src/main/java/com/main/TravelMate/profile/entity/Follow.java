package com.main.TravelMate.profile.entity;

import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "follow")
@Getter
@NoArgsConstructor
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id")
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id")
    private User following;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
    }
}
