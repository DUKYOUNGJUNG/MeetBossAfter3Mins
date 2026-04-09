// 인트로 컷씬: 마왕의 첫 대사 후 1스테이지 시작
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const W = 800;
        const H = 600;

        // 1단계: 화면 암전 후 생일 카운트다운
        this.time.delayedCall(800, () => {
            const birthday = this.add.text(W / 2, H / 2 - 40, '00:00', {
                fontSize: '48px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: birthday,
                alpha: 1,
                duration: 1000
            });

            // 2단계: 화면 흔들림 + 시계 깨짐
            this.time.delayedCall(2000, () => {
                this.cameras.main.shake(500, 0.02);

                this.tweens.add({
                    targets: birthday,
                    alpha: 0,
                    scaleX: 2,
                    scaleY: 2,
                    duration: 500
                });

                // 3단계: 마왕 대사
                this.time.delayedCall(1200, () => {
                    const bossText = this.add.text(W / 2, H / 2, '', {
                        fontSize: '24px',
                        fontFamily: 'monospace',
                        color: '#ff4444',
                        stroke: '#000000',
                        strokeThickness: 2,
                        align: 'center'
                    }).setOrigin(0.5);

                    // 타자기 효과
                    const fullText = '"3분 주마.\n찾아봐. 이유를."';
                    let charIndex = 0;
                    const typeTimer = this.time.addEvent({
                        delay: 80,
                        callback: () => {
                            charIndex++;
                            bossText.setText(fullText.substring(0, charIndex));
                            if (charIndex >= fullText.length) {
                                typeTimer.remove();

                                // 4단계: 탭하여 시작
                                this.time.delayedCall(1500, () => {
                                    const startText = this.add.text(W / 2, H - 80, '탭하여 시작', {
                                        fontSize: '18px',
                                        fontFamily: 'monospace',
                                        color: '#666666'
                                    }).setOrigin(0.5).setAlpha(0);

                                    this.tweens.add({
                                        targets: startText,
                                        alpha: 1,
                                        duration: 500
                                    });

                                    // 깜빡임
                                    this.tweens.add({
                                        targets: startText,
                                        alpha: 0.3,
                                        duration: 800,
                                        yoyo: true,
                                        repeat: -1,
                                        delay: 500
                                    });

                                    // 입력 대기
                                    this.input.once('pointerdown', () => {
                                        this.cameras.main.fadeOut(500, 0, 0, 0);
                                        this.time.delayedCall(500, () => {
                                            this.scene.start('GameScene', { stageId: 'normal_1' });
                                        });
                                    });
                                    this.input.keyboard.once('keydown', () => {
                                        this.cameras.main.fadeOut(500, 0, 0, 0);
                                        this.time.delayedCall(500, () => {
                                            this.scene.start('GameScene', { stageId: 'normal_1' });
                                        });
                                    });
                                });
                            }
                        },
                        loop: true
                    });
                });
            });
        });
    }
}
