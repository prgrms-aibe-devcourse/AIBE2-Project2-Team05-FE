package com.main.TravelMate.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * 후기 작성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateRequestDto {

    @NotBlank(message = "후기 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이내로 작성해주세요")
    private String title;

    @NotBlank(message = "후기 내용은 필수입니다")
    private String content;

    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;

    // 후기 태그들 (선택사항)
    private List<String> tags;

    // 이미지 URL들 (선택사항)
    private List<String> imageUrls;
} 