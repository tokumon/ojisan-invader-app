import { Component } from '../core/Component.js';

/**
 * Collision component - defines collision boundaries and behavior
 */
export class Collision extends Component {
    constructor(config = {}) {
        super();
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.offsetX = config.offsetX || 0;
        this.offsetY = config.offsetY || 0;
        this.type = config.type || 'rectangle'; // rectangle, circle
        this.radius = config.radius || 16; // for circle collision
        this.layer = config.layer || 'default';
        this.mask = config.mask || ['default']; // what layers this can collide with
        this.isTrigger = config.isTrigger || false; // trigger vs solid collision
        this.enabled = config.enabled !== false;
    }

    /**
     * Set collision size
     * @param {number} width - Collision width
     * @param {number} height - Collision height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Set collision offset from entity position
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     */
    setOffset(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    /**
     * Set collision layer
     * @param {string} layer - Collision layer name
     */
    setLayer(layer) {
        this.layer = layer;
    }

    /**
     * Set collision mask (what layers this can collide with)
     * @param {string[]} mask - Array of layer names
     */
    setMask(mask) {
        this.mask = Array.isArray(mask) ? mask : [mask];
    }

    /**
     * Check if this collision can collide with another layer
     * @param {string} otherLayer - Other collision layer
     * @returns {boolean} - True if collision is possible
     */
    canCollideWith(otherLayer) {
        return this.mask.includes(otherLayer);
    }

    /**
     * Get collision bounds relative to entity position
     * @param {number} entityX - Entity X position
     * @param {number} entityY - Entity Y position
     * @returns {Object} - Collision bounds {left, top, right, bottom}
     */
    getBounds(entityX, entityY) {
        const x = entityX + this.offsetX;
        const y = entityY + this.offsetY;
        
        if (this.type === 'circle') {
            return {
                centerX: x,
                centerY: y,
                radius: this.radius,
                left: x - this.radius,
                top: y - this.radius,
                right: x + this.radius,
                bottom: y + this.radius
            };
        } else {
            return {
                left: x - this.width / 2,
                top: y - this.height / 2,
                right: x + this.width / 2,
                bottom: y + this.height / 2
            };
        }
    }

    /**
     * Enable or disable collision
     * @param {boolean} enabled - Whether collision is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.width = 32;
        this.height = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        this.type = 'rectangle';
        this.radius = 16;
        this.layer = 'default';
        this.mask = ['default'];
        this.isTrigger = false;
        this.enabled = true;
    }

    /**
     * Clone this component
     * @returns {Collision} - New collision instance
     */
    clone() {
        return new Collision({
            width: this.width,
            height: this.height,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            type: this.type,
            radius: this.radius,
            layer: this.layer,
            mask: [...this.mask],
            isTrigger: this.isTrigger,
            enabled: this.enabled
        });
    }
}