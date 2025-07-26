import { Component } from '../core/Component.js';

/**
 * Health component - manages entity health and damage
 */
export class Health extends Component {
    constructor(maxHealth = 1) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 0;
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @returns {boolean} - True if damage was taken
     */
    takeDamage(amount) {
        if (this.invulnerable || amount <= 0) {
            return false;
        }

        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
        }

        return true;
    }

    /**
     * Heal entity
     * @param {number} amount - Heal amount
     */
    heal(amount) {
        if (amount <= 0) return;

        this.currentHealth += amount;
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    /**
     * Check if entity is dead
     * @returns {boolean} - True if health is 0 or less
     */
    isDead() {
        return this.currentHealth <= 0;
    }

    /**
     * Check if entity is at full health
     * @returns {boolean} - True if at max health
     */
    isFullHealth() {
        return this.currentHealth >= this.maxHealth;
    }

    /**
     * Get health percentage
     * @returns {number} - Health as percentage (0-1)
     */
    getHealthPercentage() {
        return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
    }

    /**
     * Set maximum health
     * @param {number} maxHealth - New maximum health
     * @param {boolean} healToFull - Whether to heal to full after setting max
     */
    setMaxHealth(maxHealth, healToFull = false) {
        this.maxHealth = Math.max(1, maxHealth);
        
        if (healToFull) {
            this.currentHealth = this.maxHealth;
        } else if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    /**
     * Set invulnerability for a duration
     * @param {number} duration - Invulnerability duration in seconds
     */
    setInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = duration;
    }

    /**
     * Update invulnerability timer
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTimer += deltaTime;
            if (this.invulnerabilityTimer >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }
    }

    /**
     * Instantly kill entity
     */
    kill() {
        this.currentHealth = 0;
    }

    /**
     * Restore to full health
     */
    restore() {
        this.currentHealth = this.maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.maxHealth = 1;
        this.currentHealth = 1;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 0;
    }

    /**
     * Clone this component
     * @returns {Health} - New health instance
     */
    clone() {
        const health = new Health(this.maxHealth);
        health.currentHealth = this.currentHealth;
        health.invulnerable = this.invulnerable;
        health.invulnerabilityTimer = this.invulnerabilityTimer;
        health.invulnerabilityDuration = this.invulnerabilityDuration;
        return health;
    }
}