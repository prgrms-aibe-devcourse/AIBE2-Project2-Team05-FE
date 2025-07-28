package com.main.TravelMate.feed.entity;

import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "feed_like",
    uniqueConstraints = @UniqueConstraint(columnNames = {"travel_feed_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "travel_feed_id", nullable = false)
    private Long travelFeedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 생성자
    public FeedLike(Long travelFeedId, User user) {
        this.travelFeedId = travelFeedId;
        this.user = user;
    }
} 