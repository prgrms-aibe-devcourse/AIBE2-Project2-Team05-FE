package com.main.TravelMate.user.repository;


import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // 닉네임으로 사용자 조회 (프로필 URL용)
    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
    
    // 💬 사용자 검색 (채팅을 위한 사용자 검색)
    // 닉네임 또는 이메일로 부분일치 검색 (대소문자 구분 안함)
    List<User> findByNicknameContainingIgnoreCaseOrEmailContainingIgnoreCase(String nickname, String email);
}