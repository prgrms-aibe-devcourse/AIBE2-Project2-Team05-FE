package com.main.TravelMate.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManageReportRequest {
    private Long reportId;
    private String status; // REVIEWED, RESOLVED, REJECTED
    private String actionTaken; // USER_BLOCKED, WARNING_ISSUED, NO_ACTION 등
}
