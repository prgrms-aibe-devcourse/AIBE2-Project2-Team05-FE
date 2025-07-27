package com.main.TravelMate.review.entity;

import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 여행 후기 엔티티
 * - 한 피드에 여러 참여자가 각각 후기를 작성할 수 있음
 * - 후기는 피드 모달에서 누적되어 표시됨
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 피드에 대한 후기인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_feed_id", nullable = false)
    private TravelFeed travelFeed;

    // 후기 작성자 (여행 작성자 또는 참여자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 후기 제목
    @Column(nullable = false, length = 200)
    private String title;

    // 후기 내용
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 평점 (1-5점)
    @Column(nullable = false)
    private Integer rating;

    // 후기 태그 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String tags; // ["맛집탐방", "힐링", "액티비티"] 형태

    // 후기 이미지 URL들 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String imageUrls; // ["url1", "url2"] 형태

    // 작성일시
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 후기 상태 (ACTIVE, DELETED)
    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
} 