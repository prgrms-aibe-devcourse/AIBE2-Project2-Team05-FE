package com.main.TravelMate.match.service;

import com.main.TravelMate.match.dto.MatchSearchCriteria;
import com.main.TravelMate.match.dto.UserMatchDto;
import com.main.TravelMate.match.entity.MatchStatus;
import com.main.TravelMate.match.entity.TravelStyle;
import com.main.TravelMate.match.exception.DuplicateMatchRequestException;
import com.main.TravelMate.match.exception.SelfMatchRequestException;
import com.main.TravelMate.match.repository.MatchRepository;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceImplTest {

    @Mock
    private MatchRepository matchRepository;
    
    @Mock
    private TravelPlanRepository travelPlanRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private MatchingServiceImpl matchingService;
    
    private User testUser1;
    private User testUser2;
    private TravelPlan testPlan1;
    private TravelPlan testPlan2;
    private MatchSearchCriteria searchCriteria;

    @BeforeEach
    void setUp() {
        testUser1 = User.builder()
            .id(1L)
            .email("user1@test.com")
            .nickname("여행자1")
            .build();
            
        testUser2 = User.builder()
            .id(2L)
            .email("user2@test.com")
            .nickname("여행자2")
            .build();
            
        testPlan1 = TravelPlan.builder()
            .id(1L)
            .user(testUser1)
            .title("서울 여행")
            .destination("서울")
            .startDate(LocalDate.of(2024, 6, 1))
            .endDate(LocalDate.of(2024, 6, 5))
            .travelStyle(TravelStyle.CULTURAL)
            .numberOfPeople(2)
            .budget(500000)
            .description("문화 탐방 여행")
            .build();
            
        testPlan2 = TravelPlan.builder()
            .id(2L)
            .user(testUser2)
            .title("서울 맛집 투어")
            .destination("서울")
            .startDate(LocalDate.of(2024, 6, 3))
            .endDate(LocalDate.of(2024, 6, 7))
            .travelStyle(TravelStyle.CULTURAL)
            .numberOfPeople(2)
            .budget(400000)
            .description("서울 맛집 탐방")
            .build();
            
        searchCriteria = new MatchSearchCriteria();
        searchCriteria.setDestination("서울");
        searchCriteria.setStartDate(LocalDate.of(2024, 6, 1));
        searchCriteria.setEndDate(LocalDate.of(2024, 6, 5));
        searchCriteria.setTravelStyle(TravelStyle.CULTURAL);
        searchCriteria.setMaxGroupSize(3);
    }

    @Test
    @DisplayName("호환 가능한 여행자 검색 - 성공")
    void searchCompatibleTravelers_Success() {
        // Given
        Page<TravelPlan> mockPage = new PageImpl<>(Arrays.asList(testPlan2));
        when(travelPlanRepository.findCompatibleTravelPlansByStyle(
            anyString(), any(LocalDate.class), any(LocalDate.class), 
            anyLong(), any(TravelStyle.class), any(Pageable.class)))
            .thenReturn(mockPage);

        // When
        List<UserMatchDto> results = matchingService.searchCompatibleTravelers(searchCriteria, 1L);

        // Then
        assertThat(results).hasSize(1);
        UserMatchDto result = results.get(0);
        assertThat(result.getUserId()).isEqualTo(2L);
        assertThat(result.getNickname()).isEqualTo("여행자2");
        assertThat(result.getDestination()).isEqualTo("서울");
        assertThat(result.getCompatibilityScore()).isGreaterThanOrEqualTo(50);
    }

    @Test
    @DisplayName("자기 자신에게 매칭 요청 - 예외 발생")
    void sendMatchRequest_SelfRequest_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> 
            matchingService.sendMatchRequest(1L, 1L, 1L, "안녕하세요"))
            .isInstanceOf(SelfMatchRequestException.class);
    }

    @Test
    @DisplayName("중복 매칭 요청 - 예외 발생")
    void sendMatchRequest_DuplicateRequest_ThrowsException() {
        // Given
        when(matchRepository.findPendingMatchBetweenUsers(1L, 2L))
            .thenReturn(Optional.of(mock(com.main.TravelMate.match.entity.Match.class)));

        // When & Then
        assertThatThrownBy(() -> 
            matchingService.sendMatchRequest(1L, 2L, 1L, "안녕하세요"))
            .isInstanceOf(DuplicateMatchRequestException.class);
    }

    @Test
    @DisplayName("매칭 요청 전송 - 성공")
    void sendMatchRequest_Success() {
        // Given
        when(matchRepository.findPendingMatchBetweenUsers(1L, 2L))
            .thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testUser2));
        when(travelPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan1));
        when(matchRepository.save(any())).thenAnswer(invocation -> {
            com.main.TravelMate.match.entity.Match match = invocation.getArgument(0);
            match.setId(1L);
            return match;
        });

        // When
        var result = matchingService.sendMatchRequest(1L, 2L, 1L, "함께 여행하실래요?");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRequester().getId()).isEqualTo(1L);
        assertThat(result.getReceiver().getId()).isEqualTo(2L);
        assertThat(result.getStatus()).isEqualTo(MatchStatus.PENDING);
        assertThat(result.getMessage()).isEqualTo("함께 여행하실래요?");
    }

    @Test
    @DisplayName("매칭 요청 응답 - 수락")
    void respondToMatchRequest_Accept_Success() {
        // Given
        com.main.TravelMate.match.entity.Match mockMatch = mock(com.main.TravelMate.match.entity.Match.class);
        when(mockMatch.getId()).thenReturn(1L);
        when(mockMatch.getReceiver()).thenReturn(testUser2);
        when(mockMatch.getStatus()).thenReturn(MatchStatus.PENDING);
        when(mockMatch.getRequester()).thenReturn(testUser1);
        when(mockMatch.getTravelPlan()).thenReturn(testPlan1);
        
        when(matchRepository.findById(1L)).thenReturn(Optional.of(mockMatch));
        when(matchRepository.save(any())).thenReturn(mockMatch);

        // When
        var result = matchingService.respondToMatchRequest(1L, 2L, true);

        // Then
        verify(mockMatch).setStatus(MatchStatus.ACCEPTED);
        verify(mockMatch).setRespondedAt(any());
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("매칭 요청 응답 - 거절")
    void respondToMatchRequest_Reject_Success() {
        // Given
        com.main.TravelMate.match.entity.Match mockMatch = mock(com.main.TravelMate.match.entity.Match.class);
        when(mockMatch.getId()).thenReturn(1L);
        when(mockMatch.getReceiver()).thenReturn(testUser2);
        when(mockMatch.getStatus()).thenReturn(MatchStatus.PENDING);
        when(mockMatch.getRequester()).thenReturn(testUser1);
        when(mockMatch.getTravelPlan()).thenReturn(testPlan1);
        
        when(matchRepository.findById(1L)).thenReturn(Optional.of(mockMatch));
        when(matchRepository.save(any())).thenReturn(mockMatch);

        // When
        var result = matchingService.respondToMatchRequest(1L, 2L, false);

        // Then
        verify(mockMatch).setStatus(MatchStatus.REJECTED);
        verify(mockMatch).setRespondedAt(any());
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("받은 매칭 요청 조회 - 성공")
    void getReceivedRequests_Success() {
        // Given
        com.main.TravelMate.match.entity.Match mockMatch = mock(com.main.TravelMate.match.entity.Match.class);
        when(mockMatch.getId()).thenReturn(1L);
        when(mockMatch.getRequester()).thenReturn(testUser1);
        when(mockMatch.getReceiver()).thenReturn(testUser2);
        when(mockMatch.getTravelPlan()).thenReturn(testPlan1);
        when(mockMatch.getStatus()).thenReturn(MatchStatus.PENDING);
        
        when(matchRepository.findByReceiverIdAndStatus(2L, MatchStatus.PENDING))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        var results = matchingService.getReceivedRequests(2L);

        // Then
        assertThat(results).hasSize(1);
        verify(matchRepository).findByReceiverIdAndStatus(2L, MatchStatus.PENDING);
    }

    @Test
    @DisplayName("보낸 매칭 요청 조회 - 성공")
    void getSentRequests_Success() {
        // Given
        com.main.TravelMate.match.entity.Match mockMatch = mock(com.main.TravelMate.match.entity.Match.class);
        when(mockMatch.getId()).thenReturn(1L);
        when(mockMatch.getRequester()).thenReturn(testUser1);
        when(mockMatch.getReceiver()).thenReturn(testUser2);
        when(mockMatch.getTravelPlan()).thenReturn(testPlan1);
        when(mockMatch.getStatus()).thenReturn(MatchStatus.PENDING);
        
        when(matchRepository.findByRequesterId(1L))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        var results = matchingService.getSentRequests(1L);

        // Then
        assertThat(results).hasSize(1);
        verify(matchRepository).findByRequesterId(1L);
    }

    @Test
    @DisplayName("활성 매칭 조회 - 성공")
    void getActiveMatches_Success() {
        // Given
        com.main.TravelMate.match.entity.Match mockMatch = mock(com.main.TravelMate.match.entity.Match.class);
        when(mockMatch.getRequester()).thenReturn(testUser1);
        when(mockMatch.getReceiver()).thenReturn(testUser2);
        when(mockMatch.getTravelPlan()).thenReturn(testPlan1);
        
        when(matchRepository.findActiveMatchesByUserId(1L))
            .thenReturn(Arrays.asList(mockMatch));

        // When
        var results = matchingService.getActiveMatches(1L);

        // Then
        assertThat(results).hasSize(1);
        UserMatchDto result = results.get(0);
        assertThat(result.getUserId()).isEqualTo(2L); // 상대방 ID
        assertThat(result.getNickname()).isEqualTo("여행자2");
        assertThat(result.getCompatibilityScore()).isEqualTo(100);
        verify(matchRepository).findActiveMatchesByUserId(1L);
    }

    @Test
    @DisplayName("매칭 통계 조회 - 성공")
    void getMatchingStatistics_Success() {
        // Given
        when(matchRepository.countTotalRequests()).thenReturn(100L);
        when(matchRepository.countAcceptedRequests()).thenReturn(60L);
        when(matchRepository.countActiveMatches()).thenReturn(30L);
        when(matchRepository.count()).thenReturn(100L);
        when(matchRepository.findAll()).thenReturn(Arrays.asList());

        // When
        var statistics = matchingService.getMatchingStatistics();

        // Then
        assertThat(statistics.getTotalMatchRequests()).isEqualTo(100L);
        assertThat(statistics.getAcceptedMatchRequests()).isEqualTo(60L);
        assertThat(statistics.getActiveMatches()).isEqualTo(30L);
        assertThat(statistics.getSuccessRate()).isEqualTo(60.0);
    }
}