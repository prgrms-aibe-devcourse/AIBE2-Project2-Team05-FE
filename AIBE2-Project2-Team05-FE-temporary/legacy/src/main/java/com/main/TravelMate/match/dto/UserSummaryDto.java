package com.main.TravelMate.match.dto;

import com.main.TravelMate.user.domain.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 사용자 요약 정보 DTO
 * 매칭 요청 정보에서 사용자 정보를 간략하게 표시할 때 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {
    
    /**
     * 사용자 ID
     */
    private Long id;
    
    /**
     * 사용자 닉네임
     */
    private String nickname;
    
    /**
     * 사용자 이메일
     */
    private String email;
    
    /**
     * 사용자 권한 (USER, GUIDE, ADMIN)
     */
    private Role role;
}