import { Component } from '../core/Component.js';

/**
 * Enemy component - marks an entity as an enemy and stores enemy-specific data
 */
export class Enemy extends Component {
    constructor(type = 'cabaret', points = 100) {
        super();
        this.type = type; // 'cabaret' for cabaret girls
        this.points = points; // points awarded for defeating this enemy
        this.movePattern = 'descend'; // movement pattern
        this.speed = 50; // pixels per second
        this.shootCooldown = 2.0; // seconds between shots (if applicable)
        this.lastShotTime = 0;
        this.canShoot = false; // whether this enemy can shoot
        this.direction = 1; // 1 for right, -1 for left
        this.descended = false; // whether enemy has descended a row
    }

    /**
     * Set enemy type and configure accordingly
     * @param {string} type - Enemy type
     */
    setType(type) {
        this.type = type;
        
        switch (type) {
            case 'cabaret':
                this.points = 100;
                this.speed = 50;
                this.canShoot = false;
                break;
            case 'boss_cabaret':
                this.points = 500;
                this.speed = 30;
                this.canShoot = true;
                this.shootCooldown = 1.5;
                break;
            default:
                this.points = 100;
                this.speed = 50;
                this.canShoot = false;
        }
    }

    /**
     * Check if enemy can shoot
     * @param {number} currentTime - Current game time
     * @returns {boolean} - True if can shoot
     */
    canShootNow(currentTime) {
        return this.canShoot && (currentTime - this.lastShotTime >= this.shootCooldown);
    }

    /**
     * Record shot time
     * @param {number} currentTime - Current game time
     */
    recordShot(currentTime) {
        this.lastShotTime = currentTime;
    }

    /**
     * Set movement direction
     * @param {number} direction - 1 for right, -1 for left
     */
    setDirection(direction) {
        this.direction = direction;
    }

    /**
     * Mark that enemy has descended
     */
    markDescended() {
        this.descended = true;
    }

    /**
     * Reset descent flag
     */
    resetDescent() {
        this.descended = false;
    }

    /**
     * Get points value
     * @returns {number} - Points awarded for defeating this enemy
     */
    getPoints() {
        return this.points;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.type = 'cabaret';
        this.points = 100;
        this.movePattern = 'descend';
        this.speed = 50;
        this.shootCooldown = 2.0;
        this.lastShotTime = 0;
        this.canShoot = false;
        this.direction = 1;
        this.descended = false;
    }

    /**
     * Clone this component
     * @returns {Enemy} - New enemy instance
     */
    clone() {
        const enemy = new Enemy(this.type, this.points);
        enemy.movePattern = this.movePattern;
        enemy.speed = this.speed;
        enemy.shootCooldown = this.shootCooldown;
        enemy.lastShotTime = this.lastShotTime;
        enemy.canShoot = this.canShoot;
        enemy.direction = this.direction;
        enemy.descended = this.descended;
        return enemy;
    }
}