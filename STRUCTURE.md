# TravelMate 프로젝트 구조 가이드

## 📁 프로젝트 구조 개요

이 프로젝트는 **React 19 + TypeScript 4.9.5** 기반의 여행 동반자 매칭 플랫폼입니다.

## 🏗️ 폴더 구조

### 📂 현재 구조 (권장)
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── admin/          # 관리자 전용 컴포넌트
│   ├── common/         # 공통 컴포넌트 (모달, 에러 등)
│   ├── feed/           # 피드 관련 컴포넌트
│   ├── home/           # 홈페이지 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트 (Header, Footer, Sidebar)
├── contexts/           # React Context 제공자
├── data/              # 목 데이터 및 상수
├── hooks/             # 커스텀 React 훅
├── pages/             # 페이지 컴포넌트 (라우팅)
├── services/          # API 및 외부 서비스 호출
├── styles/            # 전역 스타일
└── types/             # TypeScript 타입 정의
```

### 📂 새로운 확장 구조 (미래)
```
src/
├── app/               # 앱 초기화, 전역 설정
├── entities/          # 비즈니스 엔티티 (User, TravelPlan 등)
├── features/          # 기능별 모듈화
│   ├── auth/          # 인증 관련 기능
│   ├── matching/      # 매칭 관련 기능
│   └── travel-plan/   # 여행 계획 관련 기능
└── shared/            # 공유 유틸리티, 컴포넌트
```

## 🎯 명명 규칙

### 📝 파일 명명
- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **페이지**: PascalCase + Page (`HomePage.tsx`)
- **서비스**: camelCase + Service/Api (`authService.ts`)
- **타입**: PascalCase (`User.ts`, `TravelPlan.ts`)
- **스타일**: PascalCase + .style (`HomePage.style.ts`)

### 📝 폴더 명명
- **소문자 kebab-case** (`travel-plan`, `user-profile`)
- **기능별 그룹화** 우선

## 🔧 설정 파일 구조

### 루트 레벨 설정
```
.env                    # 개발 환경 변수
.env.production        # 프로덕션 환경 변수
.prettierrc           # 코드 포맷팅 규칙
tsconfig.json         # TypeScript 설정
package.json          # 프로젝트 설정 및 의존성
```

### AI 도구 설정
```
.cursor/              # Cursor IDE 설정
├── mcp.json         # MCP 서버 설정
└── rules/           # 코딩 규칙
.taskmaster/         # Taskmaster 작업 관리
└── tasks/           # 작업 정의
```

## 🚀 최적화 전략

### 📦 Import 최적화
```typescript
// ✅ 절대 경로 사용 (tsconfig.json paths 설정)
import { UserProfile } from '@/components/UserProfile';
import { authService } from '@/services/authService';

// ❌ 상대 경로 지양
import { UserProfile } from '../../../components/UserProfile';
```

### 🔄 컴포넌트 구조
```typescript
// ✅ 권장 구조
export default function ComponentName() {
  // 1. 훅 및 상태
  const [state, setState] = useState();
  
  // 2. 이벤트 핸들러
  const handleClick = () => {};
  
  // 3. 렌더링
  return <div>...</div>;
}
```

### 📁 기능별 모듈화 (향후)
```
features/auth/
├── components/        # 인증 관련 컴포넌트
├── hooks/            # 인증 관련 훅
├── services/         # 인증 API
└── types/            # 인증 타입
```

## 🎨 스타일링 전략

### 💅 Styled Components
```typescript
// ✅ 파일별 스타일 분리
import * as S from './HomePage.style';

// ✅ 명확한 네이밍
const UserCard = styled.div`
  display: flex;
  flex-direction: column;
`;
```

## 📊 성능 최적화

### ⚡ 코드 스플리팅
```typescript
// ✅ 페이지 레벨 지연 로딩
const HomePage = lazy(() => import('./pages/HomePage'));
```

### 🎯 메모이제이션
```typescript
// ✅ 무거운 연산 최적화
const expensiveValue = useMemo(() => heavyCalculation(data), [data]);
```

## 🔍 타입 안전성

### 📋 엄격한 타입 정의
```typescript
// ✅ 명확한 인터페이스
interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}
```

## 🧪 테스트 전략

### 📂 테스트 구조
```
src/
├── __tests__/         # 통합 테스트
├── components/
│   └── UserProfile/
│       ├── UserProfile.tsx
│       └── UserProfile.test.tsx
```

## 📚 추가 리소스

- [React 19 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Styled Components 가이드](https://styled-components.com/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**📝 업데이트**: 2025-01-25 - React 19 환경에 맞는 최신 구조 가이드 