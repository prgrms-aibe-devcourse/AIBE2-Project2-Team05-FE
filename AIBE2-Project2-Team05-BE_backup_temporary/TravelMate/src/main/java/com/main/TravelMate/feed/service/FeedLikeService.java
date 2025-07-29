package com.main.TravelMate.feed.service;

import com.main.TravelMate.feed.entity.FeedLike;
import com.main.TravelMate.feed.repository.FeedLikeRepository;
import com.main.TravelMate.feed.dto.LikeResponseDto;
import com.main.TravelMate.feed.dto.LikeStatusResponseDto;
import com.main.TravelMate.feed.dto.LikeUsersResponseDto;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FeedLikeService {

    private final FeedLikeRepository feedLikeRepository;
    private final UserRepository userRepository;

    /**
     * 좋아요 토글 (추가/제거)
     */
    @Transactional
    public LikeResponseDto toggleLike(Long travelFeedId, String userEmail) {
        try {
            log.info("🔄 좋아요 토글 요청 - travelFeedId: {}, userEmail: {}", travelFeedId, userEmail);

            // 사용자 조회
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userEmail));

            // 기존 좋아요 확인
            Optional<FeedLike> existingLike = feedLikeRepository.findByTravelFeedIdAndUser(travelFeedId, user);

            boolean liked;
            String message;

            if (existingLike.isPresent()) {
                // 좋아요 제거
                feedLikeRepository.delete(existingLike.get());
                liked = false;
                message = "좋아요가 제거되었습니다";
                log.info("❤️ 좋아요 제거 완료 - travelFeedId: {}, userId: {}", travelFeedId, user.getId());
            } else {
                // 좋아요 추가
                FeedLike newLike = new FeedLike(travelFeedId, user);
                feedLikeRepository.save(newLike);
                liked = true;
                message = "좋아요가 추가되었습니다";
                log.info("💖 좋아요 추가 완료 - travelFeedId: {}, userId: {}", travelFeedId, user.getId());
            }

            // 총 좋아요 개수 조회
            long likeCount = feedLikeRepository.countByTravelFeedId(travelFeedId);
            log.info("📊 좋아요 개수 - travelFeedId: {}, count: {}", travelFeedId, likeCount);

            return LikeResponseDto.success(liked, likeCount, message);

        } catch (Exception e) {
            log.error("❌ 좋아요 토글 실패 - travelFeedId: {}, userEmail: {}, error: {}", 
                    travelFeedId, userEmail, e.getMessage(), e);
            return LikeResponseDto.error("좋아요 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 좋아요 상태 조회
     */
    public LikeStatusResponseDto getLikeStatus(Long travelFeedId, String userEmail) {
        try {
            log.info("🔍 좋아요 상태 조회 - travelFeedId: {}, userEmail: {}", travelFeedId, (userEmail != null ? userEmail : "anonymous"));

            boolean liked = false;
            if (userEmail != null) {
                // 로그인 상태일 때만 DB에서 사용자 정보를 조회합니다.
                Optional<User> userOptional = userRepository.findByEmail(userEmail);
                if (userOptional.isPresent()) {
                    liked = feedLikeRepository.existsByTravelFeedIdAndUser(travelFeedId, userOptional.get());
                }
            }
            // 비로그인 상태일 경우, liked는 false를 유지합니다.

            // 총 좋아요 개수 조회
            long likeCount = feedLikeRepository.countByTravelFeedId(travelFeedId);

            log.info("✅ 좋아요 상태 조회 완료 - travelFeedId: {}, liked: {}, count: {}", 
                    travelFeedId, liked, likeCount);

            return LikeStatusResponseDto.success(liked, likeCount);

        } catch (Exception e) {
            log.error("❌ 좋아요 상태 조회 실패 - travelFeedId: {}, userEmail: {}, error: {}", 
                    travelFeedId, (userEmail != null ? userEmail : "anonymous"), e.getMessage(), e);
            return LikeStatusResponseDto.error();
        }
    }

    /**
     * 특정 피드의 좋아요 개수만 조회
     */
    public long getLikeCount(Long travelFeedId) {
        try {
            long count = feedLikeRepository.countByTravelFeedId(travelFeedId);
            log.info("📊 좋아요 개수 조회 - travelFeedId: {}, count: {}", travelFeedId, count);
            return count;
        } catch (Exception e) {
            log.error("❌ 좋아요 개수 조회 실패 - travelFeedId: {}, error: {}", 
                    travelFeedId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 특정 피드에 좋아요한 사용자 목록 조회
     */
    public LikeUsersResponseDto getLikeUsers(Long travelFeedId) {
        try {
            log.info("👥 좋아요한 사용자 목록 조회 - travelFeedId: {}", travelFeedId);

            List<FeedLike> feedLikes = feedLikeRepository.findByTravelFeedIdOrderByCreatedAtDesc(travelFeedId);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            
            List<LikeUsersResponseDto.LikeUserDto> userDtos = feedLikes.stream()
                    .map(feedLike -> {
                        User user = feedLike.getUser();
                        return LikeUsersResponseDto.LikeUserDto.builder()
                                .userId(user.getId())
                                .nickname(user.getNickname())
                                .profileImageUrl(user.getProfile() != null ? user.getProfile().getProfileImage() : null)
                                .likedAt(feedLike.getCreatedAt().format(formatter))
                                .build();
                    })
                    .collect(Collectors.toList());

            log.info("✅ 좋아요한 사용자 목록 조회 완료 - travelFeedId: {}, count: {}", 
                    travelFeedId, userDtos.size());

            return LikeUsersResponseDto.success(userDtos, userDtos.size());

        } catch (Exception e) {
            log.error("❌ 좋아요한 사용자 목록 조회 실패 - travelFeedId: {}, error: {}", 
                    travelFeedId, e.getMessage(), e);
            return LikeUsersResponseDto.error("좋아요한 사용자 목록 조회 중 오류가 발생했습니다");
        }
    }
} 