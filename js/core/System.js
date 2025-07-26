/**
 * Base System class - contains game logic and operates on entities with specific components
 * Systems process entities that have the required components
 */
export class System {
    constructor(world) {
        this.world = world;
        this.requiredComponents = [];
        this.entities = new Set();
        this.enabled = true;
    }

    /**
     * Update the system - called every frame
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update the list of entities that match our requirements
        this.updateEntityList();
        
        // Process each matching entity
        for (const entity of this.entities) {
            if (entity.active) {
                this.processEntity(entity, deltaTime);
            }
        }
    }

    /**
     * Process a single entity - override in subclasses
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        // Override in subclasses
    }

    /**
     * Update the list of entities that have all required components
     */
    updateEntityList() {
        this.entities.clear();
        
        for (const entity of this.world.entities) {
            if (entity.active && this.matchesRequirements(entity)) {
                this.entities.add(entity);
            }
        }
    }

    /**
     * Check if an entity has all required components
     * @param {Entity} entity - The entity to check
     * @returns {boolean} - True if entity matches requirements
     */
    matchesRequirements(entity) {
        return entity.hasComponents(this.requiredComponents);
    }

    /**
     * Set the required components for this system
     * @param {Function[]} components - Array of component classes
     */
    setRequiredComponents(components) {
        this.requiredComponents = components;
    }

    /**
     * Enable or disable this system
     * @param {boolean} enabled - Whether the system should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Called when the system is initialized
     */
    init() {
        // Override in subclasses if needed
    }

    /**
     * Called when the system is destroyed
     */
    destroy() {
        this.entities.clear();
    }
}