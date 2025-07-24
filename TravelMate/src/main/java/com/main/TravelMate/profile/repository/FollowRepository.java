package com.main.TravelMate.profile.repository;

import com.main.TravelMate.profile.entity.Follow;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    int countByFollowing(User user);
    int countByFollower(User user);

    List<Follow> findByFollowing(User user);   // 팔로워 목록
    List<Follow> findByFollower(User user);    // 팔로잉 목록
}
