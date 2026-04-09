class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
        this.stageData = STAGE_DATA[this.stageId];
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a0a');
        this.input.addPointer(3);
        this.isDead = false;
        this.bossActive = false;

        // 보스전 맵 (좁은 공간)
        const BOSS_W = 1200;
        const BOSS_H = 600;

        this.physics.world.setBounds(0, 0, BOSS_W, BOSS_H + 100);

        // 바닥
        this.platforms = this.physics.add.staticGroup();
        const floorKey = 'boss_floor';
        if (!this.textures.exists(floorKey)) {
            const g = this.add.graphics();
            g.fillStyle(0x1a1a1a);
            g.fillRect(0, 0, BOSS_W, 32);
            g.generateTexture(floorKey, BOSS_W, 32);
            g.destroy();
        }
        const floor = this.platforms.create(BOSS_W / 2, BOSS_H - 16, floorKey);
        floor.refreshBody();

        // 플랫폼 몇 개 (도망용)
        const platKey = 'boss_plat';
        if (!this.textures.exists(platKey)) {
            const g = this.add.graphics();
            g.fillStyle(0x333333);
            g.fillRect(0, 0, 150, 16);
            g.generateTexture(platKey, 150, 16);
            g.destroy();
        }
        [{ x: 200, y: 450 }, { x: 600, y: 380 }, { x: 1000, y: 450 }, { x: 400, y: 280 }, { x: 800, y: 280 }].forEach(p => {
            const plat = this.platforms.create(p.x, p.y, platKey);
            plat.setDisplaySize(150, 16);
            plat.refreshBody();
        });

        // 플레이어
        if (!this.textures.exists('player')) {
            const pg = this.add.graphics();
            pg.fillStyle(0x4fc3f7);
            pg.fillRect(0, 0, 32, 48);
            pg.generateTexture('player', 32, 48);
            pg.destroy();
        }
        this.player = this.physics.add.sprite(100, BOSS_H - 80, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);
        this.physics.add.collider(this.player, this.platforms);

        // 플레이어 상태
        this.isDashing = false;
        this.dashCooldownReady = true;
        this.lastDirection = 1;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.isJumping = false;
        this.jumpHeld = false;
        this.prevJumpInput = false;
        this.prevDashInput = false;

        // 키보드
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // 카메라
        this.cameras.main.setBounds(0, 0, BOSS_W, BOSS_H);

        // 보스 등장 연출
        this.cameras.main.shake(800, 0.03);

        const warning = this.add.text(BOSS_W / 2, 100, '⚠ 보스 등장 ⚠', {
            fontSize: '36px', fontFamily: 'monospace',
            color: '#ff0000', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: warning,
            alpha: 1, duration: 400, yoyo: true, repeat: 2,
            onComplete: () => warning.destroy()
        });

        // 보스 생성 (큰 빨간 사각형)
        if (!this.textures.exists('boss_sprite')) {
            const bg = this.add.graphics();
            bg.fillStyle(0xff0000);
            bg.fillRect(0, 0, 80, 80);
            bg.fillStyle(0xcc0000);
            bg.fillRect(8, 8, 64, 64);
            bg.fillStyle(0xffffff);
            bg.fillRect(18, 20, 18, 18);
            bg.fillRect(46, 20, 18, 18);
            bg.fillStyle(0xff0000);
            bg.fillRect(24, 28, 8, 8);
            bg.fillRect(52, 28, 8, 8);
            bg.fillStyle(0x000000);
            bg.fillRect(22, 54, 38, 12);
            bg.generateTexture('boss_sprite', 80, 80);
            bg.destroy();
        }

        this.boss = this.physics.add.sprite(BOSS_W - 100, BOSS_H - 80, 'boss_sprite');
        this.boss.setCollideWorldBounds(true);
        this.boss.body.allowGravity = true;
        this.boss.body.setSize(80, 80);
        this.physics.add.collider(this.boss, this.platforms);

        // 보스-플레이어 충돌 = 즉사
        this.physics.add.overlap(this.player, this.boss, this.onBossHit, null, this);

        // 보스 투사체
        this.bossProjectiles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.bossProjectiles, this.onBossHit, null, this);

        // 3초 후 보스 활성화
        this.time.delayedCall(3000, () => {
            this.bossActive = true;
            this.bossTimer = 0;
            this.lastAttack = 0;
        });

        // 생존 타이머 (60초)
        this.surviveTime = 60;
        this.surviveTimer = this.add.text(BOSS_W / 2, 20, this.surviveTime.toString(), {
            fontSize: '24px', fontFamily: 'monospace',
            color: '#ff4444', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.surviveEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.surviveTime--;
                this.surviveTimer.setText(this.surviveTime.toString());
                if (this.surviveTime <= 10) {
                    this.surviveTimer.setColor('#ff0000');
                    this.surviveTimer.setFontSize('28px');
                }
                if (this.surviveTime <= 0) {
                    this.surviveEvent.remove();
                    this.forceDeath();
                }
            },
            callbackScope: this,
            loop: true
        });

        // 터치
        this.createTouchControls();
    }

    onBossHit(player, boss) {
        if (this.isDead) return;
        this.isDead = true;
        this.showDeath();
    }

    forceDeath() {
        if (this.isDead) return;
        this.isDead = true;
        this.bossActive = false;

        // 보스 멈춤
        this.boss.setVelocity(0, 0);

        // 마왕 대사
        const quote = this.add.text(600, 200, '"...3분은 끝났다."', {
            fontSize: '22px', fontFamily: 'monospace',
            color: '#ff4444', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: quote, alpha: 1, duration: 800,
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    // 화면 전체 빨갛게
                    this.cameras.main.flash(1000, 255, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.showDeath();
                    });
                });
            }
        });
    }

    showDeath() {
        this.bossActive = false;
        this.player.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        // 암전
        const blackout = this.add.rectangle(600, 300, 1200, 600, 0x000000, 0).setDepth(100);
        this.tweens.add({
            targets: blackout, alpha: 0.8, duration: 500
        });

        const deathText = this.add.text(600, 250, '사망...', {
            fontSize: '48px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setDepth(101);

        this.tweens.add({ targets: deathText, alpha: 1, duration: 800 });

        this.time.delayedCall(2000, () => {
            const goText = this.add.text(600, 400, '탭하여 스테이지 선택으로', {
                fontSize: '22px', color: '#aaaaaa'
            }).setOrigin(0.5).setDepth(101);

            this.tweens.add({
                targets: goText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1
            });

            const goSelect = () => {
                this.scene.start('StageSelectScene');
            };
            this.input.once('pointerdown', goSelect);
            this.input.keyboard.once('keydown', goSelect);
        });
    }

    createTouchControls() {
        const W = 1200;
        const H = 600;
        const btnY = H - 40;

        const leftArrow = this.add.text(130, btnY, '◀', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.2);
        const rightArrow = this.add.text(270, btnY, '▶', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.2);
        const dashBtn = this.add.text(800, btnY, '💨', { fontSize: '28px' })
            .setOrigin(0.5).setAlpha(0.2);
        const jumpArrow = this.add.text(1050, btnY, '▲', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.2);

        this.dashCooldownBar = this.add.rectangle(800, btnY + 24, 50, 5, 0x00ffaa, 0.6).setOrigin(0.5);
        this.dashCooldownText = this.add.text(800, btnY - 24, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#ff4444'
        }).setOrigin(0.5).setAlpha(0);
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
                const sx = pointer.x;
                if (sx < gameWidth * 0.5) {
                    if (sx < gameWidth * 0.25) this.touchLeft = true;
                    else this.touchRight = true;
                } else if (sx < gameWidth * 0.75) {
                    this.touchDash = true;
                } else {
                    this.touchJump = true;
                }
            }
        }
    }

    doDash() {
        if (!this.dashCooldownReady || this.isDashing) return;
        this.isDashing = true;
        this.dashCooldownReady = false;

        const dashTime = DASH_DISTANCE / DASH_SPEED * 1000;
        const dir = this.lastDirection;
        this.player.body.allowGravity = false;
        this.player.setVelocityY(0);
        this.player.setVelocityX(DASH_SPEED * dir);
        this.player.setAlpha(0.6);

        this.time.delayedCall(dashTime, () => {
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setAlpha(1);
        });

        this.dashCooldownBar.setScale(0, 1);
        this.dashCooldownText.setText('쿨타임').setAlpha(1);
        this.tweens.add({
            targets: this.dashCooldownBar,
            scaleX: 1, duration: DASH_COOLDOWN, ease: 'Linear',
            onComplete: () => {
                this.dashCooldownReady = true;
                this.dashCooldownText.setAlpha(0);
            }
        });
    }

    update(time, delta) {
        if (this.isDead) return;

        this.checkTouchInput();
        const dt = delta / 1000;
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;

        if (this.isDashing) {
            this.prevJumpInput = this.cursors.up.isDown || this.keyK.isDown || this.touchJump;
            this.prevDashInput = this.touchDash;
            return;
        }

        // 코요테 타임
        if (onGround) { this.coyoteTimer = COYOTE_TIME; this.isJumping = false; }
        else { this.coyoteTimer -= delta; }

        // 점프 버퍼
        const jumpInput = this.cursors.up.isDown || this.keyK.isDown || this.touchJump;
        const jumpJustPressed = jumpInput && !this.prevJumpInput;
        if (jumpJustPressed) this.jumpBufferTimer = JUMP_BUFFER_TIME;
        else this.jumpBufferTimer -= delta;

        // 이동
        const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchLeft;
        const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchRight;
        const accel = onGround ? ACCELERATION : AIR_ACCELERATION;
        const decel = onGround ? DECELERATION : AIR_DECELERATION;

        let vx = this.player.body.velocity.x;
        if (moveLeft) { vx -= accel * dt; if (vx < -MOVE_SPEED) vx = -MOVE_SPEED; this.lastDirection = -1; }
        else if (moveRight) { vx += accel * dt; if (vx > MOVE_SPEED) vx = MOVE_SPEED; this.lastDirection = 1; }
        else { if (vx > 0) { vx -= decel * dt; if (vx < 0) vx = 0; } else if (vx < 0) { vx += decel * dt; if (vx > 0) vx = 0; } }
        this.player.setVelocityX(vx);

        // 점프
        if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isJumping) {
            this.player.setVelocityY(JUMP_SPEED);
            this.isJumping = true; this.jumpHeld = true;
            this.jumpBufferTimer = 0; this.coyoteTimer = 0;
        }
        if (!jumpInput) this.jumpHeld = false;

        // 가변 중력
        const vy = this.player.body.velocity.y;
        if (!onGround && !this.isDashing) {
            if (vy > 0) this.player.body.setGravityY(NORMAL_GRAVITY * (FALL_GRAVITY_MULT - 1));
            else if (vy < 0 && !this.jumpHeld) this.player.body.setGravityY(NORMAL_GRAVITY * (LOW_JUMP_GRAVITY_MULT - 1));
            else this.player.body.setGravityY(0);
        } else { this.player.body.setGravityY(0); }

        // 대시
        const dashJustPressed = this.touchDash && !this.prevDashInput;
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) || Phaser.Input.Keyboard.JustDown(this.keyJ) || dashJustPressed) this.doDash();

        this.prevJumpInput = jumpInput;
        this.prevDashInput = this.touchDash;

        // 보스 AI
        if (this.bossActive) {
            this.updateBoss(time, delta);
        }
    }

    updateBoss(time, delta) {
        // 플레이어 추적
        const speed = 120 + (60 - this.surviveTime) * 2; // 시간 지날수록 빨라짐
        const dx = this.player.x - this.boss.x;

        if (Math.abs(dx) > 30) {
            this.boss.setVelocityX(dx > 0 ? speed : -speed);
        }

        // 플레이어가 위에 있으면 점프
        if (this.player.y < this.boss.y - 60) {
            const bossOnGround = this.boss.body.touching.down || this.boss.body.blocked.down;
            if (bossOnGround) {
                this.boss.setVelocityY(-400);
            }
        }

        // 주기적 공격 (투사체)
        const attackInterval = Math.max(800, 2000 - (60 - this.surviveTime) * 30);
        if (time - this.lastAttack > attackInterval) {
            this.lastAttack = time;
            this.bossAttack();
        }
    }

    bossAttack() {
        // 플레이어 방향으로 투사체
        if (!this.textures.exists('boss_proj')) {
            const g = this.add.graphics();
            g.fillStyle(0xff0000);
            g.fillCircle(8, 8, 8);
            g.generateTexture('boss_proj', 16, 16);
            g.destroy();
        }

        const dir = this.player.x < this.boss.x ? -1 : 1;
        const proj = this.bossProjectiles.create(this.boss.x + dir * 50, this.boss.y, 'boss_proj');
        proj.body.allowGravity = false;
        proj.setVelocityX(250 * dir);
        proj.setVelocityY(Phaser.Math.Between(-50, 50));

        this.time.delayedCall(4000, () => { if (proj.active) proj.destroy(); });
    }
}
