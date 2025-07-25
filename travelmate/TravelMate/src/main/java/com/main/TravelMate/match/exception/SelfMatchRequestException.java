package com.main.TravelMate.match.exception;

/**
 * 자기 자신에게 매칭 요청을 보낼 때 발생하는 예외
 */
public class SelfMatchRequestException extends RuntimeException {
    
    public SelfMatchRequestException(String message) {
        super(message);
    }
    
    public SelfMatchRequestException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public SelfMatchRequestException(Long userId) {
        super("자신에게는 매칭 요청을 보낼 수 없습니다. 사용자 ID: " + userId);
    }
}