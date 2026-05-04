// ==========================================
// 아이템 매니저: 텍스처/배치 관리
// 수집 로직(UI 피드백 + 클리어 전환)은 GameScene에 남김
// ==========================================

class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = scene.physics.add.staticGroup();
    }

    static createTexture(scene) {
        if (!scene.textures.exists('item')) {
            const ig = scene.add.graphics();
            ig.fillStyle(0xffd700);
            ig.fillCircle(12, 12, 12);
            ig.fillStyle(0xffea00);
            ig.fillCircle(12, 12, 8);
            ig.generateTexture('item', 24, 24);
            ig.destroy();
        }
    }

    // 스테이지 데이터로부터 아이템 배치
    // testMode: true면 스폰 위치 근처에 한 줄로 배치
    spawnFromStage(stageData, testMode = false) {
        let itemPositions;
        if (stageData.itemPresets && stageData.itemPresets.length > 0) {
            const presetIndex = Phaser.Math.Between(0, stageData.itemPresets.length - 1);
            itemPositions = stageData.itemPresets[presetIndex];
        } else {
            itemPositions = stageData.items;
        }

        if (testMode) {
            const spawnX = stageData.spawn.x;
            const spawnY = stageData.spawn.y;
            itemPositions = itemPositions.map((p, i) => ({
                ...p,
                x: spawnX + 50 + i * 30,
                y: spawnY - 20,
            }));
        }

        const itemNames = stageData.itemNames || itemPositions.map(p => p.name || '???');

        itemPositions.forEach((pos, idx) => {
            const item = this.items.create(pos.x, pos.y, 'item');
            item.setDisplaySize(24, 24);
            item.refreshBody();
            item.setData('itemName', itemNames[idx] || pos.name || '???');
            this.scene.tweens.add({
                targets: item, alpha: 0.5,
                duration: 600, yoyo: true, repeat: -1,
            });
            if (this.scene.uiCamera) this.scene.uiCamera.ignore(item);
        });

        return itemPositions.length;
    }
}
