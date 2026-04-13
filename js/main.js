// 게임 설정
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // 첫 씬은 BootScene에서 분기
    scene: [BootScene, IntroScene, CutsceneScene, TutorialScene, StageSelectScene, GameScene, BossScene, ClearScene]
};

const game = new Phaser.Game(config);
