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
    scene: [TutorialScene, IntroScene, CutsceneScene, StageSelectScene, GameScene, BossScene, ClearScene]
};

const game = new Phaser.Game(config);

// 튜토리얼 완료 시 바로 스테이지 선택으로 전환
game.events.once('ready', () => {
    const progress = StageProgress.load();
    if (progress.tutorialDone) {
        game.scene.stop('TutorialScene');
        game.scene.start('StageSelectScene');
    }
});
