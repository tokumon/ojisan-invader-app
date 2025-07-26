import { GameEngine } from './GameEngine.js';

/**
 * Main entry point for the Ojisan Invader game
 */
class OjisamInvader {
    constructor() {
        this.gameEngine = null;
        this.canvas = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            console.log('Starting Ojisan Invader...');
            
            // Get canvas element
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Initialize canvas
            this.initializeCanvas();
            
            // Create and initialize game engine
            this.gameEngine = new GameEngine(this.canvas);
            await this.gameEngine.init();
            
            // Setup window resize handling
            this.setupResizeHandling();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            this.isInitialized = true;
            console.log('Ojisan Invader initialized successfully');
            
            // Start the game
            this.start();
            
        } catch (error) {
            console.error('Failed to initialize Ojisan Invader:', error);
            this.showErrorMessage(error.message);
        }
    }

    /**
     * Initialize canvas properties
     */
    initializeCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Get context and set initial properties
        const ctx = this.canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
        
        // Add canvas focus handling
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        
        console.log(`Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Setup window resize handling
     */
    setupResizeHandling() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Initial resize
        this.handleResize();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.canvas || !this.gameEngine) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // Calculate new size while maintaining aspect ratio
        const containerRect = container.getBoundingClientRect();
        const aspectRatio = 800 / 600; // Original canvas aspect ratio
        
        let newWidth = containerRect.width - 40; // Account for padding
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > containerRect.height - 100) { // Account for header and controls
            newHeight = containerRect.height - 100;
            newWidth = newHeight * aspectRatio;
        }
        
        // Set minimum size
        newWidth = Math.max(400, newWidth);
        newHeight = Math.max(300, newHeight);
        
        // Apply size
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
        
        // Keep internal resolution fixed for pixel-perfect graphics
        // this.canvas.width = 800;
        // this.canvas.height = 600;
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Don't show error to user for uncaught errors during gameplay
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    /**
     * Start the game
     */
    start() {
        if (!this.isInitialized || !this.gameEngine) {
            console.error('Cannot start game: not initialized');
            return;
        }
        
        this.gameEngine.start();
        console.log('Game started');
    }

    /**
     * Stop the game
     */
    stop() {
        if (this.gameEngine) {
            this.gameEngine.stop();
            console.log('Game stopped');
        }
    }

    /**
     * Restart the game
     */
    restart() {
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        setTimeout(() => {
            this.init();
        }, 100);
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}<br>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Reload Page</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.parentElement.removeChild(errorDiv);
            }
        }, 10000);
    }

    /**
     * Get game statistics for debugging
     * @returns {Object} - Game statistics
     */
    getStats() {
        return this.gameEngine ? this.gameEngine.getStats() : null;
    }
}

/**
 * Initialize and start the game when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Create global game instance
    window.ojisamInvader = new OjisamInvader();
    
    // Initialize the game
    await window.ojisamInvader.init();
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (window.ojisamInvader && window.ojisamInvader.gameEngine) {
        if (document.hidden) {
            window.ojisamInvader.gameEngine.pause();
        } else {
            window.ojisamInvader.gameEngine.resume();
        }
    }
});

/**
 * Expose debug functions to global scope
 */
if (typeof window !== 'undefined') {
    window.debugGame = {
        getStats: () => window.ojisamInvader?.getStats(),
        restart: () => window.ojisamInvader?.restart(),
        stop: () => window.ojisamInvader?.stop(),
        start: () => window.ojisamInvader?.start()
    };
}

export { OjisamInvader };