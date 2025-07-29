package com.main.TravelMate.profile.entity;



import com.main.TravelMate.user.domain.Gender;
import com.main.TravelMate.user.domain.TravelStyle;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
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

    private String realName;               // 이름 (기존 컬럼명 유지)
    
    private LocalDate birthdate;           // 생년월일 (age 대신 birthdate 사용)
    
    private Integer age;                   // 나이 (기존 DB 호환성을 위해 유지)
    
    @Enumerated(EnumType.STRING)
    private Gender gender;                 // 성별 (Enum으로 타입 안전성 확보)
    
    private String preferredDestinations;  // 선호 여행지 (기존 컬럼명 유지)
    
    // ✅ @ElementCollection 개선: null 방지 + 기본값 설정
    @ElementCollection(fetch = FetchType.LAZY)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "profile_travel_styles", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "travel_style")
    @Builder.Default
    private Set<TravelStyle> travelStyles = new HashSet<>(); // 여행 스타일 (Set으로 다중 선택 지원)
    
    private String bio;                    // 자기소개 (기존 컬럼명 유지)
    
    private String profileImage;           // 프로필 이미지 URL (기존 컬럼명 유지)

    private LocalDateTime createdAt;       // 기존 컬럼명 유지
    
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        // age 자동 계산 (birthdate 기반)
        if (this.birthdate != null) {
            this.age = calculateAge();
        }
        // null 값 방지
        if (this.bio == null) this.bio = "";
        if (this.preferredDestinations == null) this.preferredDestinations = "";
        if (this.travelStyles == null) this.travelStyles = new HashSet<>();
    }
    
    @PreUpdate
    public void onUpdate() {
        // age 재계산 (birthdate 기반)
        if (this.birthdate != null) {
            this.age = calculateAge();
        }
    }
    
    /**
     * 생년월일로부터 나이 계산
     */
    public int calculateAge() {
        if (birthdate == null) {
            return 0;
        }
        return LocalDate.now().getYear() - birthdate.getYear();
    }
    
    // ✅ null 값 방지를 위한 안전한 Setter들
    public void setBio(String bio) {
        this.bio = bio != null ? bio : "";
    }
    
    public void setPreferredDestinations(String preferredDestinations) {
        this.preferredDestinations = preferredDestinations != null ? preferredDestinations : "";
    }
    
    public void setTravelStyles(Set<TravelStyle> travelStyles) {
        this.travelStyles = travelStyles != null ? travelStyles : new HashSet<>();
    }
}
