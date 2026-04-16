// ==========================================
// 플레이어 컨트롤러 (공통 조작/물리 로직)
// GameScene, BossScene, TutorialScene에서 공유
// ==========================================

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

// 플레이어 기본 설정
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const PLAYER_COLOR = 0x4fc3f7;

// 스프라이트 경로
const SPRITE_BASE = 'assets/character/sprites/';

class PlayerController {
    constructor(scene, options = {}) {
        this.scene = scene;

        // 옵션 (씬별 차이 처리)
        this.options = {
            canMove: true,
            canJump: true,
            canDash: true,
            afterImage: true,
            ...options,
        };

        this.initState();
    }

    // 상태 초기화
    initState() {
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

        // 터치 입력 상태
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchDash = false;

        // UI 참조 (createTouchControls에서 설정)
        this.dashCooldownBar = null;
        this.dashCooldownText = null;

        // 애니메이션 상태
        this.currentAnim = null;
        this.spritesLoaded = false;
    }

    // 스프라이트 프리로드 (씬의 preload()에서 호출)
    static preloadSprites(scene) {
        if (scene.textures.exists('idle_east_0')) return; // 이미 로드됨

        // idle (breathing)
        for (let i = 0; i < 4; i++) {
            scene.load.image(`idle_east_${i}`, `${SPRITE_BASE}idle_anim_east_${i}.png`);
            scene.load.image(`idle_west_${i}`, `${SPRITE_BASE}idle_anim_west_${i}.png`);
        }
        // walk
        for (let i = 0; i < 6; i++) {
            scene.load.image(`walk_east_${i}`, `${SPRITE_BASE}walk_east_${i}.png`);
            scene.load.image(`walk_west_${i}`, `${SPRITE_BASE}walk_west_${i}.png`);
        }
        // run
        for (let i = 0; i < 6; i++) {
            scene.load.image(`run_east_${i}`, `${SPRITE_BASE}run_east_${i}.png`);
            scene.load.image(`run_west_${i}`, `${SPRITE_BASE}run_west_${i}.png`);
        }
        // jump
        for (let i = 0; i < 9; i++) {
            scene.load.image(`jump_east_${i}`, `${SPRITE_BASE}jump_east_${i}.png`);
            scene.load.image(`jump_west_${i}`, `${SPRITE_BASE}jump_west_${i}.png`);
        }
    }

    // 애니메이션 등록 (씬의 create()에서 호출)
    static createAnimations(scene) {
        if (scene.anims.exists('idle_east')) return; // 이미 등록됨

        // idle
        scene.anims.create({
            key: 'idle_east',
            frames: [0, 1, 2, 3].map(i => ({ key: `idle_east_${i}` })),
            frameRate: 4, repeat: -1
        });
        scene.anims.create({
            key: 'idle_west',
            frames: [0, 1, 2, 3].map(i => ({ key: `idle_west_${i}` })),
            frameRate: 4, repeat: -1
        });

        // walk
        scene.anims.create({
            key: 'walk_east',
            frames: [0, 1, 2, 3, 4, 5].map(i => ({ key: `walk_east_${i}` })),
            frameRate: 10, repeat: -1
        });
        scene.anims.create({
            key: 'walk_west',
            frames: [0, 1, 2, 3, 4, 5].map(i => ({ key: `walk_west_${i}` })),
            frameRate: 10, repeat: -1
        });

        // run
        scene.anims.create({
            key: 'run_east',
            frames: [0, 1, 2, 3, 4, 5].map(i => ({ key: `run_east_${i}` })),
            frameRate: 12, repeat: -1
        });
        scene.anims.create({
            key: 'run_west',
            frames: [0, 1, 2, 3, 4, 5].map(i => ({ key: `run_west_${i}` })),
            frameRate: 12, repeat: -1
        });

        // jump
        scene.anims.create({
            key: 'jump_east',
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ key: `jump_east_${i}` })),
            frameRate: 12, repeat: 0
        });
        scene.anims.create({
            key: 'jump_west',
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ key: `jump_west_${i}` })),
            frameRate: 12, repeat: 0
        });
    }

    // 플레이어 텍스처 생성 (폴백용 — 스프라이트 로드 실패 시)
    createPlayerTexture(key = 'player', color = PLAYER_COLOR) {
        if (!this.scene.textures.exists(key)) {
            const g = this.scene.add.graphics();
            g.fillStyle(color);
            g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
            g.generateTexture(key, PLAYER_WIDTH, PLAYER_HEIGHT);
            g.destroy();
        }
        // 스프라이트가 로드되었는지 확인
        this.spritesLoaded = this.scene.textures.exists('idle_east_0');
    }

    // 애니메이션 업데이트 (updatePhysics 끝에서 호출)
    updateAnimation() {
        if (!this.spritesLoaded) return;

        const player = this.scene.player;
        const onGround = player.body.touching.down || player.body.blocked.down;
        const vx = player.body.velocity.x;
        const vy = player.body.velocity.y;
        const dir = this.lastDirection > 0 ? 'east' : 'west';

        let anim;
        if (this.isDashing) {
            // 대시 중: 현재 프레임 고정 (자세 유지)
            player.anims.pause();
            return;
        } else if (!onGround) {
            anim = `jump_${dir}`;
        } else if (Math.abs(vx) > 20) {
            anim = `run_${dir}`;
        } else {
            anim = `idle_${dir}`;
        }

        if (this.currentAnim !== anim) {
            this.currentAnim = anim;
            player.play(anim, true);
        }
    }

    // 키보드 입력 설정
    setupKeyboard() {
        const scene = this.scene;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keyK = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // 터치 입력 체크 (매 프레임)
    checkTouchInput() {
        const gameWidth = this.scene.scale.width;
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchDash = false;

        const pointers = [
            this.scene.input.pointer1, this.scene.input.pointer2,
            this.scene.input.pointer3, this.scene.input.pointer4, this.scene.input.pointer5
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

    // 터치 컨트롤 UI 생성
    createTouchControls(layoutW = 800, layoutH = 600) {
        const scene = this.scene;
        const btnY = layoutH - 50;

        const leftArrow = scene.add.text(130, btnY, '\u25C0', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);
        const rightArrow = scene.add.text(270, btnY, '\u25B6', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        const dashBtn = scene.add.text(layoutW * 0.625, btnY, '\uD83D\uDCA8', { fontSize: '32px' })
            .setOrigin(0.5).setAlpha(0.3);

        this.dashCooldownBar = scene.add.rectangle(layoutW * 0.625, btnY + 28, 60, 6, 0x00ffaa, 0.8)
            .setOrigin(0.5);
        this.dashCooldownText = scene.add.text(layoutW * 0.625, btnY - 28, '', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ff4444'
        }).setOrigin(0.5).setAlpha(0);

        const jumpArrow = scene.add.text(layoutW * 0.875, btnY, '\u25B2', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        const divider1 = scene.add.rectangle(layoutW * 0.5, layoutH / 2, 1, layoutH, 0xffffff, 0.1);
        const divider2 = scene.add.rectangle(layoutW * 0.75, layoutH / 2, 1, layoutH, 0xffffff, 0.05);

        // 모든 터치 UI 요소 반환
        return [leftArrow, rightArrow, dashBtn, this.dashCooldownBar,
            this.dashCooldownText, jumpArrow, divider1, divider2];
    }

    // 대시 실행
    doDash() {
        if (!this.options.canDash) return;
        if (!this.dashCooldownReady || this.isDashing) return;

        const scene = this.scene;
        const player = scene.player;

        this.isDashing = true;
        this.dashCooldownReady = false;
        this.dashTime = DASH_DISTANCE / DASH_SPEED * 1000;

        const dir = this.lastDirection;
        player.body.allowGravity = false;
        player.setVelocityY(0);
        player.setVelocityX(DASH_SPEED * dir);
        player.setAlpha(0.6);

        // 잔상 효과 (대시 중 연속 생성)
        if (this.options.afterImage) {
            const createAfterImage = () => {
                if (!this.isDashing) return;
                const afterImage = scene.add.sprite(player.x, player.y, player.texture.key)
                    .setAlpha(0.5).setDisplaySize(player.displayWidth, player.displayHeight);
                if (player.anims.currentFrame) {
                    afterImage.setTexture(player.anims.currentFrame.textureKey);
                }
                if (scene.uiCamera) scene.uiCamera.ignore(afterImage);
                scene.tweens.add({
                    targets: afterImage,
                    alpha: 0, duration: 200,
                    onComplete: () => afterImage.destroy()
                });
                scene.time.delayedCall(50, createAfterImage);
            };
            createAfterImage();
        }

        scene.time.delayedCall(this.dashTime, () => {
            this.isDashing = false;
            player.body.allowGravity = true;
            player.setAlpha(1);
        });

        // 쿨타임 UI
        if (this.dashCooldownBar) {
            this.dashCooldownBar.setScale(0, 1);
            this.dashCooldownText.setText('\uCF00\uD0C0\uC784').setAlpha(1);
            scene.tweens.add({
                targets: this.dashCooldownBar,
                scaleX: 1, duration: DASH_COOLDOWN, ease: 'Linear',
                onComplete: () => {
                    this.dashCooldownReady = true;
                    this.dashCooldownText.setAlpha(0);
                }
            });
        } else {
            // UI 없는 경우 타이머로 쿨타임 해제
            scene.time.delayedCall(DASH_COOLDOWN, () => {
                this.dashCooldownReady = true;
            });
        }
    }

    // 메인 물리 업데이트 (매 프레임 호출)
    updatePhysics(time, delta) {
        const scene = this.scene;
        const player = scene.player;
        const dt = delta / 1000;
        const onGround = player.body.touching.down || player.body.blocked.down;

        this.checkTouchInput();

        // 대시 중에는 입력만 기록하고 리턴
        if (this.isDashing) {
            this.prevJumpInput = this.cursors.up.isDown || this.keyK.isDown || this.touchJump;
            this.prevDashInput = this.touchDash;
            this.updateAnimation();
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
        const moveLeft = this.options.canMove && (this.cursors.left.isDown || this.keyA.isDown || this.touchLeft);
        const moveRight = this.options.canMove && (this.cursors.right.isDown || this.keyD.isDown || this.touchRight);
        const accel = onGround ? ACCELERATION : AIR_ACCELERATION;
        const decel = onGround ? DECELERATION : AIR_DECELERATION;

        let vx = player.body.velocity.x;
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
        player.setVelocityX(vx);

        // 점프
        if (this.options.canJump && this.jumpBufferTimer > 0 && canCoyoteJump && !this.isJumping) {
            player.setVelocityY(JUMP_SPEED);
            this.isJumping = true;
            this.jumpHeld = true;
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
        }

        if (!jumpInput) this.jumpHeld = false;

        // 가변 중력
        const vy = player.body.velocity.y;
        if (!onGround && !this.isDashing) {
            if (vy > 0) {
                player.body.setGravityY(NORMAL_GRAVITY * (FALL_GRAVITY_MULT - 1));
            } else if (vy < 0 && !this.jumpHeld) {
                player.body.setGravityY(NORMAL_GRAVITY * (LOW_JUMP_GRAVITY_MULT - 1));
            } else {
                player.body.setGravityY(0);
            }
        } else {
            player.body.setGravityY(0);
        }

        // 대시 입력
        const dashJustPressed = this.touchDash && !this.prevDashInput;
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) || Phaser.Input.Keyboard.JustDown(this.keyJ) || dashJustPressed) {
            this.doDash();
        }

        this.prevJumpInput = jumpInput;
        this.prevDashInput = this.touchDash;
        this.wasOnGround = onGround;

        // 애니메이션 업데이트
        this.updateAnimation();
    }

    // 대시 상태 리셋 (피격/낙사 시 호출)
    resetDash() {
        this.isDashing = false;
        this.scene.player.body.allowGravity = true;
        this.scene.player.setAlpha(1);
    }

    // 플랫폼 생성 유틸리티
    static addPlatform(scene, platformGroup, x, y, width, height, color, keyPrefix = 'plat') {
        const key = `${keyPrefix}_${x}_${y}_${width}`;
        if (!scene.textures.exists(key)) {
            const g = scene.add.graphics();
            g.fillStyle(color);
            g.fillRect(0, 0, width, height);
            g.generateTexture(key, width, height);
            g.destroy();
        }
        const platform = platformGroup.create(x + width / 2, y + height / 2, key);
        platform.setDisplaySize(width, height);
        platform.refreshBody();
        return platform;
    }
}
