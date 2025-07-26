# 프로젝트 병합 가이드라인

## 개요
현재 프로젝트와 팀원들의 AIBE2-Project2-Team05-FE-part2_page 프로젝트를 통합하는 작업을 위한 가이드라인입니다.

## 브랜치 전략
- **작업 브랜치**: `feature/project-merge`
- **백업 브랜치**: `backup/pre-merge-state`
- **백업 태그**: `v1.0.0-pre-merge-current`

## 충돌 해결 우선순위

### 1. 높은 우선순위 (팀원 프로젝트에서 채택)
- **관리 페이지들**: 완전히 구현된 관리 시스템
  - FeedManagement.tsx
  - ReportManagement.tsx
  - UserManagement.tsx
  - NotificationManagement.tsx
- **차트 기능**: Chart.js 및 react-chartjs-2를 활용한 대시보드
  - Dashboard.tsx (팀원 버전 채택)
- **고도화된 프로필 페이지**: ProfilePage.tsx (36KB)

### 2. 중간 우선순위 (현재 프로젝트 유지 + 추가 기능)
- **AI 추천 기능**: AIRecommendationSection.tsx
- **장소 관련 기능**: PlaceDetailModal.tsx, NearbyRecommendations.tsx
- **여행 계획 페이지**: PlanPage.tsx, PlanWritePage.tsx

### 3. 디자인 시스템
- **유지**: styled-components 기반 일관된 디자인
- **색상**: #3682F8 메인 색상 유지
- **폰트**: Pretendard 폰트 유지

## 병합 순서

1. **의존성 통합** (태스크 2)
   - package.json 병합
   - 새로운 의존성 설치 (chart.js, react-chartjs-2 등)

2. **TypeScript 및 설정 통합** (태스크 3)
   - tsconfig.json 병합
   - 환경 변수 통합

3. **스타일 시스템 통합** (태스크 4)
   - CSS → styled-components 변환
   - 디자인 시스템 일관성 유지

4. **기능별 통합** (태스크 5-10)
   - 차트 기능 추가
   - 관리자 기능 통합
   - 프로필 페이지 고도화
   - AI 기능 보존

5. **테스트 및 최적화** (태스크 11-12)

## 충돌 발생 시 해결 기준

1. **기능 완전성 우선**: 더 완전하게 구현된 기능을 채택
2. **현재 디자인 시스템 유지**: styled-components 스타일 우선
3. **AI 기능 보존**: 현재 프로젝트의 고유 기능
4. **관리 기능 채택**: 팀원 프로젝트의 완전한 관리 시스템

## 백업 및 복원

### 백업 확인
```bash
git tag --list | grep pre-merge
git branch --list | grep backup
```

### 복원 방법
```bash
# 완전 복원
git reset --hard v1.0.0-pre-merge-current

# 특정 파일만 복원
git checkout v1.0.0-pre-merge-current -- [파일경로]

# 백업 브랜치로 전환
git checkout backup/pre-merge-state
```

## 진행 상황 추적
- TaskMaster를 통한 작업 진행도 관리
- 각 서브태스크별 상세 로깅
- 충돌 해결 내역 문서화

## 주의사항
- 백업 없이는 절대 원본 파일 삭제 금지
- 주석 처리를 통한 임시 비활성화 후 점진적 정리
- 병합 후 반드시 전체 기능 테스트 수행 