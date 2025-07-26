/**
 * Unit tests for ObjectPool and EntityPool
 */

import { ObjectPool, EntityPool } from '../../../js/utils/ObjectPool.js';
import { World } from '../../../js/core/World.js';
import { Component } from '../../../js/core/Component.js';

// Mock objects for testing
class MockObject {
  constructor(value = 0) {
    this.value = value;
    this.resetCalled = false;
  }

  reset() {
    this.value = 0;
    this.resetCalled = true;
  }
}

class MockComponent extends Component {
  constructor(data = 'default') {
    super();
    this.data = data;
  }

  reset() {
    this.data = 'default';
  }
}

describe('ObjectPool', () => {
  let pool;
  let createFn;
  let resetFn;

  beforeEach(() => {
    createFn = jest.fn(() => new MockObject());
    resetFn = jest.fn((obj) => obj.reset());
    pool = new ObjectPool(createFn, resetFn, 5);
  });

  describe('constructor', () => {
    test('should initialize with provided functions and initial size', () => {
      expect(pool.createFn).toBe(createFn);
      expect(pool.resetFn).toBe(resetFn);
      expect(pool.getPoolSize()).toBe(5);
      expect(pool.getActiveCount()).toBe(0);
    });

    test('should pre-populate pool with initial objects', () => {
      expect(createFn).toHaveBeenCalledTimes(5);
      expect(pool.getPoolSize()).toBe(5);
    });

    test('should handle zero initial size', () => {
      const emptyPool = new ObjectPool(createFn, resetFn, 0);
      expect(emptyPool.getPoolSize()).toBe(0);
      expect(createFn).toHaveBeenCalledTimes(5); // From first pool construction
    });

    test('should work without reset function', () => {
      const poolWithoutReset = new ObjectPool(createFn, null, 3);
      expect(poolWithoutReset.resetFn).toBeNull();
      expect(poolWithoutReset.getPoolSize()).toBe(3);
    });

    test('should default to initial size of 10', () => {
      const defaultPool = new ObjectPool(createFn, resetFn);
      expect(defaultPool.getPoolSize()).toBe(10);
    });
  });

  describe('acquire', () => {
    test('should return object from pool when available', () => {
      const obj = pool.acquire();

      expect(obj).toBeInstanceOf(MockObject);
      expect(pool.getPoolSize()).toBe(4);
      expect(pool.getActiveCount()).toBe(1);
    });

    test('should create new object when pool is empty', () => {
      // Exhaust the pool
      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }
      expect(pool.getPoolSize()).toBe(0);

      // Next acquire should create new object
      const obj = pool.acquire();
      
      expect(obj).toBeInstanceOf(MockObject);
      expect(createFn).toHaveBeenCalledTimes(6); // 5 initial + 1 new
      expect(pool.getPoolSize()).toBe(0);
      expect(pool.getActiveCount()).toBe(6);
    });

    test('should track active objects', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();

      expect(pool.getActiveCount()).toBe(2);
      expect(pool.active.has(obj1)).toBe(true);
      expect(pool.active.has(obj2)).toBe(true);
    });

    test('should handle rapid acquisition', () => {
      const objects = [];
      for (let i = 0; i < 20; i++) {
        objects.push(pool.acquire());
      }

      expect(objects).toHaveLength(20);
      expect(pool.getActiveCount()).toBe(20);
      expect(pool.getPoolSize()).toBe(0);
    });
  });

  describe('release', () => {
    test('should return object to pool and call reset', () => {
      const obj = pool.acquire();
      obj.value = 42;

      pool.release(obj);

      expect(resetFn).toHaveBeenCalledWith(obj);
      expect(obj.resetCalled).toBe(true);
      expect(pool.getPoolSize()).toBe(5); // Back to original
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.active.has(obj)).toBe(false);
    });

    test('should only release objects that are active', () => {
      const obj = pool.acquire();
      pool.release(obj);

      // Try to release same object again
      pool.release(obj);

      expect(resetFn).toHaveBeenCalledTimes(1);
      expect(pool.getPoolSize()).toBe(5);
    });

    test('should handle release without reset function', () => {
      const poolWithoutReset = new ObjectPool(createFn, null, 3);
      const obj = poolWithoutReset.acquire();

      expect(() => poolWithoutReset.release(obj)).not.toThrow();
      expect(poolWithoutReset.getPoolSize()).toBe(3);
    });

    test('should handle releasing unknown objects', () => {
      const unknownObj = new MockObject();

      expect(() => pool.release(unknownObj)).not.toThrow();
      expect(pool.getPoolSize()).toBe(5); // Unchanged
    });
  });

  describe('releaseAll', () => {
    test('should release all active objects', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();

      obj1.value = 10;
      obj2.value = 20;
      obj3.value = 30;

      pool.releaseAll();

      expect(resetFn).toHaveBeenCalledTimes(3);
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getPoolSize()).toBe(5); // Back to original
      expect(obj1.resetCalled).toBe(true);
      expect(obj2.resetCalled).toBe(true);
      expect(obj3.resetCalled).toBe(true);
    });

    test('should handle empty active set', () => {
      expect(() => pool.releaseAll()).not.toThrow();
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getPoolSize()).toBe(5);
    });

    test('should work without reset function', () => {
      const poolWithoutReset = new ObjectPool(createFn, null, 3);
      poolWithoutReset.acquire();
      poolWithoutReset.acquire();

      expect(() => poolWithoutReset.releaseAll()).not.toThrow();
      expect(poolWithoutReset.getActiveCount()).toBe(0);
    });
  });

  describe('clear', () => {
    test('should clear all pools and active objects', () => {
      pool.acquire();
      pool.acquire();

      pool.clear();

      expect(pool.getPoolSize()).toBe(0);
      expect(pool.getActiveCount()).toBe(0);
    });

    test('should handle clear on empty pool', () => {
      pool.clear();
      pool.clear(); // Clear again

      expect(pool.getPoolSize()).toBe(0);
      expect(pool.getActiveCount()).toBe(0);
    });
  });

  describe('object lifecycle', () => {
    test('should maintain object integrity through acquire/release cycles', () => {
      const obj = pool.acquire();
      const originalObj = obj;
      obj.value = 99;

      pool.release(obj);
      
      const reacquired = pool.acquire();

      expect(reacquired).toBe(originalObj); // Same object instance
      expect(reacquired.value).toBe(0); // Reset was called
      expect(reacquired.resetCalled).toBe(true);
    });

    test('should handle multiple acquire/release cycles', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        const objects = [];
        
        // Acquire multiple objects
        for (let i = 0; i < 3; i++) {
          objects.push(pool.acquire());
        }
        
        // Modify them
        objects.forEach((obj, i) => {
          obj.value = cycle * 10 + i;
        });
        
        // Release them
        objects.forEach(obj => pool.release(obj));
        
        expect(pool.getActiveCount()).toBe(0);
        expect(pool.getPoolSize()).toBeGreaterThanOrEqual(3);
      }
    });

    test('should handle interleaved acquire/release operations', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      pool.release(obj1);
      
      const obj3 = pool.acquire(); // Should reuse obj1
      const obj4 = pool.acquire();
      
      pool.release(obj2);
      pool.release(obj3);
      pool.release(obj4);

      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getPoolSize()).toBe(5);
    });
  });

  describe('performance and memory', () => {
    test('should handle high frequency acquire/release efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const obj = pool.acquire();
        obj.value = i;
        pool.release(obj);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      expect(pool.getActiveCount()).toBe(0);
      expect(createFn).toHaveBeenCalledTimes(5); // Only initial objects created
    });

    test('should reuse objects effectively', () => {
      const acquiredObjects = new Set();
      
      // Acquire and release same object multiple times
      for (let i = 0; i < 20; i++) {
        const obj = pool.acquire();
        acquiredObjects.add(obj);
        pool.release(obj);
      }
      
      // Should have reused objects, not created 20 new ones
      expect(acquiredObjects.size).toBeLessThanOrEqual(5);
      expect(createFn).toHaveBeenCalledTimes(5); // Only initial creation
    });

    test('should handle memory pressure gracefully', () => {
      // Create large number of active objects
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push(pool.acquire());
      }
      
      expect(pool.getActiveCount()).toBe(1000);
      
      // Release them all
      pool.releaseAll();
      
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getPoolSize()).toBe(1000);
    });
  });

  describe('edge cases', () => {
    test('should handle null create function', () => {
      expect(() => new ObjectPool(null, resetFn)).toThrow();
    });

    test('should handle undefined create function', () => {
      expect(() => new ObjectPool(undefined, resetFn)).toThrow();
    });

    test('should handle create function that returns null', () => {
      const nullCreateFn = () => null;
      const nullPool = new ObjectPool(nullCreateFn, resetFn, 1);
      
      const obj = nullPool.acquire();
      expect(obj).toBeNull();
    });

    test('should handle reset function that throws', () => {
      const throwingResetFn = () => { throw new Error('Reset failed'); };
      const throwingPool = new ObjectPool(createFn, throwingResetFn, 1);
      
      const obj = throwingPool.acquire();
      
      expect(() => throwingPool.release(obj)).toThrow('Reset failed');
    });

    test('should handle create function that throws', () => {
      const throwingCreateFn = () => { throw new Error('Create failed'); };
      
      expect(() => new ObjectPool(throwingCreateFn, resetFn, 1)).toThrow('Create failed');
    });

    test('should handle very large initial size', () => {
      const largeCreateFn = jest.fn(() => new MockObject());
      const largePool = new ObjectPool(largeCreateFn, resetFn, 10000);
      
      expect(largePool.getPoolSize()).toBe(10000);
      expect(largeCreateFn).toHaveBeenCalledTimes(10000);
    });
  });
});

describe('EntityPool', () => {
  let world;
  let entityPool;
  let componentFactories;

  beforeEach(() => {
    world = new World();
    componentFactories = {
      'mock': () => new MockComponent(),
      'position': () => ({ x: 0, y: 0 }),
      'velocity': () => ({ x: 0, y: 0 })
    };
    entityPool = new EntityPool(world, componentFactories, 3);
  });

  describe('constructor', () => {
    test('should initialize with world and component factories', () => {
      expect(entityPool.world).toBe(world);
      expect(entityPool.componentFactories).toBe(componentFactories);
      expect(entityPool.getPoolSize()).toBe(3);
    });

    test('should use Entity-specific create and reset functions', () => {
      const entity = entityPool.acquire();
      
      expect(entity.id).toBeDefined();
      expect(entity.active).toBe(true);
    });
  });

  describe('acquireWithComponents', () => {
    test('should acquire entity and add specified components', () => {
      const entity = entityPool.acquireWithComponents(['mock', 'position']);
      
      expect(entity.components.has('MockComponent')).toBe(true);
      expect(entity.components.has('Object')).toBe(true); // position component
      expect(entityPool.getActiveCount()).toBe(1);
    });

    test('should handle empty component list', () => {
      const entity = entityPool.acquireWithComponents([]);
      
      expect(entity.components.size).toBe(0);
      expect(entity.active).toBe(true);
    });

    test('should handle unknown component types', () => {
      const entity = entityPool.acquireWithComponents(['unknown']);
      
      expect(entity.components.size).toBe(0); // Unknown component not added
      expect(entity.active).toBe(true);
    });

    test('should handle multiple component types', () => {
      const entity = entityPool.acquireWithComponents(['mock', 'position', 'velocity']);
      
      expect(entity.components.size).toBe(3);
      expect(entity.active).toBe(true);
    });
  });

  describe('release', () => {
    test('should clear components and release entity', () => {
      const entity = entityPool.acquireWithComponents(['mock', 'position']);
      
      expect(entity.components.size).toBe(2);
      
      entityPool.release(entity);
      
      expect(entity.components.size).toBe(0);
      expect(entity.active).toBe(true);
      expect(entityPool.getActiveCount()).toBe(0);
    });

    test('should handle entity without components', () => {
      const entity = entityPool.acquire();
      
      expect(() => entityPool.release(entity)).not.toThrow();
      expect(entity.components.size).toBe(0);
    });
  });

  describe('entity lifecycle', () => {
    test('should reuse entities across acquire/release cycles', () => {
      const entity1 = entityPool.acquire();
      const originalId = entity1.id;
      
      entityPool.release(entity1);
      
      const entity2 = entityPool.acquire();
      
      expect(entity2.id).toBe(originalId); // Same entity reused
      expect(entity2.active).toBe(true);
    });

    test('should handle component reset through lifecycle', () => {
      const entity = entityPool.acquireWithComponents(['mock']);
      const component = entity.getComponent(MockComponent);
      
      component.data = 'modified';
      
      entityPool.release(entity);
      
      const reused = entityPool.acquireWithComponents(['mock']);
      const newComponent = reused.getComponent(MockComponent);
      
      expect(newComponent.data).toBe('default'); // Reset called
    });

    test('should maintain entity integrity across multiple cycles', () => {
      const entities = [];
      
      // Acquire multiple entities
      for (let i = 0; i < 5; i++) {
        entities.push(entityPool.acquireWithComponents(['mock']));
      }
      
      // Release them all
      entities.forEach(entity => entityPool.release(entity));
      
      // Acquire new entities
      const newEntities = [];
      for (let i = 0; i < 3; i++) {
        newEntities.push(entityPool.acquire());
      }
      
      expect(newEntities).toHaveLength(3);
      expect(entityPool.getActiveCount()).toBe(3);
    });
  });

  describe('integration with World', () => {
    test('should create entities that belong to world', () => {
      const entity = entityPool.acquire();
      
      expect(world.entities.has(entity)).toBe(true);
    });

    test('should handle world entity management', () => {
      const entity1 = entityPool.acquire();
      const entity2 = entityPool.acquire();
      
      expect(world.getEntityCount()).toBe(2);
      
      entityPool.release(entity1);
      entityPool.release(entity2);
      
      // Entities are still in world, just in pool
      expect(world.getEntityCount()).toBe(2);
    });

    test('should handle entity removal from world', () => {
      const entity = entityPool.acquire();
      
      world.removeEntity(entity);
      world.cleanupEntities();
      
      expect(world.entities.has(entity)).toBe(false);
      
      // Pool should still track it as active until explicitly released
      expect(entityPool.getActiveCount()).toBe(1);
    });
  });

  describe('performance with components', () => {
    test('should handle rapid entity creation with components efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const entity = entityPool.acquireWithComponents(['mock', 'position']);
        entityPool.release(entity);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(entityPool.getActiveCount()).toBe(0);
    });

    test('should reuse component instances when possible', () => {
      const entity1 = entityPool.acquireWithComponents(['mock']);
      const component1 = entity1.getComponent(MockComponent);
      
      entityPool.release(entity1);
      
      const entity2 = entityPool.acquireWithComponents(['mock']);
      const component2 = entity2.getComponent(MockComponent);
      
      // Should be different component instances
      expect(component2).not.toBe(component1);
      expect(component2.data).toBe('default');
    });
  });

  describe('edge cases', () => {
    test('should handle null component factories', () => {
      const nullPool = new EntityPool(world, null, 1);
      
      expect(() => nullPool.acquireWithComponents(['any'])).not.toThrow();
    });

    test('should handle component factory that throws', () => {
      const badFactories = {
        'bad': () => { throw new Error('Component creation failed'); }
      };
      const badPool = new EntityPool(world, badFactories, 1);
      
      expect(() => badPool.acquireWithComponents(['bad'])).not.toThrow();
    });

    test('should handle component factory that returns null', () => {
      const nullFactories = {
        'null': () => null
      };
      const nullPool = new EntityPool(world, nullFactories, 1);
      
      const entity = nullPool.acquireWithComponents(['null']);
      expect(entity.components.size).toBe(0); // Null component not added
    });

    test('should handle very large component lists', () => {
      const manyFactories = {};
      const componentTypes = [];
      
      for (let i = 0; i < 100; i++) {
        const type = `component${i}`;
        manyFactories[type] = () => ({ id: i });
        componentTypes.push(type);
      }
      
      const bigPool = new EntityPool(world, manyFactories, 1);
      
      const startTime = performance.now();
      const entity = bigPool.acquireWithComponents(componentTypes);
      const endTime = performance.now();
      
      expect(entity.components.size).toBe(100);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});