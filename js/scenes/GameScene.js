// 맵 크기 상수
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 1200;

// 대시 설정
const DASH_DISTANCE = 200;
const DASH_SPEED = 800;
const DASH_COOLDOWN = 2000; // 2초 쿨타임

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 배경
        this.cameras.main.setBackgroundColor('#16213e');

        // 멀티터치 활성화
        this.input.addPointer(3);

        // 플랫폼 그룹
        this.platforms = this.physics.add.staticGroup();
        this.createMap();

        // 플레이어 텍스처 생성
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4fc3f7);
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player', 32, 48);
        playerGraphics.destroy();

        // 플레이어
        this.player = this.physics.add.sprite(100, MAP_HEIGHT - 80, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);

        // 대시 상태
        this.isDashing = false;
        this.dashCooldownReady = true;
        this.lastDirection = 1; // 1 = 오른쪽, -1 = 왼쪽
        this.dashTime = 0;

        // 플레이어-플랫폼 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 아이템 5개 배치
        this.items = this.physics.add.staticGroup();
        this.collectedCount = 0;
        this.totalItems = 5;
        this.createItems();

        // 아이템 수집
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // 1초마다 타이머 감소
        this.timeLeft = 180;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // 키보드 입력
        this.cursors = this.input.keyboard.createCursorKeys();
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // 카메라 설정 - 플레이어 따라가기
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.3);

        // UI 전용 카메라 (줌/스크롤 영향 없는 고정 레이어)
        this.uiCamera = this.cameras.add(0, 0, 800, 600);
        this.uiCamera.setScroll(0, 0);

        // UI 레이어
        this.uiLayer = this.add.container(0, 0);

        // 타이머
        this.timerText = this.add.text(400, 16, this.formatTime(this.timeLeft), {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);

        // 버전 표시
        const versionText = this.add.text(784, 16, 'v0.0.2', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#666666'
        }).setOrigin(1, 0);

        // 아이템 카운터
        this.itemText = this.add.text(16, 16, '🔑 0 / 5', {
            fontSize: '22px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        });

        // UI 요소들을 컨테이너에 추가
        this.uiLayer.add([this.timerText, versionText, this.itemText]);

        // 메인 카메라는 UI 레이어 무시
        this.cameras.main.ignore(this.uiLayer);
        this.cameras.main.ignore(this.timerText);
        this.cameras.main.ignore(versionText);
        this.cameras.main.ignore(this.itemText);

        // UI 카메라는 게임 오브젝트 무시 (UI만 렌더링)
        this.platforms.getChildren().forEach(p => this.uiCamera.ignore(p));
        this.items.getChildren().forEach(i => this.uiCamera.ignore(i));
        this.uiCamera.ignore(this.player);

        // 모바일 터치 컨트롤
        this.createTouchControls();
    }

    createMap() {
        // 바닥 (전체 맵)
        this.addPlatform(0, MAP_HEIGHT - 32, MAP_WIDTH, 32, 0x2d4059);

        // ===== 시작 영역 (0~600) - 쉬운 구간 =====
        this.addPlatform(150, MAP_HEIGHT - 130, 180, 20, 0x3a506b);
        this.addPlatform(400, MAP_HEIGHT - 200, 150, 20, 0x3a506b);

        // ===== 지하 동굴 영역 (500~1200) =====
        this.addPlatform(500, MAP_HEIGHT - 400, 700, 20, 0x2d4059);
        this.addPlatform(550, MAP_HEIGHT - 150, 120, 20, 0x3a506b);
        this.addPlatform(750, MAP_HEIGHT - 220, 100, 20, 0x3a506b);
        this.addPlatform(900, MAP_HEIGHT - 130, 150, 20, 0x3a506b);
        this.addPlatform(1050, MAP_HEIGHT - 250, 130, 20, 0x3a506b);
        this.addPlatform(600, MAP_HEIGHT - 500, 120, 20, 0x3a506b);
        this.addPlatform(800, MAP_HEIGHT - 580, 100, 20, 0x3a506b);

        // ===== 높은 절벽 영역 (1200~2000) =====
        this.addPlatform(1200, MAP_HEIGHT - 150, 200, 20, 0x3a506b);
        this.addPlatform(1350, MAP_HEIGHT - 280, 120, 20, 0x3a506b);
        this.addPlatform(1500, MAP_HEIGHT - 400, 150, 20, 0x3a506b);
        this.addPlatform(1650, MAP_HEIGHT - 520, 130, 20, 0x3a506b);
        this.addPlatform(1450, MAP_HEIGHT - 620, 100, 20, 0x3a506b);
        this.addPlatform(1600, MAP_HEIGHT - 730, 120, 20, 0x3a506b);
        this.addPlatform(1800, MAP_HEIGHT - 600, 180, 20, 0x3a506b);
        this.addPlatform(1900, MAP_HEIGHT - 200, 150, 20, 0x3a506b);

        // ===== 부유 섬 영역 (2000~2800) =====
        this.addPlatform(2050, MAP_HEIGHT - 300, 120, 20, 0x3a506b);
        this.addPlatform(2250, MAP_HEIGHT - 400, 100, 20, 0x3a506b);
        this.addPlatform(2400, MAP_HEIGHT - 500, 150, 20, 0x3a506b);
        this.addPlatform(2200, MAP_HEIGHT - 650, 120, 20, 0x3a506b);
        this.addPlatform(2450, MAP_HEIGHT - 750, 100, 20, 0x3a506b);
        this.addPlatform(2600, MAP_HEIGHT - 350, 180, 20, 0x3a506b);
        this.addPlatform(2700, MAP_HEIGHT - 500, 120, 20, 0x3a506b);
        this.addPlatform(2550, MAP_HEIGHT - 150, 200, 20, 0x3a506b);

        // ===== 최종 영역 (2800~4000) =====
        this.addPlatform(2900, MAP_HEIGHT - 200, 150, 20, 0x3a506b);
        this.addPlatform(3100, MAP_HEIGHT - 330, 130, 20, 0x3a506b);
        this.addPlatform(3300, MAP_HEIGHT - 450, 150, 20, 0x3a506b);
        this.addPlatform(3150, MAP_HEIGHT - 600, 100, 20, 0x3a506b);
        this.addPlatform(3400, MAP_HEIGHT - 700, 120, 20, 0x3a506b);
        this.addPlatform(3550, MAP_HEIGHT - 550, 180, 20, 0x3a506b);
        this.addPlatform(3700, MAP_HEIGHT - 400, 150, 20, 0x3a506b);
        this.addPlatform(3850, MAP_HEIGHT - 250, 130, 20, 0x3a506b);

        // 벽 장애물들 (수직 플랫폼)
        this.addPlatform(1180, MAP_HEIGHT - 300, 30, 270, 0x2d4059);
        this.addPlatform(2800, MAP_HEIGHT - 250, 30, 220, 0x2d4059);
    }

    addPlatform(x, y, width, height, color) {
        const key = `platform_${x}_${y}`;
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();

        const platform = this.platforms.create(x + width / 2, y + height / 2, key);
        platform.setDisplaySize(width, height);
        platform.refreshBody();
    }

    createItems() {
        // 5개의 키 아이템 - 맵 곳곳에 숨김 (탐색해야 발견)
        const itemPositions = [
            { x: 770, y: MAP_HEIGHT - 250 },
            { x: 820, y: MAP_HEIGHT - 610 },
            { x: 1660, y: MAP_HEIGHT - 760 },
            { x: 2460, y: MAP_HEIGHT - 780 },
            { x: 3410, y: MAP_HEIGHT - 730 },
        ];

        // 아이템 텍스처 생성
        const itemGraphics = this.add.graphics();
        itemGraphics.fillStyle(0xffd700);
        itemGraphics.fillCircle(12, 12, 12);
        itemGraphics.fillStyle(0xffea00);
        itemGraphics.fillCircle(12, 12, 8);
        itemGraphics.generateTexture('item', 24, 24);
        itemGraphics.destroy();

        itemPositions.forEach(pos => {
            const item = this.items.create(pos.x, pos.y, 'item');
            item.setDisplaySize(24, 24);
            item.refreshBody();
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

    collectItem(player, item) {
        item.destroy();
        this.collectedCount++;
        this.itemText.setText(`🔑 ${this.collectedCount} / ${this.totalItems}`);

        // 수집 이펙트
        const flash = this.add.circle(item.x, item.y, 20, 0xffd700, 0.8);
        if (this.uiCamera) this.uiCamera.ignore(flash);
        this.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });

        // 전부 수집 시 클리어
        if (this.collectedCount >= this.totalItems) {
            this.timerEvent.remove();
            this.time.delayedCall(500, () => {
                this.scene.start('ClearScene');
            });
        }
    }

    createTouchControls() {
        // C안: 왼쪽 절반 = 이동(위치로 좌/우), 오른쪽에 대시+점프 버튼
        // 터치 영역: 0~50% = 이동, 50~75% = 대시, 75~100% = 점프
        const W = 800;
        const H = 600;
        const btnY = H - 50;

        // 왼쪽 이동 영역 (0~50%)
        const leftArrow = this.add.text(130, btnY, '◀', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);
        const rightArrow = this.add.text(270, btnY, '▶', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        // 대시 버튼 (50~75%)
        const dashBtn = this.add.text(500, btnY, '💨', { fontSize: '32px' })
            .setOrigin(0.5).setAlpha(0.3);

        // 대시 쿨타임 표시 (대시 버튼 아래)
        this.dashCooldownBar = this.add.rectangle(500, btnY + 28, 60, 6, 0x00ffaa, 0.8)
            .setOrigin(0.5);
        this.dashCooldownText = this.add.text(500, btnY - 28, '', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ff4444'
        }).setOrigin(0.5).setAlpha(0);

        // 점프 버튼 (75~100%)
        const jumpArrow = this.add.text(700, btnY, '▲', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setAlpha(0.3);

        // 영역 구분선
        const divider1 = this.add.rectangle(W * 0.5, H / 2, 1, H, 0xffffff, 0.1);
        const divider2 = this.add.rectangle(W * 0.75, H / 2, 1, H, 0xffffff, 0.05);

        // UI 레이어에 추가
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

        // 대시 방향 (현재 이동 방향 또는 마지막 방향)
        const dir = this.lastDirection;

        // 대시 중 중력 무시
        this.player.body.allowGravity = false;
        this.player.setVelocityY(0);
        this.player.setVelocityX(DASH_SPEED * dir);

        // 대시 이펙트 (잔상)
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

        // 대시 종료
        this.time.delayedCall(this.dashTime, () => {
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setAlpha(1);
        });

        // 쿨타임 시작
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
        // 매 프레임 모든 활성 포인터를 직접 체크
        const gameWidth = this.scale.width;

        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchDash = false;

        const pointers = [
            this.input.pointer1,
            this.input.pointer2,
            this.input.pointer3,
            this.input.pointer4,
            this.input.pointer5
        ];

        for (const pointer of pointers) {
            if (pointer && pointer.isDown) {
                const screenX = pointer.x;
                // 왼쪽 절반 = 이동
                if (screenX < gameWidth * 0.5) {
                    if (screenX < gameWidth * 0.25) {
                        this.touchLeft = true;
                    } else {
                        this.touchRight = true;
                    }
                }
                // 50~75% = 대시
                else if (screenX < gameWidth * 0.75) {
                    this.touchDash = true;
                }
                // 75~100% = 점프
                else {
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
            this.scene.start('BossScene');
        }
    }

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    update() {
        // 매 프레임 터치 상태 갱신
        this.checkTouchInput();

        const speed = 250;
        const jumpSpeed = -500;
        const onGround = this.player.body.touching.down;

        // 대시 중에는 이동 입력 무시
        if (this.isDashing) return;

        // 좌/우 이동
        if (this.cursors.left.isDown || this.touchLeft) {
            this.player.setVelocityX(-speed);
            this.lastDirection = -1;
        } else if (this.cursors.right.isDown || this.touchRight) {
            this.player.setVelocityX(speed);
            this.lastDirection = 1;
        } else {
            this.player.setVelocityX(0);
        }

        // 점프 (땅에 있을 때만)
        if ((this.cursors.up.isDown || this.touchJump) && onGround) {
            this.player.setVelocityY(jumpSpeed);
        }

        // 대시 (Shift키 또는 터치)
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) || this.touchDash) {
            this.doDash();
        }
    }
}
