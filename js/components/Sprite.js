import { Component } from '../core/Component.js';

/**
 * Sprite component - handles visual representation
 */
export class Sprite extends Component {
    constructor(config = {}) {
        super();
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.color = config.color || '#FFFFFF';
        this.shape = config.shape || 'rectangle'; // rectangle, circle, custom
        this.image = config.image || null;
        this.scale = config.scale || 1;
        this.rotation = config.rotation || 0;
        this.opacity = config.opacity || 1;
        this.visible = config.visible !== false;
        
        // For custom shapes or text
        this.customRender = config.customRender || null;
        this.text = config.text || '';
        this.font = config.font || '16px Arial';
        this.textAlign = config.textAlign || 'center';
    }

    /**
     * Set size
     * @param {number} width - Width
     * @param {number} height - Height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Set color
     * @param {string} color - Color string
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Set visibility
     * @param {boolean} visible - Whether sprite is visible
     */
    setVisible(visible) {
        this.visible = visible;
    }

    /**
     * Set rotation in radians
     * @param {number} rotation - Rotation in radians
     */
    setRotation(rotation) {
        this.rotation = rotation;
    }

    /**
     * Set scale
     * @param {number} scale - Scale factor
     */
    setScale(scale) {
        this.scale = scale;
    }

    /**
     * Set opacity
     * @param {number} opacity - Opacity from 0 to 1
     */
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Get actual width with scale
     * @returns {number} - Scaled width
     */
    getScaledWidth() {
        return this.width * this.scale;
    }

    /**
     * Get actual height with scale
     * @returns {number} - Scaled height
     */
    getScaledHeight() {
        return this.height * this.scale;
    }

    /**
     * Reset component for object pooling
     */
    reset() {
        this.width = 32;
        this.height = 32;
        this.color = '#FFFFFF';
        this.shape = 'rectangle';
        this.image = null;
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 1;
        this.visible = true;
        this.customRender = null;
        this.text = '';
        this.font = '16px Arial';
        this.textAlign = 'center';
    }

    /**
     * Clone this component
     * @returns {Sprite} - New sprite instance
     */
    clone() {
        return new Sprite({
            width: this.width,
            height: this.height,
            color: this.color,
            shape: this.shape,
            image: this.image,
            scale: this.scale,
            rotation: this.rotation,
            opacity: this.opacity,
            visible: this.visible,
            customRender: this.customRender,
            text: this.text,
            font: this.font,
            textAlign: this.textAlign
        });
    }
}