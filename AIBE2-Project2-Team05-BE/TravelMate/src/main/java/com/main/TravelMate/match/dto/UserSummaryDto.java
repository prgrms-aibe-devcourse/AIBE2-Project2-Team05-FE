package com.main.TravelMate.match.dto;

import com.main.TravelMate.user.domain.Role;
import lombok.*;

/**
 * 사용자 요약 정보를 위한 DTO
 * 매칭 시스템에서 사용자 기본 정보를 표시할 때 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {
    private Long id;
    private String nickname;
    private String email;
    private String profileImageUrl;
    private String travelStyle;
    private Double compatibilityScore;
    private Role role;
} 