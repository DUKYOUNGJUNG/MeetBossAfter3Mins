class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
        this.stageData = STAGE_DATA[this.stageId];
        this.testMode = data && data.testMode ? true : false;
        // 디버그/룰렛 — itemPresets 인덱스 강제 (없으면 ItemManager가 랜덤 선택)
        this.presetIndex = data && data.presetIndex != null ? data.presetIndex : null;
    }

    preload() {
        PlayerController.preloadSprites(this);
        // 스테이지별 타일 텍스처 (있으면)
        if (this.stageData.map.tileKey) {
            const key = this.stageData.map.tileKey;
            if (!this.textures.exists(key)) {
                this.load.image(key, `assets/tiles/${key}.png`);
            }
        }
    }

    create() {
        PlayerController.createAnimations(this);
        const sd = this.stageData;
        const mapW = sd.map.width;
        const mapH = sd.map.height;

        this.cameras.main.setBackgroundColor(sd.map.backgroundColor);
        this.input.addPointer(3);

        // 플랫폼
        this.platforms = this.physics.add.staticGroup();
        this.createMap();

        // 플레이어 컨트롤러
        this.pc = new PlayerController(this, { afterImage: true });
        this.pc.createPlayerTexture();

        // 플레이어 (스프라이트 로드 시 첫 프레임, 아니면 폴백 텍스처)
        const playerKey = this.textures.exists('idle_east_0') ? 'idle_east_0' : 'player';
        this.player = this.physics.add.sprite(sd.spawn.x, sd.spawn.y, playerKey);
        this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        this.player.body.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);

        // 피격/낙사 상태
        this.isRespawning = false;

        // 이동 발판
        this.movingPlatforms = this.physics.add.group();
        this.createMovingPlatforms();

        // 충돌
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatforms);

        // 아이템
        ItemManager.createTexture(this);
        this.itemMgr = new ItemManager(this);
        this.collectedCount = 0;
        // itemPresets 인덱스 결정 (디버그로 지정 안 됐으면 랜덤)
        if (sd.itemPresets && sd.itemPresets.length > 0) {
            this.currentPreset = this.presetIndex != null
                ? this.presetIndex
                : Phaser.Math.Between(0, sd.itemPresets.length - 1);
        }
        this.totalItems = this.itemMgr.spawnFromStage(sd, this.testMode, this.currentPreset);
        this.physics.add.overlap(this.player, this.itemMgr.items, this.collectItem, null, this);

        // 적
        EnemyManager.createTextures(this);
        this.enemyMgr = new EnemyManager(this);
        this.enemyMgr.spawnAll(sd.enemies);
        this.physics.add.collider(this.enemyMgr.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemyMgr.enemies, this.onEnemyHit, null, this);
        this.physics.add.overlap(this.player, this.enemyMgr.projectiles, this.onEnemyHit, null, this);

        // 타이머
        this.timeLeft = sd.timeLimit;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // 키보드
        this.pc.setupKeyboard();

        // 디버그: V키로 다음 변주(itemPresets)로 씬 재시작
        if (sd.itemPresets && sd.itemPresets.length > 0) {
            this.input.keyboard.on('keydown-V', () => {
                const next = ((this.currentPreset || 0) + 1) % sd.itemPresets.length;
                this.scene.restart({ stageId: this.stageId, testMode: this.testMode, presetIndex: next });
            });
        }

        // 카메라
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.physics.world.setBounds(0, 0, mapW, mapH + 300);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.3);

        // UI 카메라
        this.uiCamera = this.cameras.add(0, 0, 800, 600);
        this.uiCamera.setScroll(0, 0);

        // UI 레이어
        this.uiLayer = this.add.container(0, 0);

        // 타이머 텍스트
        this.timerText = this.add.text(400, 16, this.formatTime(this.timeLeft), {
            fontSize: '28px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5, 0);

        // 스테이지 정보
        const stageInfo = this.add.text(400, 50, `${sd.era} - ${sd.name}`, {
            fontSize: '14px', fontFamily: 'monospace',
            color: '#888888', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5, 0);

        // 생명력 표시
        const lives = StageProgress.getLives();
        const livesText = this.add.text(16, 44, '\u2764'.repeat(lives) + '\uD83D\uDDA4'.repeat(3 - lives), {
            fontSize: '18px'
        });

        // 아이템 카운터
        this.itemText = this.add.text(16, 16, '\uD83D\uDD11 0 / 5', {
            fontSize: '22px', color: '#ffd700',
            stroke: '#000000', strokeThickness: 3
        });

        // 버전
        const versionText = this.add.text(784, 16, 'v0.1.0', {
            fontSize: '14px', fontFamily: 'monospace', color: '#666666'
        }).setOrigin(1, 0);

        // 변주 인디케이터 (디버그) — itemPresets 있을 때만
        const uiItems = [this.timerText, stageInfo, versionText, this.itemText, livesText];
        if (sd.itemPresets && sd.itemPresets.length > 0) {
            const varText = this.add.text(784, 36, `[V] 변주 ${this.currentPreset + 1}/${sd.itemPresets.length}`, {
                fontSize: '12px', fontFamily: 'monospace', color: '#aa66ff'
            }).setOrigin(1, 0);
            uiItems.push(varText);
            this.cameras.main.ignore(varText);
        }

        // UI 컨테이너
        this.uiLayer.add(uiItems);

        // 메인 카메라는 UI 무시
        this.cameras.main.ignore(this.uiLayer);
        this.cameras.main.ignore(this.timerText);
        this.cameras.main.ignore(stageInfo);
        this.cameras.main.ignore(versionText);
        this.cameras.main.ignore(this.itemText);
        this.cameras.main.ignore(livesText);

        // UI 카메라는 게임 오브젝트 무시
        this.platforms.getChildren().forEach(p => this.uiCamera.ignore(p));
        this.itemMgr.items.getChildren().forEach(i => this.uiCamera.ignore(i));
        this.uiCamera.ignore(this.player);
        this.enemyMgr.enemies.getChildren().forEach(e => this.uiCamera.ignore(e));

        // 터치 컨트롤
        const touchElements = this.pc.createTouchControls(800, 600);
        this.uiLayer.add(touchElements);
        touchElements.forEach(el => this.cameras.main.ignore(el));
    }

    createMap() {
        const sd = this.stageData;
        const defaultColor = sd.map.platformColor;
        const accentColor = sd.map.accentColor;
        const tileKey = sd.map.tileKey;
        const useTexture = tileKey && this.textures.exists(tileKey);

        const addPlat = (x, y, w, h, color) => {
            if (useTexture) {
                // 타일 텍스처를 plat 영역에 자동 반복
                const ts = this.add.tileSprite(x + w / 2, y + h / 2, w, h, tileKey);
                this.physics.add.existing(ts, true);
                this.platforms.add(ts);
                return ts;
            }
            return PlayerController.addPlatform(this, this.platforms, x, y, w, h, color, `plat_${this.stageId}`);
        };

        // 일반 플랫폼
        sd.platforms.forEach((p) => {
            const color = p.color != null ? p.color : defaultColor;
            addPlat(p.x, p.y, p.w, p.h, color);
        });

        // 벽
        if (sd.walls) {
            sd.walls.forEach(w => addPlat(w.x, w.y, w.w, w.h, accentColor));
        }

        // 좌우 경계 벽 (모든 맵 공통 — 떨어져 죽는 것 방지). 배경색과 동일하게 안 보이게
        const BOUND_W = 10;
        const bgInt = parseInt(sd.map.backgroundColor.replace('#', ''), 16);
        PlayerController.addPlatform(this, this.platforms, 0, 0, BOUND_W, sd.map.height, bgInt, 'bound_l');
        PlayerController.addPlatform(this, this.platforms, sd.map.width - BOUND_W, 0, BOUND_W, sd.map.height, bgInt, 'bound_r');
    }

    createMovingPlatforms() {
        const sd = this.stageData;
        if (!sd.movingPlatforms || sd.movingPlatforms.length === 0) return;

        sd.movingPlatforms.forEach(mp => {
            const w = mp.w || 120;
            const h = mp.h || 16;
            const key = `mplat_${mp.x}_${mp.y}_${w}`;
            if (!this.textures.exists(key)) {
                const g = this.add.graphics();
                g.fillStyle(mp.color || sd.map.platformColor);
                g.fillRect(0, 0, w, h);
                g.fillStyle(0xffffff, 0.1);
                for (let i = 0; i < w; i += 8) {
                    g.fillRect(i, 0, 4, h);
                }
                g.generateTexture(key, w, h);
                g.destroy();
            }

            const plat = this.movingPlatforms.create(mp.x + w / 2, mp.y + h / 2, key);
            plat.setDisplaySize(w, h);
            plat.setImmovable(true);
            plat.body.allowGravity = false;

            const speed = mp.speed || 50;
            plat.setData('moveType', mp.moveType);
            plat.setData('startX', mp.x + w / 2);
            plat.setData('startY', mp.y + h / 2);
            plat.setData('distance', mp.distance || 200);
            plat.setData('speed', speed);

            // 초기 velocity (시작은 +방향)
            if (mp.moveType === 'horizontal') plat.setVelocityX(speed);
            else if (mp.moveType === 'vertical') plat.setVelocityY(speed);

            if (this.uiCamera) this.uiCamera.ignore(plat);
        });
    }

    updateMovingPlatforms(time) {
        const children = this.movingPlatforms.getChildren();
        if (children.length === 0) return;

        children.forEach(plat => {
            const moveType = plat.getData('moveType');
            const startX = plat.getData('startX');
            const startY = plat.getData('startY');
            const dist = plat.getData('distance');
            const speed = plat.getData('speed');

            // setVelocity 기반 왕복: 데이터 speed = px/s, distance = 진폭
            if (moveType === 'horizontal') {
                if (plat.x >= startX + dist && plat.body.velocity.x > 0) plat.setVelocityX(-speed);
                else if (plat.x <= startX - dist && plat.body.velocity.x < 0) plat.setVelocityX(speed);
            } else if (moveType === 'vertical') {
                if (plat.y >= startY + dist && plat.body.velocity.y > 0) plat.setVelocityY(-speed);
                else if (plat.y <= startY - dist && plat.body.velocity.y < 0) plat.setVelocityY(speed);
            }
        });
    }

    onEnemyHit(player, enemy) {
        if (this.isRespawning) return;
        if (enemy.getData && enemy.getData('type') === 'sealer') return;  // sealer는 봉인만, 데미지 없음
        this.takeDamage();

        if (this.enemyMgr.projectiles.contains(enemy)) {
            enemy.destroy();
        }
    }

    collectItem(player, item) {
        const itemName = item.getData('itemName');
        item.destroy();
        this.collectedCount++;
        this.itemText.setText(`\uD83D\uDD11 ${this.collectedCount} / ${this.totalItems}`);

        // 수집 이펙트
        const flash = this.add.circle(item.x, item.y, 20, 0xffd700, 0.8);
        if (this.uiCamera) this.uiCamera.ignore(flash);
        this.tweens.add({
            targets: flash,
            scale: 2, alpha: 0, duration: 300,
            onComplete: () => flash.destroy()
        });

        // 아이템 이름 팝업
        const namePopup = this.add.text(400, 140, `\uD83D\uDCDC ${itemName}`, {
            fontSize: '18px', fontFamily: 'monospace',
            color: '#ffd700', stroke: '#000000', strokeThickness: 3,
            backgroundColor: '#00000088',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setAlpha(0);

        this.uiLayer.add(namePopup);
        this.cameras.main.ignore(namePopup);

        this.tweens.add({
            targets: namePopup,
            alpha: 1, y: 130,
            duration: 300, ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: namePopup,
                        alpha: 0, y: 120,
                        duration: 300,
                        onComplete: () => namePopup.destroy()
                    });
                });
            }
        });

        if (this.collectedCount >= this.totalItems) {
            this.timerEvent.remove();
            this.time.delayedCall(500, () => {
                this.scene.start('ClearScene', { stageId: this.stageId });
            });
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(this.formatTime(this.timeLeft));

        if (this.timeLeft <= 30) {
            this.timerText.setColor('#ff4444');
        } else if (this.timeLeft <= 60) {
            this.timerText.setColor('#ffaa00');
        }

        if (this.timeLeft <= 0) {
            this.timerEvent.remove();
            this.showBossIntro();
        }
    }

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    update(time, delta) {
        if (this.isRespawning) {
            // 리스폰 중에는 입력만 기록
            this.pc.checkTouchInput();
            this.pc.prevJumpInput = this.pc.cursors.up.isDown || this.pc.keyK.isDown || this.pc.touchJump;
            this.pc.prevDashInput = this.pc.touchDash;
        } else {
            // 플레이어 물리
            this.pc.updatePhysics(time, delta);
        }

        this.enemyMgr.update(time, this.player);
        this.updateMovingPlatforms(time);

        // 무빙 플랫폼 위 플레이어 캐리 (Phaser arcade 한계 보완)
        if (!this.isRespawning && (this.player.body.touching.down || this.player.body.blocked.down)) {
            this.movingPlatforms.getChildren().forEach(plat => {
                const xOverlap = Math.abs(this.player.x - plat.x) < (plat.body.width + this.player.body.width) / 2;
                const yClose = Math.abs(this.player.body.bottom - plat.body.top) < 5;
                if (xOverlap && yClose) {
                    this.player.x += plat.body.deltaX();
                    this.player.y += plat.body.deltaY();
                }
            });
        }

        // 낙사 감지
        if (!this.isRespawning && this.player.y > this.stageData.map.height + 50) {
            this.takeDamage();
        }
    }

    showBossIntro() {
        this.physics.pause();
        this.isRespawning = true;

        this.cameras.main.shake(500, 0.03);

        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0).setDepth(200);
        overlay.setScrollFactor(0);
        this.tweens.add({ targets: overlay, alpha: 0.7, duration: 500 });

        const bossText = this.add.text(400, 250, 'BOSS', {
            fontSize: '72px', fontFamily: 'monospace',
            color: '#ff0000', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setDepth(201).setScrollFactor(0);

        this.tweens.add({
            targets: bossText,
            alpha: 1, scaleX: 1.1, scaleY: 1.1,
            duration: 800, ease: 'Power2'
        });

        this.time.delayedCall(1500, () => {
            const tapText = this.add.text(400, 380, '\uD0ED\uD558\uC5EC \uBCF4\uC2A4\uC804 \uC2DC\uC791', {
                fontSize: '20px', fontFamily: 'monospace', color: '#aaaaaa'
            }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

            this.tweens.add({
                targets: tapText,
                alpha: 0.3, duration: 800, yoyo: true, repeat: -1
            });

            const startBoss = () => {
                this.scene.start('BossScene', { stageId: this.stageId });
            };
            this.input.once('pointerdown', startBoss);
            this.input.keyboard.once('keydown', startBoss);
        });
    }

    takeDamage() {
        if (this.isRespawning) return;
        this.isRespawning = true;

        const PENALTY = 10;
        const sd = this.stageData;

        this.timeLeft = Math.max(0, this.timeLeft - PENALTY);
        this.timerText.setText(this.formatTime(this.timeLeft));

        if (this.timeLeft <= 0) {
            this.timerEvent.remove();
            this.showBossIntro();
            return;
        }

        if (this.timeLeft <= 30) {
            this.timerText.setColor('#ff4444');
        } else if (this.timeLeft <= 60) {
            this.timerText.setColor('#ffaa00');
        }

        // 패널티 텍스트
        const penaltyText = this.add.text(400, 200, `-${PENALTY}\uCD08`, {
            fontSize: '32px', fontFamily: 'monospace',
            color: '#ff4444', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.uiLayer.add(penaltyText);
        this.cameras.main.ignore(penaltyText);

        this.tweens.add({
            targets: penaltyText,
            alpha: 1, y: 180, duration: 300,
            onComplete: () => {
                this.time.delayedCall(800, () => {
                    this.tweens.add({
                        targets: penaltyText,
                        alpha: 0, y: 160, duration: 300,
                        onComplete: () => penaltyText.destroy()
                    });
                });
            }
        });

        this.cameras.main.flash(300, 255, 0, 0, true);

        // 리스폰
        this.player.setPosition(sd.spawn.x, sd.spawn.y);
        this.player.setVelocity(0, 0);
        this.pc.resetDash();
        this.enemyMgr.resetChasers();

        // 무적 (깜빡임)
        this.player.setAlpha(0.5);
        this.time.delayedCall(1000, () => {
            this.player.setAlpha(1);
            this.isRespawning = false;
        });
    }
}
