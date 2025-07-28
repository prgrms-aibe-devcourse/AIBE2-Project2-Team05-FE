package com.main.TravelMate.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManageFeedRequest {
    private Long travelFeedId;
    private String status; // HIDDEN, DELETED_BY_ADMIN
    private String reason;
}
