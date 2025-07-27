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

        String token = resolveToken(request);
        if (token != null) {
            if (jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
                logger.debug("✅ JWT 인증 성공 - 사용자: {}", auth.getName());
            } else {
                logger.warn("❌ 유효하지 않은 JWT 토큰");
            }
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
        
        // 🔓 WebSecurityCustomizer에서 이미 제외된 경로들은 여기서 중복 제외할 필요 없음
        // 추가로 JWT 필터에서만 제외할 경로들:
        return (path.startsWith("/api/feed") && "GET".equals(method))        // 피드 조회만 허용
                || (path.startsWith("/api/profile/user") && "GET".equals(method)) // 프로필 조회만 허용  
                || path.startsWith("/api/places")                            // 장소 API 모든 메서드 허용
                || "OPTIONS".equals(method);                                 // CORS preflight 요청
    }
}
