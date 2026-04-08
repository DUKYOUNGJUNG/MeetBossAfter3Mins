class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // 화면 흔들림 효과
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

        // 보스 (큰 빨간 사각형)
        const bossGraphics = this.add.graphics();
        bossGraphics.fillStyle(0xff0000);
        bossGraphics.fillRect(0, 0, 120, 120);
        bossGraphics.fillStyle(0xcc0000);
        bossGraphics.fillRect(10, 10, 100, 100);
        // 눈
        bossGraphics.fillStyle(0xffffff);
        bossGraphics.fillRect(25, 30, 25, 25);
        bossGraphics.fillRect(70, 30, 25, 25);
        bossGraphics.fillStyle(0xff0000);
        bossGraphics.fillRect(35, 40, 10, 10);
        bossGraphics.fillRect(80, 40, 10, 10);
        // 입
        bossGraphics.fillStyle(0x000000);
        bossGraphics.fillRect(30, 75, 60, 15);
        bossGraphics.generateTexture('boss', 120, 120);
        bossGraphics.destroy();

        const boss = this.add.image(400, 600, 'boss').setOrigin(0.5);

        // 보스 등장 애니메이션
        this.tweens.add({
            targets: boss,
            y: 350,
            duration: 1500,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                // 사망 연출
                this.time.delayedCall(800, () => {
                    this.cameras.main.flash(500, 255, 0, 0);

                    const deathText = this.add.text(400, 250, '사망...', {
                        fontSize: '48px',
                        fontFamily: 'monospace',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 6
                    }).setOrigin(0.5).setAlpha(0);

                    this.tweens.add({
                        targets: deathText,
                        alpha: 1,
                        duration: 800
                    });

                    // 다시 시작 안내
                    this.time.delayedCall(2000, () => {
                        const restartText = this.add.text(400, 450, '탭하여 다시 도전', {
                            fontSize: '24px',
                            color: '#aaaaaa'
                        }).setOrigin(0.5);

                        this.tweens.add({
                            targets: restartText,
                            alpha: 0.3,
                            duration: 800,
                            yoyo: true,
                            repeat: -1
                        });

                        // 클릭/탭으로 재시작
                        this.input.once('pointerdown', () => {
                            this.scene.start('GameScene');
                        });

                        // 키보드로도 재시작
                        this.input.keyboard.once('keydown', () => {
                            this.scene.start('GameScene');
                        });
                    });
                });
            }
        });
    }
}
