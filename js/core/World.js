import { Entity } from './Entity.js';

/**
 * World class - manages all entities and systems
 * Central hub for the ECS architecture
 */
export class World {
    constructor() {
        this.entities = new Set();
        this.systems = new Map();
        this.entitiesToRemove = new Set();
    }

    /**
     * Create a new entity and add it to the world
     * @returns {Entity} - The created entity
     */
    createEntity() {
        const entity = new Entity();
        this.entities.add(entity);
        return entity;
    }

    /**
     * Add an existing entity to the world
     * @param {Entity} entity - The entity to add
     */
    addEntity(entity) {
        this.entities.add(entity);
    }

    /**
     * Remove an entity from the world
     * @param {Entity} entity - The entity to remove
     */
    removeEntity(entity) {
        this.entitiesToRemove.add(entity);
    }

    /**
     * Add a system to the world
     * @param {string} name - Name of the system
     * @param {System} system - The system instance
     */
    addSystem(name, system) {
        this.systems.set(name, system);
        system.init();
    }

    /**
     * Get a system by name
     * @param {string} name - Name of the system
     * @returns {System|undefined} - The system instance
     */
    getSystem(name) {
        return this.systems.get(name);
    }

    /**
     * Remove a system from the world
     * @param {string} name - Name of the system to remove
     */
    removeSystem(name) {
        const system = this.systems.get(name);
        if (system) {
            system.destroy();
            this.systems.delete(name);
        }
    }

    /**
     * Update all systems
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Update all systems
        for (const [name, system] of this.systems) {
            system.update(deltaTime);
        }

        // Clean up entities marked for removal
        this.cleanupEntities();
    }

    /**
     * Remove entities that have been marked for deletion
     */
    cleanupEntities() {
        // Remove inactive entities
        for (const entity of this.entities) {
            if (!entity.active) {
                this.entitiesToRemove.add(entity);
            }
        }

        // Actually remove the entities
        for (const entity of this.entitiesToRemove) {
            this.entities.delete(entity);
        }
        this.entitiesToRemove.clear();
    }

    /**
     * Get all entities with specific components
     * @param {Function[]} componentClasses - Array of component classes
     * @returns {Entity[]} - Array of matching entities
     */
    getEntitiesWithComponents(componentClasses) {
        const result = [];
        for (const entity of this.entities) {
            if (entity.active && entity.hasComponents(componentClasses)) {
                result.push(entity);
            }
        }
        return result;
    }

    /**
     * Get the first entity with specific components
     * @param {Function[]} componentClasses - Array of component classes
     * @returns {Entity|null} - The first matching entity or null
     */
    getEntityWithComponents(componentClasses) {
        for (const entity of this.entities) {
            if (entity.active && entity.hasComponents(componentClasses)) {
                return entity;
            }
        }
        return null;
    }

    /**
     * Clear all entities and systems
     */
    clear() {
        // Destroy all systems
        for (const [name, system] of this.systems) {
            system.destroy();
        }
        
        this.entities.clear();
        this.systems.clear();
        this.entitiesToRemove.clear();
    }

    /**
     * Get entity count for debugging
     * @returns {number} - Number of active entities
     */
    getEntityCount() {
        return this.entities.size;
    }

    /**
     * Get system count for debugging
     * @returns {number} - Number of active systems
     */
    getSystemCount() {
        return this.systems.size;
    }
}