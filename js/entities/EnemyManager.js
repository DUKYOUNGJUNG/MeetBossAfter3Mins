// ==========================================
// 적 매니저: 텍스처/생성/AI 일괄 관리
// GameScene에서 사용
// ==========================================

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        this.projectiles = scene.physics.add.group();
    }

    // 적 텍스처 생성 (씬당 1회)
    static createTextures(scene) {
        if (!scene.textures.exists('enemy_walk')) {
            const g = scene.add.graphics();
            g.fillStyle(0xff4444);
            g.fillRect(0, 0, 28, 28);
            g.fillStyle(0xcc0000);
            g.fillRect(4, 4, 20, 20);
            g.fillStyle(0xffffff);
            g.fillRect(8, 8, 6, 6);
            g.fillRect(16, 8, 6, 6);
            g.generateTexture('enemy_walk', 28, 28);
            g.destroy();
        }
        if (!scene.textures.exists('enemy_jump')) {
            const g = scene.add.graphics();
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
        if (!scene.textures.exists('enemy_shooter')) {
            const g = scene.add.graphics();
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
        if (!scene.textures.exists('projectile')) {
            const g = scene.add.graphics();
            g.fillStyle(0xff00ff);
            g.fillCircle(5, 5, 5);
            g.generateTexture('projectile', 10, 10);
            g.destroy();
        }
        if (!scene.textures.exists('falling_obj')) {
            const g = scene.add.graphics();
            g.fillStyle(0x888888);
            g.fillTriangle(10, 0, 0, 20, 20, 20);
            g.generateTexture('falling_obj', 20, 20);
            g.destroy();
        }
        if (!scene.textures.exists('spike')) {
            const g = scene.add.graphics();
            g.fillStyle(0xaa4444);
            g.fillTriangle(12, 0, 0, 24, 24, 24);
            g.generateTexture('spike', 24, 24);
            g.destroy();
        }
        if (!scene.textures.exists('enemy_sealer')) {
            const g = scene.add.graphics();
            g.fillStyle(0x9933ff);
            g.fillRect(0, 0, 28, 28);
            g.fillStyle(0x6622cc);
            g.fillRect(4, 4, 20, 20);
            g.fillStyle(0xffffff);
            g.fillRect(10, 10, 8, 8);
            g.generateTexture('enemy_sealer', 28, 28);
            g.destroy();
        }
        if (!scene.textures.exists('enemy_chaser')) {
            const g = scene.add.graphics();
            g.fillStyle(0xff8866);
            g.fillRect(0, 0, 26, 28);
            g.fillStyle(0xcc4422);
            g.fillRect(3, 3, 20, 22);
            g.fillStyle(0xffffff);
            g.fillRect(7, 8, 5, 5);
            g.fillRect(15, 8, 5, 5);
            g.generateTexture('enemy_chaser', 26, 28);
            g.destroy();
        }
    }

    // 데이터로부터 적 일괄 생성
    spawnAll(enemyDataArray) {
        if (!enemyDataArray || enemyDataArray.length === 0) return;

        enemyDataArray.forEach(eData => {
            let enemy;
            switch (eData.type) {
                case 'walker':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_walk');
                    enemy.setData('type', 'walker');
                    enemy.setData('speed', eData.speed || 60);
                    enemy.setData('dir', eData.dir || 1);
                    enemy.setData('spawnX', eData.x);
                    enemy.setData('spawnY', eData.y);
                    enemy.body.setSize(28, 28);
                    enemy.setVelocityX((eData.speed || 60) * (eData.dir || 1));
                    enemy.setFlipX((eData.dir || 1) < 0);
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
                    enemy.setData('phase', 'idle');
                    enemy.setData('phaseStart', 0);
                    enemy.setData('jumpPower', eData.jumpPower || 380);
                    enemy.setData('hoverMs', eData.hoverMs || 900);
                    enemy.setData('descendSpeed', eData.descendSpeed || 70);
                    enemy.setData('idleMs', eData.idleMs || 500);
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
                    enemy.body.moves = false;
                    break;

                case 'falling': {
                    enemy = this.enemies.create(eData.x, eData.y, 'falling_obj');
                    enemy.setData('type', 'falling');
                    enemy.setData('spawnX', eData.x);
                    enemy.setData('spawnY', eData.y);
                    enemy.setData('floorY', eData.floorY || (eData.y + 600));
                    enemy.setData('warningMs', eData.warningMs || 800);
                    enemy.setData('cooldownMs', eData.cooldownMs || 1500);
                    enemy.setData('phase', 'warning');
                    enemy.setData('phaseStart', 0);
                    enemy.body.allowGravity = false;
                    enemy.body.setSize(20, 20);
                    // 그림자 표시 (착지 지점)
                    const shadowY = (eData.floorY || (eData.y + 600)) - 4;
                    const shadow = this.scene.add.rectangle(eData.x, shadowY, 36, 8, 0xff3333, 0.5);
                    enemy.setData('shadow', shadow);
                    if (this.scene.uiCamera) this.scene.uiCamera.ignore(shadow);
                    break;
                }

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

                case 'sealer': {
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_sealer');
                    enemy.setData('type', 'sealer');
                    enemy.setData('radius', eData.radius || 150);
                    enemy.body.setSize(28, 28);
                    enemy.body.allowGravity = false;
                    enemy.body.immovable = true;
                    enemy.body.moves = false;
                    // 봉인 반경 시각화 (보라 오라)
                    const aura = this.scene.add.circle(eData.x, eData.y, eData.radius || 150, 0x9933ff, 0.12);
                    aura.setStrokeStyle(2, 0xaa66ff, 0.5);
                    enemy.setData('aura', aura);
                    if (this.scene.uiCamera) this.scene.uiCamera.ignore(aura);
                    break;
                }

                case 'chaser':
                    enemy = this.enemies.create(eData.x, eData.y, 'enemy_chaser');
                    enemy.setData('type', 'chaser');
                    enemy.setData('speed', eData.speed || 100);
                    enemy.setData('spawnX', eData.x);
                    enemy.setData('spawnY', eData.y);
                    enemy.body.setSize(26, 28);
                    break;
            }

            if (enemy && this.scene.uiCamera) {
                this.scene.uiCamera.ignore(enemy);
            }
        });
    }

    // 매 프레임 AI 업데이트
    update(time, player) {
        let inSealRange = false;

        this.enemies.getChildren().forEach(enemy => {
            const type = enemy.getData('type');

            switch (type) {
                case 'walker': {
                    // 벽에 막히면 spawn 위치로 리스폰 + 플레이어 쪽으로 방향 전환
                    if (enemy.body.blocked.left || enemy.body.blocked.right) {
                        const spawnX = enemy.getData('spawnX');
                        const spawnY = enemy.getData('spawnY');
                        const speed = enemy.getData('speed');
                        enemy.setPosition(spawnX, spawnY);
                        const newDir = player.x < spawnX ? -1 : 1;
                        enemy.setData('dir', newDir);
                        enemy.setVelocityX(speed * newDir);
                        enemy.setFlipX(newDir < 0);
                    }
                    break;
                }

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
                    // idle → rising → hovering(공중정지) → descending(천천히) → idle
                    const phase = enemy.getData('phase');
                    const phaseStart = enemy.getData('phaseStart');
                    const elapsed = time - phaseStart;
                    const onGround = enemy.body.touching.down || enemy.body.blocked.down;

                    if (phase === 'idle') {
                        if (onGround && elapsed > enemy.getData('idleMs')) {
                            enemy.setVelocityY(-enemy.getData('jumpPower'));
                            enemy.setData('phase', 'rising');
                            enemy.setData('phaseStart', time);
                        }
                    } else if (phase === 'rising') {
                        if (enemy.body.velocity.y >= 0) {
                            enemy.body.allowGravity = false;
                            enemy.setVelocityY(0);
                            enemy.setData('phase', 'hovering');
                            enemy.setData('phaseStart', time);
                        }
                    } else if (phase === 'hovering') {
                        if (elapsed > enemy.getData('hoverMs')) {
                            enemy.setVelocityY(enemy.getData('descendSpeed'));
                            enemy.setData('phase', 'descending');
                            enemy.setData('phaseStart', time);
                        }
                    } else if (phase === 'descending') {
                        if (onGround) {
                            enemy.body.allowGravity = true;
                            enemy.setVelocityY(0);
                            enemy.setData('phase', 'idle');
                            enemy.setData('phaseStart', time);
                        }
                    }
                    break;
                }

                case 'shooter': {
                    const interval = enemy.getData('interval');
                    const lastShot = enemy.getData('lastShot');
                    if (time - lastShot > interval) {
                        enemy.setData('lastShot', time);
                        const dir = player.x < enemy.x ? -1 : 1;
                        const proj = this.projectiles.create(enemy.x + dir * 20, enemy.y, 'projectile');
                        proj.setVelocityX(200 * dir);
                        proj.body.allowGravity = false;
                        if (this.scene.uiCamera) this.scene.uiCamera.ignore(proj);
                        this.scene.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
                    }
                    break;
                }

                case 'falling': {
                    // warning(그림자 깜빡) → falling(중력) → cooldown(숨김) → warning 반복
                    const phase = enemy.getData('phase');
                    const phaseStart = enemy.getData('phaseStart');
                    const elapsed = time - phaseStart;
                    const shadow = enemy.getData('shadow');

                    if (phase === 'warning') {
                        if (shadow) shadow.setAlpha(0.3 + Math.sin(time * 0.015) * 0.25);
                        if (elapsed > enemy.getData('warningMs')) {
                            enemy.body.allowGravity = true;
                            enemy.setData('phase', 'falling');
                            enemy.setData('phaseStart', time);
                            if (shadow) shadow.setAlpha(0.7);
                        }
                    } else if (phase === 'falling') {
                        const floorY = enemy.getData('floorY');
                        const onGround = enemy.body.blocked.down || enemy.body.touching.down;
                        if (enemy.y >= floorY - 10 || onGround) {
                            enemy.body.allowGravity = false;
                            enemy.body.enable = false;
                            enemy.setVisible(false);
                            enemy.setVelocity(0, 0);
                            enemy.setData('phase', 'cooldown');
                            enemy.setData('phaseStart', time);
                            if (shadow) shadow.setAlpha(0);
                        }
                    } else if (phase === 'cooldown') {
                        if (elapsed > enemy.getData('cooldownMs')) {
                            enemy.setPosition(enemy.getData('spawnX'), enemy.getData('spawnY'));
                            enemy.body.enable = true;
                            enemy.setVisible(true);
                            enemy.setData('phase', 'warning');
                            enemy.setData('phaseStart', time);
                        }
                    }
                    break;
                }

                case 'spike': {
                    const interval = enemy.getData('interval');
                    const phase = time % interval;
                    const baseY = enemy.getData('baseY');
                    if (phase < interval * 0.3) {
                        if (!enemy.getData('active')) {
                            enemy.setData('active', true);
                            enemy.setAlpha(1);
                            enemy.setY(baseY - 20);
                        }
                    } else if (phase > interval * 0.7) {
                        if (enemy.getData('active')) {
                            enemy.setData('active', false);
                            enemy.setAlpha(0.3);
                            enemy.setY(baseY);
                        }
                    }
                    break;
                }

                case 'sealer': {
                    // 위치 고정. 플레이어가 반경 내 진입했는지 체크.
                    const r = enemy.getData('radius');
                    const dx = player.x - enemy.x;
                    const dy = player.y - enemy.y;
                    if (dx * dx + dy * dy < r * r) inSealRange = true;
                    break;
                }

                case 'chaser': {
                    // 플레이어 x 방향 추적 (점프 안 함, 떨어짐 가능)
                    const speed = enemy.getData('speed');
                    const dir = player.x < enemy.x ? -1 : 1;
                    enemy.setVelocityX(speed * dir);
                    enemy.setFlipX(dir < 0);
                    break;
                }
            }
        });

        // 대시 봉인 상태 일괄 적용
        if (this.scene.pc) this.scene.pc.isDashSealed = inSealRange;
    }

    // 플레이어 피격 시 호출 — 추적형 적을 spawn 위치로 복귀
    resetChasers() {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.getData('type') === 'chaser') {
                enemy.setPosition(enemy.getData('spawnX'), enemy.getData('spawnY'));
                enemy.setVelocity(0, 0);
            }
        });
    }
}
