// 오프닝 → CutsceneScene으로 위임
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        this.scene.start('CutsceneScene', CUTSCENE_DATA.opening);
    }
}
