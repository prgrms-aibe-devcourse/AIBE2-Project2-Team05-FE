package com.main.TravelMate.admin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.main.TravelMate.admin.entity.ManagedUser;

public interface ManagedUserRepository extends JpaRepository<ManagedUser, Long> {
    Optional<ManagedUser> findByUserId(Long userId); // 다시 Long으로 되돌림
    
    // 삭제되지 않은 사용자만 조회하는 메서드
    @Query("SELECT mu FROM ManagedUser mu " +
           "LEFT JOIN FETCH mu.user " +
           "LEFT JOIN FETCH mu.admin " +
           "WHERE mu.user IS NOT NULL " +
           "ORDER BY mu.updatedAt DESC")
    List<ManagedUser> findAllWithValidUsers();
}
