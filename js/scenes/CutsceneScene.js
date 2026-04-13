// 범용 컷씬 재생 씬
// 텍스트 시퀀스를 순서대로 표시하고, 끝나면 지정된 다음 씬으로 전환
class CutsceneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CutsceneScene' });
    }

    init(data) {
        // data가 문자열이면 CUTSCENE_DATA에서 로드
        if (typeof data === 'string') {
            data = CUTSCENE_DATA[data] || {};
        }
        // data.cutsceneId로도 지정 가능
        if (data.cutsceneId) {
            const csData = CUTSCENE_DATA[data.cutsceneId] || {};
            data = { ...csData, ...data };
        }
        this.sequence = data.sequence || [];
        this.nextScene = data.nextScene || 'StageSelectScene';
        this.nextData = data.nextData || {};
        this.bgColor = data.bgColor || '#000000';
        this.typewriter = data.typewriter || false;
    }

    create() {
        this.cameras.main.setBackgroundColor(this.bgColor);
        this.cameras.main.fadeIn(500);

        const W = 800;
        const H = 600;
        this.currentIndex = 0;

        // 시퀀스가 비어있으면 바로 다음 씬
        if (this.sequence.length === 0) {
            this.goNext();
            return;
        }

        this.showNext();
    }

    showNext() {
        const W = 800;
        const H = 600;

        if (this.currentIndex >= this.sequence.length) {
            if (!this.nextScene) {
                // 끝. 조작 불가 (진엔딩 후)
                return;
            }
            // 시퀀스 끝 — 탭하여 계속
            const continueText = this.add.text(W / 2, H - 60, '탭하여 계속', {
                fontSize: '18px', fontFamily: 'monospace', color: '#666666'
            }).setOrigin(0.5);
            this.tweens.add({
                targets: continueText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1
            });
            const go = () => this.goNext();
            this.input.once('pointerdown', go);
            this.input.keyboard.once('keydown', go);
            return;
        }

        const item = this.sequence[this.currentIndex];
        const color = item.color || '#ffffff';
        const size = item.size || '22px';
        const duration = item.duration || 2000;
        const delay = item.delay || 0;
        const y = item.y || (H / 2);

        this.time.delayedCall(delay, () => {
            if (this.typewriter && item.text) {
                // 타자기 효과
                const textObj = this.add.text(W / 2, y, '', {
                    fontSize: size, fontFamily: 'monospace',
                    color: color, stroke: '#000000', strokeThickness: 2,
                    align: 'center', wordWrap: { width: 700 }
                }).setOrigin(0.5).setAlpha(1);

                let charIdx = 0;
                const fullText = item.text;
                const typeTimer = this.time.addEvent({
                    delay: 60,
                    callback: () => {
                        charIdx++;
                        textObj.setText(fullText.substring(0, charIdx));
                        if (charIdx >= fullText.length) {
                            typeTimer.remove();
                            this.time.delayedCall(duration, () => {
                                this.tweens.add({
                                    targets: textObj, alpha: 0, duration: 500,
                                    onComplete: () => {
                                        textObj.destroy();
                                        this.currentIndex++;
                                        this.showNext();
                                    }
                                });
                            });
                        }
                    },
                    loop: true
                });
            } else if (item.text) {
                // 페이드 효과
                const textObj = this.add.text(W / 2, y, item.text, {
                    fontSize: size, fontFamily: 'monospace',
                    color: color, stroke: '#000000', strokeThickness: 2,
                    align: 'center', wordWrap: { width: 700 }
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: textObj, alpha: 1, duration: 500,
                    onComplete: () => {
                        this.time.delayedCall(duration, () => {
                            this.tweens.add({
                                targets: textObj, alpha: 0, duration: 500,
                                onComplete: () => {
                                    textObj.destroy();
                                    this.currentIndex++;
                                    this.showNext();
                                }
                            });
                        });
                    }
                });
            } else {
                // 텍스트 없이 딜레이만
                this.time.delayedCall(duration, () => {
                    this.currentIndex++;
                    this.showNext();
                });
            }
        });
    }

    goNext() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(this.nextScene, this.nextData);
        });
    }
}
