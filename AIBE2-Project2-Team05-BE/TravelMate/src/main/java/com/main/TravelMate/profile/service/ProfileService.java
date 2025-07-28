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
import com.main.TravelMate.user.domain.Gender;
import com.main.TravelMate.user.domain.TravelStyle;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.main.TravelMate.common.service.FileUploadService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final ProfileRepository profileRepository;
    private final FileUploadService fileUploadService;

    public ProfileResponseDto getProfile(Long userId) {
        log.info("👤 프로필 조회 시작 - 사용자 ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return buildProfileResponse(user);
    }

    /**
     * 닉네임으로 프로필 조회
     */
    public ProfileResponseDto getProfileByNickname(String nickname) {
        log.info("👤 닉네임으로 프로필 조회 시작 - 닉네임: {}", nickname);
        
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + nickname));
        
        return buildProfileResponse(user);
    }

    /**
     * 공통 프로필 응답 생성 메서드
     */
    private ProfileResponseDto buildProfileResponse(User user) {
        log.info("✅ 사용자 정보 조회 완료 - 이메일: {}, 닉네임: {}", user.getEmail(), user.getNickname());

        // ✅ ACTIVE 상태 피드만 조회 (숨김 처리된 피드 제외)
        List<TravelFeed> feeds = travelFeedRepository.findByUserAndStatusOrderByCreatedAtDesc(user, "ACTIVE");
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
            
            // 🔍 이미지 URL 디버깅 로그 추가
            log.info("📷 피드 ID: {}, TravelPlan 이미지 URL: {}", 
                    feed.getId(), plan.getImageUrl());

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
                    .planId(plan.getId().toString()) // ✅ 단순한 ID 사용
                    .title(plan.getTitle())
                    .location(plan.getLocation())
                    .description(plan.getDescription())
                    .interests(plan.getInterests())
                    .numberOfPeople(plan.getNumberOfPeople())
                    .budget(plan.getBudget())
                    .startDate(plan.getStartDate())
                    .endDate(plan.getEndDate())
                    .days(dayDtos)
                    .imageUrl(plan.getImageUrl()) // ✅ TravelPlan의 image_url 사용
                    .caption(feed.getCaption())
                    .authorName(plan.getAuthorName()) // ✅ 여행 계획 작성자 이름 추가
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
                .age(user.getProfile() != null ? user.getProfile().calculateAge() : 0) // ✅ calculateAge() 메서드 사용
                .gender(user.getProfile() != null && user.getProfile().getGender() != null 
                       ? user.getProfile().getGender().getDisplayName() : "비공개") // ✅ Gender enum -> String 변환
                .residence(user.getProfile() != null ? user.getProfile().getResidence() : "") // 🏠 거주지 추가
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
        
        // ✅ age 관련 처리 - birthdate로 변경됨 (기존 age 필드 사용 시 주석 처리)
        // if (request.getAge() != null) {
        //     // age를 birthdate로 변환하는 로직이 필요하다면 추가
        // }
        
        // ✅ Gender enum 처리
        if (request.getGender() != null) {
            try {
                Gender gender = Gender.valueOf(request.getGender().toUpperCase());
                profile.setGender(gender);
            } catch (IllegalArgumentException e) {
                log.warn("⚠️ 유효하지 않은 성별 값: {}", request.getGender());
                // 기본값으로 처리하거나 예외를 던질 수 있음
            }
        }
        
        profile.setPreferredDestinations(request.getPreferredDestinations());
        profile.setResidence(request.getResidence()); // 🏠 거주지 업데이트
        
        // ✅ travelStyle -> travelStyles 처리
        if (request.getTravelStyle() != null) {
            // 기존 String travelStyle을 Set<TravelStyle>로 변환
            try {
                // 여행 스타일을 콤마로 구분된 문자열로 가정
                String[] styles = request.getTravelStyle().split(",");
                Set<TravelStyle> travelStyles = Set.of(styles).stream()
                    .map(style -> TravelStyle.valueOf(style.trim().toUpperCase()))
                    .collect(Collectors.toSet());
                profile.setTravelStyles(travelStyles);
            } catch (Exception e) {
                log.warn("⚠️ 여행 스타일 변환 실패: {}", request.getTravelStyle(), e);
            }
        }
        
        profile.setBio(request.getBio());
        
        // 🔒 profileImage는 null이 아닐 때만 업데이트 (기존 이미지 보존)
        if (request.getProfileImage() != null) {
            profile.setProfileImage(request.getProfileImage());
        }

        profileRepository.save(profile);
        user.setProfile(profile); // 양방향 연관관계 유지
        
        log.info("✅ 프로필 업데이트 완료 - 사용자: {}, 닉네임: {}", user.getEmail(), user.getNickname());
    }

    /**
     * 테스트용: 모든 사용자 목록 조회 (개발용)
     */
    public List<Object> getAllUsersForTest() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("nickname", user.getNickname());
                    userInfo.put("role", user.getRole());
                    return userInfo;
                })
                .collect(Collectors.toList());
    }

    /**
     * 기존 사용자를 위한 기본 프로필 생성
     */
    @Transactional
    public void createDefaultProfileForUser(Long userId) {
        log.info("👤 사용자 ID {} 기본 프로필 생성 시작", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // 이미 프로필이 있는지 확인
        Optional<Profile> existingProfile = profileRepository.findByUser(user);
        if (existingProfile.isPresent()) {
            log.info("⚠️ 이미 프로필이 존재함: 사용자 ID {}", userId);
            return;
        }
        
        // 기본 프로필 생성
        Profile profile = Profile.builder()
                .user(user)
                .realName(user.getNickname() != null ? user.getNickname() : "사용자" + userId)
                .birthdate(java.time.LocalDate.of(1990, 1, 1)) // 기본 생년월일
                .gender(Gender.MALE) // 기본 성별
                .bio("안녕하세요! " + (user.getNickname() != null ? user.getNickname() : "사용자" + userId) + "입니다.")
                .preferredDestinations("여행지 미정")
                .travelStyles(Set.of(TravelStyle.CULTURE)) // 기본 여행 스타일
                .profileImage(null)
                .build();
        
        profileRepository.save(profile);
        
        log.info("✅ 기본 프로필 생성 완료: 사용자 ID {}, 닉네임: {}", userId, user.getNickname());
    }
    
    /**
     * 프로필이 없는 모든 사용자들을 위한 기본 프로필 일괄 생성
     */
    @Transactional
    public Map<String, Object> createDefaultProfilesForAllUsers() {
        log.info("🔄 모든 사용자 프로필 일괄 생성 시작");
        
        List<User> allUsers = userRepository.findAll();
        int totalUsers = allUsers.size();
        int createdProfiles = 0;
        int skippedProfiles = 0;
        
        for (User user : allUsers) {
            try {
                Optional<Profile> existingProfile = profileRepository.findByUser(user);
                if (existingProfile.isEmpty()) {
                    // 랜덤한 프로필 데이터 생성
                    Profile profile = generateRandomProfile(user);
                    profileRepository.save(profile);
                    createdProfiles++;
                    log.info("✅ 프로필 생성: 사용자 ID {}, 닉네임: {}", user.getId(), user.getNickname());
                } else {
                    skippedProfiles++;
                    log.info("⏭️ 프로필 존재: 사용자 ID {}, 닉네임: {}", user.getId(), user.getNickname());
                }
            } catch (Exception e) {
                log.error("❌ 프로필 생성 실패: 사용자 ID {}, 오류: {}", user.getId(), e.getMessage());
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers", totalUsers);
        result.put("createdProfiles", createdProfiles);
        result.put("skippedProfiles", skippedProfiles);
        
        log.info("🎉 프로필 일괄 생성 완료: 전체 {}, 생성 {}, 건너뜀 {}", totalUsers, createdProfiles, skippedProfiles);
        return result;
    }
    
    /**
     * 랜덤한 프로필 데이터 생성
     */
    private Profile generateRandomProfile(User user) {
        String[] bioTemplates = {
            "안녕하세요! 여행을 좋아하는 %s입니다 ✈️",
            "새로운 경험을 추구하는 %s입니다 🌟", 
            "일상에서 벗어나 특별한 여행을 꿈꾸는 %s입니다 🗺️",
            "맛있는 음식과 아름다운 풍경을 사랑하는 %s입니다 🍽️",
            "자유로운 영혼의 %s입니다 🎒"
        };
        
        String[] destinations = {
            "제주도, 부산", "일본, 태국", "유럽, 미국", "동남아시아", 
            "국내 여행지", "해외 여행지", "자연 명소", "도시 여행"
        };
        
        TravelStyle[] travelStyleArray = TravelStyle.values();
        Gender[] genderArray = Gender.values();
        
        String nickname = user.getNickname() != null ? user.getNickname() : "사용자" + user.getId();
        String bio = String.format(bioTemplates[user.getId().intValue() % bioTemplates.length], nickname);
        String preferredDestination = destinations[user.getId().intValue() % destinations.length];
        
        // 나이는 25~45세 사이로 랜덤 생성
        int age = 25 + (user.getId().intValue() % 21);
        java.time.LocalDate birthdate = java.time.LocalDate.now().minusYears(age);
        
        // 성별은 ID 기반으로 결정
        Gender gender = genderArray[user.getId().intValue() % genderArray.length];
        
        // 여행 스타일은 1~3개 랜덤 선택
        Set<TravelStyle> travelStyles = new HashSet<>();
        int numStyles = 1 + (user.getId().intValue() % 3);
        for (int i = 0; i < numStyles; i++) {
            TravelStyle style = travelStyleArray[(user.getId().intValue() + i) % travelStyleArray.length];
            travelStyles.add(style);
        }
        
        return Profile.builder()
                .user(user)
                .realName(nickname)
                .birthdate(birthdate)
                .gender(gender)
                .bio(bio)
                .preferredDestinations(preferredDestination)
                .travelStyles(travelStyles)
                .profileImage(null)
                .build();
    }

    /**
     * 프로필 이미지 업데이트
     */
    @Transactional
    public String updateProfileImage(Long userId, MultipartFile profileImage) {
        try {
            log.info("🖼️ 프로필 이미지 업데이트 시작 - 사용자 ID: {}, 파일명: {}", 
                    userId, profileImage.getOriginalFilename());

            // 사용자 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));

            // 프로필 조회 또는 생성
            Profile profile = user.getProfile();
            if (profile == null) {
                log.info("프로필이 없어서 새로 생성합니다 - 사용자 ID: {}", userId);
                createDefaultProfileForUser(userId);
                // 생성 후 다시 조회
                user = userRepository.findById(userId)
                        .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
                profile = user.getProfile();
            }

            // 파일 검증 및 업로드
            if (!fileUploadService.validateFile(profileImage)) {
                throw new IllegalArgumentException("유효하지 않은 이미지 파일입니다");
            }

            String imageUrl = fileUploadService.uploadFile(profileImage, "profile-images");
            log.info("이미지 업로드 완료 - URL: {}", imageUrl);

            // 프로필 이미지 URL 업데이트
            profile.setProfileImage(imageUrl);
            profileRepository.save(profile);

            log.info("✅ 프로필 이미지 업데이트 완료 - 사용자 ID: {}, URL: {}", userId, imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("❌ 프로필 이미지 업데이트 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
            throw new RuntimeException("프로필 이미지 업데이트 실패: " + e.getMessage(), e);
        }
    }
}
