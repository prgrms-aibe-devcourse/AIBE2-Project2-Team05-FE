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
    
    // 닉네임으로 사용자 조회 (프로필 URL용)
    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
    
    /**
     * 닉네임으로 사용자 검색 (부분 일치)
     * 채팅에서 사용자를 검색할 때 사용
     * @param nickname 검색할 닉네임 (부분 일치)
     * @return 검색 결과 사용자 리스트 (최대 10명)
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profile " +
           "WHERE u.nickname LIKE %:nickname% " +
           "AND (u.status = 'ACTIVE' OR u.status IS NULL) " +
           "ORDER BY u.nickname ASC")
    List<User> findByNicknameContainingIgnoreCaseAndStatusActive(@Param("nickname") String nickname);
}