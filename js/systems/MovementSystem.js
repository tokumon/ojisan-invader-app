import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';

/**
 * MovementSystem - handles entity movement based on velocity
 */
export class MovementSystem extends System {
    constructor(world) {
        super(world);
        this.setRequiredComponents([Position, Velocity]);
    }

    /**
     * Process entity movement
     * @param {Entity} entity - Entity to process
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const velocity = entity.getComponent(Velocity);

        // Update position based on velocity
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // Apply velocity damping if needed (for future use)
        // velocity.x *= 0.99;
        // velocity.y *= 0.99;
    }
}