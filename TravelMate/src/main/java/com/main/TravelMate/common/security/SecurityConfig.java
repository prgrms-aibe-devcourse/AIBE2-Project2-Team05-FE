package com.main.TravelMate.common.security;


import com.main.TravelMate.common.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ actuator 엔드포인트 명시적 허용
                        .requestMatchers("/actuator", "/actuator/**").permitAll()
                        // ✅ 인증 관련 엔드포인트
                        .requestMatchers("/api/admin/login", "/api/admin/signup").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/oauth/**", "/api/auth/health").permitAll()
                        // ✅ Google Places API
                        .requestMatchers("/api/places/**").permitAll()
                        .requestMatchers("/api/openai/**").permitAll()
                        
                        // ✅ 공개 프로필 조회 (닉네임 기반)
                        .requestMatchers("/api/profile/user/**").permitAll()
                        .requestMatchers("/api/profile/test/**").permitAll()
                        
                        // ✅ 인증이 필요한 엔드포인트 - ROLE_USER 명시
                        .requestMatchers("/api/plan/**").hasRole("USER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/feed/**").authenticated()
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers("/api/match/**").authenticated()
                        
                        // ✅ 나머지 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new Http403ForbiddenEntryPoint())
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 추가
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/login", "/api/admin/signup").permitAll()
                        .requestMatchers("/api/auth/**", "/api/auth/oauth/**").permitAll()
                        .requestMatchers("/api/profile/images/**").permitAll() // 이미지 파일 접근 허용
                        .requestMatchers("/api/admin/manage/user").authenticated() // 임시로 권한 완화
                        .requestMatchers("/api/admin/manage/feed").authenticated() // 임시로 권한 완화
                        .requestMatchers("/api/admin/manage/**").authenticated() // 모든 관리 API 임시로 권한 완화
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/**").hasAnyRole("USER", "GUIDE", "ADMIN")
                        .requestMatchers("/api/plan/**").authenticated()
                        .requestMatchers("/api/feed/**").authenticated()
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/match/**").authenticated()
                        .requestMatchers("/api/report/**").authenticated()
                        .requestMatchers("/api/profile/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS 설정을 정의하는 Bean
     * 프론트엔드(React)에서 백엔드(Spring Boot)로 요청을 보낼 수 있도록 허용
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 도메인 (프론트엔드 주소)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",        // 개발환경 React 주소
            "http://127.0.0.1:3000",        // 로컬호스트 다른 형태
            "https://localhost:3000"        // HTTPS로도 접근 가능하도록
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 쿠키/인증 정보 포함 허용
        configuration.setAllowCredentials(true);
        
        // 브라우저에서 접근할 수 있는 응답 헤더
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 프론트엔드 주소 허용
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        // 모든 HTTP 메서드 허용
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 모든 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Authorization 헤더 노출 (JWT 토큰용)
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        // 인증 정보 포함 허용
        configuration.setAllowCredentials(true);
        // preflight 요청 캐시 시간
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }
}