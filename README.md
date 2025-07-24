# 🧳 TravelMate - 여행 동반자 매칭 플랫폼

> **AI 기반 여행 계획 및 동반자 매칭 소셜 플랫폼**

여행을 계획하고, AI의 도움을 받아 개인화된 추천을 받으며, 비슷한 관심사를 가진 여행 동반자를 찾아 함께 여행을 떠날 수 있는 종합 여행 플랫폼입니다.

---

## 📱 주요 기능

### 🎯 **여행 계획 관리**

- **📝 여행 계획 작성**: 목적지, 일정, 예산, 스타일 등을 포함한 상세 여행 계획 작성
- **🤖 AI 추천 시스템**: OpenAI 기반으로 실제 방문 장소 분석하여 맞춤 해시태그 5개와 근처 가볼만한 곳 9개(맛집/액티비티/관광명소 각 3개) 추천
- **📍 지도 연동**: 카카오맵 API로 여행지 위치 확인 및 경로 계획
- **📊 계획 상세보기**: 일정별 상세 정보, AI 추천 해시태그, 근처 관광지 정보 제공

### 👥 **소셜 기능**

- **🔍 동반자 매칭**: 여행 스타일, 목적지, 일정 기반 동반자 추천 및 매칭
- **💬 실시간 채팅**: WebSocket 기반 개인/그룹 채팅
- **📱 피드 시스템**: 여행 계획이 자동으로 피드로 공유, 좋아요/댓글 기능
- **👤 프로필 관리**: 개인 프로필, 여행 스타일, 관심사 설정

### 🔐 **사용자 관리**

- **🚪 회원가입/로그인**: JWT 기반 보안 인증
- **⭐ 후기 시스템**: 여행 후 동반자 평가 및 후기 작성
- **🛡️ 신고 관리**: 부적절한 사용자/콘텐츠 신고 및 관리자 처리

### 🎨 **UX/UI 특징**

- **📱 반응형 디자인**: 모바일/데스크톱 최적화
- **🎭 모달 시스템**: 여행 계획 상세보기는 모달로 표시 (스크롤바 숨김)
- **🎨 일관된 디자인**: styled-components 기반 통일된 디자인 시스템
- **⚡ 부드러운 애니메이션**: Framer Motion으로 자연스러운 페이지 전환

---

## 🛠 기술 스택

### **Frontend**

| 카테고리       | 기술                       | 설명                         |
| -------------- | -------------------------- | ---------------------------- |
| **Core**       | React 19.1.0 + TypeScript  | 모던 React 함수형 컴포넌트   |
| **라우팅**     | React Router Dom 6.14.0    | SPA 라우팅 및 페이지 관리    |
| **스타일링**   | Styled-Components 6.0.0    | CSS-in-JS 스타일링           |
| **애니메이션** | Framer Motion 12.23.6      | 페이지 전환 및 UI 애니메이션 |
| **상태관리**   | React Context + useState   | 간단한 전역 상태 관리        |
| **알림**       | React Hot Toast 2.5.2      | 사용자 피드백 토스트         |
| **지도**       | React Kakao Maps SDK 1.2.0 | 카카오맵 API 연동            |
| **HTTP**       | Axios 1.10.0               | API 통신                     |
| **폼**         | Formik 2.4.6 + Yup 1.6.1   | 폼 관리 및 유효성 검증       |
| **실시간**     | WebSocket + STOMP          | 실시간 채팅                  |

### **Backend** (Java Spring Boot)

| 기술                      | 설명                     |
| ------------------------- | ------------------------ |
| **Java 17**               | 최신 LTS 버전            |
| **Spring Boot 3.x**       | 백엔드 프레임워크        |
| **Spring Security + JWT** | 인증/인가 시스템         |
| **Spring Data JPA**       | ORM 및 데이터베이스 관리 |
| **MySQL**                 | 관계형 데이터베이스      |
| **WebSocket**             | 실시간 채팅              |

### **외부 API**

| API                   | 용도                        |
| --------------------- | --------------------------- |
| **OpenAI API**        | AI 해시태그 추천, 장소 추천 |
| **카카오맵 API**      | 지도 및 위치 서비스         |
| **Google Places API** | 장소 검색                   |
| **Unsplash API**      | 고품질 여행 이미지          |

---

## 📁 프로젝트 구조

```
📦 AIBE2-Project2-Team05-FE/
├── 📂 src/
│   ├── 📂 components/          # 재사용 가능한 컴포넌트
│   │   ├── 📂 common/          # 공통 컴포넌트
│   │   ├── 📂 layout/          # 레이아웃 컴포넌트
│   │   ├── 📂 feed/            # 피드 관련 컴포넌트
│   │   └── 📂 home/            # 홈페이지 컴포넌트
│   ├── 📂 pages/               # 페이지 컴포넌트
│   │   ├── HomePage.tsx        # 홈 페이지
│   │   ├── PlanWritePage.tsx   # 여행 계획 작성 (🤖 AI 연동)
│   │   ├── PlanPage.tsx        # 여행 계획 상세보기
│   │   ├── ProfilePage.tsx     # 사용자 프로필
│   │   ├── MyPage.tsx          # 내 정보 관리
│   │   ├── MatchPage.tsx       # 동반자 매칭
│   │   ├── ChatPage.tsx        # 채팅
│   │   ├── FeedListPage.tsx    # 피드 목록
│   │   └── FeedDetailPage.tsx  # 피드 상세
│   ├── 📂 services/            # API 서비스
│   │   ├── openaiApi.ts        # 🤖 OpenAI API 연동
│   │   ├── googlePlacesApi.ts  # Google Places API
│   │   ├── travelPlanApi.ts    # 여행 계획 API
│   │   └── api.ts              # 기본 API 설정
│   ├── 📂 contexts/            # React Context
│   ├── 📂 hooks/               # 커스텀 훅
│   ├── 📂 types/               # TypeScript 타입 정의
│   └── 📂 styles/              # 글로벌 스타일
├── 📂 legacy/                  # 기존 HTML 파일들 (참고용)
├── 📂 public/                  # 정적 파일
└── 📂 AIBE2-Project2-Team05-BE-feature-kimh/  # 백엔드 프로젝트
```

---

## 🚀 빠른 시작 가이드

### 1️⃣ **프로젝트 클론 및 의존성 설치**

```bash
# 프로젝트 클론
git clone [repository-url]
cd AIBE2-Project2-Team05-FE

# 의존성 설치
npm install
```

### 2️⃣ **환경 변수 설정**

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# ✅ 필수: OpenAI API (AI 추천 기능)
REACT_APP_OPENAI_API_KEY=sk-your-openai-api-key-here

# 선택사항: 다른 API들 (기본값으로 동작 가능)
REACT_APP_KAKAO_MAP_API_KEY=your-kakao-map-key
REACT_APP_GOOGLE_PLACES_API_KEY=your-google-places-key
REACT_APP_UNSPLASH_ACCESS_KEY=your-unsplash-key
```

#### 🔑 **OpenAI API 키 발급 방법**

1. [OpenAI Platform](https://platform.openai.com/account/api-keys) 방문
2. 계정 생성 또는 로그인
3. **"Create new secret key"** 클릭
4. API 키 복사 (형식: `sk-xxxxxxxxx
5. `.env` 파일에 추가

⚠️ **중요**: API 키는 절대 Git에 커밋하지 마세요! `.env` 파일은 이미 `.gitignore`에 포함되어 있습니다.

### 3️⃣ **백엔드 서버 실행**

백엔드 서버는 Spring Boot로 구성되어 있으며, 다음 단계로 실행할 수 있습니다:

#### **3-1. 백엔드 환경 변수 설정**

백엔드 디렉토리에도 `.env` 파일을 생성해야 합니다:

```bash
# 백엔드 디렉토리로 이동
cd AIBE2-Project2-Team05-BE-feature-kimh/TravelMate

# .env 파일 생성
touch .env
```

`.env` 파일에 다음 내용을 추가하세요:

```env
# Google Places API (백엔드에서 사용)
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here

# 선택사항: 다른 API 키들
REACT_APP_KAKAO_MAP_API_KEY=your-kakao-map-key
REACT_APP_GOOGLE_PLACES_API_KEY=your-google-places-key
```

#### **3-2. MySQL 데이터베이스 설정**

백엔드는 MySQL 데이터베이스를 사용합니다:

1. **MySQL 설치 및 실행**

   ```bash
   # macOS (Homebrew)
   brew install mysql
   brew services start mysql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql

   # Windows
   # MySQL Community Server 다운로드 및 설치
   ```

2. **데이터베이스 생성**

   ```sql
   # MySQL에 로그인
   mysql -u root -p

   # 데이터베이스 생성
   CREATE DATABASE travel_mate_db;

   # 사용자 생성 및 권한 부여 (선택사항)
   CREATE USER 'travelmate'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON travel_mate_db.* TO 'travelmate'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### **3-3. 백엔드 서버 실행**

```bash
# 백엔드 디렉토리에서
cd AIBE2-Project2-Team05-BE-feature-kimh/TravelMate

# 방법 1: start.sh 스크립트 사용 (권장)
./start.sh

# 방법 2: Gradle 직접 실행
./gradlew bootRun
```

**백엔드 서버**: `http://localhost:8080`

#### **3-4. 백엔드 동작 확인**

서버가 정상적으로 실행되면 다음 URL로 API 테스트:

- 헬스체크: `http://localhost:8080/api/places/health`
- API 문서: `http://localhost:8080` (Swagger UI 예정)

### 4️⃣ **프론트엔드 실행**

```bash
# 프론트엔드 디렉토리에서
npm start
```

**프론트엔드 서버**: `http://localhost:3000`

브라우저가 자동으로 열리며 애플리케이션에 접속할 수 있습니다.

---

## 📖 주요 기능 사용법

### 🤖 **AI 기능 테스트하기**

1. **여행 계획 작성** (`/plan/write`)
   - 여행 제목, 목적지, 일정 입력
   - 여행 스타일 선택 (계획적/즉흥적, 관광/휴식 등)
   - 상세 일정에 **실제 방문할 장소들** 입력 (예: "경복궁", "명동", "홍대")
   - 저장 시 AI가 자동으로 분석

2. **AI 추천 결과 확인**
   - **해시태그 5개**: 실제 방문 장소 기반 구체적인 해시태그
   - **근처 가볼만한 곳 9개**: 맛집 3개 + 액티비티 3개 + 관광명소 3개

### 📱 **소셜 기능 테스트**

1. **프로필 설정** (`/mypage`)
   - 닉네임, 나이, 여행 스타일 설정
   - 설정한 정보가 여행 계획과 피드에 반영됨

2. **동반자 매칭** (`/match`)
   - 여행 스타일, 목적지, 일정으로 필터링
   - 매칭 요청 및 채팅 시작

3. **피드 시스템** (`/feed`, `/profile`)
   - 작성한 여행 계획이 자동으로 피드에 게시
   - 프로필 페이지에서 피드 클릭 시 여행 계획 모달로 표시

---

## 🧪 테스트 시나리오

### **Scenario 1: 전체 시스템 테스트 (백엔드 + 프론트엔드)**

```
1. 백엔드 서버 실행 확인:
   - http://localhost:8080/api/places/health 접속
   - "OK" 응답 확인

2. 프론트엔드 접속:
   - http://localhost:3000 접속
   - 회원가입/로그인 테스트

3. API 연동 테스트:
   - Google Places API 동작 확인
   - 백엔드와 프론트엔드 통신 확인
```

### **Scenario 2: AI 추천 기능**

```
1. /plan/write 접속
2. 제목: "서울 3일 문화탐방"
3. 목적지: "서울"
4. 일정에 실제 장소 입력:
   - 경복궁, 인사동, 명동, 홍대, 이태원
5. 저장 후 AI 추천 확인:
   - 해시태그: #서울경복궁투어, #인사동전통문화, #명동쇼핑, #홍대나이트, #이태원글로벌
   - 근처 추천: 각 지역 맛집/액티비티/관광명소
```

### **Scenario 3: 소셜 기능**

```
1. /mypage에서 프로필 설정
2. /plan/write에서 여행 계획 작성
3. /profile에서 내 피드 확인
4. 피드 클릭 → 여행 계획 모달 표시
5. /match에서 다른 사용자 여행 계획 확인
```

---

## 🐛 문제 해결

### **프론트엔드 문제들**

1. **포트 3000이 이미 사용 중**

   ```bash
   npx kill-port 3000
   npm start
   ```

2. **OpenAI API 오류**
   - 프론트엔드 `.env` 파일의 API 키 확인
   - OpenAI 계정 크레딧 잔액 확인
   - API 키가 없어도 기본 추천으로 동작

3. **지도가 표시되지 않음**
   - 카카오맵 API 키 확인
   - 도메인 설정 확인

### **백엔드 문제들**

4. **백엔드 서버 실행 오류**

   ```bash
   # 권한 문제 해결
   chmod +x ./gradlew
   chmod +x ./start.sh

   # Java 버전 확인 (Java 17 필요)
   java -version
   ```

5. **MySQL 연결 오류**
   - MySQL 서버가 실행 중인지 확인: `brew services list | grep mysql`
   - 데이터베이스 `travel_mate_db`가 존재하는지 확인
   - `application.yml`의 DB 설정 확인

6. **Google Places API 오류 (백엔드)**
   - 백엔드 `.env` 파일의 `GOOGLE_PLACES_API_KEY` 확인
   - API 키 활성화 및 Places API 권한 확인

7. **백엔드 연결 오류**
   - 백엔드 서버가 실행 중인지 확인 (`http://localhost:8080`)
   - CORS 설정 확인
   - 포트 8080이 사용 가능한지 확인: `npx kill-port 8080`

---

## 👥 팀 정보

### **Frontend Team**

| 이름    | 역할          | 주요 담당               |
| ------- | ------------- | ----------------------- |
| 김민지  | Frontend Lead | UI/UX, 라우팅, 상태관리 |
| [팀원2] | Frontend      | 컴포넌트, API 연동      |
| [팀원3] | Frontend      | 스타일링, 반응형        |

### **Backend Team**

| 이름   | 역할    | 주요 담당         |
| ------ | ------- | ----------------- |
| 남정현 | Backend | 채팅 시스템       |
| 조민귀 | Backend | 매칭 시스템, 후기 |
| 김현승 | Backend | 관리자, 인증      |

---

## 📝 추가 정보

### **주요 명령어**

```bash
npm start          # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm test           # 테스트 실행
npm run eject      # CRA 설정 추출 (주의!)
```

### **참고 문서**

- [React 공식 문서](https://reactjs.org/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Styled Components 문서](https://styled-components.com/)
- [OpenAI API 문서](https://platform.openai.com/docs/)
- [카카오맵 API 문서](https://apis.map.kakao.com/)

---

## 🚀 배포 및 프로덕션

현재는 개발 환경에서 테스트 가능하며, 향후 배포를 위해서는:

- 환경별 설정 파일 분리
- CI/CD 파이프라인 구축
- 도메인 및 HTTPS 설정
- 백엔드 API 서버 배포

---

**🎯 Happy Coding & Happy Traveling! 🧳✈️**
