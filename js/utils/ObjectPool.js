/**
 * ObjectPool - manages reusable objects to reduce garbage collection
 */
export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    /**
     * Get an object from the pool
     * @returns {Object} - Pooled object
     */
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        this.active.add(obj);
        return obj;
    }

    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            
            if (this.resetFn) {
                this.resetFn(obj);
            }
            
            this.pool.push(obj);
        }
    }

    /**
     * Release all active objects
     */
    releaseAll() {
        for (const obj of this.active) {
            if (this.resetFn) {
                this.resetFn(obj);
            }
            this.pool.push(obj);
        }
        this.active.clear();
    }

    /**
     * Get number of objects in pool
     * @returns {number} - Pool size
     */
    getPoolSize() {
        return this.pool.length;
    }

    /**
     * Get number of active objects
     * @returns {number} - Active count
     */
    getActiveCount() {
        return this.active.size;
    }

    /**
     * Clear the entire pool
     */
    clear() {
        this.pool = [];
        this.active.clear();
    }
}

/**
 * EntityPool - specialized pool for entities
 */
export class EntityPool extends ObjectPool {
    constructor(world, componentFactories, initialSize = 10) {
        super(
            () => world.createEntity(),
            (entity) => {
                // Reset entity components
                for (const component of entity.components.values()) {
                    if (component.reset) {
                        component.reset();
                    }
                }
                entity.active = true;
            },
            initialSize
        );
        
        this.world = world;
        this.componentFactories = componentFactories;
    }

    /**
     * Acquire an entity with specific components
     * @param {string[]} componentTypes - Component types to add
     * @returns {Entity} - Configured entity
     */
    acquireWithComponents(componentTypes) {
        const entity = this.acquire();
        
        // Add required components
        for (const componentType of componentTypes) {
            if (this.componentFactories[componentType]) {
                const component = this.componentFactories[componentType]();
                entity.addComponent(component);
            }
        }
        
        return entity;
    }

    /**
     * Release entity back to pool
     * @param {Entity} entity - Entity to release
     */
    release(entity) {
        // Remove all components
        entity.components.clear();
        entity.active = true;
        
        super.release(entity);
    }
}