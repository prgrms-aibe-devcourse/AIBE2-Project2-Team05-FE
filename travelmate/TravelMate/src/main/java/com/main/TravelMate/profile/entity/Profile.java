package com.main.TravelMate.profile.entity;



import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 연관 관계 (User가 주 테이블)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String realName;               // 이름
    private int age;                       // 나이
    private String gender;                 // 성별 ("남성", "여성", "기타")
    private String preferredDestinations;  // 선호 여행지 (예: "유럽,동남아시아,일본")
    private String travelStyle;            // 여행 스타일 (예: "계획적,관광 중심")
    private String bio;                    // 자기소개
    private String profileImage;           // 프로필 이미지 URL

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
