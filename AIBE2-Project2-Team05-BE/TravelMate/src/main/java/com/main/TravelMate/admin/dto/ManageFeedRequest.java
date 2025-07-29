package com.main.TravelMate.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManageFeedRequest {
    private Long travelFeedId;
    private String status; // HIDDEN, DELETED_BY_ADMIN
    private String reason;
}
