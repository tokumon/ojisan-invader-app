import { Component } from '../core/Component.js';

/**
 * Obstacle component - manages obstacle behavior and data
 */
export class Obstacle extends Component {
    constructor(type = 'money', damage = 1) {
        super();
        this.type = type; // 'money' for ¥500,000 bills
        this.damage = damage; // damage dealt to player on contact
        this.speed = 100; // pixels per second
        this.lifeTime = 10.0; // seconds before auto-destruction
        this.age = 0; // current age in seconds
        this.destructible = false; // whether obstacle can be destroyed by projectiles
        this.scoreValue = 0; // points awarded if destroyed (if destructible)
    }

    /**
     * Set obstacle type and configure accordingly
     * @param {string} type - Obstacle type
     */
    setType(type) {
        this.type = type;
        
        switch (type) {
            case 'money':
                this.damage = 1;
                this.speed = 100;
                this.destructible = false;
                this.scoreValue = 0;
                break;
            case 'safe':
                this.damage = 2;
                this.speed = 50;
                this.destructible = true;
                this.scoreValue = 200;
                break;
            default:
                this.damage = 1;
                this.speed = 100;
                this.destructible = false;
                this.scoreValue = 0;
        }
    }

    /**
     * Update obstacle age
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {boolean} - True if obstacle should be destroyed
     */
    updateAge(deltaTime) {
        this.age += deltaTime;
        return this.age >= this.lifeTime;
    }

    /**
     * Check if obstacle can be destroyed by projectiles
     * @returns {boolean} - True if destructible
     */
    isDestructible() {
        return this.destructible;
    }

    /**
     * Get damage dealt to player
     * @returns {number} - Damage amount
     */
    getDamage() {
        return this.damage;
    }

    /**
     * Get score value if destroyed
     * @returns {number} - Score points
     */
    getScoreValue() {
        return this.scoreValue;
    }

    /**
     * Set movement speed
     * @param {number} speed - Speed in pixels per second
     */
    setSpeed(speed) {
        this.speed = Math.max(0, speed);
    }

    /**
     * Set lifetime
     * @param {number} lifeTime - Lifetime in seconds
     */
    setLifeTime(lifeTime) {
        this.lifeTime = Math.max(0, lifeTime);
    }

    /**
     * Check if obstacle is a money bill
     * @returns {boolean} - True if money type
     */
    isMoney() {
        return this.type === 'money';
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.type = 'money';
        this.damage = 1;
        this.speed = 100;
        this.lifeTime = 10.0;
        this.age = 0;
        this.destructible = false;
        this.scoreValue = 0;
    }

    /**
     * Clone this component
     * @returns {Obstacle} - New obstacle instance
     */
    clone() {
        const obstacle = new Obstacle(this.type, this.damage);
        obstacle.speed = this.speed;
        obstacle.lifeTime = this.lifeTime;
        obstacle.age = this.age;
        obstacle.destructible = this.destructible;
        obstacle.scoreValue = this.scoreValue;
        return obstacle;
    }
}