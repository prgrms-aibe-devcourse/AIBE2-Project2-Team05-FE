package com.main.TravelMate.match.exception;

/**
 * 매칭 요청을 찾을 수 없을 때 발생하는 예외
 */
public class MatchRequestNotFoundException extends RuntimeException {
    
    public MatchRequestNotFoundException(String message) {
        super(message);
    }
    
    public MatchRequestNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public MatchRequestNotFoundException(Long requestId) {
        super("매칭 요청을 찾을 수 없습니다. ID: " + requestId);
    }
}