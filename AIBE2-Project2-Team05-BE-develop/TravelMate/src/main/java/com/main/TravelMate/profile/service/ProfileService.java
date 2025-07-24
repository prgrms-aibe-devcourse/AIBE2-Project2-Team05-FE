package com.main.TravelMate.profile.service;




import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.profile.dto.ProfileResponseDto;
import com.main.TravelMate.profile.dto.ProfileUpdateRequestDto;
import com.main.TravelMate.profile.entity.Follow;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.profile.repository.FollowRepository;
import com.main.TravelMate.profile.repository.ProfileRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final ProfileRepository profileRepository;

    public ProfileResponseDto getProfile(Long userId) {
        log.info("👤 프로필 조회 시작 - 사용자 ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        log.info("✅ 사용자 정보 조회 완료 - 이메일: {}, 닉네임: {}", user.getEmail(), user.getNickname());

        // 더 안전한 피드 조회 (EntityGraph 포함)
        List<TravelFeed> feeds = travelFeedRepository.findByUserOrderByCreatedAtDesc(user);
        int feedCount = travelFeedRepository.countByUser(user);
        log.info("📋 사용자 피드 조회 완료 - 조회된 피드 수: {}, 전체 피드 수: {}", feeds.size(), feedCount);
        
        // 각 피드 정보 출력
        for (int i = 0; i < feeds.size(); i++) {
            TravelFeed feed = feeds.get(i);
            log.info("  📄 피드 {} - ID: {}, 여행 제목: '{}', 캡션: '{}'", 
                    i + 1, feed.getId(), 
                    feed.getTravelPlan() != null ? feed.getTravelPlan().getTitle() : "null",
                    feed.getCaption() != null ? feed.getCaption().substring(0, Math.min(50, feed.getCaption().length())) + "..." : "null");
        }

        List<TravelFeedResponseDto> feedDtos = feeds.stream().map(feed -> {
            var plan = feed.getTravelPlan();

            List<TravelDayDto> dayDtos = plan.getDays().stream().map(day -> {
                List<TravelScheduleDto> scheduleDtos = day.getSchedules().stream().map(schedule ->
                        TravelScheduleDto.builder()
                                .time(schedule.getTime())
                                .place(schedule.getPlace())
                                .activity(schedule.getActivity())
                                .memo(schedule.getMemo())
                                .cost(schedule.getCost())
                                .build()
                ).toList();

                return TravelDayDto.builder()
                        .dayNumber(day.getDayNumber())
                        .date(day.getDate())
                        .schedules(scheduleDtos)
                        .build();
            }).toList();

            return TravelFeedResponseDto.builder()
                    .travelPlanId(plan.getId())
                    .title(plan.getTitle())
                    .location(plan.getLocation())
                    .description(plan.getDescription())
                    .interests(plan.getInterests())
                    .numberOfPeople(plan.getNumberOfPeople())
                    .budget(plan.getBudget())
                    .startDate(plan.getStartDate())
                    .endDate(plan.getEndDate())
                    .days(dayDtos)
                    .imageUrl(feed.getImageUrl())
                    .caption(feed.getCaption())
                    .build();
        }).toList();

        // 팔로워/팔로잉 수 계산
        int followerCount = followRepository.countByFollowing(user);
        int followingCount = followRepository.countByFollower(user);
        
        // 피드 수 = 게시물 수
        int postsCount = feeds.size();
        
        // TODO: 실제 여행 계획 생성/참여 수 계산 로직 추가 필요
        int createdTripsCount = 0; // 추후 TravelPlan 테이블에서 계산
        int joinedTripsCount = 0;  // 추후 매칭/참여 테이블에서 계산

        ProfileResponseDto response = ProfileResponseDto.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .bio(user.getProfile() != null ? user.getProfile().getBio() : "자기소개를 입력해주세요.")
                .profileImage(user.getProfile() != null ? user.getProfile().getProfileImage() : null)
                .age(user.getProfile() != null ? user.getProfile().getAge() : 0)
                .gender(user.getProfile() != null ? user.getProfile().getGender() : "비공개")
                .followerCount(followerCount)
                .followingCount(followingCount)
                .postsCount(postsCount)
                .createdTripsCount(createdTripsCount)
                .joinedTripsCount(joinedTripsCount)
                .feeds(feedDtos)
                .build();
        
        log.info("🎯 프로필 응답 생성 완료 - 사용자: {}, 총 피드 수: {}", user.getEmail(), feedDtos.size());
        return response;
    }

    public void follow(Long currentUserId, Long targetId) {
        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User following = userRepository.findById(targetId)
                .orElseThrow(() -> new UsernameNotFoundException("Target user not found"));

        if (!followRepository.existsByFollowerAndFollowing(follower, following)) {
            followRepository.save(new Follow(follower, following));
        }
    }

    public void unfollow(Long currentUserId, Long targetId) {
        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User following = userRepository.findById(targetId)
                .orElseThrow(() -> new UsernameNotFoundException("Target user not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new IllegalStateException("Follow relation not found"));
        followRepository.delete(follow);
    }


    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 🔄 User 엔티티의 nickname 업데이트
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            log.info("👤 닉네임 업데이트: {} -> {}", user.getNickname(), request.getNickname());
            user.setNickname(request.getNickname().trim());
            userRepository.save(user); // User 엔티티 저장
        }

        Profile profile = profileRepository.findByUser(user)
                .orElse(Profile.builder().user(user).build()); // 없으면 새로 생성

        profile.setRealName(request.getRealName());
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setPreferredDestinations(request.getPreferredDestinations());
        profile.setTravelStyle(request.getTravelStyle());
        profile.setBio(request.getBio());
        profile.setProfileImage(request.getProfileImage());

        profileRepository.save(profile);
        user.setProfile(profile); // 양방향 연관관계 유지
        
        log.info("✅ 프로필 업데이트 완료 - 사용자: {}, 닉네임: {}", user.getEmail(), user.getNickname());
    }
}
