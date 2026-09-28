# AGENT.md - DaoXin (道心) 프로젝트 가이드

루트 문서: [../AGENT.md](file:///e:/withc/Documents/coding/daoxin/AGENT.md)

## 1. 프로젝트 개요
* **프로젝트명**: ABILITY: DaoXin(道心)
* **목적**: 동양 철학 및 선도/무협 수양(修養) 컨셉을 결합한 게이미피케이션 기반 습관 관리 & 플래너
* **지원 플랫폼**:
  * **Web / PWA**: GitHub Pages (`https://yoonjonglyu.github.io/daoxin`)
  * **Android**: Capacitor 8 기반 하이브리드 모바일 앱 (`com.yoonjongryu.daoxin`)

---

## 2. 기술 스택 (Tech Stack)

* **Core & UI**: React 19, TypeScript (~5.7.2), Vite 6 (SWC 플러그인)
* **상태 관리**: Jotai v2 (경량 Atom 기반 전역 상태 관리)
* **라우팅**: React Router v7 (`createBrowserRouter`)
* **모바일 프레임워크**: Capacitor v8
  * `@capacitor/android`, `@capacitor/core`, `@capacitor/filesystem`, `@capacitor/share`
  * `@capacitor-community/admob` (안드로이드 광고 연동)
  * `@capawesome/capacitor-google-sign-in` (구글 로그인 및 드라이브 연동)
* **데이터 보안 & 저장**: `isa-util` (`loadEncryptedData`, `saveEncryptedData`)
  * 브라우저 localStorage에 데이터를 암호화하여 저장하는 Local-First 구조
* **PWA**: `vite-plugin-pwa`, `@vite-pwa/assets-generator`
* **다국어 (i18n)**: 자체 구현된 `useTranslation` (한국어 / 영어)
* **스타일링**: CSS 모듈 방식의 Vanilla CSS (다크/수양 테마)

---

## 3. 핵심 디렉토리 구조

```plaintext
daoxin/
├── android/                 # Capacitor 안드로이드 네이티브 프로젝트
├── src/
│   ├── components/          # 공통 UI 컴포넌트 및 기본 레이아웃 (BasicLayout)
│   ├── features/            # 핵심 도메인별 기능 컴포넌트
│   │   ├── daoxingraph/     # 도심 수양 상태 원형 게이지/그래프 시각화
│   │   ├── daoxintodo/      # 오늘의 수련 (습관/할 일 완료 및 체크)
│   │   ├── daoxinschedule/  # 수련 일정/습관 캘린더 및 플래너
│   │   └── settings/        # 앱 설정, 데이터 백업/복원, 구글 로그인 모달
│   ├── pages/               # 라우트 페이지 (main, category, schedule)
│   ├── services/            # 비즈니스 로직 및 서비스 계층
│   │   ├── daoxinService.ts     # 도심 게이지, 레벨, 경지(Realm) 계산
│   │   ├── scheduleService.ts   # 일정/습관 CRUD, 주기(반복) 처리
│   │   ├── categoryService.ts   # 카테고리 관리
│   │   ├── statisticsService.ts # 통계 및 달성률 집계
│   │   └── googleDriveService.ts# 구글 드라이브 백업/복원
│   ├── store/               # Jotai Atom 정의 (daoxin, schedule, category, logs 등)
│   ├── hooks/               # 도메인 커스텀 훅 (useDaoxin, useSchedule, useCategory 등)
│   ├── utils/               # 암호화 스토리지(storage), 백업(backup), 날짜(date), 다국어(i18n)
│   ├── types/               # TypeScript 인터페이스 정의
│   └── value.tsx            # 전역 상수 및 초기 데이터 (MIN/MAX GAUGE, 기본 카테고리/습관)
```

---

## 4. 도메인 및 비즈니스 규칙

### 4.1 도심(道心) 수양 및 경지(Realm) 체계
* **게이지(Gauge)**: `1` ~ `78` (주역 64괘 + 선도 수치 모티브)
* **4단계 경지**:
  1. **발심 (發心)**: `1 <= gauge < 25` (초심을 세우는 단계)
  2. **승화 (昇華)**: `25 <= gauge < 50` (수련을 발전시키는 단계)
  3. **응심 (凝心)**: `50 <= gauge < 77` (마음을 집중하고 굳히는 단계)
  4. **천교 (天巧)**: `77 <= gauge <= 78` (자연과 하나 되는 완성 단계)
* **기운(Exp / Qi)**: 수련 완료 시 획득하며 누적 경험치로 관리됨
* **연속 수련 (Streak)**: 매일 수련을 완료할 경우 연속 일수 증가

### 4.2 수련(Habit / Schedule) 및 카테고리
* **카테고리 구분**:
  * `Health(신체 수련)`: 강건한 육신을 위한 정진 (참장공, 근력운동 등)
  * `Mind(심신 안정)`: 맑은 정신과 도심을 닦는 행위 (명상 등)
  * `Wisdom(지식 정진)`: 세상의 이치를 깨닫는 공부
* **주기**: `daily`(일간), `weekly`(주간) 등 주기적 반복 관리

### 4.3 데이터 저장 및 동기화 (Local-First)
* 모든 데이터는 `SALT('일체유심조')`를 기반으로 `isa-util`을 통해 암호화되어 localStorage에 저장됨.
* 외부 의존 서버 없이 독립 동작하며, 필요 시 JSON 파일 내보내기/가져오기 또는 Google Drive 연동으로 백업/복원 가능.

### 4.4 공법(Technique) & 만물각(Shop) 시스템
* **영석 (Spirit Stones)**:
  * 수련 완수 시 기본 보상(+5) 및 습관 100% 달성 보너스(+20) 등으로 획득 가능한 인앱 재화.
  * `src/store/inventory.ts`, `src/hooks/useInventory.ts`를 통해 전역 상태 및 로컬 암호화 스토리지 관리.
* **공법 (Passive Techniques)**:
  * 기본 4대 공법:
    1. `토납심법 (吐納心法)`: 수련 완료 시 공력(Exp) 추가 획득 배율 증가 (+10% ~ +30%).
    2. `금강보체 (金剛寶體)`: 금일 습관 100% 완수 시 추가 도심 게이지 보너스 (+1 ~ +2).
    3. `자하진기 (紫霞眞氣)`: 아침 8시 이전 수련 시 영기/공력 2배 획득.
    4. `불멸심인 (不滅心印)`: 3일 연속 정진 시마다 추가 도심 및 경험치 보너스.
  * 장착 슬롯(`maxEquipSlots`, 기본 2개) 제한 내에서 원하는 심법을 장착/해제.
  * 수련을 완료할 때마다 장착된 공법의 숙련도(`exp`)가 상승하며, 성(Tier, 최대 5성) 승급 시 효과가 점진적으로 강화됨.
  * 새로운 공법 추가 시 `src/types/inventory.ts`의 `TechniqueType` 및 `src/services/techniqueService.ts`의 `calculateCultivationReward` / `DEFAULT_TECHNIQUES`에 추가하면 자동 확장 지원.
* **만물각 (Dao Shop / Treasury)**:
  * `비급서(Manuals)`: 영석을 소비하여 새로운 공법을 해금하고 영구 습득.
  * `영약관(Elixirs)`:
    * `청심환 (Focus Elixir)`: 복용 후 24시간 동안 수련 공력 2배 부스트.
    * `보심단 (Streak Shield)`: 연속 수련일이 끊길 위기일 때 자동으로 소모되어 스트릭을 보호.
  * 새로운 아이템 추가 시 `src/value.tsx`의 `DAOXIN_SHOP_ITEMS`에 정의만 추가하면 상점 UI에 즉시 반영됨.

---

## 5. 실행 및 빌드 명령어

`daoxin/` 디렉토리 기준으로 실행합니다:

```bash
# 의존성 설치
pnpm install

# 로컬 개발 서버 실행
pnpm dev

# 웹 빌드 및 타입 검사
pnpm build

# GitHub Pages 배포
pnpm deploy

# 안드로이드 빌드 및 동기화 (Capacitor)
pnpm build:android

# PWA 에셋 생성
pnpm pwa:assets
```

---

## 6. 개발 및 코드 수정 시 유의사항
* **라우팅 베이스 경로**: GitHub Pages 배포 시 basename은 `/daoxin`이며, Capacitor 빌드(`VITE_BUILD_TARGET=capacitor`) 시에는 빈 문자열(`''`)을 사용합니다 (`src/pages/index.tsx` 참고).
* **데이터 키 & 상수 관리**: 저장소 키 및 기본 데이터는 `src/value.tsx`에 중앙 집중화되어 있습니다.
* **로컬 타임존 일관성**: 기기 로컬 시간(`00:00:00`) 기준으로 일일 통계 및 날짜 판별이 동작해야 글로벌 사용자의 수련 기록이 왜곡되지 않습니다.
* **국제화 (i18n)**: 새로운 텍스트나 UI 라벨 추가 시 `src/utils/i18n.ts`에 한국어/영어 번역 키를 반드시 함께 등록해야 합니다.
* **신규 공법/아이템 확장 방법**:
  1. `src/types/inventory.ts`: 필요 시 신규 `TechniqueType` 추가
  2. `src/value.tsx`: `DEFAULT_TECHNIQUES` 및 `DAOXIN_SHOP_ITEMS`에 항목 등록
  3. `src/services/techniqueService.ts`: `calculateCultivationReward`에 계산 로직 매핑

