package com.main.TravelMate.chat.repository;

import com.main.TravelMate.chat.entity.ChatRoom;
// 임시 비활성화 - 매칭 기능 개발 중
// import com.main.TravelMate.matching.entity.MatchingRequest;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 임시 비활성화 - 매칭 기능 개발 중
    // List<ChatRoom> findByMatchingId(Long matchingId);
    // Optional<ChatRoom> findByMatching(MatchingRequest matchingRequest);
}
