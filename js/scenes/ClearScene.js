class ClearScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClearScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#0f3460');

        // 클리어 텍스트
        const clearText = this.add.text(400, 200, '🎉 스테이지 클리어! 🎉', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: clearText,
            alpha: 1,
            y: 180,
            duration: 1000,
            ease: 'Back.easeOut'
        });

        // 축하 메시지
        this.time.delayedCall(1000, () => {
            const subText = this.add.text(400, 280, '보스가 오기 전에 모든 열쇠를 찾았다!', {
                fontSize: '20px',
                color: '#e0e0e0'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: subText,
                alpha: 1,
                duration: 800
            });
        });

        // 파티클 효과 (단순 원들)
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(50, 550);
            const size = Phaser.Math.Between(3, 8);
            const color = Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b6b, 0x4fc3f7, 0x66bb6a]);
            const particle = this.add.circle(x, -20, size, color);

            this.tweens.add({
                targets: particle,
                y: y,
                duration: Phaser.Math.Between(1000, 2000),
                delay: Phaser.Math.Between(0, 1500),
                ease: 'Bounce.easeOut'
            });
        }

        // 다시 시작
        this.time.delayedCall(2500, () => {
            const restartText = this.add.text(400, 450, '탭하여 다시 플레이', {
                fontSize: '24px',
                color: '#aaaaaa'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: restartText,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            this.input.once('pointerdown', () => {
                this.scene.start('GameScene');
            });

            this.input.keyboard.once('keydown', () => {
                this.scene.start('GameScene');
            });
        });
    }
}
