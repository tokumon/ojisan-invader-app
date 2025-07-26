import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Collision } from '../components/Collision.js';
import { Health } from '../components/Health.js';
import { Player } from '../components/Player.js';
import { Enemy } from '../components/Enemy.js';
import { Projectile } from '../components/Projectile.js';
import { Obstacle } from '../components/Obstacle.js';

/**
 * CollisionSystem - handles collision detection and response
 */
export class CollisionSystem extends System {
    constructor(world) {
        super(world);
        this.setRequiredComponents([Position, Collision]);
        this.collisionEvents = [];
    }

    /**
     * Update - check collisions between all entities
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        this.collisionEvents = [];
        super.update(deltaTime);
        this.handleCollisionEvents();
    }

    /**
     * Process entity - build collision list and check for collisions
     * @param {Entity} entity - Entity to process
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const collision = entity.getComponent(Collision);

        if (!collision.enabled) return;

        // Check collisions with other entities
        for (const other of this.entities) {
            if (other === entity || !other.active) continue;

            const otherPosition = other.getComponent(Position);
            const otherCollision = other.getComponent(Collision);

            if (!otherCollision.enabled) continue;

            // Check if these collision layers can interact
            if (!collision.canCollideWith(otherCollision.layer)) continue;

            // Perform collision detection
            if (this.checkCollision(entity, other)) {
                this.collisionEvents.push({
                    entityA: entity,
                    entityB: other,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Check collision between two entities
     * @param {Entity} entityA - First entity
     * @param {Entity} entityB - Second entity
     * @returns {boolean} - True if collision detected
     */
    checkCollision(entityA, entityB) {
        const posA = entityA.getComponent(Position);
        const collA = entityA.getComponent(Collision);
        const posB = entityB.getComponent(Position);
        const collB = entityB.getComponent(Collision);

        const boundsA = collA.getBounds(posA.x, posA.y);
        const boundsB = collB.getBounds(posB.x, posB.y);

        // Rectangle vs Rectangle collision
        if (collA.type === 'rectangle' && collB.type === 'rectangle') {
            return this.checkRectangleCollision(boundsA, boundsB);
        }
        
        // Circle vs Circle collision
        if (collA.type === 'circle' && collB.type === 'circle') {
            return this.checkCircleCollision(boundsA, boundsB);
        }
        
        // Rectangle vs Circle collision
        if (collA.type === 'rectangle' && collB.type === 'circle') {
            return this.checkRectangleCircleCollision(boundsA, boundsB);
        }
        
        if (collA.type === 'circle' && collB.type === 'rectangle') {
            return this.checkRectangleCircleCollision(boundsB, boundsA);
        }

        return false;
    }

    /**
     * Check rectangle collision
     * @param {Object} rectA - Rectangle bounds
     * @param {Object} rectB - Rectangle bounds
     * @returns {boolean} - True if collision
     */
    checkRectangleCollision(rectA, rectB) {
        return rectA.left < rectB.right &&
               rectA.right > rectB.left &&
               rectA.top < rectB.bottom &&
               rectA.bottom > rectB.top;
    }

    /**
     * Check circle collision
     * @param {Object} circleA - Circle bounds
     * @param {Object} circleB - Circle bounds
     * @returns {boolean} - True if collision
     */
    checkCircleCollision(circleA, circleB) {
        const dx = circleA.centerX - circleB.centerX;
        const dy = circleA.centerY - circleB.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circleA.radius + circleB.radius);
    }

    /**
     * Check rectangle vs circle collision
     * @param {Object} rect - Rectangle bounds
     * @param {Object} circle - Circle bounds
     * @returns {boolean} - True if collision
     */
    checkRectangleCircleCollision(rect, circle) {
        const closestX = Math.max(rect.left, Math.min(circle.centerX, rect.right));
        const closestY = Math.max(rect.top, Math.min(circle.centerY, rect.bottom));
        
        const dx = circle.centerX - closestX;
        const dy = circle.centerY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < circle.radius;
    }

    /**
     * Handle all collision events
     */
    handleCollisionEvents() {
        for (const event of this.collisionEvents) {
            this.handleCollisionEvent(event.entityA, event.entityB);
        }
    }

    /**
     * Handle collision between two specific entities
     * @param {Entity} entityA - First entity
     * @param {Entity} entityB - Second entity
     */
    handleCollisionEvent(entityA, entityB) {
        // Player vs Enemy collision
        if (this.isPlayerEnemyCollision(entityA, entityB)) {
            this.handlePlayerEnemyCollision(entityA, entityB);
        }
        
        // Projectile vs Enemy collision
        else if (this.isProjectileEnemyCollision(entityA, entityB)) {
            this.handleProjectileEnemyCollision(entityA, entityB);
        }
        
        // Player vs Obstacle collision
        else if (this.isPlayerObstacleCollision(entityA, entityB)) {
            this.handlePlayerObstacleCollision(entityA, entityB);
        }
        
        // Projectile vs Obstacle collision
        else if (this.isProjectileObstacleCollision(entityA, entityB)) {
            this.handleProjectileObstacleCollision(entityA, entityB);
        }
    }

    /**
     * Check if collision is between player and enemy
     */
    isPlayerEnemyCollision(entityA, entityB) {
        return (entityA.hasComponent(Player) && entityB.hasComponent(Enemy)) ||
               (entityA.hasComponent(Enemy) && entityB.hasComponent(Player));
    }

    /**
     * Check if collision is between projectile and enemy
     */
    isProjectileEnemyCollision(entityA, entityB) {
        const projA = entityA.getComponent(Projectile);
        const projB = entityB.getComponent(Projectile);
        
        return (projA && projA.isPlayerProjectile() && entityB.hasComponent(Enemy)) ||
               (projB && projB.isPlayerProjectile() && entityA.hasComponent(Enemy));
    }

    /**
     * Check if collision is between player and obstacle
     */
    isPlayerObstacleCollision(entityA, entityB) {
        return (entityA.hasComponent(Player) && entityB.hasComponent(Obstacle)) ||
               (entityA.hasComponent(Obstacle) && entityB.hasComponent(Player));
    }

    /**
     * Check if collision is between projectile and obstacle
     */
    isProjectileObstacleCollision(entityA, entityB) {
        return (entityA.hasComponent(Projectile) && entityB.hasComponent(Obstacle)) ||
               (entityA.hasComponent(Obstacle) && entityB.hasComponent(Projectile));
    }

    /**
     * Handle player vs enemy collision
     */
    handlePlayerEnemyCollision(entityA, entityB) {
        const player = entityA.hasComponent(Player) ? entityA : entityB;
        const enemy = entityA.hasComponent(Enemy) ? entityA : entityB;
        
        const playerHealth = player.getComponent(Health);
        const playerComp = player.getComponent(Player);
        
        if (playerHealth && playerHealth.takeDamage(1)) {
            if (!playerComp.loseLife()) {
                // Player is dead - trigger game over
                this.world.getSystem('gameState')?.triggerGameOver();
            }
        }
        
        // Destroy enemy on contact
        enemy.destroy();
    }

    /**
     * Handle projectile vs enemy collision
     */
    handleProjectileEnemyCollision(entityA, entityB) {
        const projectile = entityA.hasComponent(Projectile) ? entityA : entityB;
        const enemy = entityA.hasComponent(Enemy) ? entityA : entityB;
        
        const projComp = projectile.getComponent(Projectile);
        const enemyComp = enemy.getComponent(Enemy);
        const enemyHealth = enemy.getComponent(Health);
        
        // Only player projectiles damage enemies
        if (!projComp.isPlayerProjectile()) return;
        
        // Deal damage to enemy
        if (enemyHealth && enemyHealth.takeDamage(projComp.getDamage())) {
            if (enemyHealth.isDead()) {
                // Award points to player
                const player = this.world.getEntityWithComponents([Player]);
                if (player) {
                    const playerComp = player.getComponent(Player);
                    playerComp.addScore(enemyComp.getPoints());
                }
                
                enemy.destroy();
            }
        }
        
        // Handle projectile hit
        if (projComp.onHit()) {
            projectile.destroy();
        }
    }

    /**
     * Handle player vs obstacle collision
     */
    handlePlayerObstacleCollision(entityA, entityB) {
        const player = entityA.hasComponent(Player) ? entityA : entityB;
        const obstacle = entityA.hasComponent(Obstacle) ? entityA : entityB;
        
        const playerHealth = player.getComponent(Health);
        const playerComp = player.getComponent(Player);
        const obstacleComp = obstacle.getComponent(Obstacle);
        
        if (playerHealth && playerHealth.takeDamage(obstacleComp.getDamage())) {
            if (!playerComp.loseLife()) {
                // Player is dead - trigger game over
                this.world.getSystem('gameState')?.triggerGameOver();
            }
        }
        
        // Destroy obstacle on contact
        obstacle.destroy();
    }

    /**
     * Handle projectile vs obstacle collision
     */
    handleProjectileObstacleCollision(entityA, entityB) {
        const projectile = entityA.hasComponent(Projectile) ? entityA : entityB;
        const obstacle = entityA.hasComponent(Obstacle) ? entityA : entityB;
        
        const projComp = projectile.getComponent(Projectile);
        const obstacleComp = obstacle.getComponent(Obstacle);
        
        // Check if obstacle is destructible
        if (obstacleComp.isDestructible()) {
            // Award points if destroyed
            const player = this.world.getEntityWithComponents([Player]);
            if (player) {
                const playerComp = player.getComponent(Player);
                playerComp.addScore(obstacleComp.getScoreValue());
            }
            
            obstacle.destroy();
        }
        
        // Destroy projectile
        projectile.destroy();
    }
}