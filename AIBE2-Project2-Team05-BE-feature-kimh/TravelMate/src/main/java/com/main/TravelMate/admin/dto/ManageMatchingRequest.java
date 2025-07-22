package com.main.TravelMate.admin.dto;

import lombok.Getter;

@Getter
public class ManageMatchingRequest {
    private Long matchingId;
    private String status; // "APPROVED", "REJECTED_BY_ADMIN", "UNDER_REVIEW"
    private String notes;  // 처리 사유
}
