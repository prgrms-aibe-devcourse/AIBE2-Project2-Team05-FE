package com.main.TravelMate.review.service;

import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.review.dto.ReviewCreateRequestDto;
import com.main.TravelMate.review.dto.ReviewResponseDto;
import com.main.TravelMate.review.entity.Review;
import com.main.TravelMate.review.repository.ReviewRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * 후기 작성
     * - 여행 작성자 또는 참여자만 작성 가능
     * - 한 사용자당 한 피드에 여러 개의 후기 작성 가능 (누적)
     */
    @Transactional
    public ReviewResponseDto createReview(Long feedId, String userEmail, ReviewCreateRequestDto requestDto) {
        log.info("🌟 후기 작성 시작 - 피드 ID: {}, 사용자: {}", feedId, userEmail);

        // 1. 사용자 조회
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userEmail));

        // 2. 피드 조회
        TravelFeed feed = travelFeedRepository.findById(feedId)
                .orElseThrow(() -> new RuntimeException("피드를 찾을 수 없습니다: " + feedId));

        // 3. 후기 작성 권한 체크
        if (!canWriteReview(feed, user)) {
            throw new SecurityException("이 여행에 대한 후기 작성 권한이 없습니다");
        }

        // 4. 후기 엔티티 생성
        Review review = Review.builder()
                .travelFeed(feed)
                .user(user)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .rating(requestDto.getRating())
                .tags(convertListToJson(requestDto.getTags()))
                .imageUrls(convertListToJson(requestDto.getImageUrls()))
                .build();

        // 5. 후기 저장
        Review savedReview = reviewRepository.save(review);

        log.info("✅ 후기 작성 완료 - 후기 ID: {}, 제목: {}", savedReview.getId(), savedReview.getTitle());

        return convertToResponseDto(savedReview);
    }

    /**
     * 특정 피드의 모든 후기 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByFeedId(Long feedId) {
        log.info("📋 피드 {} 후기 목록 조회", feedId);

        List<Review> reviews = reviewRepository.findByTravelFeedIdAndStatusActive(feedId);
        
        return reviews.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 피드의 후기 통계 조회
     */
    @Transactional(readOnly = true)
    public ReviewStatsDto getReviewStats(Long feedId) {
        Double averageRating = reviewRepository.findAverageRatingByTravelFeedId(feedId);
        Long reviewCount = reviewRepository.countByTravelFeedIdAndStatusActive(feedId);

        return ReviewStatsDto.builder()
                .averageRating(averageRating != null ? averageRating : 0.0)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .build();
    }

    /**
     * 후기 작성 권한 체크
     * - 여행 작성자는 항상 가능
     * - 여행 참여자도 가능 (추후 매칭 시스템과 연동)
     */
    private boolean canWriteReview(TravelFeed feed, User user) {
        // 1. 여행 작성자인지 확인
        if (feed.getUser().getId().equals(user.getId())) {
            log.info("✅ 여행 작성자 권한으로 후기 작성 가능 - 사용자 ID: {}", user.getId());
            return true;
        }

        // 2. 여행 참여자인지 확인 (현재는 임시로 모든 사용자 허용, 추후 매칭 시스템과 연동)
        // TODO: 매칭 시스템이 구현되면 실제 참여자인지 확인하는 로직 추가
        log.info("✅ 참여자 권한으로 후기 작성 가능 (임시) - 사용자 ID: {}", user.getId());
        return true;
    }

    /**
     * Review 엔티티를 ResponseDto로 변환
     */
    private ReviewResponseDto convertToResponseDto(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .travelFeedId(review.getTravelFeed().getId())
                .title(review.getTitle())
                .content(review.getContent())
                .rating(review.getRating())
                .tags(convertJsonToList(review.getTags()))
                .imageUrls(convertJsonToList(review.getImageUrls()))
                .createdAt(review.getCreatedAt())
                .author(ReviewResponseDto.AuthorInfo.builder()
                        .id(review.getUser().getId())
                        .email(review.getUser().getEmail())
                        .nickname(review.getUser().getNickname())
                        .profileImageUrl(getProfileImageUrl(review.getUser()))
                        .build())
                .build();
    }

    /**
     * 사용자 프로필 이미지 URL 가져오기
     */
    private String getProfileImageUrl(User user) {
        // TODO: 실제 프로필 이미지 URL 로직 구현
        return "/api/profile/image/" + user.getId();
    }

    /**
     * List를 JSON 문자열로 변환
     */
    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.warn("List를 JSON으로 변환 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * JSON 문자열을 List로 변환
     */
    private List<String> convertJsonToList(String json) {
        if (json == null || json.trim().isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            log.warn("JSON을 List로 변환 실패: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * 후기 통계 DTO
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReviewStatsDto {
        private Double averageRating;
        private Long reviewCount;
    }
} 