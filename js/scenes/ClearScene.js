class ClearScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClearScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
    }

    create() {
        this.cameras.main.setBackgroundColor('#0f3460');

        // 진행 상태 저장
        const progress = StageProgress.clearStage(this.stageId);
        const stageData = STAGE_DATA[this.stageId];

        // 클리어 텍스트
        const clearText = this.add.text(400, 200,
            `${stageData.era} - ${stageData.name} 클리어!`, {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: clearText,
            alpha: 1, y: 180,
            duration: 1000,
            ease: 'Back.easeOut'
        });

        // 파티클
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(50, 400);
            const size = Phaser.Math.Between(3, 8);
            const color = Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b6b, 0x4fc3f7, 0x66bb6a]);
            const particle = this.add.circle(x, -20, size, color);
            this.tweens.add({
                targets: particle, y: y,
                duration: Phaser.Math.Between(1000, 2000),
                delay: Phaser.Math.Between(0, 1500),
                ease: 'Bounce.easeOut'
            });
        }

        // 탭하여 컷씬으로
        this.time.delayedCall(2000, () => {
            const tapText = this.add.text(400, 400, '탭하여 계속', {
                fontSize: '20px', color: '#aaaaaa'
            }).setOrigin(0.5);
            this.tweens.add({
                targets: tapText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1
            });

            const go = () => {
                // 해당 스테이지의 클리어 컷씬 찾기
                const cutsceneKey = this.stageId + '_clear';
                const cutsceneData = CUTSCENE_DATA[cutsceneKey];

                if (cutsceneData) {
                    this.scene.start('CutsceneScene', cutsceneData);
                } else {
                    // 컷씬 없으면 바로 스테이지 선택
                    this.scene.start('StageSelectScene');
                }
            };
            this.input.once('pointerdown', go);
            this.input.keyboard.once('keydown', go);
        });
    }
}
