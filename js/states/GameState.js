/**
 * Base GameState class - abstract base for all game states
 */
export class GameState {
    constructor(name) {
        this.name = name;
        this.isActive = false;
    }

    /**
     * Called when entering this state
     * @param {Object} data - Optional data passed to the state
     */
    enter(data = {}) {
        this.isActive = true;
        console.log(`Entering state: ${this.name}`);
    }

    /**
     * Called when exiting this state
     */
    exit() {
        this.isActive = false;
        console.log(`Exiting state: ${this.name}`);
    }

    /**
     * Update the state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Override in subclasses
    }

    /**
     * Render the state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Override in subclasses
    }

    /**
     * Handle input events
     * @param {string} eventType - Event type ('keydown', 'keyup', etc.)
     * @param {Event} event - Event object
     */
    handleInput(eventType, event) {
        // Override in subclasses
    }

    /**
     * Handle state-specific cleanup
     */
    cleanup() {
        // Override in subclasses
    }
}