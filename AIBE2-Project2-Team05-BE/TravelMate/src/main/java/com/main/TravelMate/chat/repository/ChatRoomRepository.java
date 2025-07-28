package com.main.TravelMate.chat.repository;

import com.main.TravelMate.chat.domain.ChatRoom;
import com.main.TravelMate.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByMatchingId(Long matchingId);
    List<ChatRoom> findByParticipantsContaining(User user);
}
