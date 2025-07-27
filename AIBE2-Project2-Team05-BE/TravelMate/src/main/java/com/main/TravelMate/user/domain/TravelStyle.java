package com.main.TravelMate.user.domain;

/**
 * 여행 스타일을 나타내는 Enum
 */
public enum TravelStyle {
    RELAXATION("휴양"),
    FOOD("맛집탐방"),
    ACTIVITY("액티비티"),
    SHOPPING("쇼핑"),
    CULTURE("문화/예술"),
    NATURE("자연");

    private final String displayName;

    TravelStyle(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 