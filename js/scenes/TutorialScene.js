// 튜토리얼 맵 설정
const TUTORIAL_WIDTH = 3200;
const TUTORIAL_HEIGHT = 600;

class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#16213e');
        this.input.addPointer(3);

        this.platforms = this.physics.add.staticGroup();
        this.createTutorialMap();

        // 플레이어 텍스처
        const pg = this.add.graphics();
        pg.fillStyle(0x4fc3f7);
        pg.fillRect(0, 0, 32, 48);
        pg.generateTexture('tut_player', 32, 48);
        pg.destroy();

        // 플레이어 (구역1 시작)
        this.player = this.physics.add.sprite(80, TUTORIAL_HEIGHT - 80, 'tut_player');
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);

        // 상태 초기화
        this.isDashing = false;
        this.dashCooldownReady = true;
        this.lastDirection = 1;
        this.dashTime = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.wasOnGround = false;
        this.isJumping = false;
        this.jumpHeld = false;
        this.prevJumpInput = false;
        this.prevDashInput = false;

        // 현재 구역 (1~4)
        this.currentZone = 1;

        // 조작 잠금 (구역별로 해금)
        this.canMove = true;
        this.canJump = false;
        this.canDash = false;

        // 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 구역 트리거 (보이지 않는 영역)
        this.triggers = this.physics.add.staticGroup();
        this.createZoneTriggers();
        this.physics.add.overlap(this.player, this.triggers, this.onTrigger, null, this);

        // 카메라 (월드는 아래쪽 여유 줘서 낙사 가능하게)
        this.cameras.main.setBounds(0, 0, TUTORIAL_WIDTH, TUTORIAL_HEIGHT);
        this.physics.world.setBounds(0, 0, TUTORIAL_WIDTH, TUTORIAL_HEIGHT + 200);
        this.player.setCollideWorldBounds(false); // 아래로 떨어질 수 있게
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.3);

        // UI 카메라
        this.uiCamera = this.cameras.add(0, 0, 800, 600);
        this.uiCamera.setScroll(0, 0);
        this.uiLayer = this.add.container(0, 0);
        this.cameras.main.ignore(this.uiLayer);

        // 구역 안내 텍스트
        this.guideText = this.add.text(400, 80, '', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        this.uiLayer.add(this.guideText);
        this.cameras.main.ignore(this.guideText);

        // 키보드
        this.cursors = this.input.keyboard.createCursorKeys();
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // 터치 컨트롤
        this.createTouchControls();

        // UI 카메라에서 게임 오브젝트 무시
        this.platforms.getChildren().forEach(p => this.uiCamera.ignore(p));
        this.triggers.getChildren().forEach(t => this.uiCamera.ignore(t));
        this.uiCamera.ignore(this.player);

        // 구역별 안내 표지판 (월드 내)
        this.createZoneSigns();

        // 구역별 리스폰 위치
        this.respawnPoints = {
            1: { x: 80, y: TUTORIAL_HEIGHT - 80 },
            2: { x: 850, y: TUTORIAL_HEIGHT - 80 },
            3: { x: 1650, y: TUTORIAL_HEIGHT - 80 },
            4: { x: 2450, y: TUTORIAL_HEIGHT - 80 },
        };

        // 구역1 시작
        this.showZoneGuide(1);
    }

    createTutorialMap() {
        // 바닥을 구역별로 끊어서 배치 (구멍 만들기 위해)

        // ===== 구역 1: 좌우 이동 (0~800) =====
        // 넓은 평탄한 바닥, 그냥 걸어가면 됨
        this.addPlatform(0, TUTORIAL_HEIGHT - 32, 800, 32, 0x2d4059);

        // ===== 구역 2: 점프 (800~1600) =====
        // 바닥 일부만
        this.addPlatform(800, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        // 올라가는 계단식 플랫폼
        this.addPlatform(950, TUTORIAL_HEIGHT - 120, 120, 20, 0x3a506b);
        this.addPlatform(1120, TUTORIAL_HEIGHT - 200, 120, 20, 0x3a506b);
        this.addPlatform(1300, TUTORIAL_HEIGHT - 280, 120, 20, 0x3a506b);
        // 내려오는 플랫폼
        this.addPlatform(1450, TUTORIAL_HEIGHT - 180, 120, 20, 0x3a506b);
        // 착지 바닥
        this.addPlatform(1450, TUTORIAL_HEIGHT - 32, 150, 32, 0x2d4059);

        // ===== 구역 3: 대시 (1600~2400) =====
        // 출발 바닥
        this.addPlatform(1600, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        // 갭! (걸어서/점프로 못 넘는 거리, 대시 필요)
        // 도착 바닥
        this.addPlatform(2100, TUTORIAL_HEIGHT - 32, 300, 32, 0x2d4059);

        // ===== 구역 4: 점프 + 공중 대시 (2400~3200) =====
        // 출발 바닥
        this.addPlatform(2400, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        // 점프만으론 못 닿는 먼 공중 플랫폼 (점프+대시 필요)
        this.addPlatform(2900, TUTORIAL_HEIGHT - 180, 120, 20, 0x3a506b);
        // 골 바닥
        this.addPlatform(2900, TUTORIAL_HEIGHT - 32, 300, 32, 0x2d4059);
    }

    addPlatform(x, y, width, height, color) {
        const key = `tut_plat_${x}_${y}_${width}`;
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
        return platform;
    }

    createZoneTriggers() {
        const triggerData = [
            { x: 800, zone: 2 },
            { x: 1600, zone: 3 },
            { x: 2400, zone: 4 },
            { x: 2950, zone: 5 },  // 골
        ];

        // 트리거용 텍스처
        if (!this.textures.exists('tut_trigger')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0);
            g.fillRect(0, 0, 30, TUTORIAL_HEIGHT);
            g.generateTexture('tut_trigger', 30, TUTORIAL_HEIGHT);
            g.destroy();
        }

        triggerData.forEach(data => {
            const trigger = this.triggers.create(data.x, TUTORIAL_HEIGHT / 2, 'tut_trigger');
            trigger.setDisplaySize(30, TUTORIAL_HEIGHT);
            trigger.setAlpha(0);
            trigger.refreshBody();
            trigger.setData('zone', data.zone);
        });
    }

    createZoneSigns() {
        // 월드 내 표지판 텍스트
        const signs = [
            { x: 80, y: TUTORIAL_HEIGHT - 60, text: '← →\n이동' },
            { x: 830, y: TUTORIAL_HEIGHT - 60, text: '▲\n점프' },
            { x: 1630, y: TUTORIAL_HEIGHT - 60, text: '💨\n대시' },
            { x: 2430, y: TUTORIAL_HEIGHT - 60, text: '▲ + 💨\n점프 + 공중 대시' },
        ];

        signs.forEach(s => {
            const sign = this.add.text(s.x, s.y, s.text, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0, 1);
            this.uiCamera.ignore(sign);
        });

        // 골 표지판
        const goalSign = this.add.text(2960, TUTORIAL_HEIGHT - 220, '🚪', {
            fontSize: '40px'
        }).setOrigin(0.5);
        this.uiCamera.ignore(goalSign);

        // 깜빡임
        this.tweens.add({
            targets: goalSign,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    onTrigger(player, trigger) {
        const zone = trigger.getData('zone');

        if (zone === 5) {
            // 골! → 인트로 컷씬
            this.scene.start('IntroScene');
            return;
        }

        if (zone > this.currentZone) {
            this.currentZone = zone;
            this.showZoneGuide(zone);
        }
    }

    showZoneGuide(zone) {
        switch (zone) {
            case 1:
                this.canMove = true;
                this.canJump = false;
                this.canDash = false;
                this.guideText.setText('◀ ▶  좌우로 이동해보세요');
                break;
            case 2:
                this.canMove = true;
                this.canJump = true;
                this.canDash = false;
                this.guideText.setText('▲  점프! 플랫폼을 올라가세요');
                // 구역1 벽 제거 (되돌아올 수 있게)
                break;
            case 3:
                this.canMove = true;
                this.canJump = true;
                this.canDash = true;
                this.guideText.setText('💨  대시! 먼 거리를 순식간에');
                break;
            case 4:
                this.canMove = true;
                this.canJump = true;
                this.canDash = true;
                this.guideText.setText('▲ + 💨  점프 후 공중에서 대시!');
                break;
        }

        // 텍스트 등장 이펙트
        this.guideText.setAlpha(0);
        this.tweens.add({
            targets: this.guideText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
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

    doDash() {
        if (!this.canDash) return;
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
        this.uiCamera.ignore(afterImage);
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

    update(time, delta) {
        this.checkTouchInput();
        const dt = delta / 1000;
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;

        if (this.isDashing) {
            this.prevJumpInput = this.cursors.up.isDown || this.touchJump;
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
        const jumpInput = this.cursors.up.isDown || this.touchJump;
        const jumpJustPressed = jumpInput && !this.prevJumpInput;
        if (jumpJustPressed) {
            this.jumpBufferTimer = JUMP_BUFFER_TIME;
        } else {
            this.jumpBufferTimer -= delta;
        }

        // 좌우 이동
        const moveLeft = this.canMove && (this.cursors.left.isDown || this.touchLeft);
        const moveRight = this.canMove && (this.cursors.right.isDown || this.touchRight);
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
        if (this.canJump && this.jumpBufferTimer > 0 && canCoyoteJump && !this.isJumping) {
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
        if (this.canDash && (Phaser.Input.Keyboard.JustDown(this.dashKey) || dashJustPressed)) {
            this.doDash();
        }

        // 낙사 체크
        if (this.player.y > TUTORIAL_HEIGHT + 50) {
            const spawn = this.respawnPoints[this.currentZone];
            this.player.setPosition(spawn.x, spawn.y);
            this.player.setVelocity(0, 0);
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setAlpha(1);
        }

        this.prevJumpInput = jumpInput;
        this.prevDashInput = this.touchDash;
        this.wasOnGround = onGround;
    }
}
