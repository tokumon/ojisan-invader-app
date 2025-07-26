import { GameState } from './GameState.js';

/**
 * MenuState - handles the main menu
 */
export class MenuState extends GameState {
    constructor(stateManager, gameEngine) {
        super('menu');
        this.stateManager = stateManager;
        this.gameEngine = gameEngine;
        this.menuScreen = null;
        this.startButton = null;
    }

    /**
     * Enter menu state
     */
    enter(data = {}) {
        super.enter(data);
        
        // Show menu screen
        this.menuScreen = document.getElementById('menuScreen');
        this.startButton = document.getElementById('startButton');
        
        if (this.menuScreen) {
            this.menuScreen.classList.remove('hidden');
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide other UI elements
        this.hideGameUI();
    }

    /**
     * Exit menu state
     */
    exit() {
        super.exit();
        
        // Hide menu screen
        if (this.menuScreen) {
            this.menuScreen.classList.add('hidden');
        }
        
        // Remove event listeners
        this.removeEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.startButton) {
            this.startButton.addEventListener('click', this.handleStartGame.bind(this));
        }
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.startButton) {
            this.startButton.removeEventListener('click', this.handleStartGame.bind(this));
        }
        
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle start game button click
     */
    handleStartGame() {
        this.startNewGame();
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
                this.startNewGame();
                break;
        }
    }

    /**
     * Start a new game
     */
    startNewGame() {
        this.stateManager.changeState('playing');
    }

    /**
     * Hide game UI elements
     */
    hideGameUI() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }

    /**
     * Update menu state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Menu doesn't need game logic updates
        // Could add animations or effects here
    }

    /**
     * Render menu state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Clear canvas with a dark background
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw background stars or pattern
        this.drawBackground(ctx);
        
        // Draw title if menu screen is hidden or for canvas overlay
        this.drawTitle(ctx);
    }

    /**
     * Draw animated background
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawBackground(ctx) {
        const time = Date.now() * 0.001;
        
        // Draw scrolling stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (i * 67 + time * 20) % ctx.canvas.width;
            const y = (i * 43) % ctx.canvas.height;
            const size = 1 + (i % 3);
            
            ctx.fillRect(x, y, size, size);
        }
    }

    /**
     * Draw title on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawTitle(ctx) {
        // Only draw if menu screen is hidden (fallback)
        if (this.menuScreen && !this.menuScreen.classList.contains('hidden')) {
            return;
        }
        
        ctx.save();
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('オジサンインベーダー', ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);
        
        // Subtitle
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('Ojisan Invader', ctx.canvas.width / 2, ctx.canvas.height / 2 - 60);
        
        // Instructions
        ctx.font = '18px Arial';
        ctx.fillText('Press SPACE or ENTER to start', ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
        
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
     * Cleanup menu state
     */
    cleanup() {
        this.removeEventListeners();
    }
}