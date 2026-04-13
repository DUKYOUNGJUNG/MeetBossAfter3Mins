// 게임 시작 시 진행 상태에 따라 분기
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const progress = StageProgress.load();

        if (progress.trueRedComplete) {
            // 진엔딩 봤으면 → 평범한 생일 (조작 불가)
            this.scene.start('CutsceneScene', CUTSCENE_DATA.post_ending);
        } else if (progress.tutorialDone) {
            // 튜토리얼 완료 → 스테이지 선택
            this.scene.start('StageSelectScene');
        } else {
            // 첫 플레이 → 오프닝
            this.scene.start('CutsceneScene', CUTSCENE_DATA.opening);
        }
    }
}
