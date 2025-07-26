import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Projectile } from '../components/Projectile.js';
import { Health } from '../components/Health.js';
import { Player } from '../components/Player.js';

/**
 * CleanupSystem - handles cleanup of entities that should be removed
 */
export class CleanupSystem extends System {
    constructor(world, canvas) {
        super(world);
        this.canvas = canvas;
        this.setRequiredComponents([Position]);
    }

    /**
     * Process entity cleanup
     * @param {Entity} entity - Entity to process
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        
        // Check if entity is off screen and should be cleaned up
        if (this.isOffScreen(position)) {
            this.handleOffScreenEntity(entity);
        }
        
        // Check if entity has health component and is dead
        const health = entity.getComponent(Health);
        if (health && health.isDead()) {
            entity.destroy();
        }
        
        // Handle projectile aging
        const projectile = entity.getComponent(Projectile);
        if (projectile && projectile.updateAge(deltaTime)) {
            entity.destroy();
        }
    }

    /**
     * Check if position is off screen
     * @param {Position} position - Position component
     * @returns {boolean} - True if off screen
     */
    isOffScreen(position) {
        const margin = 100; // Extra margin for cleanup
        
        return position.x < -margin ||
               position.x > this.canvas.width + margin ||
               position.y < -margin ||
               position.y > this.canvas.height + margin;
    }

    /**
     * Handle entity that has moved off screen
     * @param {Entity} entity - Off screen entity
     */
    handleOffScreenEntity(entity) {
        const position = entity.getComponent(Position);
        
        // Only destroy certain types of entities when off screen
        const projectile = entity.getComponent(Projectile);
        
        // Projectiles are destroyed when off screen
        if (projectile) {
            entity.destroy();
            return;
        }
        
        // Let other systems handle their own entities
        // (e.g., enemies that reach bottom trigger game over)
    }

    /**
     * Force cleanup of all entities (for game reset)
     */
    cleanupAll() {
        const allEntities = Array.from(this.world.entities);
        
        for (const entity of allEntities) {
            // Don't destroy the player entity during cleanup
            if (!entity.hasComponent(Player)) {
                entity.destroy();
            }
        }
    }

    /**
     * Cleanup entities of specific type
     * @param {Function} componentClass - Component class to cleanup
     */
    cleanupByType(componentClass) {
        const entities = this.world.getEntitiesWithComponents([componentClass]);
        
        for (const entity of entities) {
            entity.destroy();
        }
    }
}