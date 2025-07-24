package com.main.TravelMate.user.repository;


import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // 닉네임으로 사용자 검색 (부분 일치, 대소문자 무시)
    @Query("SELECT u FROM User u WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> findByNicknameContainingIgnoreCase(@Param("keyword") String keyword);
}