package com.main.TravelMate.plan.entity;

/**
 * 여행 계획의 상태를 나타내는 enum
 */
public enum PlanStatus {
    ACTIVE,     // 활성 상태 (기본값)
    COMPLETED,  // 완료된 여행
    CANCELLED,  // 취소된 여행
    DELETED     // 삭제된 여행 (소프트 삭제)
} 