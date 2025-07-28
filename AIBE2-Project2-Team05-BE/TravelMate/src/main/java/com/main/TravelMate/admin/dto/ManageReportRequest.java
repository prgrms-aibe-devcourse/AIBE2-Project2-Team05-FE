package com.main.TravelMate.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManageReportRequest {
    private Long reportId;
    private String status; // REVIEWED, RESOLVED, REJECTED
    private String actionTaken; // USER_BLOCKED, WARNING_ISSUED, NO_ACTION 등
}
