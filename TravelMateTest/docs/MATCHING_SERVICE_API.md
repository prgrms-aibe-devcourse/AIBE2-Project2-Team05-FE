# 여행자 파트너 매칭 서비스 API 문서

## 개요
여행자 파트너 매칭 서비스는 비슷한 여행 계획을 가진 사용자들을 연결해주는 기능을 제공합니다.

## 주요 기능
1. 호환 가능한 여행자 검색
2. 매칭 요청 전송 및 관리
3. 매칭 요청 응답 (수락/거절)
4. 매칭 현황 조회
5. 매칭 통계 (관리자용)

## API 엔드포인트

### 1. 호환 가능한 여행자 검색
```
GET /api/matches/search
```

#### Request Parameters
- `destination` (필수): 여행 목적지
- `startDate` (필수): 여행 시작일 (yyyy-MM-dd)
- `endDate` (필수): 여행 종료일 (yyyy-MM-dd)
- `travelStyle` (선택): 여행 스타일 (ADVENTURE, RELAXED, CULTURAL, BUDGET, LUXURY)
- `maxGroupSize` (선택): 최대 그룹 크기
- `page` (선택): 페이지 번호 (기본값: 0)
- `size` (선택): 페이지 크기 (기본값: 20)

#### Response
```json
[
  {
    "userId": 2,
    "nickname": "여행러버",
    "travelPlanId": 5,
    "destination": "제주도",
    "startDate": "2025-08-01",
    "endDate": "2025-08-07",
    "travelStyle": "RELAXED",
    "description": "제주도 힐링 여행",
    "budget": 1000000,
    "numberOfPeople": 2,
    "compatibilityScore": 85,
    "overlappingDays": 7
  }
]
```

### 2. 매칭 요청 전송
```
POST /api/matches/request
```

#### Request Body
```json
{
  "receiverId": 2,
  "travelPlanId": 5,
  "message": "안녕하세요! 저도 제주도 여행 계획이 있어서 함께 하면 좋을 것 같아요."
}
```

#### Response
```json
{
  "id": 1,
  "requester": {
    "id": 1,
    "nickname": "여행초보",
    "email": "user1@example.com",
    "role": "USER"
  },
  "receiver": {
    "id": 2,
    "nickname": "여행러버",
    "email": "user2@example.com",
    "role": "USER"
  },
  "travelPlanId": 5,
  "travelPlanTitle": "제주도 힐링 여행",
  "destination": "제주도",
  "status": "PENDING",
  "message": "안녕하세요! 저도 제주도 여행 계획이 있어서 함께 하면 좋을 것 같아요.",
  "createdAt": "2025-07-18T16:30:00",
  "respondedAt": null
}
```

### 3. 매칭 요청 응답
```
PUT /api/matches/request/{id}
```

#### Request Body
```json
{
  "accept": true
}
```

### 4. 받은 매칭 요청 목록 조회
```
GET /api/matches/received
```

### 5. 보낸 매칭 요청 목록 조회
```
GET /api/matches/sent
```

### 6. 활성 매칭 목록 조회
```
GET /api/matches/active
```

### 7. 매칭 통계 조회 (관리자 전용)
```
GET /api/matches/statistics
```

#### Response
```json
{
  "totalMatchRequests": 150,
  "acceptedMatchRequests": 75,
  "rejectedMatchRequests": 50,
  "pendingMatchRequests": 25,
  "activeMatches": 60,
  "successRate": 50.0,
  "generatedAt": "2025-07-18T16:30:00"
}
```

## 오류 코드

### 400 Bad Request
- 자기 자신에게 매칭 요청을 보낸 경우
- 이미 매칭 요청을 보낸 상대에게 중복 요청한 경우
- 잘못된 요청 파라미터

### 403 Forbidden
- 다른 사용자의 매칭 요청에 응답하려고 한 경우

### 404 Not Found
- 매칭 요청을 찾을 수 없는 경우
- 사용자나 여행 계획을 찾을 수 없는 경우

## 호환성 점수 계산 알고리즘
호환성 점수는 다음 요소들을 기반으로 계산됩니다:
- **목적지 매칭 (40점)**: 동일한 목적지인 경우
- **날짜 겹침 (30점)**: 여행 날짜가 겹치는 비율
- **여행 스타일 (20점)**: 동일한 여행 스타일인 경우
- **그룹 크기 (10점)**: 희망 인원수 차이에 따라

총 100점 만점으로 계산되며, 50점 이상인 경우만 검색 결과에 표시됩니다. 