package com.main.TravelMate.user.entity;


import com.main.TravelMate.chat.domain.ChatRoom;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.domain.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    private Role role; // USER, GUIDE, ADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE; // 기본값은 ACTIVE

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Profile profile;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(mappedBy = "participants")
    private Set<ChatRoom> chatRooms = new HashSet<>();

    // 연관관계와 비즈니스 로직
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TravelFeed> travelFeeds = new ArrayList<>();

    /**
     * 비밀번호 업데이트 메서드
     */
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }
}
