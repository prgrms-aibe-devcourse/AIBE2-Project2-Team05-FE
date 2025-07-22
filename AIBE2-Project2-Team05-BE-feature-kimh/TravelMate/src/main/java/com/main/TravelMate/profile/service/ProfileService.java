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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final ProfileRepository profileRepository;

    public ProfileResponseDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<TravelFeed> feeds = travelFeedRepository.findByUser(user);

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

        return ProfileResponseDto.builder()
                .nickname(user.getNickname())
                .bio(user.getProfile().getBio())
                .profileImage(user.getProfile().getProfileImage())
                .age(user.getProfile().getAge())
                .gender(user.getProfile().getGender())
                .followerCount(followRepository.countByFollowing(user))
                .followingCount(followRepository.countByFollower(user))
                .feeds(feedDtos)
                .build();
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
    }
}
