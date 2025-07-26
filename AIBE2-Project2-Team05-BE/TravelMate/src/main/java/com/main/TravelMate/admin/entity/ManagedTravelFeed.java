package com.main.TravelMate.admin.entity;

import com.main.TravelMate.feed.entity.TravelFeed;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ManagedTravelFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "travel_feed_id", unique = true)
    private TravelFeed travelFeed;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(nullable = false)
    private String status; // HIDDEN, DELETED_BY_ADMIN

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime updatedAt;
}
