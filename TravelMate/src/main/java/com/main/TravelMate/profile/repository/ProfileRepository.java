package com.main.TravelMate.profile.repository;

import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUser(User user);

    Optional<Profile> findByUserId(Long userId);
}
