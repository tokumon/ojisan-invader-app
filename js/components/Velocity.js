import { Component } from '../core/Component.js';

/**
 * Velocity component - stores velocity in x, y directions
 */
export class Velocity extends Component {
    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
        this.maxSpeed = Infinity;
    }

    /**
     * Set velocity
     * @param {number} x - X velocity
     * @param {number} y - Y velocity
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        this.clampToMaxSpeed();
    }

    /**
     * Add to velocity
     * @param {number} dx - Delta X velocity
     * @param {number} dy - Delta Y velocity
     */
    add(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.clampToMaxSpeed();
    }

    /**
     * Set maximum speed limit
     * @param {number} maxSpeed - Maximum speed
     */
    setMaxSpeed(maxSpeed) {
        this.maxSpeed = maxSpeed;
        this.clampToMaxSpeed();
    }

    /**
     * Clamp velocity to maximum speed
     */
    clampToMaxSpeed() {
        if (this.maxSpeed === Infinity) return;
        
        const speed = Math.sqrt(this.x * this.x + this.y * this.y);
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed;
            this.x *= scale;
            this.y *= scale;
        }
    }

    /**
     * Get current speed
     * @returns {number} - Current speed magnitude
     */
    getSpeed() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.maxSpeed = Infinity;
    }

    /**
     * Clone this component
     * @returns {Velocity} - New velocity instance
     */
    clone() {
        const vel = new Velocity(this.x, this.y);
        vel.maxSpeed = this.maxSpeed;
        return vel;
    }
}