// 노멀 루트: 가문의 죄악을 목격
// 아이템 위치 고정 (items 배열)

const STAGES_NORMAL = {

    // N1: 가로형 4500x1200, 적 없음.
    // 디자인 원칙: 단서를 메인 동선에서 곁가지로 비켜둠.
    //   1: 스폰 LEFT-UP (뒤돌아 봐야 발견)
    //   2: 가짜 정상 위 더 LEFT-UP (한 번 더 climb)
    //   3: drop 도중 floor 측면 작은 알코브
    //   4: 정상2 바로 아래 매달린 plat (drop 후 재climb 필요)
    //   5: 맵 최고점 끝 (정상에서 더 climb)
    // 목표 클리어 시간: 1:30~2:00 (첫 플레이 기준)
    normal_1: {
        id: 'normal_1',
        name: '부패한 귀족',
        era: '고대',
        route: 'normal',
        stageNumber: 1,
        map: {
            width: 4500,
            height: 1200,
            backgroundColor: '#1a1a0e',
            platformColor: 0x5C4833,
            accentColor: 0x6B4226,
            tileKey: 'n1_stone_block',  // assets/tiles/{tileKey}.png 자동 로드, 플랫폼 타일링
        },
        spawn: { x: 100, y: 1120 },
        timeLimit: 180,
        platforms: [
            // 바닥 (전체 깔림)
            { x: 0, y: 1168, w: 4500, h: 32 },

            // === 아이템 1 숨김: 스폰 LEFT-UP의 작은 plat ===
            { x: 30, y: 1050, w: 80, h: 16 },

            // === 메인 climb 동선 (자연스러운 우측 위 zigzag) ===
            { x: 350, y: 1080, w: 180, h: 20 },
            { x: 600, y: 990, w: 180, h: 20 },
            { x: 850, y: 900, w: 180, h: 20 },
            { x: 1100, y: 810, w: 180, h: 20 },
            { x: 1350, y: 720, w: 180, h: 20 },
            { x: 1600, y: 630, w: 250, h: 20 }, // 가짜 정상 1

            // === 아이템 2 숨김: 가짜 정상 위 더 LEFT-UP ===
            { x: 1400, y: 540, w: 100, h: 16 },
            { x: 1200, y: 460, w: 100, h: 16 },
            { x: 1000, y: 380, w: 200, h: 20 }, // 진짜 정상 1 (아이템 2)

            // === 메인 동선 우측 drop ===
            { x: 1900, y: 760, w: 150, h: 20 },
            { x: 2100, y: 880, w: 150, h: 20 },
            { x: 2350, y: 1010, w: 200, h: 20 },

            // === 아이템 3 숨김: drop 끝 LEFT 측면 알코브 ===
            { x: 2050, y: 1080, w: 80, h: 16 },

            // === 메인 동선 우측 climb 2 ===
            { x: 2600, y: 940, w: 150, h: 20 },
            { x: 2800, y: 850, w: 150, h: 20 },
            { x: 3000, y: 760, w: 150, h: 20 },
            { x: 3200, y: 670, w: 150, h: 20 },
            { x: 3400, y: 580, w: 250, h: 20 }, // 정상 2

            // === 아이템 4 숨김: 정상 2 바로 아래 매달린 plat ===
            // 정상에서 살짝 보이지만, 떨어진 후 다시 올라오는 데 시간 듦
            { x: 3150, y: 870, w: 100, h: 16 },

            // === 마지막 climb — 아이템 5 (최고점, 끝) ===
            { x: 3700, y: 470, w: 150, h: 20 },
            { x: 3900, y: 360, w: 150, h: 20 },
            { x: 4100, y: 250, w: 200, h: 20 }, // 아이템 5
        ],
        walls: [],
        items: [
            { x: 70, y: 1020, name: '세금 장부' },          // 1: LEFT-UP 숨김
            { x: 1100, y: 350, name: '낡은 족쇄' },         // 2: 가짜 정상 위 진짜 정상
            { x: 2090, y: 1050, name: '가문의 칙령서' },    // 3: 측면 알코브
            { x: 3200, y: 840, name: '피 묻은 제단 조각' }, // 4: 정상 2 아래 매달림
            { x: 4200, y: 220, name: '농민의 편지' },       // 5: 최고점 끝
        ],
        itemPresets: null,
        enemies: [
            // 바닥 patrol — 단서 1↔3 횡단 시 회피해야 함 (느림, 넓은 범위)
            { type: 'patrol', x: 1500, y: 1140, speed: 60, minX: 1300, maxX: 2200 },
            // 가짜 정상 plat — 단서 2 찾으려 climb 중 만남
            { type: 'patrol', x: 1700, y: 600, speed: 80, minX: 1600, maxX: 1830 },
            // drop 끝 plat — 단서 3 알코브로 가는 길목
            { type: 'patrol', x: 2400, y: 980, speed: 80, minX: 2350, maxX: 2540 },
            // 정상 2 plat — 단서 4 발견 후 다시 climb 시 만남
            { type: 'patrol', x: 3450, y: 550, speed: 80, minX: 3400, maxX: 3640 },
        ],
    },

    // N2: 가로형 4500x1200, walker 첫 등장.
    // 디자인 원칙: 2층 구조 (상층 plat 천장 + 하층 floor). 단서가 두 층에 분산.
    //   1: 하층 floor — 상층 천장 아래 숨김 (위에서 안 보임)
    //   2: 상층 plat 위에 — 비교적 평이
    //   3: 상층에서 더 위로 climb한 정상 (작은 detour)
    //   4: 우측 climb 도중 LEFT-UP에 살짝 비켜둔 작은 plat (N1 스타일)
    //   5: 맵 최고점 끝 (우측 끝 high)
    // 적 배치: walker 2 (하층 통로 회피) + patrol 3 (상층/climb 길목)
    // 목표 클리어 시간: 1:30~2:00
    normal_2: {
        id: 'normal_2',
        name: '암살 의뢰',
        era: '중세',
        route: 'normal',
        stageNumber: 2,
        map: {
            width: 4500,
            height: 1200,
            backgroundColor: '#0e1a1a',
            platformColor: 0x4A6670,
            accentColor: 0x2F4F4F,
            tileKey: 'n1_stone_block', // 일단 N1 타일 재사용 (추후 톤 변경 가능)
        },
        spawn: { x: 100, y: 1120 },
        timeLimit: 180,
        platforms: [
            // 바닥 (전체)
            { x: 0, y: 1168, w: 4500, h: 32 },

            // === 상층 천장 (단서 1을 그 아래 숨기는 구조) ===
            // 좌측 천장 (단서 1 위)
            { x: 300, y: 950, w: 700, h: 20 },     // 300~1000
            // 우측 천장 (단서 2 위, 단서 3 climb 베이스)
            { x: 1300, y: 950, w: 900, h: 20 },    // 1300~2200

            // === 천장 사이 climb 통로 (gap 1000~1300, 폭 300px) ===
            // 이 갭으로 위→아래 진입 가능, climb 계단으로 천장 위 안착 가능
            { x: 1050, y: 1080, w: 80, h: 16 },
            { x: 1170, y: 1010, w: 80, h: 16 },

            // === 단서 3 detour climb (상층 위로 한 단계 더) ===
            { x: 1500, y: 850, w: 150, h: 20 },
            { x: 1700, y: 750, w: 150, h: 20 },
            { x: 1900, y: 650, w: 200, h: 20 }, // 단서 3 plat

            // === 우측 climb (단서 5 가는 길) ===
            { x: 2700, y: 1080, w: 100, h: 20 },
            { x: 2900, y: 1000, w: 100, h: 20 },
            { x: 3100, y: 920, w: 100, h: 20 },
            { x: 3300, y: 840, w: 100, h: 20 },
            { x: 3500, y: 760, w: 150, h: 20 },
            { x: 3750, y: 660, w: 150, h: 20 },
            { x: 4000, y: 560, w: 150, h: 20 },
            { x: 4250, y: 460, w: 200, h: 20 }, // 단서 5 plat (최고점)

            // === 단서 4 숨김 (우측 climb 도중 LEFT-UP 곁가지) ===
            { x: 3200, y: 740, w: 80, h: 16 },
        ],
        walls: [],
        items: [
            { x: 450, y: 1140, name: '암호화된 의뢰서' },  // 1: 하층 천장 아래 숨김
            { x: 2050, y: 920, name: '독이 묻은 단검' },   // 2: 상층 우측 끝 (detour climb 반대편)
            { x: 1980, y: 620, name: '수도원 기록부' },    // 3: 상층 detour 정상
            { x: 3220, y: 710, name: '목격자의 일기' },    // 4: 우측 climb 곁가지
            { x: 4350, y: 430, name: '가문 연대기' },      // 5: 최고점 끝
        ],
        itemPresets: null,
        enemies: [
            // 하층 walker — 단서 1로 가는 길 회피 + 우측 횡단 시 회피
            { type: 'walker', x: 800, y: 1140, speed: 50, dir: -1 },
            { type: 'walker', x: 2500, y: 1140, speed: 60, dir: 1 },
            // 상층 patrol — 좌측 천장 위 (단서 2로 가기 전 길목)
            { type: 'patrol', x: 1700, y: 920, speed: 80, minX: 1500, maxX: 2000 },
            // 단서 3 detour climb 도중 patrol
            { type: 'patrol', x: 1750, y: 720, speed: 70, minX: 1700, maxX: 1840 },
            // 우측 climb patrol — 단서 4↔5 사이
            { type: 'patrol', x: 3550, y: 730, speed: 80, minX: 3500, maxX: 3640 },
        ],
    },

    // N3: 가로형 4000x1500, 위/아래 갈래 살짝 + jumper/falling 첫 등장.
    // 디자인 원칙:
    //   1: 스폰 LEFT-UP (N1 패턴)
    //   2: 위 갈래 첫 단서 plat
    //   3: 위 갈래 정상 (최고점 1)
    //   4: 합류 climb LEFT-UP 곁가지 (N1 패턴)
    //   5: 우측 합류 climb 정상 (최고점 2)
    // 적: jumper 3 (좁은 plat 점거 - 위 갈래/합류 climb 가드)
    //     falling 3 (floor 통과 회피 — 그림자 + 반복)
    //     patrol 2 (위 갈래 통로)
    // 목표 클리어 시간: 약 2:30 (남은 시간 30초)
    normal_3: {
        id: 'normal_3',
        name: '가업 계승',
        era: '근대',
        route: 'normal',
        stageNumber: 3,
        map: {
            width: 4000,
            height: 1500,
            backgroundColor: '#1a150e',
            platformColor: 0x7B6B5A,
            accentColor: 0x5C4033,
            tileKey: 'n1_stone_block',
        },
        spawn: { x: 100, y: 1420 },
        timeLimit: 180,
        platforms: [
            // 바닥
            { x: 0, y: 1468, w: 4000, h: 32 },

            // === 단서 1 숨김: 스폰 LEFT-UP ===
            { x: 30, y: 1370, w: 80, h: 16 },

            // === 위 갈래 진입 climb (좌측) ===
            { x: 250, y: 1370, w: 150, h: 20 },
            { x: 450, y: 1270, w: 150, h: 20 },
            { x: 650, y: 1170, w: 150, h: 20 },
            { x: 850, y: 1060, w: 150, h: 20 },
            { x: 1050, y: 950, w: 200, h: 20 },

            // === 위 갈래 통로 (단서 2, 3) ===
            { x: 1350, y: 870, w: 150, h: 20 },
            { x: 1550, y: 790, w: 100, h: 16 },   // 좁은 plat (jumper 점거)
            { x: 1750, y: 720, w: 200, h: 20 },   // 단서 2
            { x: 2050, y: 660, w: 150, h: 20 },
            { x: 2250, y: 580, w: 150, h: 20 },
            { x: 2400, y: 480, w: 100, h: 16 },   // 좁은 plat (jumper 점거)
            { x: 2550, y: 400, w: 200, h: 20 },   // 단서 3 (위 갈래 정상)

            // === 우측 합류 climb (위 갈래에서 떨어진 후) ===
            { x: 2800, y: 1350, w: 150, h: 20 },
            { x: 3000, y: 1240, w: 150, h: 20 },
            { x: 3200, y: 1140, w: 150, h: 20 },
            { x: 3400, y: 1020, w: 100, h: 16 },  // 좁은 plat (jumper 점거)
            { x: 3600, y: 900, w: 150, h: 20 },
            { x: 3800, y: 780, w: 150, h: 20 },
            { x: 3700, y: 670, w: 100, h: 16 },
            { x: 3850, y: 550, w: 200, h: 20 },   // 단서 5 (최고점)

            // === 단서 4 숨김: 합류 climb LEFT-UP 곁가지 ===
            { x: 3050, y: 1050, w: 80, h: 16 },
        ],
        walls: [],
        items: [
            { x: 70, y: 1340, name: '교육 일지' },          // 1: 스폰 LEFT-UP
            { x: 1830, y: 690, name: '아이의 그림' },        // 2: 위 갈래 단서 plat
            { x: 2630, y: 370, name: '훈련용 칼' },          // 3: 위 갈래 정상
            { x: 3090, y: 1020, name: '가문 가훈 액자' },    // 4: 합류 climb LEFT-UP
            { x: 3950, y: 520, name: '어머니의 편지' },      // 5: 합류 정상 (최고점)
        ],
        itemPresets: null,
        enemies: [
            // jumper — 좁은 plat 점거 (정점 0.9초 hover + 천천히 낙하)
            { type: 'jumper', x: 1600, y: 760 },
            { type: 'jumper', x: 2450, y: 450 },
            { type: 'jumper', x: 3450, y: 990 },
            // falling — floor 우측 진행 시 회피 (반복 낙하 + 그림자 경고)
            { type: 'falling', x: 1300, y: 800, floorY: 1460, warningMs: 700, cooldownMs: 1300 },
            { type: 'falling', x: 1520, y: 800, floorY: 1460, warningMs: 800, cooldownMs: 1500 },
            { type: 'falling', x: 2780, y: 800, floorY: 1460, warningMs: 700, cooldownMs: 1400 },
            // patrol — 위 갈래 통로 강제 회피
            { type: 'patrol', x: 1400, y: 840, speed: 80, minX: 1350, maxX: 1490 },
            { type: 'patrol', x: 2100, y: 630, speed: 80, minX: 2050, maxX: 2190 },
        ],
    },

    // N4: 정사각형 2500x2500 다층 + 무빙 플랫폼/shooter 첫 등장.
    // 디자인 원칙:
    //   spawn: 가운데 (정사각형 컨셉 + 시작 시 좌우 살피게 됨)
    //   1: 우측 끝 alcove (역방향 — N1/N3의 LEFT-UP 패턴과 차별화)
    //   2: 좌 중층 plat
    //   3: 상층 통로 plat
    //   4: 우 정상 plat (정상 1)
    //   5: 좌상 최고점 (역주행 climb)
    // 적: shooter 2 (climb 동선 가로지름) + falling 2 (그림자) + patrol 2
    // 무빙 플랫폼 1: v-moving — 좌 중층(y=1800) → 좌 상층(y=1200) 진입 핵심 (필수)
    // 목표 클리어 시간: 약 2:50
    normal_4: {
        id: 'normal_4',
        name: '생체 실험',
        era: '현대',
        route: 'normal',
        stageNumber: 4,
        map: {
            width: 2500,
            height: 2500,
            backgroundColor: '#0e0e1a',
            platformColor: 0x4A4A6A,
            accentColor: 0x2D2D5E,
            tileKey: 'n1_stone_block',
        },
        spawn: { x: 1250, y: 2420 },
        timeLimit: 180,
        platforms: [
            // 바닥 (전체)
            { x: 0, y: 2468, w: 2500, h: 32 },

            // === 단서 1 숨김: 우측 끝 alcove (역방향 가야 발견) ===
            { x: 2390, y: 2370, w: 80, h: 16 },

            // === 좌측 climb (중층 진입) ===
            { x: 200, y: 2350, w: 150, h: 20 },
            { x: 400, y: 2240, w: 150, h: 20 },
            { x: 600, y: 2120, w: 150, h: 20 },
            { x: 750, y: 2000, w: 100, h: 20 },
            { x: 950, y: 1900, w: 150, h: 20 },
            { x: 1200, y: 1800, w: 200, h: 20 },     // 단서 2 plat (좌 중층)

            // === 좌 상층 plat (무빙 플랫폼으로만 도달 가능) ===
            { x: 1450, y: 1200, w: 200, h: 20 },

            // === 상층 통로 (단서 3) ===
            { x: 1700, y: 1080, w: 150, h: 20 },     // 단서 3 plat
            { x: 1900, y: 970, w: 100, h: 16 },      // 좁은 plat
            { x: 2050, y: 850, w: 150, h: 20 },
            { x: 2250, y: 730, w: 150, h: 20 },
            { x: 2350, y: 610, w: 100, h: 16 },
            { x: 2200, y: 490, w: 200, h: 20 },     // 단서 4 plat (정상 1)

            // === 좌상 최고점 (역주행 climb, 단서 5) ===
            { x: 1950, y: 380, w: 150, h: 20 },
            { x: 1700, y: 280, w: 150, h: 20 },
            { x: 1400, y: 180, w: 200, h: 20 },     // 단서 5 plat (최고점)
        ],
        movingPlatforms: [
            // v-moving: 좌 중층(y=1800) → 좌 상층(y=1200) 진입 수단 (이게 없으면 못 올라감)
            // speed=120 px/s, distance=300 → 한 방향 2.5초, 한 사이클 10초
            { x: 1380, y: 1500, w: 100, h: 16, moveType: 'vertical', distance: 300, speed: 120 },
        ],
        walls: [],
        items: [
            { x: 2430, y: 2340, name: '실험 보고서 #0001' },    // 1: 우측 끝 alcove (역방향)
            { x: 1280, y: 1770, name: '수술 도구 세트' },      // 2: 좌 중층
            { x: 1770, y: 1050, name: '뇌파 기록지' },         // 3: 상층 plat
            { x: 2280, y: 460, name: '윤리위원회 반려서' },    // 4: 정상 1
            { x: 1470, y: 150, name: '녹음 테이프' },          // 5: 최고점
        ],
        itemPresets: null,
        enemies: [
            // shooter — 원거리 사격 (climb 동선 가로지름)
            { type: 'shooter', x: 1700, y: 950, interval: 2200 },     // 상층 통로 위협
            { type: 'shooter', x: 2350, y: 460, interval: 2400 },     // 정상 진입 위협
            // falling — 그림자 + 반복
            { type: 'falling', x: 1500, y: 1100, floorY: 1190, warningMs: 800, cooldownMs: 1500 },
            { type: 'falling', x: 2100, y: 800, floorY: 840, warningMs: 700, cooldownMs: 1400 },
            // patrol — 통로 회피 (누적 난이도)
            { type: 'patrol', x: 1280, y: 1770, speed: 90, minX: 1200, maxX: 1390 },
            { type: 'patrol', x: 2300, y: 700, speed: 90, minX: 2250, maxX: 2390 },
        ],
    },

    // N5: 큰 정사각형 미로 3500x3500 + sealer/chaser 첫 등장.
    // 디자인 원칙:
    //   spawn 좌하 (전통)
    //   1: spawn LEFT-UP (좌하)
    //   2: 우하 끝 alcove (역방향 곁가지)
    //   3: 좌상 정상 (좌상층 zigzag climb)
    //   4: 가운데 plat (메인 동선 위)
    //   5: 우상 정상 (최고점)
    // 가이드 의도: 첫 도전 거의 실패 — 위치 외워야 클리어 (2~3회 재도전)
    // 적: sealer 2 (좁은 통로 봉인) + chaser 1 (floor 추적) + jumper 3 (좁은 plat 점거)
    //     + falling 2 (그림자) + patrol 2 (통로) + shooter 2 (정상 위협)
    normal_5: {
        id: 'normal_5',
        name: '감금 시설',
        era: '미래',
        route: 'normal',
        stageNumber: 5,
        map: {
            width: 3500,
            height: 3500,
            backgroundColor: '#16213e',
            platformColor: 0x3a506b,
            accentColor: 0x2d4059,
            tileKey: 'n1_stone_block',
        },
        spawn: { x: 100, y: 3420 },
        timeLimit: 180,
        platforms: [
            // 바닥 (전체)
            { x: 0, y: 3468, w: 3500, h: 32 },

            // === 단서 1 숨김: spawn LEFT-UP ===
            { x: 30, y: 3370, w: 80, h: 16 },

            // === 단서 2 숨김: 우하 끝 alcove ===
            { x: 3380, y: 3340, w: 100, h: 16 },

            // === 좌측 climb (좌 중층 진입) ===
            { x: 200, y: 3350, w: 150, h: 20 },
            { x: 400, y: 3240, w: 150, h: 20 },
            { x: 600, y: 3120, w: 150, h: 20 },
            { x: 850, y: 3000, w: 150, h: 20 },
            { x: 1100, y: 2880, w: 200, h: 20 },     // 좌 중층 1

            // === 좌상 분기 climb (단서 3 가는 길) ===
            { x: 950, y: 2760, w: 100, h: 16 },
            { x: 800, y: 2640, w: 100, h: 16 },
            { x: 600, y: 2520, w: 150, h: 20 },
            { x: 400, y: 2400, w: 150, h: 20 },
            { x: 200, y: 2280, w: 150, h: 20 },
            { x: 350, y: 2160, w: 150, h: 20 },
            { x: 550, y: 2040, w: 150, h: 20 },
            { x: 350, y: 1920, w: 100, h: 16 },     // 좁은 plat (jumper)
            { x: 550, y: 1800, w: 150, h: 20 },
            { x: 750, y: 1680, w: 150, h: 20 },
            { x: 600, y: 1560, w: 100, h: 16 },
            { x: 750, y: 1440, w: 150, h: 20 },
            { x: 600, y: 1320, w: 200, h: 20 },     // 단서 3 plat (좌상 정상)

            // === 가운데 통로 (단서 4) ===
            { x: 1400, y: 2880, w: 200, h: 20 },     // 좌 중층 2
            { x: 1700, y: 2780, w: 200, h: 20 },     // 가운데 진입
            { x: 1500, y: 2680, w: 200, h: 20 },     // 단서 4 plat

            // === 우 중층 → 우상 정상 climb (단서 5) ===
            { x: 1900, y: 2680, w: 150, h: 20 },
            { x: 2100, y: 2570, w: 150, h: 20 },
            { x: 2300, y: 2460, w: 150, h: 20 },
            { x: 2500, y: 2350, w: 150, h: 20 },
            { x: 2700, y: 2240, w: 150, h: 20 },
            { x: 2900, y: 2130, w: 150, h: 20 },
            { x: 3150, y: 2020, w: 150, h: 20 },
            { x: 3000, y: 1910, w: 100, h: 16 },     // 좁은 plat (jumper)
            { x: 3150, y: 1800, w: 150, h: 20 },
            { x: 3000, y: 1690, w: 100, h: 16 },     // sealer 반경 — 봉인 통로
            { x: 3150, y: 1580, w: 150, h: 20 },
            { x: 3000, y: 1470, w: 100, h: 16 },
            { x: 3150, y: 1360, w: 150, h: 20 },
            { x: 3000, y: 1250, w: 100, h: 16 },     // 좁은 plat (jumper)
            { x: 3150, y: 1140, w: 150, h: 20 },
            { x: 3000, y: 1030, w: 150, h: 20 },
            { x: 3150, y: 920, w: 150, h: 20 },
            { x: 3000, y: 810, w: 150, h: 20 },
            { x: 3150, y: 700, w: 150, h: 20 },
            { x: 3000, y: 590, w: 150, h: 20 },
            { x: 3150, y: 480, w: 200, h: 20 },
            { x: 2950, y: 370, w: 200, h: 20 },     // 단서 5 plat (최고점)
        ],
        walls: [],
        items: [
            { x: 70, y: 3340, name: '감금실 설계도' },        // 1: spawn LEFT-UP
            { x: 3430, y: 3310, name: '에너지 추출 로그' },   // 2: 우하 끝 alcove
            { x: 700, y: 1290, name: '총수의 연설문' },       // 3: 좌상 정상
            { x: 1600, y: 2650, name: '시설 사고 보고서' },   // 4: 가운데 plat
            { x: 3050, y: 340, name: '마지막 감시 영상' },    // 5: 우상 정상 (최고점)
        ],
        itemPresets: null,
        enemies: [
            // sealer — 좁은 통로 봉인 (대시 봉인 첫 등장)
            { type: 'sealer', x: 3000, y: 1690, radius: 150 },     // 우 climb 도중
            { type: 'sealer', x: 700, y: 1680, radius: 130 },      // 좌상 climb 도중
            // chaser — floor 추적 (도망쳐도 따라옴)
            { type: 'chaser', x: 1700, y: 3440, speed: 100 },
            // jumper — 좁은 plat 점거
            { type: 'jumper', x: 400, y: 1890 },
            { type: 'jumper', x: 3050, y: 1880 },
            { type: 'jumper', x: 3050, y: 1220 },
            // falling — 그림자 + 반복
            { type: 'falling', x: 1500, y: 2400, floorY: 3450, warningMs: 700, cooldownMs: 1300 },
            { type: 'falling', x: 2100, y: 2300, floorY: 3450, warningMs: 800, cooldownMs: 1500 },
            // patrol — 통로 회피
            { type: 'patrol', x: 1300, y: 2850, speed: 90, minX: 1200, maxX: 1450 },
            { type: 'patrol', x: 2400, y: 2430, speed: 90, minX: 2300, maxX: 2500 },
            // shooter — climb 도중 위협 (정상/단서 plat과는 떨어진 위치)
            { type: 'shooter', x: 2800, y: 800, interval: 2000 },     // 우 climb 중턱 위협
            { type: 'shooter', x: 350, y: 2080, interval: 2200 },     // 좌상 climb 중턱 위협
        ],
    },

};
