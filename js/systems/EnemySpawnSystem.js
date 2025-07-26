import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Enemy } from '../components/Enemy.js';
import { Sprite } from '../components/Sprite.js';
import { Collision } from '../components/Collision.js';
import { Health } from '../components/Health.js';

/**
 * EnemySpawnSystem - handles spawning and movement of enemy entities
 */
export class EnemySpawnSystem extends System {
    constructor(world, canvas) {
        super(world);
        this.canvas = canvas;
        this.setRequiredComponents([Position, Enemy]);
        
        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // seconds between spawns
        this.waveSize = 5; // enemies per wave
        this.currentWave = 0;
        this.enemiesInWave = 0;
        this.maxEnemiesOnScreen = 15;
        
        // Formation movement
        this.formationDirection = 1; // 1 for right, -1 for left
        this.formationSpeed = 30; // pixels per second
        this.descendDistance = 30; // pixels to descend when hitting edge
        this.edgeMargin = 50; // margin from screen edge
    }

    /**
     * Update enemy spawn system
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        this.spawnTimer += deltaTime;
        
        // Update existing enemies first
        super.update(deltaTime);
        
        // Check if we need to spawn new enemies
        this.checkSpawning();
        
        // Update formation movement
        this.updateFormationMovement();
    }

    /**
     * Process individual enemy entity
     * @param {Entity} entity - Enemy entity
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const enemy = entity.getComponent(Enemy);
        
        // Remove enemies that have moved off screen
        if (position.y > this.canvas.height + 50) {
            entity.destroy();
        }
        
        // Handle individual enemy behavior
        this.updateEnemyBehavior(entity, deltaTime);
    }

    /**
     * Check if we should spawn new enemies
     */
    checkSpawning() {
        const currentEnemyCount = this.getEnemyCount();
        
        if (currentEnemyCount < this.maxEnemiesOnScreen && 
            this.spawnTimer >= this.spawnInterval) {
            
            this.spawnEnemyWave();
            this.spawnTimer = 0;
        }
    }

    /**
     * Get current number of enemies on screen
     * @returns {number} - Enemy count
     */
    getEnemyCount() {
        return this.world.getEntitiesWithComponents([Enemy]).length;
    }

    /**
     * Spawn a wave of enemies
     */
    spawnEnemyWave() {
        this.currentWave++;
        const enemiesToSpawn = Math.min(this.waveSize, this.maxEnemiesOnScreen - this.getEnemyCount());
        
        for (let i = 0; i < enemiesToSpawn; i++) {
            this.spawnEnemy(i, enemiesToSpawn);
        }
    }

    /**
     * Spawn a single enemy
     * @param {number} index - Index in formation
     * @param {number} totalInWave - Total enemies in this wave
     */
    spawnEnemy(index, totalInWave) {
        const enemy = this.world.createEntity();
        
        // Calculate spawn position in formation
        const spacing = 80;
        const totalWidth = (totalInWave - 1) * spacing;
        const startX = (this.canvas.width - totalWidth) / 2;
        const x = startX + (index * spacing);
        const y = 50 + (this.currentWave % 3) * 60; // Stagger rows
        
        // Add position component
        enemy.addComponent(new Position(x, y));
        
        // Add velocity component
        enemy.addComponent(new Velocity(0, 0));
        
        // Add enemy component
        const enemyComp = new Enemy('cabaret', 100);
        enemyComp.setDirection(this.formationDirection);
        enemy.addComponent(enemyComp);
        
        // Add health component
        enemy.addComponent(new Health(1));
        
        // Add sprite component
        const sprite = new Sprite({
            width: 32,
            height: 32,
            color: '#FF69B4',
            shape: 'cabaret'
        });
        enemy.addComponent(sprite);
        
        // Add collision component
        const collision = new Collision({
            width: 28,
            height: 28,
            layer: 'enemy',
            mask: ['player', 'player_projectile']
        });
        enemy.addComponent(collision);
    }

    /**
     * Update formation movement for all enemies
     */
    updateFormationMovement() {
        const enemies = this.world.getEntitiesWithComponents([Enemy]);
        if (enemies.length === 0) return;
        
        // Check if any enemy has hit the edge
        let shouldDescend = false;
        
        for (const enemy of enemies) {
            const position = enemy.getComponent(Position);
            
            if (this.formationDirection > 0 && position.x > this.canvas.width - this.edgeMargin) {
                shouldDescend = true;
                break;
            } else if (this.formationDirection < 0 && position.x < this.edgeMargin) {
                shouldDescend = true;
                break;
            }
        }
        
        if (shouldDescend) {
            // Change direction and descend
            this.formationDirection *= -1;
            
            for (const enemy of enemies) {
                const position = enemy.getComponent(Position);
                const velocity = enemy.getComponent(Velocity);
                const enemyComp = enemy.getComponent(Enemy);
                
                // Descend
                position.y += this.descendDistance;
                
                // Update direction
                enemyComp.setDirection(this.formationDirection);
                velocity.x = this.formationDirection * this.formationSpeed;
            }
        } else {
            // Normal horizontal movement
            for (const enemy of enemies) {
                const velocity = enemy.getComponent(Velocity);
                velocity.x = this.formationDirection * this.formationSpeed;
            }
        }
    }

    /**
     * Update individual enemy behavior
     * @param {Entity} entity - Enemy entity
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateEnemyBehavior(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const enemy = entity.getComponent(Enemy);
        
        // Check if enemy has reached the player area (game over condition)
        if (position.y > this.canvas.height * 0.8) {
            // Enemy invasion - trigger game over
            const gameState = this.world.getSystem('gameState');
            if (gameState) {
                gameState.triggerGameOver();
            }
        }
    }

    /**
     * Increase spawn rate as game progresses
     */
    increaseDifficulty() {
        this.spawnInterval = Math.max(0.5, this.spawnInterval * 0.9);
        this.formationSpeed = Math.min(100, this.formationSpeed * 1.1);
        this.waveSize = Math.min(8, this.waveSize + 1);
    }

    /**
     * Reset spawn system
     */
    reset() {
        this.spawnTimer = 0;
        this.spawnInterval = 2.0;
        this.waveSize = 5;
        this.currentWave = 0;
        this.enemiesInWave = 0;
        this.formationDirection = 1;
        this.formationSpeed = 30;
    }
}