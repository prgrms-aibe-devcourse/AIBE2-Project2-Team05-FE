package com.main.TravelMate.user.domain;

/**
 * 사용자 상태를 정의하는 enum
 * ACTIVE: 활성 상태 (정상 사용 가능)
 * BANNED: 차단 상태 (로그인 불가, 서비스 이용 제한)
 * INACTIVE: 비활성 상태 (일시적으로 서비스 이용 제한)
 */
public enum UserStatus {
    ACTIVE,     // 활성 상태
    BANNED,     // 차단 상태
    INACTIVE    // 비활성 상태
} 