package com.main.TravelMate.user.entity;


import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.user.domain.Role;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.domain.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)

    @Column(nullable = false)

    @JsonIgnore // 비밀번호는 JSON 응답에서 제외

    private String password;

    private Role role; // USER, GUIDE, ADMIN

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Profile profile;
    private LocalDateTime createdAt = LocalDateTime.now();


    @Builder.Default // Builder 사용시 기본값 적용

    @JsonIgnore // Profile 관계를 JSON에서 제외하여 순환 참조 방지
    private Profile profile;

    @Builder.Default // Builder 사용시 기본값 적용
    private LocalDateTime createdAt = LocalDateTime.now();
    /**
     * JSON 직렬화용 status getter
     * status가 null이면 ACTIVE를 기본값으로 반환
     */
    @JsonGetter("status")
    public UserStatus getStatusForJson() {
        return status != null ? status : UserStatus.ACTIVE;
    }



}
