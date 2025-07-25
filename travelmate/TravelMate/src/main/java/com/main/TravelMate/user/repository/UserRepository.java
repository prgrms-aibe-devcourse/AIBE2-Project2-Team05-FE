package com.main.TravelMate.user.repository;


import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // 닉네임으로 사용자 조회 (프로필 URL용)
    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
}