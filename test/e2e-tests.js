/**
 * E2Eテスト - ゲーム全体の統合テスト
 */

class E2ETestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.gameEngine = null;
        this.inputSystem = null;
        this.uiSystem = null;
        this.soundSystem = null;
    }
    
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async run() {
        console.log('🎮 E2Eテストを開始...\n');
        
        for (const { name, testFunction } of this.tests) {
            try {
                await testFunction();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 E2Eテスト結果: ${this.passed}個成功, ${this.failed}個失敗`);
    }
    
    // テスト用のゲーム環境をセットアップ
    setupGame() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.id = 'gameCanvas';
        
        // 必要なDOM要素を作成
        const container = document.createElement('div');
        container.id = 'gameContainer';
        
        const ui = document.createElement('div');
        ui.id = 'ui';
        ui.innerHTML = `
            <div>スコア: <span id="score">0</span></div>
            <div>ライフ: <span id="lives">3</span></div>
        `;
        
        const gameOver = document.createElement('div');
        gameOver.id = 'gameOver';
        gameOver.style.display = 'none';
        gameOver.innerHTML = '<div>ゲームオーバー</div>';
        
        const startScreen = document.createElement('div');
        startScreen.id = 'startScreen';
        startScreen.innerHTML = '<div>おじさんインベーダー</div>';
        
        container.appendChild(canvas);
        container.appendChild(ui);
        container.appendChild(gameOver);
        container.appendChild(startScreen);
        document.body.appendChild(container);
        
        // ゲームシステムを初期化
        this.gameEngine = new GameEngine(canvas);
        this.soundSystem = new SoundSystem();
        this.inputSystem = new InputSystem(this.gameEngine);
        this.uiSystem = new UISystem(this.gameEngine);
        
        this.gameEngine.init();
    }
    
    // テスト環境をクリーンアップ
    cleanup() {
        const container = document.getElementById('gameContainer');
        if (container) {
            document.body.removeChild(container);
        }
    }
    
    // キーイベントをシミュレート
    simulateKeyEvent(type, keyCode) {
        const event = new KeyboardEvent(type, {
            code: keyCode,
            key: keyCode,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
    
    // 時間を進める（非同期処理をシミュレート）
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// E2Eテスト実行
async function runE2ETests() {
    const suite = new E2ETestSuite();
    
    // ゲーム初期化テスト
    suite.test('ゲーム初期化', async () => {
        suite.setupGame();
        
        if (!suite.gameEngine) {
            throw new Error('ゲームエンジンが初期化されていません');
        }
        
        if (suite.gameEngine.gameState !== 'start') {
            throw new Error('ゲーム状態が正しく初期化されていません');
        }
        
        if (suite.gameEngine.score !== 0) {
            throw new Error('スコアが正しく初期化されていません');
        }
        
        if (suite.gameEngine.lives !== 3) {
            throw new Error('ライフが正しく初期化されていません');
        }
        
        suite.cleanup();
    });
    
    // ゲーム開始テスト
    suite.test('ゲーム開始', async () => {
        suite.setupGame();
        
        // スペースキーでゲーム開始
        suite.simulateKeyEvent('keydown', 'Space');
        await suite.wait(100);
        
        if (suite.gameEngine.gameState !== 'playing') {
            throw new Error('ゲームが開始されていません');
        }
        
        suite.cleanup();
    });
    
    // プレイヤー移動テスト
    suite.test('プレイヤー移動', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        const initialX = suite.gameEngine.gameObjects.player.x;
        
        // 右矢印キーを押す
        suite.simulateKeyEvent('keydown', 'ArrowRight');
        await suite.wait(100);
        
        // プレイヤーが移動しているかチェック
        if (suite.gameEngine.gameObjects.player.x <= initialX) {
            throw new Error('プレイヤーが移動していません');
        }
        
        suite.cleanup();
    });
    
    // 弾丸発射テスト
    suite.test('弾丸発射', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        const initialBulletCount = suite.gameEngine.gameObjects.bullets.length;
        
        // スペースキーで弾丸発射
        suite.simulateKeyEvent('keydown', 'Space');
        await suite.wait(100);
        
        if (suite.gameEngine.gameObjects.bullets.length <= initialBulletCount) {
            throw new Error('弾丸が発射されていません');
        }
        
        suite.cleanup();
    });
    
    // 敵生成テスト
    suite.test('敵生成', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        
        if (suite.gameEngine.gameObjects.enemies.length === 0) {
            throw new Error('敵が生成されていません');
        }
        
        suite.cleanup();
    });
    
    // 衝突検出テスト
    suite.test('衝突検出', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        
        // プレイヤーと敵を同じ位置に配置
        const player = suite.gameEngine.gameObjects.player;
        const enemy = suite.gameEngine.gameObjects.enemies[0];
        
        enemy.x = player.x;
        enemy.y = player.y;
        
        // 衝突検出を実行
        suite.gameEngine.checkCollisions();
        
        // ライフが減っているかチェック
        if (suite.gameEngine.lives >= 3) {
            throw new Error('衝突検出が動作していません');
        }
        
        suite.cleanup();
    });
    
    // スコア更新テスト
    suite.test('スコア更新', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        
        // 弾丸と敵を同じ位置に配置
        const bullet = new Bullet(100, 100);
        const enemy = suite.gameEngine.gameObjects.enemies[0];
        
        bullet.x = enemy.x;
        bullet.y = enemy.y;
        
        suite.gameEngine.gameObjects.bullets.push(bullet);
        
        const initialScore = suite.gameEngine.score;
        
        // 衝突検出を実行
        suite.gameEngine.checkCollisions();
        
        if (suite.gameEngine.score <= initialScore) {
            throw new Error('スコアが更新されていません');
        }
        
        suite.cleanup();
    });
    
    // ゲームオーバーテスト
    suite.test('ゲームオーバー', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        
        // ライフを0にする
        suite.gameEngine.lives = 0;
        
        // 敵が画面外に出るようにする
        const enemy = suite.gameEngine.gameObjects.enemies[0];
        enemy.y = suite.gameEngine.config.canvasHeight + 10;
        
        // 敵の更新を実行
        suite.gameEngine.updateEnemies();
        
        if (suite.gameEngine.gameState !== 'gameOver') {
            throw new Error('ゲームオーバーが発生していません');
        }
        
        suite.cleanup();
    });
    
    // ゲームリスタートテスト
    suite.test('ゲームリスタート', async () => {
        suite.setupGame();
        
        // ゲームを開始してゲームオーバーにする
        suite.gameEngine.start();
        suite.gameEngine.gameOver();
        
        // スペースキーでリスタート
        suite.simulateKeyEvent('keydown', 'Space');
        await suite.wait(100);
        
        if (suite.gameEngine.gameState !== 'playing') {
            throw new Error('ゲームがリスタートされていません');
        }
        
        if (suite.gameEngine.score !== 0) {
            throw new Error('スコアがリセットされていません');
        }
        
        if (suite.gameEngine.lives !== 3) {
            throw new Error('ライフがリセットされていません');
        }
        
        suite.cleanup();
    });
    
    // UI更新テスト
    suite.test('UI更新', async () => {
        suite.setupGame();
        
        // スコアを変更
        suite.gameEngine.score = 500;
        suite.uiSystem.updateUI();
        
        const scoreElement = document.getElementById('score');
        if (scoreElement.textContent !== '500') {
            throw new Error('UIのスコアが更新されていません');
        }
        
        // ライフを変更
        suite.gameEngine.lives = 2;
        suite.uiSystem.updateUI();
        
        const livesElement = document.getElementById('lives');
        if (livesElement.textContent !== '2') {
            throw new Error('UIのライフが更新されていません');
        }
        
        suite.cleanup();
    });
    
    // レベルアップテスト
    suite.test('レベルアップ', async () => {
        suite.setupGame();
        
        // ゲームを開始
        suite.gameEngine.start();
        
        const initialLevel = suite.gameEngine.level;
        const initialSpeed = suite.gameEngine.enemySpeed;
        
        // スコアをレベルアップ条件に設定
        suite.gameEngine.score = 1000;
        suite.gameEngine.checkLevelUp();
        
        if (suite.gameEngine.level <= initialLevel) {
            throw new Error('レベルアップが発生していません');
        }
        
        if (suite.gameEngine.enemySpeed <= initialSpeed) {
            throw new Error('敵の速度が上がっていません');
        }
        
        suite.cleanup();
    });
    
    // 入力システムテスト
    suite.test('入力システム', async () => {
        suite.setupGame();
        
        // キーが押されていない状態をチェック
        if (suite.inputSystem.isKeyPressed('ArrowLeft')) {
            throw new Error('キーが押されていないのに検出されています');
        }
        
        // キーを押す
        suite.simulateKeyEvent('keydown', 'ArrowLeft');
        await suite.wait(50);
        
        if (!suite.inputSystem.isKeyPressed('ArrowLeft')) {
            throw new Error('キーが押されているのに検出されていません');
        }
        
        // キーを離す
        suite.simulateKeyEvent('keyup', 'ArrowLeft');
        await suite.wait(50);
        
        if (suite.inputSystem.isKeyPressed('ArrowLeft')) {
            throw new Error('キーが離されているのに検出されています');
        }
        
        suite.cleanup();
    });
    
    // 実行
    await suite.run();
}

// テストを実行（ブラウザで実行する場合）
if (typeof window !== 'undefined') {
    window.runE2ETests = runE2ETests;
} 