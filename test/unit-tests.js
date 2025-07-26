/**
 * ユニットテスト - ゲームコンポーネントのテスト
 */

// テスト用のモックCanvas
class MockCanvas {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        this.getContext = () => ({
            fillRect: () => {},
            fillStyle: '',
            strokeRect: () => {},
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            fillText: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            globalAlpha: 1
        });
    }
}

// テストスイート
class TestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    run() {
        console.log('🧪 ユニットテストを開始...\n');
        
        this.tests.forEach(({ name, testFunction }) => {
            try {
                testFunction();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        });
        
        console.log(`\n📊 テスト結果: ${this.passed}個成功, ${this.failed}個失敗`);
    }
}

// テスト実行
function runUnitTests() {
    const suite = new TestSuite();
    
    // Player クラスのテスト
    suite.test('Player - 初期化', () => {
        const player = new Player(100, 200);
        if (player.x !== 100 || player.y !== 200) {
            throw new Error('Player初期化エラー');
        }
    });
    
    suite.test('Player - 移動（左）', () => {
        const player = new Player(100, 200);
        const initialX = player.x;
        player.move('left', 800);
        if (player.x >= initialX) {
            throw new Error('Player左移動エラー');
        }
    });
    
    suite.test('Player - 移動（右）', () => {
        const player = new Player(100, 200);
        const initialX = player.x;
        player.move('right', 800);
        if (player.x <= initialX) {
            throw new Error('Player右移動エラー');
        }
    });
    
    suite.test('Player - 境界チェック（左）', () => {
        const player = new Player(0, 200);
        player.move('left', 800);
        if (player.x < 0) {
            throw new Error('Player左境界チェックエラー');
        }
    });
    
    suite.test('Player - 境界チェック（右）', () => {
        const player = new Player(760, 200); // 800 - 40 = 760
        player.move('right', 800);
        if (player.x > 760) {
            throw new Error('Player右境界チェックエラー');
        }
    });
    
    // Bullet クラスのテスト
    suite.test('Bullet - 初期化', () => {
        const bullet = new Bullet(100, 200);
        if (bullet.x !== 98 || bullet.y !== 200) { // x - 2
            throw new Error('Bullet初期化エラー');
        }
    });
    
    suite.test('Bullet - 移動', () => {
        const bullet = new Bullet(100, 200);
        const initialY = bullet.y;
        bullet.update(16); // 16ms
        if (bullet.y >= initialY) {
            throw new Error('Bullet移動エラー');
        }
    });
    
    // Enemy クラスのテスト
    suite.test('Enemy - 初期化', () => {
        const enemy = new Enemy(100, 200, 1);
        if (enemy.x !== 100 || enemy.y !== 200 || enemy.speed !== 1) {
            throw new Error('Enemy初期化エラー');
        }
    });
    
    suite.test('Enemy - 移動', () => {
        const enemy = new Enemy(100, 200, 1);
        const initialY = enemy.y;
        enemy.update(16);
        if (enemy.y <= initialY) {
            throw new Error('Enemy移動エラー');
        }
    });
    
    // Money クラスのテスト
    suite.test('Money - 初期化', () => {
        const money = new Money(100, 200);
        if (money.x !== 100 || money.y !== 200) {
            throw new Error('Money初期化エラー');
        }
    });
    
    suite.test('Money - 移動と回転', () => {
        const money = new Money(100, 200);
        const initialY = money.y;
        const initialRotation = money.rotation;
        money.update(16);
        if (money.y <= initialY || money.rotation <= initialRotation) {
            throw new Error('Money移動・回転エラー');
        }
    });
    
    // Explosion クラスのテスト
    suite.test('Explosion - 初期化', () => {
        const explosion = new Explosion(100, 200);
        if (explosion.particles.length !== 20) {
            throw new Error('Explosion初期化エラー');
        }
    });
    
    suite.test('Explosion - パーティクル更新', () => {
        const explosion = new Explosion(100, 200);
        const initialParticle = explosion.particles[0];
        explosion.update(16);
        if (initialParticle.life >= 1.0) {
            throw new Error('Explosionパーティクル更新エラー');
        }
    });
    
    suite.test('Explosion - 終了判定', () => {
        const explosion = new Explosion(100, 200);
        explosion.elapsed = 1001; // 1秒以上経過
        if (!explosion.isFinished()) {
            throw new Error('Explosion終了判定エラー');
        }
    });
    
    // GameEngine クラスのテスト
    suite.test('GameEngine - 初期化', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        if (engine.gameState !== 'start' || engine.score !== 0 || engine.lives !== 3) {
            throw new Error('GameEngine初期化エラー');
        }
    });
    
    suite.test('GameEngine - 衝突判定', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        const obj1 = { x: 0, y: 0, width: 10, height: 10 };
        const obj2 = { x: 5, y: 5, width: 10, height: 10 };
        const obj3 = { x: 20, y: 20, width: 10, height: 10 };
        
        if (!engine.isColliding(obj1, obj2)) {
            throw new Error('衝突判定エラー（衝突すべき）');
        }
        
        if (engine.isColliding(obj1, obj3)) {
            throw new Error('衝突判定エラー（衝突すべきでない）');
        }
    });
    
    suite.test('GameEngine - スコア更新', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const initialScore = engine.score;
        engine.score += 100;
        if (engine.score !== initialScore + 100) {
            throw new Error('スコア更新エラー');
        }
    });
    
    suite.test('GameEngine - ライフ更新', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const initialLives = engine.lives;
        engine.lives--;
        if (engine.lives !== initialLives - 1) {
            throw new Error('ライフ更新エラー');
        }
    });
    
    suite.test('GameEngine - レベルアップ', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const initialLevel = engine.level;
        engine.score = 1000; // レベルアップ条件
        engine.checkLevelUp();
        if (engine.level <= initialLevel) {
            throw new Error('レベルアップエラー');
        }
    });
    
    // InputSystem クラスのテスト
    suite.test('InputSystem - キー状態管理', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const input = new InputSystem(engine);
        
        if (input.isKeyPressed('ArrowLeft')) {
            throw new Error('キー状態管理エラー（初期状態）');
        }
        
        input.keys['ArrowLeft'] = true;
        if (!input.isKeyPressed('ArrowLeft')) {
            throw new Error('キー状態管理エラー（設定後）');
        }
    });
    
    // UISystem クラスのテスト
    suite.test('UISystem - スコア更新', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const ui = new UISystem(engine);
        
        const testScore = 500;
        ui.updateScore(testScore);
        if (engine.score !== testScore) {
            throw new Error('UIスコア更新エラー');
        }
    });
    
    suite.test('UISystem - ライフ更新', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const ui = new UISystem(engine);
        
        const testLives = 2;
        ui.updateLives(testLives);
        if (engine.lives !== testLives) {
            throw new Error('UIライフ更新エラー');
        }
    });
    
    // SoundSystem クラスのテスト
    suite.test('SoundSystem - 初期化', () => {
        const sound = new SoundSystem();
        if (sound.masterVolume !== 0.3) {
            throw new Error('SoundSystem初期化エラー');
        }
    });
    
    suite.test('SoundSystem - ボリューム設定', () => {
        const sound = new SoundSystem();
        const testVolume = 0.5;
        sound.setVolume(testVolume);
        if (sound.masterVolume !== testVolume) {
            throw new Error('SoundSystemボリューム設定エラー');
        }
    });
    
    suite.test('SoundSystem - 有効/無効切り替え', () => {
        const sound = new SoundSystem();
        sound.setEnabled(false);
        if (sound.enabled !== false) {
            throw new Error('SoundSystem有効/無効切り替えエラー');
        }
    });
    
    // 実行
    suite.run();
}

// テストを実行（ブラウザで実行する場合）
if (typeof window !== 'undefined') {
    window.runUnitTests = runUnitTests;
} 