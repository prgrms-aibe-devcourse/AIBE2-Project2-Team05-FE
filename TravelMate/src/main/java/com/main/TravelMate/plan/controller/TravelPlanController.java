package com.main.TravelMate.plan.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.plan.dto.TravelPlanCreateRequestDto;
import com.main.TravelMate.plan.dto.TravelPlanResponseDto;
import com.main.TravelMate.plan.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class TravelPlanController {

    private final TravelPlanService planService;

    @PostMapping
    public ResponseEntity<String> createPlan(@RequestBody TravelPlanCreateRequestDto request,
                                             @AuthenticationPrincipal CustomUserDetails user) {
        planService.createPlan(user.getUsername(), request);
        return ResponseEntity.ok("여행 계획 등록 완료");
    }

    @GetMapping
    public ResponseEntity<List<TravelPlanResponseDto>> getPlans(Authentication authentication) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(planService.getUserPlans(user.getUsername()));
    }
}
