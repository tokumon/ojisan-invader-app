/**
 * StateManager - manages game state transitions
 */
export class StateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.nextState = null;
        this.stateData = null;
    }

    /**
     * Add a state to the manager
     * @param {string} name - State name
     * @param {GameState} state - State instance
     */
    addState(name, state) {
        this.states.set(name, state);
    }

    /**
     * Remove a state from the manager
     * @param {string} name - State name
     */
    removeState(name) {
        const state = this.states.get(name);
        if (state && state === this.currentState) {
            this.currentState = null;
        }
        this.states.delete(name);
    }

    /**
     * Change to a different state
     * @param {string} stateName - Name of the state to change to
     * @param {Object} data - Optional data to pass to the new state
     */
    changeState(stateName, data = {}) {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.error(`State '${stateName}' not found`);
            return;
        }

        this.nextState = newState;
        this.stateData = data;
    }

    /**
     * Update the current state and handle state transitions
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Handle state transition
        if (this.nextState) {
            this.performStateTransition();
        }

        // Update current state
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }

    /**
     * Render the current state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (this.currentState) {
            this.currentState.render(ctx);
        }
    }

    /**
     * Handle input for the current state
     * @param {string} eventType - Event type ('keydown', 'keyup', etc.)
     * @param {Event} event - Event object
     */
    handleInput(eventType, event) {
        if (this.currentState) {
            this.currentState.handleInput(eventType, event);
        }
    }

    /**
     * Perform the actual state transition
     */
    performStateTransition() {
        // Exit current state
        if (this.currentState) {
            this.currentState.exit();
        }

        // Switch to new state
        this.currentState = this.nextState;
        this.nextState = null;

        // Enter new state
        if (this.currentState) {
            this.currentState.enter(this.stateData || {});
        }

        this.stateData = null;
    }

    /**
     * Get the current state name
     * @returns {string|null} - Current state name or null
     */
    getCurrentStateName() {
        return this.currentState ? this.currentState.name : null;
    }

    /**
     * Check if a specific state is active
     * @param {string} stateName - State name to check
     * @returns {boolean} - True if the state is active
     */
    isStateActive(stateName) {
        return this.currentState && this.currentState.name === stateName;
    }

    /**
     * Get a state by name
     * @param {string} name - State name
     * @returns {GameState|undefined} - State instance or undefined
     */
    getState(name) {
        return this.states.get(name);
    }

    /**
     * Check if a state exists
     * @param {string} name - State name
     * @returns {boolean} - True if state exists
     */
    hasState(name) {
        return this.states.has(name);
    }

    /**
     * Get all state names
     * @returns {string[]} - Array of state names
     */
    getStateNames() {
        return Array.from(this.states.keys());
    }

    /**
     * Cleanup all states
     */
    cleanup() {
        // Exit current state
        if (this.currentState) {
            this.currentState.exit();
            this.currentState = null;
        }

        // Cleanup all states
        for (const [name, state] of this.states) {
            if (state.cleanup) {
                state.cleanup();
            }
        }

        this.states.clear();
        this.nextState = null;
        this.stateData = null;
    }

    /**
     * Pause the current state (if supported)
     */
    pause() {
        if (this.currentState && typeof this.currentState.pause === 'function') {
            this.currentState.pause();
        }
    }

    /**
     * Resume the current state (if supported)
     */
    resume() {
        if (this.currentState && typeof this.currentState.resume === 'function') {
            this.currentState.resume();
        }
    }
}