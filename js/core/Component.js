/**
 * Base Component class - pure data containers
 * Components should not contain behavior, only data
 */
export class Component {
    constructor() {
        // Base component - subclasses should add their own properties
    }

    /**
     * Clone this component for object pooling
     * @returns {Component} - A new instance with the same data
     */
    clone() {
        const cloned = new this.constructor();
        Object.assign(cloned, this);
        return cloned;
    }

    /**
     * Reset component to default state for object pooling
     */
    reset() {
        // Override in subclasses to reset component state
    }
}