package com.main.TravelMate.feed.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorFeedResponseDto {
    
    private List<TravelFeedResponseDto> feeds; // 피드 목록
    private Long nextCursor; // 다음 페이지 커서 (null이면 마지막 페이지)
    private boolean hasNext; // 다음 페이지 존재 여부
    private int totalCount; // 현재 응답의 피드 개수
    
    // 편의 메서드: 다음 페이지가 있는지 확인
    public boolean hasNextPage() {
        return hasNext && nextCursor != null;
    }
} 