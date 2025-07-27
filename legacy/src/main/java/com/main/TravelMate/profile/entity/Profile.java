package com.main.TravelMate.profile.entity;



import com.main.TravelMate.user.domain.Gender;
import com.main.TravelMate.user.domain.TravelStyle;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

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
    private LocalDate birthdate;           // 생년월일
    
    @Enumerated(EnumType.STRING)
    private Gender gender;                 // 성별

    private String preferredDestinations;  // 선호 여행지 (예: "유럽,동남아시아,일본")
    
    @ElementCollection(fetch = FetchType.LAZY)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "profile_travel_styles", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "travel_style")
    private Set<TravelStyle> travelStyles; // 여행 스타일
    
    private String bio;                    // 자기소개
    private String profileImage;           // 프로필 이미지 URL

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
