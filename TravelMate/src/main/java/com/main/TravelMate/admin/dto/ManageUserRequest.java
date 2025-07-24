package com.main.TravelMate.admin.dto;

import lombok.Getter;

@Getter
public class ManageUserRequest {
    private Long userId; // 다시 Long으로 되돌림
    private String status; // "BLOCKED", "ACTIVE", "DELETED_BY_ADMIN"
    private String reason;
}
