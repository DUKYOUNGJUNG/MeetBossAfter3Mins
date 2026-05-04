// 스테이지 데이터 통합 + 순서 정의
// 실제 스테이지 정의는 js/data/stages/ 하위 파일들에 있음
// (normal.js / red.js / true_red.js → STAGES_NORMAL / STAGES_RED / STAGES_TRUE_RED)

const STAGE_DATA = {
    ...STAGES_NORMAL,
    ...STAGES_RED,
    ...STAGES_TRUE_RED,
};

const STAGE_ORDER = {
    normal: ['normal_1', 'normal_2', 'normal_3', 'normal_4', 'normal_5'],
    red: ['red_1', 'red_2', 'red_3', 'red_4', 'red_5'],
    true_red: ['true_red_1', 'true_red_2', 'true_red_3', 'true_red_4', 'true_red_5'],
};
