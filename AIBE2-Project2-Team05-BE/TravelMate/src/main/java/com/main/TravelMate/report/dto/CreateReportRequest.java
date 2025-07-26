package com.main.TravelMate.report.dto;

import lombok.Getter;

@Getter
public class CreateReportRequest {
    private Long reportedUserId;
    private String reportType;
    private String description;
}
