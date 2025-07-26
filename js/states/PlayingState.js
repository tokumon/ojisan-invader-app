import { GameState } from './GameState.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Player } from '../components/Player.js';
import { Sprite } from '../components/Sprite.js';
import { Collision } from '../components/Collision.js';
import { Health } from '../components/Health.js';

/**
 * PlayingState - handles the main gameplay
 */
export class PlayingState extends GameState {
    constructor(stateManager, gameEngine) {
        super('playing');
        this.stateManager = stateManager;
        this.gameEngine = gameEngine;
        this.world = gameEngine.world;
        this.playerEntity = null;
        this.gameTime = 0;
        this.isPaused = false;
    }

    /**
     * Enter playing state
     */
    enter(data = {}) {
        super.enter(data);
        
        // Initialize game world
        this.initializeGame();
        
        // Show game UI
        this.showGameUI();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Exit playing state
     */
    exit() {
        super.exit();
        
        // Cleanup game world
        this.cleanupGame();
        
        // Remove event listeners
        this.removeEventListeners();
    }

    /**
     * Initialize the game
     */
    initializeGame() {
        // Create player entity
        this.createPlayer();
        
        // Reset game systems
        this.resetGameSystems();
        
        // Reset game time
        this.gameTime = 0;
        this.isPaused = false;
    }

    /**
     * Create the player entity
     */
    createPlayer() {
        this.playerEntity = this.world.createEntity();
        
        // Add player position (centered at bottom of screen)
        const canvas = this.gameEngine.canvas;
        const startX = canvas.width / 2;
        const startY = canvas.height - 50;
        this.playerEntity.addComponent(new Position(startX, startY));
        
        // Add velocity component
        this.playerEntity.addComponent(new Velocity(0, 0));
        
        // Add player component
        const playerComp = new Player();
        playerComp.resetStats(); // Start with fresh stats
        this.playerEntity.addComponent(playerComp);
        
        // Add health component
        this.playerEntity.addComponent(new Health(1));
        
        // Add sprite component
        const sprite = new Sprite({
            width: 40,
            height: 40,
            color: '#4169E1',
            shape: 'ojisan'
        });
        this.playerEntity.addComponent(sprite);
        
        // Add collision component
        const collision = new Collision({
            width: 36,
            height: 36,
            layer: 'player',
            mask: ['enemy', 'obstacle']
        });
        this.playerEntity.addComponent(collision);
    }

    /**
     * Reset game systems to initial state
     */
    resetGameSystems() {
        // Reset spawn systems
        const enemySpawnSystem = this.world.getSystem('enemySpawn');
        if (enemySpawnSystem) {
            enemySpawnSystem.reset();
        }
        
        const obstacleSpawnSystem = this.world.getSystem('obstacleSpawn');
        if (obstacleSpawnSystem) {
            obstacleSpawnSystem.reset();
        }
        
        // Clear existing entities except player
        const entities = Array.from(this.world.entities);
        for (const entity of entities) {
            if (entity !== this.playerEntity) {
                entity.destroy();
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'Escape':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyP':
                event.preventDefault();
                this.togglePause();
                break;
        }
    }

    /**
     * Toggle game pause
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            console.log('Game paused');
        } else {
            console.log('Game resumed');
        }
    }

    /**
     * Show game UI elements
     */
    showGameUI() {
        // Hide menu and game over screens
        const menuScreen = document.getElementById('menuScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (menuScreen) {
            menuScreen.classList.add('hidden');
        }
        
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }

    /**
     * Update playing state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        if (this.isPaused) {
            return; // Don't update game logic when paused
        }
        
        this.gameTime += deltaTime;
        
        // Update UI
        this.updateUI();
        
        // Check game over conditions
        this.checkGameOverConditions();
        
        // Increase difficulty over time
        this.updateDifficulty();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (!this.playerEntity || !this.playerEntity.active) return;
        
        const player = this.playerEntity.getComponent(Player);
        if (!player) return;
        
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = player.score.toString();
        }
        
        // Update lives display
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = player.lives.toString();
        }
    }

    /**
     * Check for game over conditions
     */
    checkGameOverConditions() {
        if (!this.playerEntity || !this.playerEntity.active) {
            this.triggerGameOver();
            return;
        }
        
        const player = this.playerEntity.getComponent(Player);
        if (!player || !player.isAlive()) {
            this.triggerGameOver();
        }
    }

    /**
     * Trigger game over
     */
    triggerGameOver() {
        let finalScore = 0;
        
        if (this.playerEntity && this.playerEntity.active) {
            const player = this.playerEntity.getComponent(Player);
            if (player) {
                finalScore = player.score;
            }
        }
        
        this.stateManager.changeState('gameOver', { score: finalScore });
    }

    /**
     * Update difficulty based on game time and score
     */
    updateDifficulty() {
        const difficultyInterval = 30; // Increase difficulty every 30 seconds
        const difficultyLevel = Math.floor(this.gameTime / difficultyInterval);
        
        if (difficultyLevel > 0 && this.gameTime % difficultyInterval < 0.1) {
            // Increase spawn system difficulty
            const enemySpawnSystem = this.world.getSystem('enemySpawn');
            if (enemySpawnSystem) {
                enemySpawnSystem.increaseDifficulty();
            }
            
            const obstacleSpawnSystem = this.world.getSystem('obstacleSpawn');
            if (obstacleSpawnSystem) {
                obstacleSpawnSystem.increaseDifficulty();
            }
        }
    }

    /**
     * Render playing state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#000022';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw background elements
        this.drawBackground(ctx);
        
        // Game entities are rendered by the RenderSystem
        
        // Draw pause overlay if paused
        if (this.isPaused) {
            this.drawPauseOverlay(ctx);
        }
    }

    /**
     * Draw background elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawBackground(ctx) {
        const time = this.gameTime;
        
        // Draw scrolling stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 100; i++) {
            const x = (i * 67 + time * 30) % ctx.canvas.width;
            const y = (i * 43 + time * 20) % ctx.canvas.height;
            const size = 1 + (i % 2);
            
            ctx.globalAlpha = 0.3 + (i % 3) * 0.2;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1.0;
    }

    /**
     * Draw pause overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawPauseOverlay(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Pause text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
        
        // Instructions
        ctx.font = '24px Arial';
        ctx.fillText('Press ESC or P to resume', ctx.canvas.width / 2, ctx.canvas.height / 2 + 60);
    }

    /**
     * Cleanup playing state
     */
    cleanupGame() {
        // Clear all entities
        if (this.world) {
            this.world.clear();
        }
        
        this.playerEntity = null;
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
     * Cleanup
     */
    cleanup() {
        this.removeEventListeners();
        this.cleanupGame();
    }
}