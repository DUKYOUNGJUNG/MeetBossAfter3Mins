// 맵 크기 상수
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 1200;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 배경
        this.cameras.main.setBackgroundColor('#16213e');

        // 멀티터치 활성화
        this.input.addPointer(2);

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

        // 플레이어-플랫폼 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 아이템 5개 배치
        this.items = this.physics.add.staticGroup();
        this.collectedCount = 0;
        this.totalItems = 5;
        this.createItems();

        // 아이템 수집
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // 타이머 (180초)
        this.timeLeft = 180;
        this.timerText = this.add.text(400, 16, this.formatTime(this.timeLeft), {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // 아이템 카운터 UI
        this.itemText = this.add.text(16, 16, '🔑 0 / 5', {
            fontSize: '22px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(100);

        // 1초마다 타이머 감소
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // 키보드 입력
        this.cursors = this.input.keyboard.createCursorKeys();

        // 모바일 터치 컨트롤 (존 기반 멀티터치)
        this.createTouchControls();

        // 카메라 설정 - 플레이어 따라가기
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        // 카메라 줌 (플레이어 주변만 보이도록)
        this.cameras.main.setZoom(1.3);
    }

    createMap() {
        // 바닥 (전체 맵)
        this.addPlatform(0, MAP_HEIGHT - 32, MAP_WIDTH, 32, 0x2d4059);

        // ===== 시작 영역 (0~600) - 쉬운 구간 =====
        this.addPlatform(150, MAP_HEIGHT - 130, 180, 20, 0x3a506b);
        this.addPlatform(400, MAP_HEIGHT - 200, 150, 20, 0x3a506b);

        // ===== 지하 동굴 영역 (500~1200) =====
        // 천장처럼 보이는 플랫폼
        this.addPlatform(500, MAP_HEIGHT - 400, 700, 20, 0x2d4059);
        // 동굴 내부 플랫폼
        this.addPlatform(550, MAP_HEIGHT - 150, 120, 20, 0x3a506b);
        this.addPlatform(750, MAP_HEIGHT - 220, 100, 20, 0x3a506b);
        this.addPlatform(900, MAP_HEIGHT - 130, 150, 20, 0x3a506b);
        this.addPlatform(1050, MAP_HEIGHT - 250, 130, 20, 0x3a506b);
        // 동굴 위쪽으로 올라가는 길
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
            { x: 770, y: MAP_HEIGHT - 250 },    // 동굴 내부
            { x: 820, y: MAP_HEIGHT - 610 },    // 동굴 위 높은 곳
            { x: 1660, y: MAP_HEIGHT - 760 },   // 절벽 꼭대기
            { x: 2460, y: MAP_HEIGHT - 780 },   // 부유 섬 높은 곳
            { x: 3410, y: MAP_HEIGHT - 730 },   // 최종 영역 높은 곳
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
            // 반짝이는 효과
            this.tweens.add({
                targets: item,
                alpha: 0.5,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        });
    }

    collectItem(player, item) {
        item.destroy();
        this.collectedCount++;
        this.itemText.setText(`🔑 ${this.collectedCount} / ${this.totalItems}`);

        // 수집 이펙트
        const flash = this.add.circle(item.x, item.y, 20, 0xffd700, 0.8);
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
        // 가이드 UI만 표시 (실제 입력은 update에서 포인터 직접 체크)
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // 왼쪽 영역 UI (이동)
        this.add.rectangle(80, gameHeight - 60, 160, 80, 0xffffff, 0.08)
            .setScrollFactor(0).setDepth(199);
        this.add.text(40, gameHeight - 60, '◀', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0.4);
        this.add.text(120, gameHeight - 60, '▶', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0.4);

        // 오른쪽 영역 UI (점프)
        this.add.rectangle(gameWidth - 60, gameHeight - 60, 100, 80, 0xffffff, 0.08)
            .setScrollFactor(0).setDepth(199);
        this.add.text(gameWidth - 60, gameHeight - 60, '▲', { fontSize: '28px', color: '#ffffff' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0.4);
    }

    checkTouchInput() {
        // 매 프레임 모든 활성 포인터를 직접 체크
        const gameWidth = this.scale.width;

        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;

        // pointer1~pointer5까지 모든 포인터 확인
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
                // 오른쪽 절반 = 점프
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

        // 타이머 종료 → 보스 등장
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

        // 좌/우 이동
        if (this.cursors.left.isDown || this.touchLeft) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.touchRight) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        // 점프 (땅에 있을 때만)
        if ((this.cursors.up.isDown || this.touchJump) && onGround) {
            this.player.setVelocityY(jumpSpeed);
        }
    }
}
