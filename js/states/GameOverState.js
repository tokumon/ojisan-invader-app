import { GameState } from './GameState.js';

/**
 * GameOverState - handles the game over screen
 */
export class GameOverState extends GameState {
    constructor(stateManager, gameEngine) {
        super('gameOver');
        this.stateManager = stateManager;
        this.gameEngine = gameEngine;
        this.gameOverScreen = null;
        this.restartButton = null;
        this.finalScore = 0;
        this.highScore = 0;
    }

    /**
     * Enter game over state
     */
    enter(data = {}) {
        super.enter(data);
        
        this.finalScore = data.score || 0;
        
        // Check and update high score
        this.updateHighScore();
        
        // Show game over screen
        this.showGameOverScreen();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Exit game over state
     */
    exit() {
        super.exit();
        
        // Hide game over screen
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
        }
        
        // Remove event listeners
        this.removeEventListeners();
    }

    /**
     * Update high score
     */
    updateHighScore() {
        // Get high score from localStorage
        this.highScore = parseInt(localStorage.getItem('ojisamInvaderHighScore') || '0');
        
        // Update high score if current score is higher
        if (this.finalScore > this.highScore) {
            this.highScore = this.finalScore;
            localStorage.setItem('ojisamInvaderHighScore', this.highScore.toString());
        }
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.restartButton = document.getElementById('restartButton');
        
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.remove('hidden');
        }
        
        // Update final score display
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            finalScoreElement.textContent = this.finalScore.toString();
        }
        
        // Show high score if there's a designated element
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore.toString();
        }
        
        // Show "NEW HIGH SCORE!" message if applicable
        if (this.finalScore === this.highScore && this.finalScore > 0) {
            this.showNewHighScoreMessage();
        }
    }

    /**
     * Show new high score message
     */
    showNewHighScoreMessage() {
        const gameOverContent = this.gameOverScreen?.querySelector('.overlay-content');
        if (gameOverContent) {
            const newHighScoreMsg = document.createElement('div');
            newHighScoreMsg.className = 'new-high-score';
            newHighScoreMsg.innerHTML = '🎉 NEW HIGH SCORE! 🎉';
            newHighScoreMsg.style.cssText = `
                color: #FFD700;
                font-weight: bold;
                font-size: 24px;
                margin: 10px 0;
                animation: pulse 1s infinite;
            `;
            
            // Insert before restart button
            gameOverContent.insertBefore(newHighScoreMsg, this.restartButton);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.restartButton) {
            this.restartButton.addEventListener('click', this.handleRestartGame.bind(this));
        }
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.restartButton) {
            this.restartButton.removeEventListener('click', this.handleRestartGame.bind(this));
        }
        
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle restart game button click
     */
    handleRestartGame() {
        this.restartGame();
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'Space':
            case 'Enter':
                event.preventDefault();
                this.restartGame();
                break;
            case 'Escape':
                event.preventDefault();
                this.returnToMenu();
                break;
        }
    }

    /**
     * Restart the game
     */
    restartGame() {
        this.stateManager.changeState('playing');
    }

    /**
     * Return to main menu
     */
    returnToMenu() {
        this.stateManager.changeState('menu');
    }

    /**
     * Update game over state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Game over state doesn't need much updating
        // Could add animations or effects here
    }

    /**
     * Render game over state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Clear canvas with dark background
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw background effects
        this.drawBackground(ctx);
        
        // Draw game over text on canvas (fallback if HTML overlay fails)
        this.drawGameOverText(ctx);
    }

    /**
     * Draw animated background
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawBackground(ctx) {
        const time = Date.now() * 0.001;
        
        // Draw fading stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 30; i++) {
            const x = (i * 89 + time * 10) % ctx.canvas.width;
            const y = (i * 67 + time * 5) % ctx.canvas.height;
            const size = 1 + (i % 2);
            const alpha = 0.1 + 0.2 * Math.sin(time + i);
            
            ctx.globalAlpha = alpha;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1.0;
        
        // Draw scrolling grid effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        const offsetX = (time * 20) % gridSize;
        const offsetY = (time * 15) % gridSize;
        
        for (let x = -gridSize + offsetX; x < ctx.canvas.width + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
        }
        
        for (let y = -gridSize + offsetY; y < ctx.canvas.height + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw game over text on canvas (fallback)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawGameOverText(ctx) {
        // Only draw if HTML overlay is hidden
        if (this.gameOverScreen && !this.gameOverScreen.classList.contains('hidden')) {
            return;
        }
        
        ctx.save();
        
        // Game Over title
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);
        
        // Final score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${this.finalScore}`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
        
        // High score
        if (this.highScore > 0) {
            ctx.font = '24px Arial';
            ctx.fillText(`High Score: ${this.highScore}`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
        
        // New high score message
        if (this.finalScore === this.highScore && this.finalScore > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('NEW HIGH SCORE!', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
        }
        
        // Instructions
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE or ENTER to play again', ctx.canvas.width / 2, ctx.canvas.height / 2 + 120);
        ctx.fillText('Press ESC to return to menu', ctx.canvas.width / 2, ctx.canvas.height / 2 + 150);
        
        ctx.restore();
    }

    /**
     * Handle input events
     * @param {string} eventType - Event type
     * @param {Event} event - Event object
     */
    handleInput(eventType, event) {
        if (eventType === 'keydown') {
            this.handleKeyDown(event);
        }
    }

    /**
     * Cleanup game over state
     */
    cleanup() {
        this.removeEventListeners();
        
        // Remove any dynamically created elements
        const newHighScoreMsg = document.querySelector('.new-high-score');
        if (newHighScoreMsg) {
            newHighScoreMsg.remove();
        }
    }
}