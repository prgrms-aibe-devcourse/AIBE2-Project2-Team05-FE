package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.entity.TravelStyle;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDate;

/**
 * 매칭 검색 조건을 담는 DTO
 * 여행자가 호환 가능한 파트너를 검색할 때 사용되는 검색 파라미터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchSearchCriteria {
    
    /**
     * 목적지/여행지
     */
    @NotBlank(message = "목적지는 필수입니다")
    private String destination;
    
    /**
     * 여행 시작일
     */
    @NotNull(message = "여행 시작일은 필수입니다")
    private LocalDate startDate;
    
    /**
     * 여행 종료일
     */
    @NotNull(message = "여행 종료일은 필수입니다")
    private LocalDate endDate;
    
    /**
     * 여행 스타일 (ADVENTURE, RELAXED, CULTURAL, BUDGET, LUXURY)
     */
    private TravelStyle travelStyle;
    
    /**
     * 날짜 차이 허용 범위 (일 단위)
     * 예: 5일이면 ±5일 범위 내에서 매칭
     */
    @Min(value = 0, message = "날짜 차이 허용 범위는 0 이상이어야 합니다")
    @Max(value = 365, message = "날짜 차이 허용 범위는 365일 이하여야 합니다")
    private Integer maxDistance;
    
    /**
     * 최대 그룹 크기
     */
    @Positive(message = "최대 그룹 크기는 양수여야 합니다")
    private Integer maxGroupSize;
    
    /**
     * 페이지 번호 (기본값: 0)
     */
    @Min(value = 0, message = "페이지 번호는 0 이상이어야 합니다")
    private Integer page = 0;
    
    /**
     * 페이지 크기 (기본값: 20)
     */
    @Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다")
    @Max(value = 100, message = "페이지 크기는 100 이하여야 합니다")
    private Integer size = 20;
}