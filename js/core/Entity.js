/**
 * Entity class - represents a game object with a unique ID
 * Entities are containers for components and don't contain game logic
 */
export class Entity {
    static nextId = 1;

    constructor() {
        this.id = Entity.nextId++;
        this.components = new Map();
        this.active = true;
    }

    /**
     * Add a component to this entity
     * @param {Component} component - The component to add
     * @returns {Entity} - Returns this entity for chaining
     */
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    /**
     * Get a component by its class name
     * @param {Function} componentClass - The component class
     * @returns {Component|undefined} - The component instance or undefined
     */
    getComponent(componentClass) {
        return this.components.get(componentClass.name);
    }

    /**
     * Check if entity has a specific component
     * @param {Function} componentClass - The component class to check for
     * @returns {boolean} - True if entity has the component
     */
    hasComponent(componentClass) {
        return this.components.has(componentClass.name);
    }

    /**
     * Remove a component from this entity
     * @param {Function} componentClass - The component class to remove
     * @returns {boolean} - True if component was removed
     */
    removeComponent(componentClass) {
        return this.components.delete(componentClass.name);
    }

    /**
     * Check if entity has all specified components
     * @param {Function[]} componentClasses - Array of component classes
     * @returns {boolean} - True if entity has all components
     */
    hasComponents(componentClasses) {
        return componentClasses.every(componentClass => 
            this.hasComponent(componentClass)
        );
    }

    /**
     * Mark entity for removal
     */
    destroy() {
        this.active = false;
    }

    /**
     * Get all component names for debugging
     * @returns {string[]} - Array of component names
     */
    getComponentNames() {
        return Array.from(this.components.keys());
    }
}