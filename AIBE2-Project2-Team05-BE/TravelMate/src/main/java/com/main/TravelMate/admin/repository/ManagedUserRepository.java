package com.main.TravelMate.admin.repository;

import com.main.TravelMate.admin.entity.ManagedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagedUserRepository extends JpaRepository<ManagedUser, Long> {
    Optional<ManagedUser> findByUserId(Long userId);
}
