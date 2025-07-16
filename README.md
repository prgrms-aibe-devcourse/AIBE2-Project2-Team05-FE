# AIBE2-Project2-Team05-FE

# 🧭 TravelMate - Frontend

> **여행 동반자 매칭 플랫폼 프론트엔드 레포지토리**

TravelMate는 혼자 여행하는 사용자들을 위한
**동행자/가이드 매칭 플랫폼**입니다.
이 저장소는 해당 플랫폼의 **사용자 인터페이스(UI)** 및 **화면 동작 로직**을 담당하는 프론트엔드 코드입니다.

---

## 🌐 주요 기능 (프론트엔드 기준)

* 🔐 회원가입 / 로그인 / 역할 구분 (여행자, 가이드, 관리자)
* 🗺 여행 일정 등록 / 여행 피드 생성
* 🔍 지역 + 날짜 + 관심사 기반 검색 + 매칭
* 📩 매칭 요청 / 수락 상태에 따른 버튼 제어
* 💬 채팅 UI (1:1 DM 및 그룹 채팅 지원)
* 📝 여행 후기 작성 및 평가 화면
* 📰 게시판 (동행자 모집 글 작성/조회)
* 🧑‍💼 관리자용 신고/제재 관리 페이지
* 📱 반응형 대응 (모바일/PC)

---

## 🛠 기술 스택

| 항목      | 기술                                      |
| ------- | --------------------------------------- |
| 언어      | JavaScript (ES6+), TypeScript(optional) |
| 프레임워크   | React.js (또는 JSP 템플릿 기반)                |
| 스타일링    | Tailwind CSS / Styled-Components        |
| 라우팅     | React Router / JSP 라우팅 구조               |
| API 통신  | Axios                                   |
| UI 협업 툴 | Figma, draw\.io                         |
| 상태관리    | Context API (또는 Redux 선택적)              |

---

## 📁 폴더 구조 예시

```bash
📦src
 ┣ 📂pages         # 화면 단위 구성
 ┃ ┣ 📂Home
 ┃ ┣ 📂Login
 ┃ ┣ 📂Register
 ┃ ┣ 📂TravelPlan
 ┃ ┣ 📂Feed
 ┃ ┣ 📂Match
 ┃ ┣ 📂Chat
 ┃ ┗ 📂Admin
 ┣ 📂components    # 재사용 가능한 컴포넌트
 ┣ 📂hooks         # 커스텀 훅
 ┣ 📂api           # axios 기반 API 요청 모음
 ┣ 📂styles        # CSS/Tailwind 설정
 ┣ 📂utils         # 유틸함수, 포맷터 등
 ┗ App.jsx / index.jsx
```

---

## ⚙️ 실행 방법

```bash
git clone https://github.com/your-org/travelmate-frontend.git
cd travelmate-frontend
npm install
npm start
```

* 백엔드 API 주소는 `.env` 또는 axios 인터셉터에서 설정 필요
* 예: `REACT_APP_API_BASE_URL=http://localhost:8080`

---

## 👥 팀원 (프론트엔드)

| 이름 | 역할    | 담당 화면                 |
| -- | ----- | --------------------- |
| 김민제  | 프론트 1 | 여행 일정 등록 / 피드 / 마이페이지 |
| 이석재  | 프론트 2 | 매칭 UI / 채팅 / 관리자 페이지  |

---

## ✅ 진행 상황

* [x] 로그인 / 회원가입 화면 구현
* [x] 여행 계획 등록 및 피드 생성 화면
* [ ] 매칭 결과 페이지 개발 중
* [ ] 채팅 UI 연동 예정
* [ ] 관리자용 신고 관리 페이지 설계 예정

---

## 🎯 향후 계획

* 다국어 대응 (i18n)
* 화면 로딩 애니메이션 / 로딩 스피너 최적화
* 반응형 레이아웃 개선 (모바일 UX 중심)
* 테스트 도구 도입 (React Testing Library 등)
