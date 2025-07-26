import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Obstacle } from '../components/Obstacle.js';
import { Sprite } from '../components/Sprite.js';
import { Collision } from '../components/Collision.js';

/**
 * ObstacleSpawnSystem - handles spawning of obstacle entities (¥500,000 bills)
 */
export class ObstacleSpawnSystem extends System {
    constructor(world, canvas) {
        super(world);
        this.canvas = canvas;
        this.setRequiredComponents([Position, Obstacle]);
        
        this.spawnTimer = 0;
        this.spawnInterval = 3.0; // seconds between obstacle spawns
        this.maxObstaclesOnScreen = 3;
    }

    /**
     * Update obstacle spawn system
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        this.spawnTimer += deltaTime;
        
        // Update existing obstacles
        super.update(deltaTime);
        
        // Check if we need to spawn new obstacles
        this.checkSpawning();
    }

    /**
     * Process individual obstacle entity
     * @param {Entity} entity - Obstacle entity
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const obstacle = entity.getComponent(Obstacle);
        
        // Remove obstacles that have moved off screen
        if (position.y > this.canvas.height + 50) {
            entity.destroy();
            return;
        }
        
        // Update obstacle age and destroy if too old
        if (obstacle.updateAge(deltaTime)) {
            entity.destroy();
        }
    }

    /**
     * Check if we should spawn new obstacles
     */
    checkSpawning() {
        const currentObstacleCount = this.getObstacleCount();
        
        if (currentObstacleCount < this.maxObstaclesOnScreen && 
            this.spawnTimer >= this.spawnInterval) {
            
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
    }

    /**
     * Get current number of obstacles on screen
     * @returns {number} - Obstacle count
     */
    getObstacleCount() {
        return this.world.getEntitiesWithComponents([Obstacle]).length;
    }

    /**
     * Spawn a single obstacle
     */
    spawnObstacle() {
        const obstacle = this.world.createEntity();
        
        // Random spawn position across screen width
        const x = Math.random() * (this.canvas.width - 100) + 50;
        const y = -50; // Start above screen
        
        // Add position component
        obstacle.addComponent(new Position(x, y));
        
        // Add velocity component (moving downward)
        const speed = 80 + Math.random() * 40; // Random speed between 80-120
        obstacle.addComponent(new Velocity(0, speed));
        
        // Add obstacle component
        const obstacleComp = new Obstacle('money', 1);
        obstacleComp.setSpeed(speed);
        obstacle.addComponent(obstacleComp);
        
        // Add sprite component
        const sprite = new Sprite({
            width: 60,
            height: 30,
            color: '#90EE90',
            shape: 'money'
        });
        obstacle.addComponent(sprite);
        
        // Add collision component
        const collision = new Collision({
            width: 56,
            height: 26,
            layer: 'obstacle',
            mask: ['player', 'player_projectile']
        });
        obstacle.addComponent(collision);
    }

    /**
     * Increase obstacle spawn rate as game progresses
     */
    increaseDifficulty() {
        this.spawnInterval = Math.max(1.0, this.spawnInterval * 0.9);
        this.maxObstaclesOnScreen = Math.min(5, this.maxObstaclesOnScreen + 1);
    }

    /**
     * Reset obstacle spawn system
     */
    reset() {
        this.spawnTimer = 0;
        this.spawnInterval = 3.0;
        this.maxObstaclesOnScreen = 3;
    }
}