// 대시 설정
const DASH_DISTANCE = 300;
const DASH_SPEED = 1200;
const DASH_COOLDOWN = 2000;

// 조작감 설정
const MOVE_SPEED = 280;
const JUMP_SPEED = -450;
const ACCELERATION = 1200;
const DECELERATION = 1800;
const AIR_ACCELERATION = 800;
const AIR_DECELERATION = 600;
const COYOTE_TIME = 100;
const JUMP_BUFFER_TIME = 120;
const FALL_GRAVITY_MULT = 3.5;
const LOW_JUMP_GRAVITY_MULT = 4.5;
const NORMAL_GRAVITY = 800;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // stageId가 없으면 기본값
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
        this.stageData = STAGE_DATA[this.stageId];
    }

    create() {
        const sd = this.stageData;
        const mapW = sd.map.width;
        const mapH = sd.map.height;

        // 배경색 (시대별)
        this.cameras.main.setBackgroundColor(sd.map.backgroundColor);

        // 멀티터치
        this.input.addPointer(3);

        // 플랫폼
        this.platforms = this.physics.add.staticGroup();
        this.createMap();

        // 플레이어 텍스처
        if (!this.textures.exists('player')) {
            const pg = this.add.graphics();
            pg.fillStyle(0x4fc3f7);
            pg.fillRect(0, 0, 32, 48);
            pg.generateTexture('player', 32, 48);
            pg.destroy();
        }

        // 플레이어
        this.player = this.physics.add.sprite(sd.spawn.x, sd.spawn.y, 'player');
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);

        // 피격/낙사 상태
        this.isRespawning = false;

        // 대시 상태
        this.isDashing = false;
        this.dashCooldownReady = true;
        this.lastDirection = 1;
        this.dashTime = 0;

        // 조작감 상태
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.wasOnGround = false;
        this.isJumping = false;
        this.jumpHeld = false;

        // 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 아이템
        this.items = this.physics.add.staticGroup();
        this.collectedCount = 0;
        this.totalItems = 5;
        this.createItems();

        // 아이템 수집
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
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // 카메라 (월드 바운드 아래 여유 줘서 낙사 감지)
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.physics.world.setBounds(0, 0, mapW, mapH + 300);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.3);

        // UI 카메라
        this.uiCamera = this.cameras.add(0, 0, 800, 600);
        this.uiCamera.setScroll(0, 0);

        // UI
        this.uiLayer = this.add.container(0, 0);

        // 타이머 텍스트
        this.timerText = this.add.text(400, 16, this.formatTime(this.timeLeft), {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);

        // 스테이지 정보
        const stageInfo = this.add.text(400, 50, `${sd.era} - ${sd.name}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);

        // 생명력 표시
        const lives = StageProgress.getLives();
        const livesText = this.add.text(16, 44, '❤'.repeat(lives) + '🖤'.repeat(3 - lives), {
            fontSize: '18px'
        });

        // 아이템 카운터
        this.itemText = this.add.text(16, 16, '🔑 0 / 5', {
            fontSize: '22px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        });

        // 버전
        const versionText = this.add.text(784, 16, 'v0.1.0', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#666666'
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
        this.createTouchControls();

        // 입력 상태
        this.prevJumpInput = false;
        this.prevDashInput = false;
    }

    createMap() {
        const sd = this.stageData;
        const defaultColor = sd.map.platformColor;
        const accentColor = sd.map.accentColor;

        // 플랫폼 배치
        sd.platforms.forEach((p, i) => {
            const color = p.color != null ? p.color : (i === 0 ? accentColor : defaultColor);
            this.addPlatform(p.x, p.y, p.w, p.h, color);
        });

        // 벽 배치
        if (sd.walls) {
            sd.walls.forEach(w => {
                this.addPlatform(w.x, w.y, w.w, w.h, accentColor);
            });
        }
    }

    addPlatform(x, y, width, height, color) {
        const key = `plat_${this.stageId}_${x}_${y}_${width}`;
        if (!this.textures.exists(key)) {
            const g = this.add.graphics();
            g.fillStyle(color);
            g.fillRect(0, 0, width, height);
            g.generateTexture(key, width, height);
            g.destroy();
        }
        const platform = this.platforms.create(x + width / 2, y + height / 2, key);
        platform.setDisplaySize(width, height);
        platform.refreshBody();
    }

    createItems() {
        const sd = this.stageData;

        // 레드 루트: 프리셋에서 랜덤 선택
        let itemPositions;
        if (sd.itemPresets && sd.itemPresets.length > 0) {
            const presetIndex = Phaser.Math.Between(0, sd.itemPresets.length - 1);
            itemPositions = sd.itemPresets[presetIndex];
        } else {
            itemPositions = sd.items;
        }

        // 아이템 텍스처
        if (!this.textures.exists('item')) {
            const ig = this.add.graphics();
            ig.fillStyle(0xffd700);
            ig.fillCircle(12, 12, 12);
            ig.fillStyle(0xffea00);
            ig.fillCircle(12, 12, 8);
            ig.generateTexture('item', 24, 24);
            ig.destroy();
        }

        // 아이템 이름 배열 (노멀: 각 아이템에 name 포함, 레드: itemNames 배열)
        const itemNames = sd.itemNames || itemPositions.map(p => p.name || '???');

        itemPositions.forEach((pos, idx) => {
            const item = this.items.create(pos.x, pos.y, 'item');
            item.setDisplaySize(24, 24);
            item.refreshBody();
            item.setData('itemName', itemNames[idx] || pos.name || '???');
            this.tweens.add({
                targets: item,
                alpha: 0.5,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
            if (this.uiCamera) this.uiCamera.ignore(item);
        });
    }

    createEnemies() {
        const sd = this.stageData;
        if (!sd.enemies || sd.enemies.length === 0) return;

        // 적 텍스처 생성
        if (!this.textures.exists('enemy_walk')) {
            const g = this.add.graphics();
            g.fillStyle(0xff4444);
            g.fillRect(0, 0, 28, 28);
            g.fillStyle(0xcc0000);
            g.fillRect(4, 4, 20, 20);
            // 눈
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
                    enemy.body.moves = false;  // 플랫폼 충돌에서 제외
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
                        // 3초 후 자동 삭제
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
                            // 3초 후 삭제
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
                        // 솟아오름
                        if (!enemy.getData('active')) {
                            enemy.setData('active', true);
                            enemy.setAlpha(1);
                            enemy.setY(baseY - 20);
                        }
                    } else if (phase > interval * 0.7) {
                        // 내려감
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

        // 투사체는 접촉 시 삭제
        if (enemy.getData && !enemy.getData('type')) {
            enemy.destroy();
        }
        // projectile 그룹의 것이면 삭제
        if (this.projectiles.contains(enemy)) {
            enemy.destroy();
        }
    }

    collectItem(player, item) {
        const itemName = item.getData('itemName');
        item.destroy();
        this.collectedCount++;
        this.itemText.setText(`🔑 ${this.collectedCount} / ${this.totalItems}`);

        // 수집 이펙트
        const flash = this.add.circle(item.x, item.y, 20, 0xffd700, 0.8);
        if (this.uiCamera) this.uiCamera.ignore(flash);
        this.tweens.add({
            targets: flash,
            scale: 2, alpha: 0, duration: 300,
            onComplete: () => flash.destroy()
        });

        // 아이템 이름 팝업 (UI 레이어, 화면 중앙 상단)
        const namePopup = this.add.text(400, 140, `📜 ${itemName}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#00000088',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setAlpha(0);

        this.uiLayer.add(namePopup);
        this.cameras.main.ignore(namePopup);

        // 등장 → 1.5초 유지 → 사라짐
        this.tweens.add({
            targets: namePopup,
            alpha: 1, y: 130,
            duration: 300,
            ease: 'Power2',
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

    createTouchControls() {
        const W = 800;
        const H = 600;
        const btnY = H - 50;

        const leftArrow = this.add.text(130, btnY, '◀', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);
        const rightArrow = this.add.text(270, btnY, '▶', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        const dashBtn = this.add.text(500, btnY, '💨', { fontSize: '32px' })
            .setOrigin(0.5).setAlpha(0.3);

        this.dashCooldownBar = this.add.rectangle(500, btnY + 28, 60, 6, 0x00ffaa, 0.8)
            .setOrigin(0.5);
        this.dashCooldownText = this.add.text(500, btnY - 28, '', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ff4444'
        }).setOrigin(0.5).setAlpha(0);

        const jumpArrow = this.add.text(700, btnY, '▲', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        const divider1 = this.add.rectangle(W * 0.5, H / 2, 1, H, 0xffffff, 0.1);
        const divider2 = this.add.rectangle(W * 0.75, H / 2, 1, H, 0xffffff, 0.05);

        const touchElements = [leftArrow, rightArrow, dashBtn, this.dashCooldownBar,
            this.dashCooldownText, jumpArrow, divider1, divider2];
        this.uiLayer.add(touchElements);
        touchElements.forEach(el => this.cameras.main.ignore(el));
    }

    doDash() {
        if (!this.dashCooldownReady || this.isDashing) return;

        this.isDashing = true;
        this.dashCooldownReady = false;
        this.dashTime = DASH_DISTANCE / DASH_SPEED * 1000;

        const dir = this.lastDirection;
        this.player.body.allowGravity = false;
        this.player.setVelocityY(0);
        this.player.setVelocityX(DASH_SPEED * dir);

        this.player.setAlpha(0.6);
        const afterImage = this.add.rectangle(
            this.player.x, this.player.y, 32, 48, 0x4fc3f7, 0.4
        );
        if (this.uiCamera) this.uiCamera.ignore(afterImage);
        this.tweens.add({
            targets: afterImage,
            alpha: 0,
            duration: 300,
            onComplete: () => afterImage.destroy()
        });

        this.time.delayedCall(this.dashTime, () => {
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setAlpha(1);
        });

        this.dashCooldownBar.setScale(0, 1);
        this.dashCooldownText.setText('쿨타임').setAlpha(1);
        this.tweens.add({
            targets: this.dashCooldownBar,
            scaleX: 1,
            duration: DASH_COOLDOWN,
            ease: 'Linear',
            onComplete: () => {
                this.dashCooldownReady = true;
                this.dashCooldownText.setAlpha(0);
            }
        });
    }

    checkTouchInput() {
        const gameWidth = this.scale.width;
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchDash = false;

        const pointers = [
            this.input.pointer1, this.input.pointer2,
            this.input.pointer3, this.input.pointer4, this.input.pointer5
        ];

        for (const pointer of pointers) {
            if (pointer && pointer.isDown) {
                const screenX = pointer.x;
                if (screenX < gameWidth * 0.5) {
                    if (screenX < gameWidth * 0.25) this.touchLeft = true;
                    else this.touchRight = true;
                } else if (screenX < gameWidth * 0.75) {
                    this.touchDash = true;
                } else {
                    this.touchJump = true;
                }
            }
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
            this.scene.start('BossScene', { stageId: this.stageId });
        }
    }

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    update(time, delta) {
        this.checkTouchInput();
        this.updateEnemies(time);
        const dt = delta / 1000;
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;

        if (this.isDashing) {
            this.prevJumpInput = this.cursors.up.isDown || this.keyK.isDown || this.touchJump;
            this.prevDashInput = this.touchDash;
            return;
        }

        // 코요테 타임
        if (onGround) {
            this.coyoteTimer = COYOTE_TIME;
            this.isJumping = false;
        } else {
            this.coyoteTimer -= delta;
        }
        const canCoyoteJump = this.coyoteTimer > 0;

        // 점프 버퍼
        const jumpInput = this.cursors.up.isDown || this.keyK.isDown || this.touchJump;
        const jumpJustPressed = jumpInput && !this.prevJumpInput;
        if (jumpJustPressed) {
            this.jumpBufferTimer = JUMP_BUFFER_TIME;
        } else {
            this.jumpBufferTimer -= delta;
        }

        // 좌우 이동
        const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchLeft;
        const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchRight;
        const accel = onGround ? ACCELERATION : AIR_ACCELERATION;
        const decel = onGround ? DECELERATION : AIR_DECELERATION;

        let vx = this.player.body.velocity.x;
        if (moveLeft) {
            vx -= accel * dt;
            if (vx < -MOVE_SPEED) vx = -MOVE_SPEED;
            this.lastDirection = -1;
        } else if (moveRight) {
            vx += accel * dt;
            if (vx > MOVE_SPEED) vx = MOVE_SPEED;
            this.lastDirection = 1;
        } else {
            if (vx > 0) { vx -= decel * dt; if (vx < 0) vx = 0; }
            else if (vx < 0) { vx += decel * dt; if (vx > 0) vx = 0; }
        }
        this.player.setVelocityX(vx);

        // 점프
        if (this.jumpBufferTimer > 0 && canCoyoteJump && !this.isJumping) {
            this.player.setVelocityY(JUMP_SPEED);
            this.isJumping = true;
            this.jumpHeld = true;
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
        }

        if (!jumpInput) this.jumpHeld = false;

        // 가변 중력
        const vy = this.player.body.velocity.y;
        if (!onGround && !this.isDashing) {
            if (vy > 0) {
                this.player.body.setGravityY(NORMAL_GRAVITY * (FALL_GRAVITY_MULT - 1));
            } else if (vy < 0 && !this.jumpHeld) {
                this.player.body.setGravityY(NORMAL_GRAVITY * (LOW_JUMP_GRAVITY_MULT - 1));
            } else {
                this.player.body.setGravityY(0);
            }
        } else {
            this.player.body.setGravityY(0);
        }

        // 대시
        const dashJustPressed = this.touchDash && !this.prevDashInput;
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) || Phaser.Input.Keyboard.JustDown(this.keyJ) || dashJustPressed) {
            this.doDash();
        }

        // 낙사 감지
        if (this.player.y > this.stageData.map.height + 50) {
            this.takeDamage();
        }

        this.prevJumpInput = jumpInput;
        this.prevDashInput = this.touchDash;
        this.wasOnGround = onGround;
    }

    // 피격/낙사 공통 처리: 시간 -10초 + 스폰 리스폰
    takeDamage() {
        if (this.isRespawning) return;
        this.isRespawning = true;

        const PENALTY = 10;
        const sd = this.stageData;

        // 시간 감소
        this.timeLeft = Math.max(0, this.timeLeft - PENALTY);
        this.timerText.setText(this.formatTime(this.timeLeft));

        // 시간 초과 체크
        if (this.timeLeft <= 0) {
            this.timerEvent.remove();
            this.scene.start('BossScene', { stageId: this.stageId });
            return;
        }

        // 타이머 색상 업데이트
        if (this.timeLeft <= 30) {
            this.timerText.setColor('#ff4444');
        } else if (this.timeLeft <= 60) {
            this.timerText.setColor('#ffaa00');
        }

        // 패널티 텍스트
        const penaltyText = this.add.text(400, 200, `-${PENALTY}초`, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.uiLayer.add(penaltyText);
        this.cameras.main.ignore(penaltyText);

        this.tweens.add({
            targets: penaltyText,
            alpha: 1, y: 180,
            duration: 300,
            onComplete: () => {
                this.time.delayedCall(800, () => {
                    this.tweens.add({
                        targets: penaltyText,
                        alpha: 0, y: 160,
                        duration: 300,
                        onComplete: () => penaltyText.destroy()
                    });
                });
            }
        });

        // 화면 빨간 플래시
        this.cameras.main.flash(300, 255, 0, 0, true);

        // 리스폰
        this.player.setPosition(sd.spawn.x, sd.spawn.y);
        this.player.setVelocity(0, 0);
        this.isDashing = false;
        this.player.body.allowGravity = true;
        this.player.setAlpha(1);

        // 잠깐 무적 (깜빡임)
        this.player.setAlpha(0.5);
        this.time.delayedCall(1000, () => {
            this.player.setAlpha(1);
            this.isRespawning = false;
        });
    }
}
