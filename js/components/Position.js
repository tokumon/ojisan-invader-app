import { Component } from '../core/Component.js';

/**
 * Position component - stores x, y coordinates
 */
export class Position extends Component {
    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * Set position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    set(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add to position
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     */
    add(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.x = 0;
        this.y = 0;
    }

    /**
     * Clone this component
     * @returns {Position} - New position instance
     */
    clone() {
        return new Position(this.x, this.y);
    }
}