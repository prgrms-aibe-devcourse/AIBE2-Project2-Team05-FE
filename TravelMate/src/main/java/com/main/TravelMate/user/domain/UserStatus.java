package com.main.TravelMate.user.domain;

/**
 * 사용자 상태를 나타내는 ENUM
 * DB의 user.status 컬럼과 매핑됩니다
 */
public enum UserStatus {
    ACTIVE,    // 활성 사용자
    BANNED,    // 차단된 사용자  
    INACTIVE   // 비활성 사용자
} 