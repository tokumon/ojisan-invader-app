/**
 * メインゲームファイル - すべてのシステムを統合
 */

// グローバル変数
let gameEngine;
let inputSystem;
let uiSystem;
let soundSystem;

/**
 * ゲームを初期化
 */
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // ゲームエンジンを初期化
    gameEngine = new GameEngine(canvas);
    
    // サウンドシステムを初期化
    soundSystem = new SoundSystem();
    
    // 入力システムを初期化
    inputSystem = new InputSystem(gameEngine);
    
    // UIシステムを初期化
    uiSystem = new UISystem(gameEngine);
    
    // ゲームエンジンを初期化
    gameEngine.init();
    
    // ゲームループでUIを更新
    updateUILoop();
    
    console.log('おじさんインベーダーが初期化されました！');
}

/**
 * UI更新ループ
 */
function updateUILoop() {
    if (uiSystem) {
        uiSystem.updateUI();
    }
    requestAnimationFrame(updateUILoop);
}

/**
 * ゲームエンジンの拡張 - サウンド統合
 */
const originalFireBullet = GameEngine.prototype.fireBullet;
GameEngine.prototype.fireBullet = function() {
    originalFireBullet.call(this);
    if (soundSystem) {
        soundSystem.playBeamSound();
    }
};

const originalGameOver = GameEngine.prototype.gameOver;
GameEngine.prototype.gameOver = function() {
    originalGameOver.call(this);
    if (soundSystem) {
        soundSystem.playGameOverSound();
        soundSystem.stopBGM();
    }
};

const originalCheckLevelUp = GameEngine.prototype.checkLevelUp;
GameEngine.prototype.checkLevelUp = function() {
    const oldLevel = this.level;
    originalCheckLevelUp.call(this);
    if (this.level > oldLevel && soundSystem) {
        soundSystem.playLevelUpSound();
    }
};

// ゲームエンジンの衝突検出を拡張
const originalCheckCollisions = GameEngine.prototype.checkCollisions;
GameEngine.prototype.checkCollisions = function() {
    const oldScore = this.score;
    originalCheckCollisions.call(this);
    
    // スコアが変わった場合（敵を倒した場合）
    if (this.score > oldScore && soundSystem) {
        soundSystem.playExplosionSound();
    }
};

// ゲーム開始時の処理を拡張
const originalStart = GameEngine.prototype.start;
GameEngine.prototype.start = function() {
    originalStart.call(this);
    if (soundSystem) {
        soundSystem.startBGM();
    }
};

// ゲームリスタート時の処理を拡張
const originalRestart = GameEngine.prototype.restart;
GameEngine.prototype.restart = function() {
    originalRestart.call(this);
    if (soundSystem) {
        soundSystem.startBGM();
    }
};

/**
 * ページ読み込み完了時にゲームを開始
 */
document.addEventListener('DOMContentLoaded', function() {
    // 少し遅延させてから初期化（DOMの完全な読み込みを待つ）
    setTimeout(initGame, 100);
});

/**
 * ウィンドウリサイズ時の処理
 */
window.addEventListener('resize', function() {
    // 必要に応じてキャンバスサイズを調整
    console.log('Window resized');
});

/**
 * ページの可視性変更時の処理
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // ページが非表示になった場合
        if (soundSystem) {
            soundSystem.stopBGM();
        }
    } else {
        // ページが表示された場合
        if (soundSystem && gameEngine && gameEngine.gameState === 'playing') {
            soundSystem.startBGM();
        }
    }
});

/**
 * エラーハンドリング
 */
window.addEventListener('error', function(event) {
    console.error('Game error:', event.error);
});

/**
 * 未処理のPromise拒否のハンドリング
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// 開発用のデバッグ機能
if (typeof window !== 'undefined') {
    window.debugGame = {
        getGameState: () => gameEngine ? gameEngine.gameState : 'not initialized',
        getScore: () => gameEngine ? gameEngine.score : 0,
        getLives: () => gameEngine ? gameEngine.lives : 0,
        getLevel: () => gameEngine ? gameEngine.level : 0,
        toggleSound: () => {
            if (soundSystem) {
                soundSystem.setEnabled(!soundSystem.enabled);
                console.log('Sound enabled:', soundSystem.enabled);
            }
        },
        setVolume: (volume) => {
            if (soundSystem) {
                soundSystem.setVolume(volume);
                console.log('Volume set to:', volume);
            }
        }
    };
} 