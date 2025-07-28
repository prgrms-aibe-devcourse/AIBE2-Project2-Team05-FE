package com.main.TravelMate.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManageUserRequest {
    private Long userId;
    private String status; // "BLOCKED", "ACTIVE", "DELETED_BY_ADMIN"
    private String reason;
}
