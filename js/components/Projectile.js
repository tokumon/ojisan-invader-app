import { Component } from '../core/Component.js';

/**
 * Projectile component - manages projectile behavior and data
 */
export class Projectile extends Component {
    constructor(type = 'necktie', damage = 1) {
        super();
        this.type = type; // 'necktie' for player, 'lipstick' for enemies
        this.damage = damage;
        this.speed = 300; // pixels per second
        this.lifeTime = 5.0; // seconds before auto-destruction
        this.age = 0; // current age in seconds
        this.owner = 'player'; // 'player' or 'enemy'
        this.piercing = false; // whether projectile can hit multiple targets
        this.hitsRemaining = 1; // how many hits before destruction
    }

    /**
     * Set projectile type and configure accordingly
     * @param {string} type - Projectile type
     */
    setType(type) {
        this.type = type;
        
        switch (type) {
            case 'necktie':
                this.damage = 1;
                this.speed = 300;
                this.owner = 'player';
                break;
            case 'lipstick':
                this.damage = 1;
                this.speed = 200;
                this.owner = 'enemy';
                break;
            case 'super_necktie':
                this.damage = 2;
                this.speed = 400;
                this.owner = 'player';
                this.piercing = true;
                this.hitsRemaining = 3;
                break;
            default:
                this.damage = 1;
                this.speed = 300;
                this.owner = 'player';
        }
    }

    /**
     * Set projectile owner
     * @param {string} owner - 'player' or 'enemy'
     */
    setOwner(owner) {
        this.owner = owner;
    }

    /**
     * Update projectile age
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {boolean} - True if projectile should be destroyed
     */
    updateAge(deltaTime) {
        this.age += deltaTime;
        return this.age >= this.lifeTime;
    }

    /**
     * Handle projectile hit
     * @returns {boolean} - True if projectile should be destroyed
     */
    onHit() {
        this.hitsRemaining--;
        return this.hitsRemaining <= 0;
    }

    /**
     * Check if projectile belongs to player
     * @returns {boolean} - True if owned by player
     */
    isPlayerProjectile() {
        return this.owner === 'player';
    }

    /**
     * Check if projectile belongs to enemy
     * @returns {boolean} - True if owned by enemy
     */
    isEnemyProjectile() {
        return this.owner === 'enemy';
    }

    /**
     * Get damage amount
     * @returns {number} - Damage dealt by this projectile
     */
    getDamage() {
        return this.damage;
    }

    /**
     * Set damage amount
     * @param {number} damage - Damage amount
     */
    setDamage(damage) {
        this.damage = Math.max(0, damage);
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.type = 'necktie';
        this.damage = 1;
        this.speed = 300;
        this.lifeTime = 5.0;
        this.age = 0;
        this.owner = 'player';
        this.piercing = false;
        this.hitsRemaining = 1;
    }

    /**
     * Clone this component
     * @returns {Projectile} - New projectile instance
     */
    clone() {
        const projectile = new Projectile(this.type, this.damage);
        projectile.speed = this.speed;
        projectile.lifeTime = this.lifeTime;
        projectile.age = this.age;
        projectile.owner = this.owner;
        projectile.piercing = this.piercing;
        projectile.hitsRemaining = this.hitsRemaining;
        return projectile;
    }
}