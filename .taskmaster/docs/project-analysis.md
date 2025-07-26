# 프로젝트 구조 분석 문서

## 개요
현재 프로젝트(`/Users/kmj/Documents/GitHub/AIBE2-Project2-Team05-FE`)와 팀원들 프로젝트(`AIBE2-Project2-Team05-FE-part2_page`)의 상세 구조 분석 및 비교

## 1. 현재 프로젝트 구조 분석

### 주요 컴포넌트 (현재 프로젝트만 보유)
- `AIRecommendationSection.tsx` (18KB) - AI 기반 여행지 추천 기능
- `NearbyRecommendations.tsx` (14KB) - 근처 장소 추천 기능  
- `PlaceDetailModal.tsx` (18KB) - 장소 상세 정보 모달

### 특징적 기능
- styled-components 기반 일관된 디자인 시스템
- AI 추천 알고리즘 통합
- 장소 상세 모달 시스템
- 완전한 여행 계획 페이지 구현

## 2. 팀원들 프로젝트 구조 분석

### 주요 특징 (팀원들 프로젝트만 보유)
- Chart.js/react-chartjs-2 차트 라이브러리 포함
- 고도화된 관리자 대시보드 (Dashboard.tsx 18KB vs 6.4KB)
- 완전한 관리 페이지들:
  - FeedManagementPage.tsx (12KB vs 344B)
  - ReportManagementPage.tsx (17KB vs 462B)  
  - UserManagementPage.tsx (13KB vs 330B)
- 향상된 프로필 페이지 (ProfilePage.tsx 36KB vs 24KB)

### CSS 파일 사용
- MatchPage.css (4.7KB, 286 lines)
- MatchRecommendPage.css (19KB, 950 lines)

## 3. 공통 파일 크기 비교

### 페이지 파일 크기 비교
| 파일명 | 현재 프로젝트 | 팀원들 프로젝트 | 차이점 |
|--------|---------------|-----------------|--------|
| Dashboard.tsx | 6.4KB (273 lines) | 18KB (686 lines) | **차트 기능 포함** |
| MatchPage.tsx | 25KB (967 lines) | 15KB (660 lines) | 현재가 더 완전함 |
| MatchRecommendPage.tsx | 79KB (2608 lines) | 33KB (1003 lines) | **현재가 매우 크고 완전함** |
| PlanPage.tsx | 56KB (1685 lines) | 29KB (932 lines) | **현재가 더 완전함** |
| PlanWritePage.tsx | 51KB (1444 lines) | 37KB (1091 lines) | **현재가 더 완전함** |
| ProfilePage.tsx | 24KB (969 lines) | 36KB (1375 lines) | **팀원들이 더 고도화됨** |
| MyPage.tsx | 21KB (782 lines) | 28KB (1039 lines) | 팀원들이 더 완전함 |

## 4. package.json 의존성 비교

### 현재 프로젝트만 보유한 기능
- (차이점 없음 - 거의 동일)

### 팀원들 프로젝트 추가 의존성
```json
{
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0"
}
```

## 5. 스타일 시스템 비교

### 현재 프로젝트
- 완전한 styled-components 기반
- 일관된 디자인 시스템
- 테마 및 글로벌 스타일 적용

### 팀원들 프로젝트  
- 주로 styled-components 사용
- 일부 CSS 파일 혼재 (MatchPage.css, MatchRecommendPage.css)
- 차트 관련 스타일 추가

## 6. 핵심 차이점 요약

### 현재 프로젝트의 강점
1. ✅ AI 추천 기능 (AIRecommendationSection)
2. ✅ 근처 장소 추천 (NearbyRecommendations)  
3. ✅ 장소 상세 모달 (PlaceDetailModal)
4. ✅ 더 완전한 여행 계획 페이지들
5. ✅ 더 완전한 매칭 추천 페이지
6. ✅ 일관된 styled-components 기반 디자인

### 팀원들 프로젝트의 강점
1. ✅ 차트 기능이 포함된 고도화된 대시보드
2. ✅ 완전한 관리 페이지들 (피드, 신고, 사용자 관리)
3. ✅ 더 고도화된 프로필 페이지
4. ✅ 더 완전한 마이페이지

## 7. 병합 전략 제안

### 우선 보존할 기능 (현재 프로젝트)
- AI 추천 시스템
- 여행 계획 관련 모든 페이지
- 매칭 추천 페이지
- 장소 상세 모달
- styled-components 디자인 시스템

### 통합할 기능 (팀원들 프로젝트)
- 차트 라이브러리 및 고도화된 대시보드
- 완전한 관리 페이지들
- 고도화된 프로필/마이페이지 기능
- CSS 파일들을 styled-components로 변환

## 8. 잠재적 충돌 파일 목록

### 높은 충돌 위험
1. `Dashboard.tsx` - 크기 차이 큼 (6.4KB vs 18KB)
2. `ProfilePage.tsx` - 기능 차이 큼 (24KB vs 36KB)
3. `MyPage.tsx` - 기능 차이 존재 (21KB vs 28KB)
4. 관리 페이지들 - 완전성 차이 큼

### 중간 충돌 위험
1. `package.json` - 차트 라이브러리 추가 필요
2. `HomePage.tsx` - 크기 차이 (2.7KB vs 4.3KB)  
3. `App.tsx` - 라우팅 차이 가능성

### 낮은 충돌 위험
- 기타 대부분의 파일들 (크기 차이 미미)

## 다음 단계
1. Git diff 도구로 정확한 파일별 차이점 분석
2. 충돌 파일들의 세부 내용 비교
3. 병합 우선순위 및 전략 수립 