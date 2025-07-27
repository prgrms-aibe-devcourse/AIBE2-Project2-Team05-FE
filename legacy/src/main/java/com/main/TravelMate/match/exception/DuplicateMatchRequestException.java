package com.main.TravelMate.match.exception;

/**
 * 중복 매칭 요청 시 발생하는 예외
 */
public class DuplicateMatchRequestException extends RuntimeException {
    
    public DuplicateMatchRequestException(String message) {
        super(message);
    }
    
    public DuplicateMatchRequestException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public DuplicateMatchRequestException(Long requesterId, Long receiverId) {
        super("이미 매칭 요청을 보낸 상대입니다. 요청자: " + requesterId + ", 수신자: " + receiverId);
    }
}