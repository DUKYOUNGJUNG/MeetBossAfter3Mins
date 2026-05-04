// 진 레드 루트: 시간 간섭 (테스트용 간단 맵)

const STAGES_TRUE_RED = {

    true_red_1: {
        id: 'true_red_1', name: '첫 번째 죽음', era: '시간', route: 'true_red', stageNumber: 1,
        map: { width: 2000, height: 800, backgroundColor: '#0a0008', platformColor: 0x4A1A30, accentColor: 0x2A0520 },
        spawn: { x: 100, y: 720 }, timeLimit: 180,
        platforms: [{ x: 0, y: 768, w: 2000, h: 32 }],
        walls: [],
        items: [
            { x: 200, y: 740, name: '첫 번째 기억' }, { x: 400, y: 740, name: '불꽃의 잔해' },
            { x: 600, y: 740, name: '묘비의 파편' }, { x: 800, y: 740, name: '지워진 이름' },
            { x: 1000, y: 740, name: '되돌린 시간' },
        ],
        itemPresets: null, enemies: [],
    },
    true_red_2: {
        id: 'true_red_2', name: '일족', era: '시간', route: 'true_red', stageNumber: 2,
        map: { width: 2000, height: 800, backgroundColor: '#08000a', platformColor: 0x3A1A40, accentColor: 0x200530 },
        spawn: { x: 100, y: 720 }, timeLimit: 180,
        platforms: [{ x: 0, y: 768, w: 2000, h: 32 }],
        walls: [],
        items: [
            { x: 200, y: 740, name: '다른 문양' }, { x: 400, y: 740, name: '같은 칼' },
            { x: 600, y: 740, name: '반복되는 밤' }, { x: 800, y: 740, name: '피할 수 없는 것' },
            { x: 1000, y: 740, name: '운명의 조각' },
        ],
        itemPresets: null, enemies: [],
    },
    true_red_3: {
        id: 'true_red_3', name: '감금', era: '시간', route: 'true_red', stageNumber: 3,
        map: { width: 2000, height: 800, backgroundColor: '#050008', platformColor: 0x2A1A3A, accentColor: 0x150520 },
        spawn: { x: 100, y: 720 }, timeLimit: 180,
        platforms: [{ x: 0, y: 768, w: 2000, h: 32 }],
        walls: [],
        items: [
            { x: 200, y: 740, name: '잠긴 문' }, { x: 400, y: 740, name: '빈 복도' },
            { x: 600, y: 740, name: '울리지 않는 경보' }, { x: 800, y: 740, name: '닿지 않는 손' },
            { x: 1000, y: 740, name: '찾을 수 없는 곳' },
        ],
        itemPresets: null, enemies: [],
    },
    true_red_4: {
        id: 'true_red_4', name: '시간 붕괴', era: '시간', route: 'true_red', stageNumber: 4,
        map: { width: 2000, height: 800, backgroundColor: '#030005', platformColor: 0x1A1030, accentColor: 0x0A0015 },
        spawn: { x: 100, y: 720 }, timeLimit: 180,
        platforms: [{ x: 0, y: 768, w: 2000, h: 32 }],
        walls: [],
        items: [
            { x: 200, y: 740, name: '균열' }, { x: 400, y: 740, name: '역류하는 시간' },
            { x: 600, y: 740, name: '닫히지 않는 문' }, { x: 800, y: 740, name: '능력의 한계' },
            { x: 1000, y: 740, name: '실패의 기록' },
        ],
        itemPresets: null, enemies: [],
    },
    true_red_5: {
        id: 'true_red_5', name: '너', era: '시간', route: 'true_red', stageNumber: 5,
        map: { width: 2000, height: 800, backgroundColor: '#000000', platformColor: 0x111111, accentColor: 0x080808 },
        spawn: { x: 100, y: 720 }, timeLimit: 180,
        platforms: [{ x: 0, y: 768, w: 2000, h: 32 }],
        walls: [],
        items: [
            { x: 200, y: 740, name: '도심의 불빛' }, { x: 400, y: 740, name: '건물의 문' },
            { x: 600, y: 740, name: '파티 소리' }, { x: 800, y: 740, name: '0시의 시계' },
            { x: 1000, y: 740, name: '마지막 선택' },
        ],
        itemPresets: null, enemies: [],
    },

};
