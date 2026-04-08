class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 배경
        this.cameras.main.setBackgroundColor('#16213e');

        // 플랫폼 그룹
        this.platforms = this.physics.add.staticGroup();
        this.createMap();

        // 플레이어
        this.player = this.physics.add.sprite(100, 500, null);
        this.player.setDisplaySize(32, 48);
        this.player.body.setSize(32, 48);
        this.player.setTint(0x4fc3f7);
        // 플레이어에 사각형 텍스처 생성
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4fc3f7);
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player', 32, 48);
        playerGraphics.destroy();
        this.player.setTexture('player');
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

        // 모바일 터치 컨트롤
        this.createTouchControls();

        // 카메라 설정 (맵이 화면보다 클 경우)
        this.cameras.main.setBounds(0, 0, 1600, 600);
        this.physics.world.setBounds(0, 0, 1600, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    createMap() {
        // 바닥
        this.addPlatform(0, 568, 1600, 32, 0x2d4059);

        // 플랫폼 배치 - 탐색하기 재미있는 구조
        // 왼쪽 영역
        this.addPlatform(0, 450, 200, 20, 0x3a506b);
        this.addPlatform(250, 380, 150, 20, 0x3a506b);
        this.addPlatform(50, 300, 120, 20, 0x3a506b);
        this.addPlatform(220, 220, 100, 20, 0x3a506b);

        // 중앙 영역
        this.addPlatform(400, 460, 200, 20, 0x3a506b);
        this.addPlatform(500, 350, 150, 20, 0x3a506b);
        this.addPlatform(350, 250, 120, 20, 0x3a506b);
        this.addPlatform(550, 180, 100, 20, 0x3a506b);

        // 오른쪽 영역
        this.addPlatform(700, 420, 180, 20, 0x3a506b);
        this.addPlatform(900, 350, 150, 20, 0x3a506b);
        this.addPlatform(800, 250, 120, 20, 0x3a506b);
        this.addPlatform(1000, 300, 100, 20, 0x3a506b);

        // 먼 오른쪽 영역
        this.addPlatform(1100, 450, 200, 20, 0x3a506b);
        this.addPlatform(1250, 350, 150, 20, 0x3a506b);
        this.addPlatform(1350, 250, 120, 20, 0x3a506b);
        this.addPlatform(1450, 180, 100, 20, 0x3a506b);
    }

    addPlatform(x, y, width, height, color) {
        // 그래픽으로 플랫폼 텍스처 생성
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
        // 5개의 키 아이템을 맵 곳곳에 배치
        const itemPositions = [
            { x: 70, y: 270 },      // 왼쪽 위 플랫폼
            { x: 575, y: 330 },     // 중앙 플랫폼
            { x: 270, y: 190 },     // 왼쪽 높은 곳
            { x: 1000, y: 270 },    // 오른쪽 영역
            { x: 1470, y: 150 },    // 가장 먼 오른쪽 높은 곳
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
        // 터치 영역 (화면 하단)
        const btnY = 540;
        const btnAlpha = 0.3;
        const btnSize = 70;

        // 왼쪽 버튼
        this.btnLeft = this.add.circle(60, btnY, btnSize / 2, 0xffffff, btnAlpha)
            .setScrollFactor(0).setDepth(200).setInteractive();
        this.add.text(60, btnY, '◀', { fontSize: '24px' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201);

        // 오른쪽 버튼
        this.btnRight = this.add.circle(160, btnY, btnSize / 2, 0xffffff, btnAlpha)
            .setScrollFactor(0).setDepth(200).setInteractive();
        this.add.text(160, btnY, '▶', { fontSize: '24px' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201);

        // 점프 버튼
        this.btnJump = this.add.circle(740, btnY, btnSize / 2, 0xffffff, btnAlpha)
            .setScrollFactor(0).setDepth(200).setInteractive();
        this.add.text(740, btnY, '▲', { fontSize: '24px' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(201);

        // 터치 상태 추적
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;

        this.btnLeft.on('pointerdown', () => this.touchLeft = true);
        this.btnLeft.on('pointerup', () => this.touchLeft = false);
        this.btnLeft.on('pointerout', () => this.touchLeft = false);

        this.btnRight.on('pointerdown', () => this.touchRight = true);
        this.btnRight.on('pointerup', () => this.touchRight = false);
        this.btnRight.on('pointerout', () => this.touchRight = false);

        this.btnJump.on('pointerdown', () => this.touchJump = true);
        this.btnJump.on('pointerup', () => this.touchJump = false);
        this.btnJump.on('pointerout', () => this.touchJump = false);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(this.formatTime(this.timeLeft));

        // 30초 이하일 때 빨간색으로
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
        const speed = 250;
        const jumpSpeed = -450;
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
