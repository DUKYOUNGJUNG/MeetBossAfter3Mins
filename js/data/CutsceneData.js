// 컷씬 시퀀스 데이터
const CUTSCENE_DATA = {

    // ==========================================
    // 오프닝
    // ==========================================
    opening: {
        bgColor: '#000000',
        typewriter: false,
        sequence: [
            { image: 'opening_01_city', text: '도심지. 밤.', duration: 2500, color: '#888888', size: '22px', y: 300 },
            { image: 'opening_02_building', text: '주인공이 걸어간다.\n어떤 건물 안으로 들어간다.', duration: 3000, color: '#888888', size: '22px', y: 300 },
            { image: 'opening_03_party', text: '"야, 케이크 아직?"', duration: 2500, color: '#ffffff', size: '26px', y: 280 },
            { text: '"12시 딱 되면 자를 거야."', duration: 2500, color: '#ffffff', size: '26px', y: 280 },
            { text: '23:57', duration: 1500, color: '#666666', size: '56px', y: 300 },
            { text: '23:58', duration: 1500, color: '#666666', size: '56px', y: 300 },
            { text: '23:59', duration: 2000, color: '#999999', size: '56px', y: 300 },
            { hideImage: true, text: '00:00:00', duration: 1200, color: '#ffffff', size: '64px', y: 300 },
            { text: null, duration: 1500 },
            { image: 'opening_05_midnight', text: '낯선 공간.\n콘크리트. 낡은 건물 내부.', duration: 3000, color: '#555555', size: '24px', y: 300 },
        ],
        nextScene: 'TutorialScene',
    },

    // ==========================================
    // 옥상 마왕 조우
    // ==========================================
    rooftop: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'rooftop_boss', text: '옥상. 하늘이 없다.\n검은 공간이 위로 무한히 펼쳐져 있다.', duration: 2500, color: '#555555', size: '22px', y: 250 },
            { text: null, duration: 1500 },
            { text: '"어서와…"', duration: 2500, color: '#ff4444', size: '28px', y: 300 },
            { text: null, duration: 1000 },
            { text: '"생일이라며."', duration: 2000, color: '#ff4444', size: '24px', y: 300 },
            { text: null, duration: 1000 },
            { text: '"선물을 줘야 하는데."', duration: 2000, color: '#ff4444', size: '24px', y: 280 },
            { text: '"시간을 주지."', duration: 2000, color: '#ff4444', size: '24px', y: 300 },
            { text: '"3분."', duration: 2500, color: '#ff0000', size: '36px', y: 300 },
        ],
        nextScene: 'StageSelectScene',
    },

    // ==========================================
    // 노멀 클리어 컷씬
    // ==========================================
    normal_1_clear: {
        bgColor: '#1a1a0e',
        sequence: [
            { image: 'normal_1_ancient', text: '넓은 들판.\n사람들이 줄지어 걸어간다. 쇠사슬 소리.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"그들은… 죄의 댓가로… 귀족이 되었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    normal_2_clear: {
        bgColor: '#0e1a1a',
        sequence: [
            { image: 'normal_2_medieval', text: '좁은 골목.\n바닥에 사람의 윤곽. 움직이지 않는다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"그리고… 죄를 씻기 위해… 어둠이 되었고,"', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    normal_3_clear: {
        bgColor: '#1a150e',
        sequence: [
            { image: 'normal_3_modern_edu', text: '밝은 방. 탁자 위에 아이의 그림.\n누군가 그림을 치우고 작은 칼을 놓는다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"또한… 죄를 짓기 위해… 괴물이 되었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    normal_4_clear: {
        bgColor: '#0e0e1a',
        sequence: [
            { image: 'normal_4_experiment', text: '하얀 방. 누군가 묶여 있다.\n입이 움직이지만 소리는 없다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"마침내… 힘을 얻기 위해… 죄를 이용하였다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    normal_5_clear: {
        bgColor: '#16213e',
        sequence: [
            { image: 'normal_5_facility', text: '파란 빛. 투명한 관.\n눈이 떠져 있다. 깜빡이지 않는다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"죄는 곧 그들이며,\n그들의 죄는 곧…"', duration: 2500, color: '#ff4444', size: '22px', y: 330 },
            { text: null, duration: 1500 },
            { text: '"\'나\' 이다."', duration: 3000, color: '#ff0000', size: '28px', y: 350 },
        ],
        // 엔딩 A로 연결
        nextScene: 'CutsceneScene',
        nextData: 'ending_a',
    },

    // ==========================================
    // 엔딩 A (거울 = 마왕)
    // ==========================================
    ending_a: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'ending_a_01_bathroom', text: '정신을 차린다.\n타일 바닥. 형광등. 수도꼭지에서 물이 흐른다.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '화장실이다.', duration: 1500, color: '#aaaaaa', size: '20px', y: 300 },
            { text: null, duration: 1000 },
            { text: '거울에 김이 서려 있다.\n천천히 걷힌다.', duration: 2000, color: '#888888', size: '16px', y: 280 },
            { text: null, duration: 1500 },
            { image: 'ending_a_02_face', text: '거울 속의 눈이 깜빡인다.\n나는 깜빡이지 않았다.', duration: 2500, color: '#ffffff', size: '18px', y: 280 },
            { text: null, duration: 1000 },
            { text: '거울 속의 얼굴이 웃고 있다.\n나는 웃고 있지 않다.', duration: 2500, color: '#ff6666', size: '18px', y: 280 },
            { text: '"천천히 해."', duration: 2000, color: '#ff4444', size: '24px', y: 300 },
            { text: '"난 아주 한가하니."', duration: 2500, color: '#ff4444', size: '24px', y: 300 },
            { hideImage: true, text: null, duration: 2000 },
            { text: '레드 루트 해금', duration: 2000, color: '#ff0000', size: '28px', y: 300 },
        ],
        nextScene: 'StageSelectScene',
    },

    // ==========================================
    // 레드 클리어 컷씬
    // ==========================================
    red_1_clear: {
        bgColor: '#1a120e',
        sequence: [
            { image: 'red_1_birth', text: '따뜻한 빛. 작은 방.\n아기 울음소리.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '"나에게는… 찬란한 순간이 있었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    red_2_clear: {
        bgColor: '#1a0e0e',
        sequence: [
            { image: 'red_2_sacrifice', text: '붉은 빛. 불 속으로 뛰어드는 뒷모습.\n아이를 안고 나온다. 아무도 오지 않는다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"나에게는… 영광의 순간이 있었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    red_3_clear: {
        bgColor: '#120a0a',
        sequence: [
            { image: 'red_3_captive', text: '어두운 방. 천장의 얼굴들.\n무표정. 일을 하는 표정.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"나에게는… 희망을 가진 순간이 있었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    red_4_clear: {
        bgColor: '#0e0808',
        sequence: [
            { image: 'red_4_execution', text: '깜빡이는 장면들.\n칼. 밧줄. 주사기. 칼. 칼.\n"야, 힘들지? 3분만 쉬어."', duration: 3000, color: '#888888', size: '16px', y: 250 },
            { text: '"나에게는… 아무것도 없었다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    red_5_clear: {
        bgColor: '#0a0005',
        sequence: [
            { image: 'red_5_escape', text: '감금실. 관이 깨진다.\n그가 일어선다. 이쪽을 본다.', duration: 2500, color: '#888888', size: '16px', y: 250 },
            { text: '"오직 3분만이 나의 뇌리에 남았다."', duration: 3000, color: '#ff4444', size: '22px', y: 350 },
        ],
        // 엔딩 B로 연결
        nextScene: 'CutsceneScene',
        nextData: 'ending_b',
    },

    // ==========================================
    // 엔딩 B
    // ==========================================
    ending_b: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'ending_b_question', text: '검은 공간. 마왕이 서 있다.\n처음으로 얼굴이 보인다.', duration: 2500, color: '#888888', size: '16px', y: 230 },
            { text: null, duration: 2000 },
            { text: '"너는 어떤 선택을 하겠느냐."', duration: 2500, color: '#ff4444', size: '24px', y: 300 },
            { text: null, duration: 1500 },
            { text: '"...인류 문명에 도움이 된다면..."', duration: 2500, color: '#4fc3f7', size: '22px', y: 300 },
            { hideImage: true, text: null, duration: 2000 },
            // 가짜 스탭롤
            { text: '기획: ???\n프로그래밍: ???\n아트: ???', duration: 3000, color: '#ffffff', size: '18px', y: 300 },
            { text: null, duration: 1000 },
            { text: '아직 답을 갈구할 테지.\n아직 답을 갈구할 테지.\n아직 답을 갈구할 테지.', duration: 2000, color: '#ff0000', size: '20px', y: 300 },
            { text: null, duration: 1500 },
            { text: '진 레드 루트', duration: 2000, color: '#ff0000', size: '28px', y: 300 },
        ],
        nextScene: 'StageSelectScene',
    },

    // ==========================================
    // 진레드 스테이지 시작 전 다짐
    // ==========================================
    true_red_1_start: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'true_red_1_death', text: '1번째', duration: 2000, color: '#666666', size: '36px', y: 250 },
            { text: '"지워야 했다.\n나의 첫 번째 죽음을..."', duration: 3000, color: '#ff4444', size: '22px', y: 320 },
        ],
    },
    true_red_2_start: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'true_red_2_clan', text: '2,314번째', duration: 2000, color: '#666666', size: '36px', y: 250 },
            { text: '"없애야 했다.\n그 일족을..."', duration: 3000, color: '#ff4444', size: '22px', y: 320 },
        ],
    },
    true_red_3_start: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'true_red_3_prison', text: '347,262,423번째', duration: 2000, color: '#666666', size: '36px', y: 250 },
            { text: '"구해야 했다.\n갇혀 있는 나 자신을..."', duration: 3000, color: '#ff4444', size: '22px', y: 320 },
        ],
    },
    true_red_4_start: {
        bgColor: '#000000',
        typewriter: false,
        sequence: [
            { image: 'true_red_4_collapse', text: '9,283,742,618,394,726,153,847번째', duration: 2500, color: '#666666', size: '20px', y: 250 },
            { text: '"고쳐야 했다.\n시간 붕괴의 사건을..."', duration: 3000, color: '#ff4444', size: '22px', y: 320 },
        ],
    },
    true_red_5_start: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'true_red_5_city', text: '마지막', duration: 2500, color: '#ffffff', size: '36px', y: 250 },
            { text: '"찾아야 했다.\n너를..."', duration: 3000, color: '#ff4444', size: '22px', y: 320 },
        ],
    },

    // ==========================================
    // 진레드 클리어 후 결과
    // ==========================================
    true_red_1_clear: {
        bgColor: '#0a0005',
        sequence: [
            { image: 'true_red_1_death', text: '무수히 죽는 모습.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '"지울 수 없었다."', duration: 2500, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    true_red_2_clear: {
        bgColor: '#0a0005',
        sequence: [
            { image: 'true_red_2_clan', text: '다른 문양의 가문.\n또 당한다.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '"내 운명을 피할 순 없었다."', duration: 2500, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    true_red_3_clear: {
        bgColor: '#0a0005',
        sequence: [
            { image: 'true_red_3_prison', text: '갇혀 있는 곳을 찾지 못하는 마왕.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '"내가 갇힌 곳을 찾을 수 없었다."', duration: 2500, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    true_red_4_clear: {
        bgColor: '#0a0005',
        sequence: [
            { image: 'true_red_4_collapse', text: '사건에 접근하려는 마왕.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: '"나의 능력으로는 고칠 수 없었다."', duration: 2500, color: '#ff4444', size: '22px', y: 350 },
        ],
        nextScene: 'StageSelectScene',
    },
    true_red_5_clear: {
        bgColor: '#000000',
        sequence: [
            { image: 'true_red_5_city', text: '도심지. 밤.\n인트로와 같은 곳이다.', duration: 2000, color: '#888888', size: '16px', y: 250 },
            { text: null, duration: 1500 },
            { text: '"마지막으로 너의 선택에 걸어 보겠다."', duration: 3000, color: '#ff4444', size: '22px', y: 300 },
        ],
        // 엔딩 C로 연결
        nextScene: 'CutsceneScene',
        nextData: 'ending_c',
    },

    // ==========================================
    // 엔딩 C (진엔딩)
    // ==========================================
    ending_c: {
        bgColor: '#000000',
        typewriter: true,
        sequence: [
            { image: 'ending_c_01_sitting', text: '검은 공간.\n마왕이 앉아 있다. 처음 보는 모습이다.', duration: 2500, color: '#888888', size: '16px', y: 230 },
            { text: null, duration: 3000 },
            { text: '"너의 선택을 존중한다."', duration: 2500, color: '#ff4444', size: '24px', y: 300 },
            { text: null, duration: 2000 },
            { text: '"후회할지도 모르지만…\n난 선택했어."', duration: 3000, color: '#4fc3f7', size: '22px', y: 300 },
            { text: null, duration: 2000 },
            { text: '"...그래.\n그게 답이지."', duration: 3000, color: '#ff4444', size: '24px', y: 300 },
            { text: null, duration: 2000 },
            { image: 'ending_c_02_fade', text: '마왕이 투명해지기 시작한다.', duration: 2000, color: '#666666', size: '16px', y: 300 },
            { text: null, duration: 2000 },
            { text: '"고마웠다."', duration: 3000, color: '#ff4444', size: '18px', y: 300 },
            { text: null, duration: 3000 },
        ],
        // 오프닝(평범한 생일)으로
        nextScene: 'CutsceneScene',
        nextData: 'post_ending',
    },

    // ==========================================
    // 진엔딩 후 (평범한 생일 — 조작 불가)
    // ==========================================
    post_ending: {
        bgColor: '#000000',
        typewriter: false,
        sequence: [
            { image: 'opening_01_city', text: '도심지. 밤.', duration: 1500, color: '#cccccc', size: '16px', y: 300 },
            { image: 'opening_03_party', text: '"야, 케이크 아직?"', duration: 1500, color: '#ffffff', size: '20px', y: 280 },
            { text: '"12시 딱 되면 자를 거야."', duration: 1500, color: '#ffffff', size: '20px', y: 280 },
            { text: '00:00:00', duration: 1500, color: '#ffffff', size: '48px', y: 300 },
            { image: 'ending_c_03_birthday', text: '"생일 축하해!"', duration: 2000, color: '#ffd700', size: '28px', y: 300 },
            { text: '그냥 생일이다.', duration: 2000, color: '#cccccc', size: '18px', y: 300 },
            { text: null, duration: 2000 },
            { text: '아무 일도 일어나지 않는다.', duration: 99999, color: '#666666', size: '18px', y: 300 },
        ],
        // 여기서 끝. 조작 불가. (초기화는 BootScene에서 처리)
        nextScene: null,
    },
};
