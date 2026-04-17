# 3분 뒤 보스전!

> 3분 안에 5개의 키 아이템을 찾아라. 실패하면 이길 수 없는 보스가 등장한다.

2D 플랫포머 탐색 + 반복형 스토리 게임. 반복을 통해 조각난 스토리가 공개되는 구조의 서사 중심 게임입니다.

## 플레이

🎮 **[https://dukyoungjung.github.io/MeetBossAfter3Mins/](https://dukyoungjung.github.io/MeetBossAfter3Mins/)**

모바일 사파리 / PC 브라우저 모두 지원 (세로 모드 권장).

## 게임 개요

- **제한시간** — 3분 안에 5개의 키 아이템 수집
- **실패 조건** — 시간 초과 시 보스 등장 → 강제 사망 → 스테이지 처음으로
- **반복 구조** — 반복할 때마다 스토리 조각 공개
- **3가지 루트** — 노멀(5) + 레드(5) + 진레드(5) = 총 15스테이지
- **3가지 엔딩** — A(거울=마왕) / B(진레드 진입) / C(게임 소멸)

## 조작

### PC
- **이동:** 방향키 ← → / A D
- **점프:** ↑ / K
- **대시:** Shift / J

### 모바일 (화면 4분할 터치)
- **좌측 1/4:** ◀ 왼쪽 이동
- **좌측 2번째 1/4:** ▶ 오른쪽 이동
- **우측 2번째 1/4:** 💨 대시
- **우측 1/4:** ▲ 점프

## 기술 스택

- **엔진:** Phaser.js 3 (CDN)
- **언어:** JavaScript (ES6+)
- **아트:** DALL-E 3 (컷씬 배경), PixelLab (캐릭터 스프라이트)
- **배포:** GitHub Pages

## 프로젝트 구조

```
MeetBossAfter3Mins/
├── index.html              # 진입점
├── editor.html             # 맵 에디터
├── analyzer.html           # 밸런스 분석기
├── js/
│   ├── main.js
│   ├── scenes/             # Phaser 씬들
│   │   ├── BootScene.js    # 진행 상태 분기
│   │   ├── IntroScene.js
│   │   ├── CutsceneScene.js # 이미지 + 텍스트 컷씬 재생기
│   │   ├── TutorialScene.js # 4층 건물 튜토리얼
│   │   ├── StageSelectScene.js
│   │   ├── GameScene.js    # 핵심 게임플레이
│   │   ├── BossScene.js
│   │   └── ClearScene.js
│   ├── entities/
│   │   └── PlayerController.js # 이동/점프/대시/애니메이션
│   └── data/
│       ├── StageData.js    # 스테이지 정의
│       ├── StageProgress.js # 진행 상태 (localStorage)
│       ├── CutsceneData.js # 컷씬 시퀀스
│       └── HangulMaps.js   # 한글 맵 비트맵
├── assets/
│   ├── cutscenes/          # 컷씬 배경 이미지 (25+)
│   └── character/sprites/  # 주인공 스프라이트 (idle/walk/run/jump)
├── tools/
│   └── generate_cutscenes.py # DALL-E 컷씬 생성 스크립트
└── story/                  # 스토리/컷씬 문서
```

## 주요 시스템

### 한글 맵 시스템
각 스테이지의 맵은 한글 글자 "결국나는너였고너는나였던것이다" 의 15자를 하나씩 차지합니다. 글자 비트맵이 플랫폼으로 배치되어, 스테이지를 플레이하면서 글자를 따라 탐험하게 됩니다.

### 루트 해금 구조
- **노멀 루트** — 첫 플레이 가능
- **레드 루트** — 노멀 5스테이지 모두 클리어 후 해금 (엔딩 A 진입 시)
- **진레드 루트** — 레드 5스테이지 모두 클리어 후 해금 (엔딩 B 진입 시)

### 생명력 & 게임 오버
- 기본 생명력 3개
- 보스전 사망 시 -1
- 생명력 0 = 게임 오버 → 해당 루트 전체 리셋 (튜토리얼 유지)

### 진엔딩 후 상태
엔딩 C 후에는 평범한 생일 씬으로 끝나며, 조작 불가 상태로 멈춥니다. 초기화 버튼으로만 다시 시작 가능.

## 개발 도구

### 맵 에디터 (`editor.html`)
- 플랫폼/아이템/스폰 지점 시각 편집
- 한글 글자 플랫폼 편집 가능
- JSON 익스포트

### 밸런스 분석기 (`analyzer.html`)
- 각 스테이지의 난이도/동선 시각화
- 아이템 배치 검토

## 로컬 개발

```bash
# 간단한 정적 서버 띄우기
python3 -m http.server 8080

# 브라우저에서 http://localhost:8080 열기
```

컷씬 이미지 생성:
```bash
export OPENAI_API_KEY=sk-...
python3 tools/generate_cutscenes.py
# 특정 이미지만: python3 tools/generate_cutscenes.py opening_01_city
```

## 크레딧

- **기획/디렉팅:** 정덕영
- **개발:** Claude (Anthropic)
- **컷씬 아트:** DALL-E 3
- **캐릭터 스프라이트:** PixelLab

## 라이선스

All rights reserved.
