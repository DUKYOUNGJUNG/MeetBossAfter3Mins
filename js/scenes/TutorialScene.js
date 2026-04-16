// 튜토리얼: 4층 건물 (포탈로 층 이동, 각 층에서 조작 학습)
// 1층: 이동 / 2층: 점프 / 3층: 대시 / 4층: 점프+대시 → 옥상 컷씬

const FLOOR_WIDTH = 800;
const FLOOR_HEIGHT = 600;

// 층별 설정
const FLOORS = [
    {
        // 1층: 이동
        dialogue: [
            { text: '"..."', duration: 1500, color: '#ff4444', size: '28px' },
            { text: '"옥상으로…"', duration: 2000, color: '#ff4444', size: '24px' },
        ],
        guide: '◀ ▶  좌우로 이동',
        unlock: { canMove: true, canJump: false, canDash: false },
        bgColor: '#0a0a12',
        buildFloor(scene, platforms) {
            const add = (x, y, w, h, c) => PlayerController.addPlatform(scene, platforms, x, y, w, h, c, 'tut_f1');
            // 바닥
            add(0, FLOOR_HEIGHT - 32, FLOOR_WIDTH, 32, 0x2d2d3a);
            // 벽
            add(0, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
            add(FLOOR_WIDTH - 20, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
        },
        spawnX: 80,
        spawnY: FLOOR_HEIGHT - 80,
        portalX: FLOOR_WIDTH - 80,
        portalY: FLOOR_HEIGHT - 60,
    },
    {
        // 2층: 점프
        dialogue: [
            { text: '"옥상으로…"', duration: 2000, color: '#ff4444', size: '24px' },
        ],
        guide: '▲  점프! 플랫폼을 올라가세요',
        unlock: { canMove: true, canJump: true, canDash: false },
        bgColor: '#0c0c14',
        buildFloor(scene, platforms) {
            const add = (x, y, w, h, c) => PlayerController.addPlatform(scene, platforms, x, y, w, h, c, 'tut_f2');
            // 바닥
            add(0, FLOOR_HEIGHT - 32, 300, 32, 0x2d2d3a);
            // 계단식 플랫폼
            add(200, FLOOR_HEIGHT - 130, 150, 20, 0x3a3a50);
            add(400, FLOOR_HEIGHT - 220, 150, 20, 0x3a3a50);
            add(550, FLOOR_HEIGHT - 320, 150, 20, 0x3a3a50);
            // 포탈 플랫폼
            add(600, FLOOR_HEIGHT - 420, 180, 20, 0x3a3a50);
            // 벽
            add(0, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
            add(FLOOR_WIDTH - 20, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
        },
        spawnX: 80,
        spawnY: FLOOR_HEIGHT - 80,
        portalX: 700,
        portalY: FLOOR_HEIGHT - 450,
    },
    {
        // 3층: 대시
        dialogue: [
            { text: '"그래 그래… 이쪽으로…"', duration: 2000, color: '#ff4444', size: '24px' },
        ],
        guide: '💨  대시! 먼 거리를 순식간에',
        unlock: { canMove: true, canJump: false, canDash: true },
        bgColor: '#0e0e16',
        buildFloor(scene, platforms) {
            const add = (x, y, w, h, c) => PlayerController.addPlatform(scene, platforms, x, y, w, h, c, 'tut_f3');
            // 바닥 (갭 있음 — 대시로 건너야 함)
            add(0, FLOOR_HEIGHT - 32, 350, 32, 0x2d2d3a);
            add(430, FLOOR_HEIGHT - 32, 370, 32, 0x2d2d3a);
            // 벽
            add(0, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
            add(FLOOR_WIDTH - 20, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
        },
        spawnX: 80,
        spawnY: FLOOR_HEIGHT - 80,
        portalX: FLOOR_WIDTH - 80,
        portalY: FLOOR_HEIGHT - 60,
    },
    {
        // 4층: 점프 + 대시
        dialogue: [
            { text: '"곧이야… 이쪽으로…"', duration: 2000, color: '#ff4444', size: '24px' },
        ],
        guide: '▲ + 💨  점프 후 공중에서 대시!',
        unlock: { canMove: true, canJump: true, canDash: true },
        bgColor: '#101018',
        buildFloor(scene, platforms) {
            const add = (x, y, w, h, c) => PlayerController.addPlatform(scene, platforms, x, y, w, h, c, 'tut_f4');
            // 바닥
            add(0, FLOOR_HEIGHT - 32, 300, 32, 0x2d2d3a);
            // 높은 플랫폼 (점프+대시 필요)
            add(550, FLOOR_HEIGHT - 150, 200, 20, 0x3a3a50);
            // 벽
            add(0, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
            add(FLOOR_WIDTH - 20, 0, 20, FLOOR_HEIGHT, 0x1a1a2e);
        },
        spawnX: 80,
        spawnY: FLOOR_HEIGHT - 80,
        portalX: 660,
        portalY: FLOOR_HEIGHT - 180,
    },
];

class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    preload() {
        PlayerController.preloadSprites(this);
    }

    create() {
        PlayerController.createAnimations(this);
        this.currentFloor = 0;
        this.isTransitioning = false;
        this.input.addPointer(3);

        this.loadFloor(0);
    }

    loadFloor(floorIndex) {
        const floor = FLOORS[floorIndex];
        this.currentFloor = floorIndex;

        // 기존 오브젝트 정리
        this.children.removeAll(true);
        if (this.physics.world) {
            this.physics.world.colliders.destroy();
        }

        this.cameras.main.setBackgroundColor(floor.bgColor);
        this.cameras.main.setBounds(0, 0, FLOOR_WIDTH, FLOOR_HEIGHT);
        this.cameras.main.setZoom(1);
        this.cameras.main.setScroll(0, 0);

        // 플랫폼
        this.platforms = this.physics.add.staticGroup();
        floor.buildFloor(this, this.platforms);

        // 플레이어 컨트롤러
        this.pc = new PlayerController(this, {
            ...floor.unlock,
            afterImage: true,
        });
        this.pc.createPlayerTexture('tut_player');

        // 플레이어
        const playerKey = this.textures.exists('idle_east_0') ? 'idle_east_0' : 'tut_player';
        this.player = this.physics.add.sprite(floor.spawnX, floor.spawnY, playerKey);
        this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        this.player.setBounce(0);
        this.player.setMaxVelocity(MOVE_SPEED, 900);
        this.player.setCollideWorldBounds(true);

        // 충돌
        this.physics.add.collider(this.player, this.platforms);

        // 월드 바운드
        this.physics.world.setBounds(0, 0, FLOOR_WIDTH, FLOOR_HEIGHT + 200);

        // 포탈 생성
        this.createPortal(floor.portalX, floor.portalY);

        // 키보드 + 터치
        this.pc.setupKeyboard();
        const touchElements = this.pc.createTouchControls(FLOOR_WIDTH, FLOOR_HEIGHT);

        // 층 표시
        const floorLabel = this.add.text(FLOOR_WIDTH / 2, 20, `${floorIndex + 1}F`, {
            fontSize: '16px', fontFamily: 'monospace', color: '#333333',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        // 페이드인
        this.cameras.main.fadeIn(400);

        // 대사 시퀀스 시작 (입력 잠금)
        this.isTransitioning = true;
        this.player.body.moves = false;
        this.showDialogueSequence(floor.dialogue, () => {
            // 대사 끝 → 가이드 표시 + 입력 활성화
            this.showGuide(floor.guide);
            this.player.body.moves = true;
            this.isTransitioning = false;
        });
    }

    showDialogueSequence(dialogues, onComplete) {
        let index = 0;

        const showOne = () => {
            if (index >= dialogues.length) {
                onComplete();
                return;
            }

            const d = dialogues[index];
            const textObj = this.add.text(FLOOR_WIDTH / 2, FLOOR_HEIGHT / 2 - 40, d.text, {
                fontSize: d.size || '24px', fontFamily: 'monospace',
                color: d.color || '#ff4444',
                stroke: '#000000', strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5).setAlpha(0).setDepth(10);

            this.tweens.add({
                targets: textObj, alpha: 1, duration: 400,
                onComplete: () => {
                    this.time.delayedCall(d.duration || 2000, () => {
                        this.tweens.add({
                            targets: textObj, alpha: 0, duration: 400,
                            onComplete: () => {
                                textObj.destroy();
                                index++;
                                showOne();
                            }
                        });
                    });
                }
            });
        };

        // 시작 전 잠깐 대기
        this.time.delayedCall(800, showOne);
    }

    showGuide(text) {
        const guide = this.add.text(FLOOR_WIDTH / 2, 60, text, {
            fontSize: '20px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        this.tweens.add({
            targets: guide, alpha: 1, duration: 500,
        });

        // 5초 후 서서히 사라짐
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: guide, alpha: 0, duration: 1000,
                onComplete: () => guide.destroy()
            });
        });
    }

    createPortal(x, y) {
        // 포탈 텍스처
        if (!this.textures.exists('tut_portal')) {
            const g = this.add.graphics();
            g.fillStyle(0x4444ff, 0.6);
            g.fillEllipse(20, 30, 40, 60);
            g.fillStyle(0x8888ff, 0.4);
            g.fillEllipse(20, 30, 28, 44);
            g.fillStyle(0xccccff, 0.3);
            g.fillEllipse(20, 30, 14, 24);
            g.generateTexture('tut_portal', 40, 60);
            g.destroy();
        }

        this.portal = this.physics.add.staticSprite(x, y, 'tut_portal');
        this.portal.setDisplaySize(40, 60);
        this.portal.refreshBody();

        // 포탈 펄스 효과
        this.tweens.add({
            targets: this.portal,
            alpha: 0.5, scaleX: 0.9, scaleY: 1.05,
            duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // 포탈 진입 감지
        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);
    }

    enterPortal() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // 포탈 진입 이펙트
        this.cameras.main.flash(300, 100, 100, 255);

        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
            const nextFloor = this.currentFloor + 1;

            if (nextFloor >= FLOORS.length) {
                // 4층 클리어 → 튜토리얼 완료 → 옥상 컷씬
                const progress = StageProgress.load();
                progress.tutorialDone = true;
                StageProgress.save(progress);
                this.scene.start('CutsceneScene', CUTSCENE_DATA.rooftop);
            } else {
                this.loadFloor(nextFloor);
            }
        });
    }

    update(time, delta) {
        if (this.isTransitioning) return;

        // 플레이어 물리
        this.pc.updatePhysics(time, delta);

        // 낙사 체크
        if (this.player.y > FLOOR_HEIGHT + 50) {
            const floor = FLOORS[this.currentFloor];
            this.player.setPosition(floor.spawnX, floor.spawnY);
            this.player.setVelocity(0, 0);
            this.pc.resetDash();
        }
    }
}
