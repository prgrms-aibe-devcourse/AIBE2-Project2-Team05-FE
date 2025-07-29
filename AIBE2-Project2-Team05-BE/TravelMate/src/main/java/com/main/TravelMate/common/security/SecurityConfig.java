package com.main.TravelMate.common.security;


import com.main.TravelMate.common.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/users/signup")    // 회원가입만 Spring Security에서 완전 제외
                .requestMatchers("/api/auth/login")      // 로그인만 제외  
                .requestMatchers("/uploads/**")          // 파일 업로드 경로 제외
                .requestMatchers("/api/profile/create/**")  // 프로필 생성 API 제외
                .requestMatchers("/api/profile/create-all")  // 프로필 일괄 생성 API 제외
                .requestMatchers("/api/places/**")       // 장소 API 제외 (Google Places API)
                .requestMatchers("/api/feed/migrate-ids") // 마이그레이션 API 제외
                .requestMatchers("/api/feed/migration-status") // 마이그레이션 상태 확인 API 제외
                // ✅ 매칭 API 제거 - 이제 인증이 필요한 API로 처리
                .requestMatchers("/actuator/**");        // actuator 제외
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 🔓 공개 API (인증 불필요)
                        .requestMatchers("/api/users/signup").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        // 🔧 프로필 생성 API (테스트용)
                        .requestMatchers("/api/profile/create/**").permitAll()
                        .requestMatchers("/api/profile/create-all").permitAll()
                        // 🔧 프로필 조회 API (매칭에서 상대방 정보 조회용)
                        .requestMatchers("/api/profile/**").permitAll()
                        // 🗺️ 장소 API (Google Places API)
                        .requestMatchers("/api/places/**").permitAll()
                        // 🔧 마이그레이션 API (데이터 업데이트용)
                        .requestMatchers("/api/feed/migrate-ids").permitAll()
                        .requestMatchers("/api/feed/migration-status").permitAll()
                        // 🔧 여행계획 관리 API (데이터 업데이트용)
                        .requestMatchers("/api/plan/update-current-people").permitAll()
                        // 🔒 읽기 전용 공개 API (피드, 프로필 조회 등)
                        .requestMatchers(HttpMethod.GET, "/api/feed/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/user/**").permitAll()
                        // 🌟 후기 조회 API (읽기 전용 공개)
                                        .requestMatchers(HttpMethod.GET, "/api/review/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // CORS preflight
                // 🔐 나머지는 모두 인증 필요 (매칭 API 포함)
                .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 프론트엔드 주소 허용 (명시적으로 설정)
        configuration.addAllowedOrigin("http://localhost:3000");        // 개발환경 React 주소
        configuration.addAllowedOrigin("http://127.0.0.1:3000");        // 로컬호스트 다른 형태  
        configuration.addAllowedOrigin("https://localhost:3000");       // HTTPS로도 접근 가능하도록
        
        // 모든 HTTP 메서드 허용 (명시적으로 설정)
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedMethod("OPTIONS");
        configuration.addAllowedMethod("PATCH");
        
        // 모든 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Authorization 헤더 노출 (JWT 토큰용) + 팀원 프로젝트 헤더 추가
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
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