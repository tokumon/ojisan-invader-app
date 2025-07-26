import { Component } from '../core/Component.js';

/**
 * Player component - marks an entity as the player and stores player-specific data
 */
export class Player extends Component {
    constructor() {
        super();
        this.speed = 200; // pixels per second
        this.shootCooldown = 0.2; // seconds between shots
        this.lastShotTime = 0;
        this.score = 0;
        this.lives = 3;
    }

    /**
     * Check if player can shoot
     * @param {number} currentTime - Current game time
     * @returns {boolean} - True if can shoot
     */
    canShoot(currentTime) {
        return currentTime - this.lastShotTime >= this.shootCooldown;
    }

    /**
     * Record shot time
     * @param {number} currentTime - Current game time
     */
    recordShot(currentTime) {
        this.lastShotTime = currentTime;
    }

    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Lose a life
     * @returns {boolean} - True if player still has lives left
     */
    loseLife() {
        this.lives--;
        return this.lives > 0;
    }

    /**
     * Add a life
     */
    addLife() {
        this.lives++;
    }

    /**
     * Check if player is alive
     * @returns {boolean} - True if has lives remaining
     */
    isAlive() {
        return this.lives > 0;
    }

    /**
     * Reset player stats
     */
    resetStats() {
        this.score = 0;
        this.lives = 3;
        this.lastShotTime = 0;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.speed = 200;
        this.shootCooldown = 0.2;
        this.lastShotTime = 0;
        this.score = 0;
        this.lives = 3;
    }

    /**
     * Clone this component
     * @returns {Player} - New player instance
     */
    clone() {
        const player = new Player();
        player.speed = this.speed;
        player.shootCooldown = this.shootCooldown;
        player.lastShotTime = this.lastShotTime;
        player.score = this.score;
        player.lives = this.lives;
        return player;
    }
}