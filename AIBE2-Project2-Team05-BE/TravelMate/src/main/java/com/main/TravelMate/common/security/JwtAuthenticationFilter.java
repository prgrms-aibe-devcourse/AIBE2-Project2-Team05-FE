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

        String path = request.getRequestURI();
        String method = request.getMethod();
        logger.info("🔍 JWT 필터 - 요청: {} {}", method, path);
        logger.info("🔍 Authorization 헤더: {}", request.getHeader("Authorization"));

        String token = resolveToken(request);
        if (token != null) {
            logger.info("🎫 토큰 발견: {}...", token.substring(0, Math.min(token.length(), 20)));
            
            if (jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
                logger.info("✅ 토큰 검증 성공 - 사용자: {}", auth.getName());
                logger.info("🔐 SecurityContext 설정 완료 - Principal: {}", auth.getPrincipal());
                logger.info("🔑 권한: {}", auth.getAuthorities());
            } else {
                logger.warn("❌ 토큰 검증 실패");
            }
        } else {
            logger.info("🚫 토큰 없음");
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
        return path.equals("/api/admin/login")
                || path.equals("/api/admin/signup")
                || path.startsWith("/api/auth")
                || path.startsWith("/actuator")
                || path.startsWith("/api/places");
    }
}
