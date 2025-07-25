package com.main.TravelMate.chat.repository;

import com.main.TravelMate.chat.entity.ChatRoom;
import com.main.TravelMate.matching.entity.MatchingRequest;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByMatchingId(Long matchingId);
    Optional<ChatRoom> findByMatching(MatchingRequest matchingRequest);
}
