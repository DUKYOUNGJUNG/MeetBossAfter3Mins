// 스테이지 진행/해금 관리 (localStorage 기반)
const StageProgress = {
    STORAGE_KEY: 'meetboss_progress',

    getDefault() {
        return {
            currentRoute: 'normal',
            currentStage: 'normal_1',
            cleared: {},
            tutorialDone: false,
            normalComplete: false,
            redUnlocked: false,
            redComplete: false,
        };
    },

    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {
            // localStorage 접근 불가 시 기본값
        }
        return this.getDefault();
    },

    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // 저장 실패 무시
        }
    },

    // 스테이지 클리어 처리
    clearStage(stageId) {
        const progress = this.load();
        progress.cleared[stageId] = true;

        // 노멀 전체 클리어 체크
        const allNormalCleared = STAGE_ORDER.normal.every(id => progress.cleared[id]);
        if (allNormalCleared) {
            progress.normalComplete = true;
            progress.redUnlocked = true;
        }

        // 레드 전체 클리어 체크
        const allRedCleared = STAGE_ORDER.red.every(id => progress.cleared[id]);
        if (allRedCleared) {
            progress.redComplete = true;
        }

        this.save(progress);
        return progress;
    },

    // 다음 스테이지 반환 (null이면 루트 끝)
    getNextStage(stageId) {
        const stage = STAGE_DATA[stageId];
        const order = STAGE_ORDER[stage.route];
        const idx = order.indexOf(stageId);
        if (idx < order.length - 1) {
            return order[idx + 1];
        }
        return null; // 마지막 스테이지
    },

    // 해금 여부
    isUnlocked(stageId) {
        const stage = STAGE_DATA[stageId];
        if (!stage) return false;

        // 노멀 1은 항상 해금
        if (stageId === 'normal_1') return true;

        const progress = this.load();

        // 레드 루트: 노멀 전체 클리어 필요
        if (stage.route === 'red') {
            if (!progress.redUnlocked) return false;
            if (stageId === 'red_1') return true;
            // 이전 레드 스테이지 클리어 필요
            const order = STAGE_ORDER.red;
            const idx = order.indexOf(stageId);
            return idx > 0 && progress.cleared[order[idx - 1]];
        }

        // 노멀 루트: 이전 스테이지 클리어 필요
        const order = STAGE_ORDER.normal;
        const idx = order.indexOf(stageId);
        return idx > 0 && progress.cleared[order[idx - 1]];
    },

    // 전체 초기화
    reset() {
        this.save(this.getDefault());
    },
};
