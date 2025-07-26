/**
 * UIシステム - ゲームのUI要素を管理
 */
class UISystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('gameOver');
        this.startScreenElement = document.getElementById('startScreen');
        
        this.init();
    }
    
    /**
     * UIシステムを初期化
     */
    init() {
        this.updateUI();
    }
    
    /**
     * UIを更新
     */
    updateUI() {
        // スコアの更新
        if (this.scoreElement) {
            this.scoreElement.textContent = this.gameEngine.score;
        }
        
        // ライフの更新
        if (this.livesElement) {
            this.livesElement.textContent = this.gameEngine.lives;
        }
        
        // ゲーム状態に応じたUI表示
        this.updateGameStateUI();
    }
    
    /**
     * ゲーム状態に応じたUI表示を更新
     */
    updateGameStateUI() {
        switch (this.gameEngine.gameState) {
            case 'start':
                this.showStartScreen();
                break;
                
            case 'playing':
                this.hideStartScreen();
                this.hideGameOver();
                break;
                
            case 'gameOver':
                this.showGameOver();
                break;
        }
    }
    
    /**
     * 開始画面を表示
     */
    showStartScreen() {
        if (this.startScreenElement) {
            this.startScreenElement.style.display = 'block';
        }
    }
    
    /**
     * 開始画面を非表示
     */
    hideStartScreen() {
        if (this.startScreenElement) {
            this.startScreenElement.style.display = 'none';
        }
    }
    
    /**
     * ゲームオーバー画面を表示
     */
    showGameOver() {
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'block';
        }
    }
    
    /**
     * ゲームオーバー画面を非表示
     */
    hideGameOver() {
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
    }
    
    /**
     * スコアを更新
     */
    updateScore(score) {
        this.gameEngine.score = score;
        this.updateUI();
    }
    
    /**
     * ライフを更新
     */
    updateLives(lives) {
        this.gameEngine.lives = lives;
        this.updateUI();
    }
    
    /**
     * レベル表示を追加（オプション）
     */
    showLevel() {
        // レベル表示の実装（必要に応じて）
        console.log(`Level: ${this.gameEngine.level}`);
    }
    
    /**
     * 一時的なメッセージを表示
     */
    showMessage(message, duration = 2000) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #0f0;
            font-size: 24px;
            text-align: center;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0, 255, 0, 0.5);
        `;
        
        document.getElementById('gameContainer').appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, duration);
    }
} 