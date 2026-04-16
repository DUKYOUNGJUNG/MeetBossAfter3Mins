class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
        this.stageData = STAGE_DATA[this.stageId];
        this.testMode = data && data.testMode ? true : false;
    }

    preload() {
        PlayerController.preloadSprites(this);
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
        this.items = this.physics.add.staticGroup();
        this.collectedCount = 0;
        this.totalItems = 5;
        this.createItems();
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // 적
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.createEnemies();
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onEnemyHit, null, this);
        this.physics.add.overlap(this.player, this.projectiles, this.onEnemyHit, null, this);

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

        // UI 컨테이너
        this.uiLayer.add([this.timerText, stageInfo, versionText, this.itemText, livesText]);

        // 메인 카메라는 UI 무시
        this.cameras.main.ignore(this.uiLayer);
        this.cameras.main.ignore(this.timerText);
        this.cameras.main.ignore(stageInfo);
        this.cameras.main.ignore(versionText);
        this.cameras.main.ignore(this.itemText);
        this.cameras.main.ignore(livesText);

        // UI 카메라는 게임 오브젝트 무시
        this.platforms.getChildren().forEach(p => this.uiCamera.ignore(p));
        this.items.getChildren().forEach(i => this.uiCamera.ignore(i));
        this.uiCamera.ignore(this.player);
        this.enemies.getChildren().forEach(e => this.uiCamera.ignore(e));

        // 터치 컨트롤
        const touchElements = this.pc.createTouchControls(800, 600);
        this.uiLayer.add(touchElements);
        touchElements.forEach(el => this.cameras.main.ignore(el));
    }

    createMap() {
        const sd = this.stageData;
        const defaultColor = sd.map.platformColor;
        const accentColor = sd.map.accentColor;
        const letterColor = sd.map.letterColor || accentColor;

        // 한글 글자 플랫폼 생성
        if (sd.letterChar) {
            const letterPlatforms = generateLetterPlatforms(sd.letterChar, sd.map.width);
            letterPlatforms.forEach(p => {
                const plat = PlayerController.addPlatform(
                    this, this.platforms, p.x, p.y, p.w, p.h,
                    letterColor, `letter_${this.stageId}`
                );
                if (plat) plat.setData('isLetter', true);
            });
        }

        // 일반 플랫폼 배치 (게임플레이용)
        sd.platforms.forEach((p, i) => {
            const color = p.color != null ? p.color : defaultColor;
            PlayerController.addPlatform(this, this.platforms, p.x, p.y, p.w, p.h, color, `plat_${this.stageId}`);
        });

        // 벽 배치
        if (sd.walls) {
            sd.walls.forEach(w => {
                PlayerController.addPlatform(this, this.platforms, w.x, w.y, w.w, w.h, accentColor, `plat_${this.stageId}`);
            });
        }
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

            plat.setData('moveType', mp.moveType);
            plat.setData('startX', mp.x + w / 2);
            plat.setData('startY', mp.y + h / 2);
            plat.setData('distance', mp.distance || 200);
            plat.setData('speed', mp.speed || 50);
            plat.setData('dir', 1);

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

            if (moveType === 'horizontal') {
                const t = Math.sin(time * speed / 10000 * Math.PI) * dist;
                plat.x = startX + t;
                plat.body.velocity.x = Math.cos(time * speed / 10000 * Math.PI) * dist * speed / 10000 * Math.PI;
            } else if (moveType === 'vertical') {
                const t = Math.sin(time * speed / 10000 * Math.PI) * dist;
                plat.y = startY + t;
                plat.body.velocity.y = Math.cos(time * speed / 10000 * Math.PI) * dist * speed / 10000 * Math.PI;
            }

            plat.body.updateFromGameObject();
        });
    }

    createItems() {
        const sd = this.stageData;

        let itemPositions;
        if (sd.itemPresets && sd.itemPresets.length > 0) {
            const presetIndex = Phaser.Math.Between(0, sd.itemPresets.length - 1);
            itemPositions = sd.itemPresets[presetIndex];
        } else {
            itemPositions = sd.items;
        }

        if (!this.textures.exists('item')) {
            const ig = this.add.graphics();
            ig.fillStyle(0xffd700);
            ig.fillCircle(12, 12, 12);
            ig.fillStyle(0xffea00);
            ig.fillCircle(12, 12, 8);
            ig.generateTexture('item', 24, 24);
            ig.destroy();
        }

        if (this.testMode) {
            const spawnX = sd.spawn.x;
            const spawnY = sd.spawn.y;
            itemPositions = itemPositions.map((p, i) => ({
                ...p,
                x: spawnX + 50 + i * 30,
                y: spawnY - 20
            }));
        }

        const itemNames = sd.itemNames || itemPositions.map(p => p.name || '???');

        itemPositions.forEach((pos, idx) => {
            const item = this.items.create(pos.x, pos.y, 'item');
            item.setDisplaySize(24, 24);
            item.refreshBody();
            item.setData('itemName', itemNames[idx] || pos.name || '???');
            this.tweens.add({
                targets: item, alpha: 0.5,
                duration: 600, yoyo: true, repeat: -1
            });
            if (this.uiCamera) this.uiCamera.ignore(item);
        });
    }

    createEnemies() {
        const sd = this.stageData;
        if (!sd.enemies || sd.enemies.length === 0) return;

        // 적 텍스처
        if (!this.textures.exists('enemy_walk')) {
            const g = this.add.graphics();
            g.fillStyle(0xff4444);
            g.fillRect(0, 0, 28, 28);
            g.fillStyle(0xcc0000);
            g.fillRect(4, 4, 20, 20);
            g.fillStyle(0xffffff);
            g.fillRect(8, 8, 6, 6);
            g.fillRect(16, 8, 6, 6);
            g.generateTexture('enemy_walk', 28, 28);
            g.destroy();
        }
        if (!this.textures.exists('enemy_jump')) {
            const g = this.add.graphics();
            g.fillStyle(0xff8800);
            g.fillRect(0, 0, 24, 32);
            g.fillStyle(0xcc6600);
            g.fillRect(3, 3, 18, 26);
            g.fillStyle(0xffffff);
            g.fillRect(6, 8, 5, 5);
            g.fillRect(13, 8, 5, 5);
            g.generateTexture('enemy_jump', 24, 32);
            g.destroy();
        }
        if (!this.textures.exists('enemy_shooter')) {
            const g = this.add.graphics();
            g.fillStyle(0x8844ff);
            g.fillRect(0, 0, 30, 30);
            g.fillStyle(0x6622cc);
            g.fillRect(4, 4, 22, 22);
            g.fillStyle(0xffffff);
            g.fillRect(8, 8, 6, 6);
            g.fillRect(18, 8, 6, 6);
            g.generateTexture('enemy_shooter', 30, 30);
            g.destroy();
        }
        if (!this.textures.exists('projectile')) {
            const g = this.add.graphics();
            g.fillStyle(0xff00ff);
            g.fillCircle(5, 5, 5);
            g.generateTexture('projectile', 10, 10);
            g.destroy();
        }
        if (!this.textures.exists('falling_obj')) {
            const g = this.add.graphics();
            g.fillStyle(0x888888);
            g.fillTriangle(10, 0, 0, 20, 20, 20);
            g.generateTexture('falling_obj', 20, 20);
            g.destroy();
        }
        if (!this.textures.exists('spike')) {
            const g = this.add.graphics();
            g.fillStyle(0xaa4444);
            g.fillTriangle(12, 0, 0, 24, 24, 24);
            g.generateTexture('spike', 24, 24);
            g.destroy();
        }

        sd.enemies.forEach(eData => {
            let enemy;
            switch (eData.type) {
                case 'walker':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_walk');
                    enemy.setData('type', 'walker');
                    enemy.setData('speed', eData.speed || 60);
                    enemy.setData('dir', eData.dir || 1);
                    enemy.body.setSize(28, 28);
                    enemy.setVelocityX((eData.speed || 60) * (eData.dir || 1));
                    break;

                case 'patrol':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_walk');
                    enemy.setData('type', 'patrol');
                    enemy.setData('speed', eData.speed || 80);
                    enemy.setData('minX', eData.minX);
                    enemy.setData('maxX', eData.maxX);
                    enemy.setData('dir', 1);
                    enemy.body.setSize(28, 28);
                    enemy.setVelocityX(eData.speed || 80);
                    break;

                case 'jumper':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_jump');
                    enemy.setData('type', 'jumper');
                    enemy.setData('range', eData.range || 200);
                    enemy.setData('baseY', eData.y);
                    enemy.body.setSize(24, 32);
                    enemy.body.allowGravity = true;
                    break;

                case 'shooter':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_shooter');
                    enemy.setData('type', 'shooter');
                    enemy.setData('interval', eData.interval || 2000);
                    enemy.setData('lastShot', 0);
                    enemy.body.setSize(30, 30);
                    enemy.body.allowGravity = false;
                    enemy.body.immovable = true;
                    enemy.body.moves = false;
                    break;

                case 'falling':
                    enemy = this.enemies.create(eData.x, eData.y, 'falling_obj');
                    enemy.setData('type', 'falling');
                    enemy.setData('triggerX', eData.triggerX || eData.x);
                    enemy.setData('triggered', false);
                    enemy.body.allowGravity = false;
                    enemy.body.setSize(20, 20);
                    break;

                case 'spike':
                    enemy = this.enemies.create(eData.x, eData.y, 'spike');
                    enemy.setData('type', 'spike');
                    enemy.setData('interval', eData.interval || 3000);
                    enemy.setData('baseY', eData.y);
                    enemy.setData('active', false);
                    enemy.body.allowGravity = false;
                    enemy.body.immovable = true;
                    enemy.body.moves = false;
                    enemy.body.setSize(24, 24);
                    enemy.setAlpha(0.3);
                    break;
            }

            if (enemy && this.uiCamera) {
                this.uiCamera.ignore(enemy);
            }
        });
    }

    updateEnemies(time) {
        this.enemies.getChildren().forEach(enemy => {
            const type = enemy.getData('type');

            switch (type) {
                case 'patrol': {
                    const minX = enemy.getData('minX');
                    const maxX = enemy.getData('maxX');
                    const speed = enemy.getData('speed');
                    if (enemy.x >= maxX) {
                        enemy.setVelocityX(-speed);
                        enemy.setFlipX(true);
                    } else if (enemy.x <= minX) {
                        enemy.setVelocityX(speed);
                        enemy.setFlipX(false);
                    }
                    break;
                }

                case 'jumper': {
                    const range = enemy.getData('range');
                    const dist = Math.abs(this.player.x - enemy.x);
                    const onGround = enemy.body.touching.down || enemy.body.blocked.down;
                    if (dist < range && onGround) {
                        enemy.setVelocityY(-350);
                    }
                    break;
                }

                case 'shooter': {
                    const interval = enemy.getData('interval');
                    const lastShot = enemy.getData('lastShot');
                    if (time - lastShot > interval) {
                        enemy.setData('lastShot', time);
                        const dir = this.player.x < enemy.x ? -1 : 1;
                        const proj = this.projectiles.create(enemy.x + dir * 20, enemy.y, 'projectile');
                        proj.setVelocityX(200 * dir);
                        proj.body.allowGravity = false;
                        if (this.uiCamera) this.uiCamera.ignore(proj);
                        this.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
                    }
                    break;
                }

                case 'falling': {
                    if (!enemy.getData('triggered')) {
                        const triggerX = enemy.getData('triggerX');
                        if (Math.abs(this.player.x - triggerX) < 80) {
                            enemy.setData('triggered', true);
                            enemy.body.allowGravity = true;
                            this.time.delayedCall(3000, () => { if (enemy.active) enemy.destroy(); });
                        }
                    }
                    break;
                }

                case 'spike': {
                    const interval = enemy.getData('interval');
                    const phase = time % interval;
                    const baseY = enemy.getData('baseY');
                    if (phase < interval * 0.3) {
                        if (!enemy.getData('active')) {
                            enemy.setData('active', true);
                            enemy.setAlpha(1);
                            enemy.setY(baseY - 20);
                        }
                    } else if (phase > interval * 0.7) {
                        if (enemy.getData('active')) {
                            enemy.setData('active', false);
                            enemy.setAlpha(0.3);
                            enemy.setY(baseY);
                        }
                    }
                    break;
                }
            }
        });
    }

    onEnemyHit(player, enemy) {
        if (this.isRespawning) return;
        this.takeDamage();

        if (enemy.getData && !enemy.getData('type')) {
            enemy.destroy();
        }
        if (this.projectiles.contains(enemy)) {
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

        this.updateEnemies(time);
        this.updateMovingPlatforms(time);

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

        // 무적 (깜빡임)
        this.player.setAlpha(0.5);
        this.time.delayedCall(1000, () => {
            this.player.setAlpha(1);
            this.isRespawning = false;
        });
    }
}
