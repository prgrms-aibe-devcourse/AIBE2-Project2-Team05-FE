package com.main.TravelMate.user.domain;

/**
 * 성별을 나타내는 Enum
 */
public enum Gender {
    MALE("남성"),
    FEMALE("여성"), 
    OTHER("기타");

    private final String displayName;

    Gender(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 