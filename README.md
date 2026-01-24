<div align="center">

# 🚀 AlphaBoard

### 글로벌 투자자를 위한 올인원 금융 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br />

**실시간 글로벌 주식 시세** | **AI 기반 뉴스 요약** | **투자자 커뮤니티**

한국과 미국 주식 정보를 한눈에, 직관적인 UI로 제공합니다.

<br />

[주요 기능](#-주요-기능) •
[기술 스택](#-기술-스택) •
[설치 방법](#-설치-방법) •
[프로젝트 구조](#-프로젝트-구조) •
[기여 방법](#-기여-방법)

</div>

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [스크린샷](#-스크린샷)
- [기술 스택](#-기술-스택)
- [설치 방법](#-설치-방법)
- [환경 변수](#-환경-변수)
- [프로젝트 구조](#-프로젝트-구조)
- [API 구조](#-api-구조)
- [기여 방법](#-기여-방법)
- [라이선스](#-라이선스)

---

## ✨ 주요 기능

### 🔐 사용자 인증
> Firebase Authentication 기반의 안전한 인증 시스템

- **Google OAuth 2.0** 소셜 로그인
- 신규 가입자를 위한 **온보딩 플로우**
- 프로필 관리 및 설정

---

### 📰 실시간 뉴스 피드
> 글로벌 금융 뉴스를 실시간으로 확인

- 카테고리별 뉴스 분류 (종합, 속보, 분석, 암호화폐, 경제지표)
- **Claude AI 기반 뉴스 요약** - 길고 복잡한 기사를 핵심만 요약
- **원문/번역 토글** - 영어 뉴스를 한글로 번역하여 제공
- 출처 로고 및 발행 시간 표시

---

### 💹 실시간 시세 조회
> 한국투자증권 API 연동으로 실시간 시세 제공

- **한국 주식** (KOSPI, KOSDAQ) 실시간 시세
- **미국 주식** (NYSE, NASDAQ) 실시간 시세
- **4대 지수** 위젯 (코스피, 코스닥, 다우, 나스닥)
- 인터랙티브 **차트** (일/주/월/년 기간별)
- 종목별 상세 정보 페이지

---

### 👥 투자자 커뮤니티
> 투자자들과 소통하는 타임라인 피드

- **게시글 CRUD** - 작성, 수정, 삭제 (1시간 이내)
- **댓글 시스템** - 게시글에 댓글 작성/수정/삭제
- **좋아요 기능** - 마음에 드는 게시글에 좋아요
- **종목 태그** - 게시글에 종목 태깅 ($AAPL, $005930)
- **실시간 시세 카드** - 태그된 종목의 현재가 표시
- **게시글 상세 모달** - 클릭 시 상세 내용 확인

---

### ⭐ 관심종목 관리
> 나만의 워치리스트 구성

- 종목 검색 및 관심종목 추가
- 관심종목 목록에서 실시간 시세 확인
- 드래그 앤 드롭으로 순서 변경

---

### 🔔 가격 알림
> 목표가 도달 시 즉시 알림

- 종목별 **목표가 설정**
- 상승/하락 알림 조건 선택
- 알림 히스토리 관리

---

### 🏢 회사 정보
> Wikipedia API 연동 회사 소개

- **미국 주식**: Wikipedia에서 회사 정보 자동 조회
- 회사 개요, 설립일, 본사 위치 등 기본 정보 제공

---

### 🔍 종목 검색
> 빠르고 정확한 종목 검색

- **한글/영문** 종목명 검색
- **티커 코드** 검색
- 검색 결과에서 바로 종목 페이지 이동

---

### 🌙 다크모드
> 눈의 피로를 줄이는 다크 테마

- 시스템 테마 자동 감지
- 수동 테마 전환 지원

---

## 📸 스크린샷

<div align="center">

| 뉴스 피드 | 시세 조회 |
|:---:|:---:|
| *스크린샷 추가 예정* | *스크린샷 추가 예정* |

| 커뮤니티 | 종목 상세 |
|:---:|:---:|
| *스크린샷 추가 예정* | *스크린샷 추가 예정* |

</div>

---

## 🛠 기술 스택

<details open>
<summary><b>Frontend</b></summary>

<br />

| 기술 | 버전 | 설명 |
|:---|:---:|:---|
| ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white) | 16 | React 풀스택 프레임워크 (App Router) |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | 19 | UI 라이브러리 |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | 5 | 정적 타입 언어 |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | 4 | 유틸리티 퍼스트 CSS 프레임워크 |
| ![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat-square) | 5 | 경량 상태 관리 라이브러리 |
| ![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square) | 3 | React 차트 라이브러리 |

</details>

<details open>
<summary><b>Backend & Database</b></summary>

<br />

| 기술 | 설명 |
|:---|:---|
| ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) | PostgreSQL 기반 BaaS (데이터베이스, 실시간 구독) |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) | 인증 (Authentication) |

</details>

<details open>
<summary><b>External APIs</b></summary>

<br />

| API | 용도 |
|:---|:---|
| 한국투자증권 OpenAPI | 한국/미국 주식 실시간 시세 |
| Claude AI (Anthropic) | 뉴스 AI 요약 및 번역 |
| Wikipedia API | 회사 정보 조회 |

</details>

<details>
<summary><b>개발 도구</b></summary>

<br />

| 도구 | 설명 |
|:---|:---|
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) | 코드 린팅 |
| ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black) | 코드 포맷팅 |
| ![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white) | 패키지 매니저 |

</details>

---

## 🚀 설치 방법

### 사전 요구사항

- Node.js 18.17 이상
- npm, yarn, 또는 pnpm

### 1단계: 저장소 클론

```bash
git clone https://github.com/your-username/alphaboard.git
cd alphaboard
```

### 2단계: 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3단계: 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 필요한 환경 변수를 설정합니다.

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속합니다.

---

## ⚙️ 환경 변수

<details>
<summary><b>필수 환경 변수</b></summary>

<br />

| 변수명 | 설명 |
|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase 설정 값들 |
| `KIS_APP_KEY` | 한국투자증권 API App Key |
| `KIS_APP_SECRET` | 한국투자증권 API App Secret |
| `ANTHROPIC_API_KEY` | Claude AI API Key |

</details>

<details>
<summary><b>환경 변수 설정 가이드</b></summary>

<br />

#### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Project Settings > API에서 URL과 anon key 복사

#### Firebase 설정
1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Authentication > Sign-in method > Google 활성화
3. 프로젝트 설정에서 웹 앱 추가 후 config 값 복사

#### 한국투자증권 API 설정
1. [한국투자증권 OpenAPI](https://apiportal.koreainvestment.com)에서 계정 생성
2. 앱 등록 후 App Key와 App Secret 발급

</details>

---

## 📁 프로젝트 구조

```
alphaboard/
├── 📂 src/
│   ├── 📂 app/                          # Next.js App Router
│   │   ├── 📂 api/                      # API Routes
│   │   │   ├── 📂 kis/                  # 한국투자증권 API
│   │   │   │   ├── 📂 stock/price/      # 한국 주식 시세
│   │   │   │   └── 📂 overseas/         # 미국 주식 시세
│   │   │   ├── 📂 community/            # 커뮤니티 API
│   │   │   │   └── 📂 posts/            # 게시글 CRUD
│   │   │   ├── 📂 news/                 # 뉴스 API
│   │   │   └── 📂 wikipedia/            # Wikipedia API
│   │   │
│   │   ├── 📂 (auth)/                   # 인증 관련 페이지
│   │   │   ├── 📂 login/                # 로그인
│   │   │   └── 📂 onboarding/           # 온보딩
│   │   │
│   │   ├── 📂 community/                # 커뮤니티 페이지
│   │   ├── 📂 market/                   # 시세 페이지
│   │   │   └── 📂 [ticker]/             # 종목 상세
│   │   ├── 📂 news/                     # 뉴스 페이지
│   │   └── 📂 watchlist/                # 관심종목 페이지
│   │
│   ├── 📂 components/                   # React 컴포넌트
│   │   ├── 📂 common/                   # 공통 컴포넌트
│   │   ├── 📂 features/                 # 기능별 컴포넌트
│   │   │   ├── 📂 community/            # 커뮤니티
│   │   │   ├── 📂 market/               # 시세
│   │   │   ├── 📂 news/                 # 뉴스
│   │   │   └── 📂 watchlist/            # 관심종목
│   │   ├── 📂 layout/                   # 레이아웃 컴포넌트
│   │   └── 📂 ui/                       # UI 컴포넌트
│   │
│   ├── 📂 hooks/                        # Custom Hooks
│   ├── 📂 lib/                          # 라이브러리 설정
│   │   ├── 📂 firebase/                 # Firebase 설정
│   │   ├── 📂 supabase/                 # Supabase 클라이언트
│   │   └── 📄 toast.ts                  # 토스트 알림
│   │
│   ├── 📂 stores/                       # Zustand 스토어
│   ├── 📂 types/                        # TypeScript 타입 정의
│   └── 📂 utils/                        # 유틸리티 함수
│
├── 📄 .env.local.example                # 환경 변수 예시
├── 📄 next.config.ts                    # Next.js 설정
├── 📄 tailwind.config.ts                # Tailwind CSS 설정
├── 📄 tsconfig.json                     # TypeScript 설정
└── 📄 package.json                      # 프로젝트 설정
```

---

## 🔌 API 구조

<details>
<summary><b>한국 주식 API</b></summary>

<br />

```
GET /api/kis/stock/price?symbol=005930
```

**응답 예시:**
```json
{
  "stockName": "삼성전자",
  "currentPrice": 75000,
  "changePercent": 1.35,
  "volume": 12345678
}
```

</details>

<details>
<summary><b>미국 주식 API</b></summary>

<br />

```
GET /api/kis/overseas/stock/price?symbol=AAPL
```

**응답 예시:**
```json
{
  "name": "Apple Inc",
  "nameKr": "애플",
  "currentPrice": 185.50,
  "changePercent": 2.15
}
```

</details>

<details>
<summary><b>커뮤니티 API</b></summary>

<br />

```
GET    /api/community/posts              # 게시글 목록
POST   /api/community/posts              # 게시글 작성
GET    /api/community/posts/[id]         # 게시글 상세
PUT    /api/community/posts/[id]         # 게시글 수정
DELETE /api/community/posts/[id]         # 게시글 삭제

GET    /api/community/posts/[id]/comments     # 댓글 목록
POST   /api/community/posts/[id]/comments     # 댓글 작성
```

</details>

---

## 📜 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 코드 검사
```

---

## 🤝 기여 방법

AlphaBoard에 기여해 주셔서 감사합니다!

1. 이 저장소를 **Fork** 합니다
2. 새 브랜치를 생성합니다
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 변경사항을 커밋합니다
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
4. 브랜치에 Push 합니다
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Pull Request**를 생성합니다

### 커밋 컨벤션

| 타입 | 설명 |
|:---|:---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅 |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 |
| `chore` | 빌드, 설정 변경 |

---

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.

---

<div align="center">

<br />

**Made with ❤️ for Global Investors**

<br />

[![GitHub Stars](https://img.shields.io/github/stars/your-username/alphaboard?style=social)](https://github.com/your-username/alphaboard)

</div>
