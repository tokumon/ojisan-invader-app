import { World } from './core/World.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { EnemySpawnSystem } from './systems/EnemySpawnSystem.js';
import { ObstacleSpawnSystem } from './systems/ObstacleSpawnSystem.js';
import { CleanupSystem } from './systems/CleanupSystem.js';
import { StateManager } from './states/StateManager.js';
import { MenuState } from './states/MenuState.js';
import { PlayingState } from './states/PlayingState.js';
import { GameOverState } from './states/GameOverState.js';
import { AssetManager } from './utils/AssetManager.js';

/**
 * GameEngine - main game engine with fixed timestep loop
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Core systems
        this.world = new World();
        this.stateManager = new StateManager();
        this.assetManager = new AssetManager();
        
        // Timing
        this.targetFPS = 60;
        this.targetFrameTime = 1000 / this.targetFPS; // milliseconds
        this.lastTime = 0;
        this.accumulator = 0;
        this.maxFrameTime = 250; // Cap delta time to prevent spiral of death
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        
        // Debug info
        this.debug = {
            showFPS: false,
            frameCount: 0,
            fpsTimer: 0,
            currentFPS: 0
        };
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('Initializing Game Engine...');
        
        // Initialize assets with placeholders for immediate gameplay
        this.assetManager.initializePlaceholders();
        
        // Initialize ECS systems
        this.initializeSystems();
        
        // Initialize game states
        this.initializeStates();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start with menu state
        this.stateManager.changeState('menu');
        
        console.log('Game Engine initialized successfully');
    }

    /**
     * Initialize all game systems
     */
    initializeSystems() {
        // Add systems in order of execution
        this.world.addSystem('input', new InputSystem(this.world, this.canvas));
        this.world.addSystem('movement', new MovementSystem(this.world));
        this.world.addSystem('enemySpawn', new EnemySpawnSystem(this.world, this.canvas));
        this.world.addSystem('obstacleSpawn', new ObstacleSpawnSystem(this.world, this.canvas));
        this.world.addSystem('collision', new CollisionSystem(this.world));
        this.world.addSystem('cleanup', new CleanupSystem(this.world, this.canvas));
        this.world.addSystem('render', new RenderSystem(this.world, this.canvas));
        
        console.log(`Initialized ${this.world.getSystemCount()} systems`);
    }

    /**
     * Initialize game states
     */
    initializeStates() {
        this.stateManager.addState('menu', new MenuState(this.stateManager, this));
        this.stateManager.addState('playing', new PlayingState(this.stateManager, this));
        this.stateManager.addState('gameOver', new GameOverState(this.stateManager, this));
        
        console.log('Initialized game states');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle window visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Handle window focus/blur
        window.addEventListener('blur', () => this.pause());
        window.addEventListener('focus', () => this.resume());
        
        // Debug controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F12' || (e.ctrlKey && e.shiftKey && e.code === 'KeyI')) {
                // Allow dev tools
                return;
            }
            
            if (e.code === 'F1') {
                e.preventDefault();
                this.debug.showFPS = !this.debug.showFPS;
            }
        });
    }

    /**
     * Start the game engine
     */
    start() {
        if (this.isRunning) {
            console.warn('Game engine is already running');
            return;
        }
        
        console.log('Starting game engine...');
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * Stop the game engine
     */
    stop() {
        console.log('Stopping game engine...');
        this.isRunning = false;
    }

    /**
     * Pause the game engine
     */
    pause() {
        if (!this.isPaused) {
            console.log('Pausing game engine...');
            this.isPaused = true;
        }
    }

    /**
     * Resume the game engine
     */
    resume() {
        if (this.isPaused) {
            console.log('Resuming game engine...');
            this.isPaused = false;
            this.lastTime = performance.now(); // Reset timing to prevent large delta
        }
    }

    /**
     * Main game loop with fixed timestep
     */
    gameLoop() {
        if (!this.isRunning) {
            return;
        }
        
        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        if (deltaTime > this.maxFrameTime) {
            deltaTime = this.maxFrameTime;
        }
        
        // Fixed timestep update
        if (!this.isPaused) {
            this.accumulator += deltaTime;
            
            const fixedDeltaTime = this.targetFrameTime / 1000; // Convert to seconds
            
            while (this.accumulator >= this.targetFrameTime) {
                this.update(fixedDeltaTime);
                this.accumulator -= this.targetFrameTime;
            }
        }
        
        // Render always happens (even when paused)
        this.render();
        
        // Update debug info
        this.updateDebugInfo(deltaTime);
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game logic
     * @param {number} deltaTime - Fixed delta time in seconds
     */
    update(deltaTime) {
        // Update state manager (handles state transitions and current state updates)
        this.stateManager.update(deltaTime);
        
        // Update world systems only during playing state
        if (this.stateManager.isStateActive('playing')) {
            this.world.update(deltaTime);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render current state
        this.stateManager.render(this.ctx);
        
        // Render debug info
        if (this.debug.showFPS) {
            this.renderDebugInfo();
        }
    }

    /**
     * Update debug information
     * @param {number} deltaTime - Delta time in milliseconds
     */
    updateDebugInfo(deltaTime) {
        this.debug.frameCount++;
        this.debug.fpsTimer += deltaTime;
        
        if (this.debug.fpsTimer >= 1000) { // Update FPS every second
            this.debug.currentFPS = Math.round(this.debug.frameCount * 1000 / this.debug.fpsTimer);
            this.debug.frameCount = 0;
            this.debug.fpsTimer = 0;
        }
    }

    /**
     * Render debug information
     */
    renderDebugInfo() {
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 100);
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'left';
        
        let y = 30;
        this.ctx.fillText(`FPS: ${this.debug.currentFPS}`, 20, y);
        y += 20;
        this.ctx.fillText(`Entities: ${this.world.getEntityCount()}`, 20, y);
        y += 20;
        this.ctx.fillText(`State: ${this.stateManager.getCurrentStateName()}`, 20, y);
        y += 20;
        this.ctx.fillText(`Systems: ${this.world.getSystemCount()}`, 20, y);
        
        this.ctx.restore();
    }

    /**
     * Handle input events
     * @param {string} eventType - Event type
     * @param {Event} event - Event object
     */
    handleInput(eventType, event) {
        this.stateManager.handleInput(eventType, event);
    }

    /**
     * Resize the canvas
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Maintain pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        console.log(`Canvas resized to ${width}x${height}`);
    }

    /**
     * Get current game state
     * @returns {string|null} - Current state name
     */
    getCurrentState() {
        return this.stateManager.getCurrentStateName();
    }

    /**
     * Get game statistics
     * @returns {Object} - Game statistics
     */
    getStats() {
        return {
            fps: this.debug.currentFPS,
            entities: this.world.getEntityCount(),
            systems: this.world.getSystemCount(),
            state: this.stateManager.getCurrentStateName(),
            running: this.isRunning,
            paused: this.isPaused
        };
    }

    /**
     * Cleanup and destroy the game engine
     */
    destroy() {
        console.log('Destroying game engine...');
        
        this.stop();
        
        // Cleanup systems and world
        this.world.clear();
        
        // Cleanup state manager
        this.stateManager.cleanup();
        
        // Clear assets
        this.assetManager.clear();
        
        console.log('Game engine destroyed');
    }
}