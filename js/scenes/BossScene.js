class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a0a');
        this.cameras.main.shake(500, 0.02);

        // 경고 텍스트
        const warning = this.add.text(400, 150, '⚠ 보스 등장 ⚠', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: warning,
            alpha: 1,
            duration: 500,
            yoyo: true,
            repeat: 2
        });

        // 보스 그래픽
        if (!this.textures.exists('boss')) {
            const bg = this.add.graphics();
            bg.fillStyle(0xff0000);
            bg.fillRect(0, 0, 120, 120);
            bg.fillStyle(0xcc0000);
            bg.fillRect(10, 10, 100, 100);
            bg.fillStyle(0xffffff);
            bg.fillRect(25, 30, 25, 25);
            bg.fillRect(70, 30, 25, 25);
            bg.fillStyle(0xff0000);
            bg.fillRect(35, 40, 10, 10);
            bg.fillRect(80, 40, 10, 10);
            bg.fillStyle(0x000000);
            bg.fillRect(30, 75, 60, 15);
            bg.generateTexture('boss', 120, 120);
            bg.destroy();
        }

        const boss = this.add.image(400, 600, 'boss').setOrigin(0.5);

        this.tweens.add({
            targets: boss,
            y: 350,
            duration: 1500,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.time.delayedCall(800, () => {
                    this.cameras.main.flash(500, 255, 0, 0);

                    const deathText = this.add.text(400, 250, '사망...', {
                        fontSize: '48px',
                        fontFamily: 'monospace',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 6
                    }).setOrigin(0.5).setAlpha(0);

                    this.tweens.add({ targets: deathText, alpha: 1, duration: 800 });

                    this.time.delayedCall(2000, () => {
                        const restartText = this.add.text(400, 450, '탭하여 다시 도전', {
                            fontSize: '24px',
                            color: '#aaaaaa'
                        }).setOrigin(0.5);

                        this.tweens.add({
                            targets: restartText,
                            alpha: 0.3, duration: 800, yoyo: true, repeat: -1
                        });

                        // 같은 스테이지 재도전
                        const restart = () => {
                            this.scene.start('GameScene', { stageId: this.stageId });
                        };
                        this.input.once('pointerdown', restart);
                        this.input.keyboard.once('keydown', restart);
                    });
                });
            }
        });
    }
}
