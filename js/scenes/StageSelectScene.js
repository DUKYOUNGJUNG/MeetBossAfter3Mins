class StageSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageSelectScene' });
    }

    create() {
        const progress = StageProgress.load();
        this.progress = progress;

        if (progress.trueRedUnlocked) {
            this.createTrueRedSelect();
        } else if (progress.redUnlocked && !progress.redComplete) {
            this.createRedSelect();
        } else {
            this.createNormalSelect();
        }
    }

    createNormalSelect() {
        this.cameras.main.setBackgroundColor('#0f1a2e');
        const progress = this.progress;

        // 제목
        this.add.text(400, 40, '스테이지 선택', {
            fontSize: '28px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(400, 75, '노멀 루트 — 가문의 죄악', {
            fontSize: '14px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        // 생명력 표시
        const lives = StageProgress.getLives();
        this.add.text(20, 20, '❤'.repeat(lives) + '🖤'.repeat(3 - lives), {
            fontSize: '24px'
        });

        const stages = STAGE_ORDER.normal;
        const boxSize = 80;
        const gap = 40;
        const totalW = stages.length * boxSize + (stages.length - 1) * gap;
        const startX = (800 - totalW) / 2 + boxSize / 2;
        const centerY = 280;

        // 시대별 색상
        const eraColors = {
            normal_1: 0x8B7355,
            normal_2: 0x4A6670,
            normal_3: 0x7B6B5A,
            normal_4: 0x4A4A6A,
            normal_5: 0x3a506b,
        };

        stages.forEach((stageId, i) => {
            const x = startX + i * (boxSize + gap);
            const sd = STAGE_DATA[stageId];
            const cleared = progress.cleared[stageId];
            const unlocked = StageProgress.isUnlocked(stageId);

            // 연결선
            if (i < stages.length - 1) {
                const lineColor = progress.cleared[stages[i]] ? 0xffd700 : 0x333333;
                this.add.rectangle(x + (boxSize + gap) / 2, centerY, gap, 3, lineColor);
            }

            // 박스
            const boxColor = cleared ? (eraColors[stageId] || 0x3a506b) : 0x222222;
            const box = this.add.rectangle(x, centerY, boxSize, boxSize, boxColor)
                .setStrokeStyle(2, cleared ? 0xffd700 : (unlocked ? 0x666666 : 0x333333));

            // 내용
            if (cleared) {
                // 클리어: 시대 이름 + 번호
                this.add.text(x, centerY - 12, sd.era, {
                    fontSize: '14px', fontFamily: 'monospace', color: '#ffd700'
                }).setOrigin(0.5);
                this.add.text(x, centerY + 12, `${sd.stageNumber}`, {
                    fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
                }).setOrigin(0.5);
                // ✓ 표시
                this.add.text(x + 30, centerY - 30, '✓', {
                    fontSize: '16px', color: '#00ff88'
                }).setOrigin(0.5);
            } else if (unlocked) {
                // 해금됨: ?
                const q = this.add.text(x, centerY, '?', {
                    fontSize: '32px', fontFamily: 'monospace', color: '#aaaaaa'
                }).setOrigin(0.5);
                this.tweens.add({
                    targets: q, alpha: 0.4,
                    duration: 800, yoyo: true, repeat: -1
                });
            } else {
                // 잠김: 자물쇠
                this.add.text(x, centerY, '🔒', {
                    fontSize: '24px'
                }).setOrigin(0.5);
            }

            // 클릭 이벤트 (해금된 스테이지만)
            if (unlocked) {
                box.setInteractive({ useHandCursor: true });
                box.on('pointerdown', () => {
                    this.scene.start('GameScene', { stageId: stageId, testMode: this._testMode });
                });
            }
        });

        // 하단 안내
        const hint = this.add.text(400, 480, '스테이지를 탭하여 시작', {
            fontSize: '16px', fontFamily: 'monospace', color: '#666666'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: hint, alpha: 0.3,
            duration: 800, yoyo: true, repeat: -1
        });

        // 레드 루트 전환 버튼 (해금 시)
        if (this.progress.redUnlocked) {
            const redBtn = this.add.text(400, 540, '▶ 레드 루트', {
                fontSize: '18px', fontFamily: 'monospace',
                color: '#ff4444', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            redBtn.on('pointerdown', () => {
                this.isRedMode = true;
                this.scene.restart();
            });
        }

        // 초기화 버튼 + 테스트 모드 버튼
        this.addResetButton();
        this.addTestModeButton();
    }

    createRedSelect() {
        this.cameras.main.setBackgroundColor('#0a0508');
        const progress = this.progress;

        // 제목
        this.add.text(400, 40, '스테이지 선택', {
            fontSize: '28px', fontFamily: 'monospace',
            color: '#ff4444', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(400, 75, '레드 루트 — 마왕의 과거', {
            fontSize: '14px', fontFamily: 'monospace', color: '#884444'
        }).setOrigin(0.5);

        // 생명력 표시
        const lives = StageProgress.getLives();
        this.add.text(20, 20, '❤'.repeat(lives) + '🖤'.repeat(3 - lives), {
            fontSize: '24px'
        });

        const stages = STAGE_ORDER.red;
        const startX = 120;
        const centerY = 260;
        const stageGap = 140;

        // 레드 시대별 색상
        const redColors = {
            red_1: 0x8B6B55,
            red_2: 0x7B4A4A,
            red_3: 0x6B3A3A,
            red_4: 0x5C2A2A,
            red_5: 0x4A1A30,
        };

        stages.forEach((stageId, i) => {
            const x = startX + i * stageGap;
            const sd = STAGE_DATA[stageId];
            const cleared = progress.cleared[stageId];
            const unlocked = StageProgress.isUnlocked(stageId);

            // 연결선
            if (i < stages.length - 1) {
                const lineColor = progress.cleared[stages[i]] ? 0xff4444 : 0x331111;
                this.add.rectangle(x + stageGap / 2, centerY - 20, stageGap - 60, 2, lineColor);
            }

            // 시대 라벨
            this.add.text(x, centerY - 70, sd.era, {
                fontSize: '12px', fontFamily: 'monospace',
                color: cleared ? '#ff6666' : '#555555'
            }).setOrigin(0.5);

            // 5개 작은 박스 (프리셋 표현)
            const miniSize = 18;
            const miniGap = 4;
            const miniTotalW = 5 * miniSize + 4 * miniGap;
            const miniStartX = x - miniTotalW / 2 + miniSize / 2;

            for (let j = 0; j < 5; j++) {
                const mx = miniStartX + j * (miniSize + miniGap);
                const miniColor = cleared ? (redColors[stageId] || 0x5C2A2A) : 0x1a1010;
                this.add.rectangle(mx, centerY - 20, miniSize, miniSize, miniColor)
                    .setStrokeStyle(1, cleared ? 0xff4444 : 0x332222);
            }

            // 메인 박스
            const boxColor = cleared ? (redColors[stageId] || 0x5C2A2A) : 0x1a1010;
            const box = this.add.rectangle(x, centerY + 30, 60, 60, boxColor)
                .setStrokeStyle(2, cleared ? 0xff4444 : (unlocked ? 0x664444 : 0x332222));

            if (cleared) {
                this.add.text(x, centerY + 30, `${sd.stageNumber}`, {
                    fontSize: '20px', fontFamily: 'monospace', color: '#ff6666'
                }).setOrigin(0.5);
                this.add.text(x + 22, centerY + 8, '✓', {
                    fontSize: '14px', color: '#ff4444'
                }).setOrigin(0.5);
            } else if (unlocked) {
                const q = this.add.text(x, centerY + 30, '?', {
                    fontSize: '28px', fontFamily: 'monospace', color: '#aa4444'
                }).setOrigin(0.5);
                this.tweens.add({
                    targets: q, alpha: 0.3,
                    duration: 600, yoyo: true, repeat: -1
                });
            } else {
                this.add.text(x, centerY + 30, '🔒', { fontSize: '20px' }).setOrigin(0.5);
            }

            // 클릭 → 룰렛 연출 후 게임 시작
            if (unlocked) {
                box.setInteractive({ useHandCursor: true });
                box.on('pointerdown', () => {
                    this.startRouletteAndPlay(stageId, x, centerY - 20, miniStartX, miniSize, miniGap);
                });
            }
        });

        // 하단
        const hint = this.add.text(400, 480, '스테이지를 탭하여 시작 — 프리셋이 랜덤 선택됩니다', {
            fontSize: '13px', fontFamily: 'monospace', color: '#664444'
        }).setOrigin(0.5);

        // 노멀 루트 전환
        const normalBtn = this.add.text(400, 540, '◀ 노멀 루트', {
            fontSize: '18px', fontFamily: 'monospace',
            color: '#aaaaaa', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        normalBtn.on('pointerdown', () => {
            this.isRedMode = false;
            this.scene.restart();
        });

        // 초기화 버튼 + 테스트 모드 버튼
        this.addResetButton();
        this.addTestModeButton();
    }

    createTrueRedSelect() {
        this.cameras.main.setBackgroundColor('#020002');
        const progress = this.progress;

        // 제목
        this.add.text(400, 30, '진 레드 루트', {
            fontSize: '28px', fontFamily: 'monospace',
            color: '#ff0000', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(400, 60, '"시간"', {
            fontSize: '14px', fontFamily: 'monospace', color: '#884444'
        }).setOrigin(0.5);

        // 생명력
        const lives = StageProgress.getLives();
        this.add.text(20, 20, '❤'.repeat(lives) + '🖤'.repeat(3 - lives), { fontSize: '24px' });

        // 노멀 (위 — 비활성)
        const normalY = 130;
        this.add.text(400, normalY - 15, '노멀', { fontSize: '10px', fontFamily: 'monospace', color: '#333333' }).setOrigin(0.5);
        for (let i = 0; i < 5; i++) {
            this.add.rectangle(200 + i * 100, normalY + 10, 30, 30, 0x111111).setStrokeStyle(1, 0x222222);
            this.add.text(200 + i * 100, normalY + 10, '✓', { fontSize: '12px', color: '#333333' }).setOrigin(0.5);
        }

        // 레드 (중간 — 비활성, 남은 슬롯 표시)
        const redY = 220;
        this.add.text(400, redY - 15, '레드', { fontSize: '10px', fontFamily: 'monospace', color: '#442222' }).setOrigin(0.5);
        for (let i = 0; i < 5; i++) {
            this.add.rectangle(200 + i * 100, redY + 10, 30, 30, 0x1a0808).setStrokeStyle(1, 0x332222);
            this.add.text(200 + i * 100, redY + 10, '■', { fontSize: '10px', color: '#442222' }).setOrigin(0.5);
        }

        // 진레드 (아래 — 활성)
        const trueRedY = 370;
        const stages = STAGE_ORDER.true_red;
        const startX = 200;
        const gap = 100;

        stages.forEach((stageId, i) => {
            const x = startX + i * gap;
            const sd = STAGE_DATA[stageId];
            const cleared = progress.cleared[stageId];
            const unlocked = StageProgress.isUnlocked(stageId);

            // 연결선
            if (i < stages.length - 1) {
                const lineColor = cleared ? 0xff0000 : 0x220000;
                this.add.rectangle(x + gap / 2, trueRedY, gap - 50, 2, lineColor);
            }

            const boxColor = cleared ? 0x4A1A30 : 0x0a0005;
            const box = this.add.rectangle(x, trueRedY, 50, 50, boxColor)
                .setStrokeStyle(2, cleared ? 0xff0000 : (unlocked ? 0x664444 : 0x220000));

            if (cleared) {
                this.add.text(x, trueRedY, `${sd.stageNumber}`, {
                    fontSize: '18px', fontFamily: 'monospace', color: '#ff4444'
                }).setOrigin(0.5);
            } else if (unlocked) {
                const q = this.add.text(x, trueRedY, '?', {
                    fontSize: '24px', fontFamily: 'monospace', color: '#aa4444'
                }).setOrigin(0.5);
                this.tweens.add({ targets: q, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
            } else {
                this.add.text(x, trueRedY, '🔒', { fontSize: '18px' }).setOrigin(0.5);
            }

            if (unlocked) {
                box.setInteractive({ useHandCursor: true });
                box.on('pointerdown', () => {
                    // 진레드 시작 전 다짐 컷씬
                    const startCutscene = CUTSCENE_DATA[`true_red_${sd.stageNumber}_start`];
                    if (startCutscene) {
                        const csData = { ...startCutscene, nextScene: 'GameScene', nextData: { stageId: stageId, testMode: this._testMode } };
                        this.scene.start('CutsceneScene', csData);
                    } else {
                        this.scene.start('GameScene', { stageId: stageId, testMode: this._testMode });
                    }
                });
            }
        });

        // 하단
        const hint = this.add.text(400, 500, '스테이지를 탭하여 시작', {
            fontSize: '13px', fontFamily: 'monospace', color: '#664444'
        }).setOrigin(0.5);

        this.addResetButton();
        this.addTestModeButton();
    }

    addResetButton() {
        const resetBtn = this.add.text(780, 580, '🔄 초기화', {
            fontSize: '14px', fontFamily: 'monospace',
            color: '#666666'
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        resetBtn.on('pointerdown', () => {
            StageProgress.reset();
            this.scene.start('TutorialScene');
        });
    }

    addTestModeButton() {
        if (!this._testMode) this._testMode = false;
        const btn = this.add.text(20, 580, this._testMode ? '🧪 테스트 ON' : '🧪 테스트 OFF', {
            fontSize: '14px', fontFamily: 'monospace',
            color: this._testMode ? '#00ff88' : '#666666'
        }).setOrigin(0, 1).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this._testMode = !this._testMode;
            btn.setText(this._testMode ? '🧪 테스트 ON' : '🧪 테스트 OFF');
            btn.setColor(this._testMode ? '#00ff88' : '#666666');
        });
    }

    startRouletteAndPlay(stageId, x, y, miniStartX, miniSize, miniGap) {
        // 입력 잠금
        this.input.enabled = false;

        // 룰렛 효과: 5개 박스를 빠르게 하이라이트
        let current = 0;
        let speed = 80;
        let rounds = 0;
        const totalRounds = 15 + Phaser.Math.Between(3, 8); // 15~23회 회전
        const finalIndex = Phaser.Math.Between(0, 4);
        const highlights = [];

        // 하이라이트 박스 5개 생성
        for (let j = 0; j < 5; j++) {
            const mx = miniStartX + j * (miniSize + miniGap);
            const hl = this.add.rectangle(mx, y, miniSize + 4, miniSize + 4, 0xff4444, 0)
                .setStrokeStyle(2, 0xff4444);
            highlights.push(hl);
        }

        const step = () => {
            // 이전 하이라이트 끄기
            highlights.forEach(h => h.setAlpha(0));

            // 현재 하이라이트
            highlights[current].setAlpha(1);

            rounds++;
            current = (current + 1) % 5;

            // 마지막 몇 회는 느려짐
            if (rounds > totalRounds - 5) {
                speed += 60;
            }
            if (rounds > totalRounds - 3) {
                speed += 100;
            }

            if (rounds >= totalRounds) {
                // 최종 선택
                highlights.forEach(h => h.setAlpha(0));
                highlights[finalIndex].setAlpha(1);

                // 깜빡임
                this.tweens.add({
                    targets: highlights[finalIndex],
                    alpha: 0.3, duration: 200,
                    yoyo: true, repeat: 3,
                    onComplete: () => {
                        this.cameras.main.fadeOut(500, 0, 0, 0);
                        this.time.delayedCall(500, () => {
                            this.scene.start('GameScene', { stageId: stageId, testMode: this._testMode });
                        });
                    }
                });
            } else {
                this.time.delayedCall(speed, step);
            }
        };

        step();
    }
}
