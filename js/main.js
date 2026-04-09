// 게임 설정
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// 튜토리얼 완료 여부에 따라 시작 씬 결정
const progress = StageProgress.load();
const startScene = progress.tutorialDone ? StageSelectScene : TutorialScene;

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
    scene: [startScene, TutorialScene, IntroScene, StageSelectScene, GameScene, BossScene, ClearScene]
};

const game = new Phaser.Game(config);
