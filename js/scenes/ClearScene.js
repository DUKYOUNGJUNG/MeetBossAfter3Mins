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
        const nextStageId = StageProgress.getNextStage(this.stageId);

        // 클리어 텍스트
        const clearText = this.add.text(400, 200,
            `🎉 ${stageData.era} - ${stageData.name} 클리어! 🎉`, {
            fontSize: '30px',
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

        // 축하 메시지
        this.time.delayedCall(1000, () => {
            const subText = this.add.text(400, 280, '보스가 오기 전에 모든 열쇠를 찾았다!', {
                fontSize: '20px',
                color: '#e0e0e0'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({ targets: subText, alpha: 1, duration: 800 });
        });

        // 파티클
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(50, 550);
            const size = Phaser.Math.Between(3, 8);
            const color = Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b6b, 0x4fc3f7, 0x66bb6a]);
            const particle = this.add.circle(x, -20, size, color);
            this.tweens.add({
                targets: particle,
                y: y,
                duration: Phaser.Math.Between(1000, 2000),
                delay: Phaser.Math.Between(0, 1500),
                ease: 'Bounce.easeOut'
            });
        }

        // 다음 행동 결정
        this.time.delayedCall(2500, () => {
            if (nextStageId) {
                // 다음 스테이지로
                const nextData = STAGE_DATA[nextStageId];
                const nextText = this.add.text(400, 420,
                    `다음: ${nextData.era} - ${nextData.name}`, {
                    fontSize: '18px',
                    color: '#aaaaaa'
                }).setOrigin(0.5);

                const continueText = this.add.text(400, 460, '탭하여 계속', {
                    fontSize: '24px',
                    color: '#ffffff'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: continueText,
                    alpha: 0.3, duration: 800, yoyo: true, repeat: -1
                });

                const goNext = () => {
                    this.scene.start('GameScene', { stageId: nextStageId });
                };
                this.input.once('pointerdown', goNext);
                this.input.keyboard.once('keydown', goNext);

            } else if (stageData.route === 'normal' && progress.redUnlocked) {
                // 노멀 루트 완료 → 레드 루트 해금
                const endText = this.add.text(400, 400, '노멀 루트 완료', {
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    color: '#ff4444',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({ targets: endText, alpha: 1, duration: 800 });

                this.time.delayedCall(1500, () => {
                    const unlockText = this.add.text(400, 450,
                        '"이번엔 내 이야기를 보여주마."', {
                        fontSize: '20px',
                        fontFamily: 'monospace',
                        color: '#ff6666'
                    }).setOrigin(0.5).setAlpha(0);

                    this.tweens.add({ targets: unlockText, alpha: 1, duration: 800 });

                    this.time.delayedCall(2000, () => {
                        const startRed = this.add.text(400, 510, '탭하여 레드 루트 시작', {
                            fontSize: '22px',
                            color: '#ffffff'
                        }).setOrigin(0.5);

                        this.tweens.add({
                            targets: startRed,
                            alpha: 0.3, duration: 800, yoyo: true, repeat: -1
                        });

                        const goRed = () => {
                            this.scene.start('GameScene', { stageId: 'red_1' });
                        };
                        this.input.once('pointerdown', goRed);
                        this.input.keyboard.once('keydown', goRed);
                    });
                });

            } else if (stageData.route === 'red' && progress.redComplete) {
                // 레드 루트 완료 → 최종 엔딩
                const finalText = this.add.text(400, 400,
                    '"그래도 만들겠느냐? 그 기술을."', {
                    fontSize: '22px',
                    fontFamily: 'monospace',
                    color: '#ff4444',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({ targets: finalText, alpha: 1, duration: 1500 });

                this.time.delayedCall(3000, () => {
                    const endMsg = this.add.text(400, 470, '탭하여 처음으로', {
                        fontSize: '20px',
                        color: '#aaaaaa'
                    }).setOrigin(0.5);

                    this.tweens.add({
                        targets: endMsg,
                        alpha: 0.3, duration: 800, yoyo: true, repeat: -1
                    });

                    const goStart = () => {
                        this.scene.start('StageSelectScene');
                    };
                    this.input.once('pointerdown', goStart);
                    this.input.keyboard.once('keydown', goStart);
                });
            }
        });
    }
}
