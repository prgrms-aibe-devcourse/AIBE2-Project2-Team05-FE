package com.main.TravelMate.feed.domain;

/**
 * 여행 상태 enum
 * 매칭 서비스에서 사용되는 여행 진행 상태
 */
public enum TravelStatus {
    RECRUITING("모집중"),
    MATCHED("매칭완료"),
    TRAVELING("여행중"),
    COMPLETED("완료"),
    CANCELLED("취소");

    private final String description;

    TravelStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 