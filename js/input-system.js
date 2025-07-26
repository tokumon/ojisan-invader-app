/**
 * 入力システム - キーボード入力を管理
 */
class InputSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keys = {};
        this.lastFireTime = 0;
        this.fireCooldown = 200; // ミリ秒
        
        this.init();
    }
    
    /**
     * 入力システムを初期化
     */
    init() {
        // キーダウンイベント
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyDown(event);
        });
        
        // キーアップイベント
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // ゲームループで継続的な入力を処理
        this.startInputLoop();
    }
    
    /**
     * キーダウンイベントの処理
     */
    handleKeyDown(event) {
        const currentTime = Date.now();
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.handleFire(currentTime);
                break;
                
            case 'Enter':
                event.preventDefault();
                this.handleEnter();
                break;
        }
    }
    
    /**
     * 攻撃処理
     */
    handleFire(currentTime) {
        if (currentTime - this.lastFireTime >= this.fireCooldown) {
            if (this.gameEngine.gameState === 'start') {
                this.gameEngine.start();
            } else if (this.gameEngine.gameState === 'gameOver') {
                this.gameEngine.restart();
            } else if (this.gameEngine.gameState === 'playing') {
                this.gameEngine.fireBullet();
            }
            this.lastFireTime = currentTime;
        }
    }
    
    /**
     * Enterキー処理
     */
    handleEnter() {
        if (this.gameEngine.gameState === 'start') {
            this.gameEngine.start();
        } else if (this.gameEngine.gameState === 'gameOver') {
            this.gameEngine.restart();
        }
    }
    
    /**
     * 継続的な入力処理ループ
     */
    startInputLoop() {
        const inputLoop = () => {
            this.processContinuousInput();
            requestAnimationFrame(inputLoop);
        };
        inputLoop();
    }
    
    /**
     * 継続的な入力を処理
     */
    processContinuousInput() {
        if (this.gameEngine.gameState !== 'playing') return;
        
        // 移動処理
        if (this.keys['ArrowLeft']) {
            this.gameEngine.movePlayer('left');
        }
        
        if (this.keys['ArrowRight']) {
            this.gameEngine.movePlayer('right');
        }
        
        // 上矢印キーでも攻撃可能
        if (this.keys['ArrowUp']) {
            const currentTime = Date.now();
            this.handleFire(currentTime);
        }
    }
    
    /**
     * 特定のキーが押されているかチェック
     */
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    /**
     * すべてのキーをリセット
     */
    resetKeys() {
        this.keys = {};
    }
} 