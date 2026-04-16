class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.stageId = data && data.stageId ? data.stageId : 'normal_1';
        this.stageData = STAGE_DATA[this.stageId];
    }

    preload() {
        PlayerController.preloadSprites(this);
    }

    create() {
        PlayerController.createAnimations(this);
        this.cameras.main.setBackgroundColor('#0a0a0a');
        this.input.addPointer(3);
        this.isDead = false;
        this.bossActive = false;

        const BOSS_W = 1200;
        const BOSS_H = 600;

        this.physics.world.setBounds(0, 0, BOSS_W, BOSS_H + 100);

        // 플랫폼
        this.platforms = this.physics.add.staticGroup();
        PlayerController.addPlatform(this, this.platforms, 0, BOSS_H - 32, BOSS_W, 32, 0x1a1a1a, 'boss_floor');
        [{ x: 200, y: 450 }, { x: 600, y: 380 }, { x: 1000, y: 450 }, { x: 400, y: 280 }, { x: 800, y: 280 }].forEach(p => {
            PlayerController.addPlatform(this, this.platforms, p.x - 75, p.y - 8, 150, 16, 0x333333, 'boss_plat');
        });

        // 플레이어 컨트롤러
        this.pc = new PlayerController(this, { afterImage: false });
        this.pc.createPlayerTexture();

        const playerKey = this.textures.exists('idle_east_0') ? 'idle_east_0' : 'player';
        this.player = this.physics.add.sprite(100, BOSS_H - 80, playerKey);
        this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);
        this.physics.add.collider(this.player, this.platforms);

        // 키보드 + 터치
        this.pc.setupKeyboard();
        this.pc.createTouchControls(BOSS_W, BOSS_H);

        // 카메라
        this.cameras.main.setBounds(0, 0, BOSS_W, BOSS_H);

        // 보스 등장 연출
        this.cameras.main.shake(800, 0.03);

        const warning = this.add.text(BOSS_W / 2, 100, '\u26A0 \uBCF4\uC2A4 \uB4F1\uC7A5 \u26A0', {
            fontSize: '36px', fontFamily: 'monospace',
            color: '#ff0000', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: warning,
            alpha: 1, duration: 400, yoyo: true, repeat: 2,
            onComplete: () => warning.destroy()
        });

        // 보스 생성
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

        // 생명력 표시
        const lives = StageProgress.getLives();
        this.livesText = this.add.text(20, 20, '\u2764'.repeat(lives), {
            fontSize: '24px'
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

        this.boss.setVelocity(0, 0);

        const quote = this.add.text(600, 200, '"\u2026 3\uBD84\uC740 \uB05D\uB0AC\uB2E4."', {
            fontSize: '22px', fontFamily: 'monospace',
            color: '#ff4444', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: quote, alpha: 1, duration: 800,
            onComplete: () => {
                this.time.delayedCall(1500, () => {
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
        if (this.surviveEvent) this.surviveEvent.remove();
        this.player.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        const isGameOver = StageProgress.loseLife();
        const remainLives = StageProgress.getLives();

        const blackout = this.add.rectangle(600, 300, 1200, 600, 0x000000, 0).setDepth(100);
        this.tweens.add({ targets: blackout, alpha: 0.8, duration: 500 });

        const deathText = this.add.text(600, 220, '\uC0AC\uB9DD...', {
            fontSize: '48px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setDepth(101);

        this.tweens.add({ targets: deathText, alpha: 1, duration: 800 });

        const livesDisplay = this.add.text(600, 290,
            isGameOver ? '\uD83D\uDC80 \uC0DD\uBA85\uB825 \uC18C\uC9C4' : `\u2764 \uB0A8\uC740 \uC0DD\uBA85\uB825: ${'\u2764'.repeat(remainLives)}`, {
            fontSize: '22px', fontFamily: 'monospace',
            color: isGameOver ? '#ff4444' : '#ff8888'
        }).setOrigin(0.5).setAlpha(0).setDepth(101);

        this.tweens.add({ targets: livesDisplay, alpha: 1, duration: 800, delay: 500 });

        this.time.delayedCall(2500, () => {
            if (isGameOver) {
                const goText = this.add.text(600, 380, 'GAME OVER', {
                    fontSize: '36px', fontFamily: 'monospace',
                    color: '#ff0000', stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5).setDepth(101);

                const restartText = this.add.text(600, 440, '\uD0ED\uD558\uC5EC \uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC \uC2DC\uC791', {
                    fontSize: '18px', color: '#aaaaaa'
                }).setOrigin(0.5).setDepth(101);

                this.tweens.add({
                    targets: restartText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1
                });

                const doGameOver = () => {
                    StageProgress.gameOver();
                    this.scene.start('StageSelectScene');
                };
                this.input.once('pointerdown', doGameOver);
                this.input.keyboard.once('keydown', doGameOver);
            } else {
                const goText = this.add.text(600, 400, '\uD0ED\uD558\uC5EC \uC2A4\uD14C\uC774\uC9C0 \uC120\uD0DD\uC73C\uB85C', {
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
            }
        });
    }

    update(time, delta) {
        if (this.isDead) return;

        // 플레이어 물리
        this.pc.updatePhysics(time, delta);

        // 보스 AI
        if (this.bossActive) {
            this.updateBoss(time, delta);
        }
    }

    updateBoss(time, delta) {
        const speed = 120 + (60 - this.surviveTime) * 2;
        const dx = this.player.x - this.boss.x;

        if (Math.abs(dx) > 30) {
            this.boss.setVelocityX(dx > 0 ? speed : -speed);
        }

        if (this.player.y < this.boss.y - 60) {
            const bossOnGround = this.boss.body.touching.down || this.boss.body.blocked.down;
            if (bossOnGround) {
                this.boss.setVelocityY(-400);
            }
        }

        const attackInterval = Math.max(800, 2000 - (60 - this.surviveTime) * 30);
        if (time - this.lastAttack > attackInterval) {
            this.lastAttack = time;
            this.bossAttack();
        }
    }

    bossAttack() {
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
