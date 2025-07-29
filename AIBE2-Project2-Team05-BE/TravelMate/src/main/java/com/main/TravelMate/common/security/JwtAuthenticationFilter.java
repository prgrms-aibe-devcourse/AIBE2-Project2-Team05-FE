package com.main.TravelMate.common.security;


import com.main.TravelMate.common.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        // 🚨 디버깅: 모든 요청 로그
        logger.info("🔍 [JWT 필터] 요청: {} {}", method, requestURI);

        String token = resolveToken(request);
        logger.info("🔍 [JWT 필터] 토큰 추출: {}", token != null ? "토큰 있음 (길이: " + token.length() + ")" : "토큰 없음");
        
        if (token != null) {
            logger.info("🔍 [JWT 필터] 토큰 검증 시작...");
            if (jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
                logger.info("✅ [JWT 필터] 인증 성공 - 사용자: {}", auth.getName());
            } else {
                logger.warn("❌ [JWT 필터] 유효하지 않은 JWT 토큰");
            }
        } else {
            logger.warn("🚫 [JWT 필터] JWT 토큰 없음 - 요청: {} {}", method, requestURI);
        }
        
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // 🚨 디버깅: shouldNotFilter 체크
        logger.info("🔍 [JWT 필터 - shouldNotFilter] 요청: {} {}", method, path);
        
        boolean shouldSkip = (path.startsWith("/api/feed") && "GET".equals(method))        // 피드 조회만 허용
                || (path.startsWith("/api/profile/user") && "GET".equals(method)) // 프로필 조회만 허용  
                || (path.startsWith("/api/review") && "GET".equals(method))       // 후기 조회만 허용
                || path.startsWith("/api/places")                            // 장소 API 모든 메서드 허용
                || path.startsWith("/uploads/")                              // 업로드 파일 접근 허용
                || (path.equals("/api/admin/login") && "POST".equals(method))    // 관리자 로그인 허용 (POST만)
                || (path.equals("/api/auth/login") && "POST".equals(method))     // 사용자 로그인 허용 (POST만)
                || (path.equals("/api/users/signup") && "POST".equals(method))   // 사용자 회원가입 허용 (POST만)
                || "OPTIONS".equals(method);                                 // CORS preflight 요청
        
        logger.info("🔍 [JWT 필터 - shouldNotFilter] 결과: {} (스킵: {})", shouldSkip ? "JWT 필터 건너뜀" : "JWT 필터 실행", shouldSkip);
        
        return shouldSkip;
    }
}
