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

        // 플레이어 컨트롤러
        this.pc = new PlayerController(this, {
            canMove: true,
            canJump: false,
            canDash: false,
            afterImage: true,
        });
        this.pc.createPlayerTexture('tut_player');

        // 플레이어 (구역1 시작)
        this.player = this.physics.add.sprite(80, TUTORIAL_HEIGHT - 80, 'tut_player');
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);

        // 현재 구역 (1~4)
        this.currentZone = 1;

        // 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 구역 트리거
        this.triggers = this.physics.add.staticGroup();
        this.createZoneTriggers();
        this.physics.add.overlap(this.player, this.triggers, this.onTrigger, null, this);

        // 카메라
        this.cameras.main.setBounds(0, 0, TUTORIAL_WIDTH, TUTORIAL_HEIGHT);
        this.physics.world.setBounds(0, 0, TUTORIAL_WIDTH, TUTORIAL_HEIGHT + 200);
        this.player.setCollideWorldBounds(false);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.3);

        // UI 카메라
        this.uiCamera = this.cameras.add(0, 0, 800, 600);
        this.uiCamera.setScroll(0, 0);
        this.uiLayer = this.add.container(0, 0);
        this.cameras.main.ignore(this.uiLayer);

        // 구역 안내 텍스트
        this.guideText = this.add.text(400, 80, '', {
            fontSize: '20px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        this.uiLayer.add(this.guideText);
        this.cameras.main.ignore(this.guideText);

        // 키보드 + 터치
        this.pc.setupKeyboard();
        const touchElements = this.pc.createTouchControls(800, 600);
        this.uiLayer.add(touchElements);
        touchElements.forEach(el => this.cameras.main.ignore(el));

        // UI 카메라에서 게임 오브젝트 무시
        this.platforms.getChildren().forEach(p => this.uiCamera.ignore(p));
        this.triggers.getChildren().forEach(t => this.uiCamera.ignore(t));
        this.uiCamera.ignore(this.player);

        // 구역별 표지판
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
        const add = (x, y, w, h, c) => PlayerController.addPlatform(this, this.platforms, x, y, w, h, c, 'tut_plat');

        // 구역 1: 좌우 이동 (0~800)
        add(0, TUTORIAL_HEIGHT - 32, 800, 32, 0x2d4059);

        // 구역 2: 점프 (800~1600)
        add(800, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        add(950, TUTORIAL_HEIGHT - 120, 120, 20, 0x3a506b);
        add(1120, TUTORIAL_HEIGHT - 200, 120, 20, 0x3a506b);
        add(1300, TUTORIAL_HEIGHT - 280, 120, 20, 0x3a506b);
        add(1450, TUTORIAL_HEIGHT - 180, 120, 20, 0x3a506b);
        add(1450, TUTORIAL_HEIGHT - 32, 150, 32, 0x2d4059);

        // 구역 3: 대시 (1600~2400) — 갭은 캐릭터 크기 수준 (~40px)
        add(1600, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        add(1840, TUTORIAL_HEIGHT - 32, 560, 32, 0x2d4059);

        // 구역 4: 점프 + 공중 대시 (2400~3200)
        add(2400, TUTORIAL_HEIGHT - 32, 200, 32, 0x2d4059);
        add(2900, TUTORIAL_HEIGHT - 180, 120, 20, 0x3a506b);
        add(2900, TUTORIAL_HEIGHT - 32, 300, 32, 0x2d4059);
    }

    createZoneTriggers() {
        const triggerData = [
            { x: 800, zone: 2 },
            { x: 1600, zone: 3 },
            { x: 2400, zone: 4 },
            { x: 2950, zone: 5 },
        ];

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
        const signs = [
            { x: 80, y: TUTORIAL_HEIGHT - 60, text: '\u2190 \u2192\n\uC774\uB3D9' },
            { x: 830, y: TUTORIAL_HEIGHT - 60, text: '\u25B2\n\uC810\uD504' },
            { x: 1630, y: TUTORIAL_HEIGHT - 60, text: '\uD83D\uDCA8\n\uB300\uC2DC' },
            { x: 2430, y: TUTORIAL_HEIGHT - 60, text: '\u25B2 + \uD83D\uDCA8\n\uC810\uD504 + \uACF5\uC911 \uB300\uC2DC' },
        ];

        signs.forEach(s => {
            const sign = this.add.text(s.x, s.y, s.text, {
                fontSize: '14px', fontFamily: 'monospace',
                color: '#ffcc00', stroke: '#000000', strokeThickness: 2,
                align: 'center'
            }).setOrigin(0, 1);
            this.uiCamera.ignore(sign);
        });

        const goalSign = this.add.text(2960, TUTORIAL_HEIGHT - 220, '\uD83D\uDEAA', {
            fontSize: '40px'
        }).setOrigin(0.5);
        this.uiCamera.ignore(goalSign);
        this.tweens.add({
            targets: goalSign, alpha: 0.4,
            duration: 800, yoyo: true, repeat: -1
        });
    }

    onTrigger(player, trigger) {
        const zone = trigger.getData('zone');

        if (zone === 5) {
            const progress = StageProgress.load();
            progress.tutorialDone = true;
            StageProgress.save(progress);
            this.scene.start('CutsceneScene', CUTSCENE_DATA.rooftop);
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
                this.pc.options.canMove = true;
                this.pc.options.canJump = false;
                this.pc.options.canDash = false;
                this.guideText.setText('\u25C0 \u25B6  \uC88C\uC6B0\uB85C \uC774\uB3D9\uD574\uBCF4\uC138\uC694');
                break;
            case 2:
                this.pc.options.canJump = true;
                this.pc.options.canDash = false;
                this.guideText.setText('\u25B2  \uC810\uD504! \uD50C\uB7AB\uD3FC\uC744 \uC62C\uB77C\uAC00\uC138\uC694');
                break;
            case 3:
                this.pc.options.canDash = true;
                this.guideText.setText('\uD83D\uDCA8  \uB300\uC2DC! \uBA3C \uAC70\uB9AC\uB97C \uC21C\uC2DD\uAC04\uC5D0');
                break;
            case 4:
                this.guideText.setText('\u25B2 + \uD83D\uDCA8  \uC810\uD504 \uD6C4 \uACF5\uC911\uC5D0\uC11C \uB300\uC2DC!');
                break;
        }

        this.guideText.setAlpha(0);
        this.tweens.add({
            targets: this.guideText, alpha: 1,
            duration: 500, ease: 'Power2'
        });
    }

    update(time, delta) {
        // 플레이어 물리
        this.pc.updatePhysics(time, delta);

        // 낙사 체크
        if (this.player.y > TUTORIAL_HEIGHT + 50) {
            const spawn = this.respawnPoints[this.currentZone];
            this.player.setPosition(spawn.x, spawn.y);
            this.player.setVelocity(0, 0);
            this.pc.resetDash();
        }
    }
}
