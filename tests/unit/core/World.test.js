/**
 * Unit tests for World class
 */

import { World } from '../../../js/core/World.js';
import { Entity } from '../../../js/core/Entity.js';
import { System } from '../../../js/core/System.js';
import { Component } from '../../../js/core/Component.js';

// Mock components
class MockComponent extends Component {
  constructor(value = 0) {
    super();
    this.value = value;
  }
}

class AnotherMockComponent extends Component {
  constructor(name = 'test') {
    super();
    this.name = name;
  }
}

// Mock systems
class MockSystem extends System {
  constructor(world) {
    super(world);
    this.initCalled = false;
    this.updateCalled = false;
    this.destroyCalled = false;
    this.updateCount = 0;
  }

  init() {
    this.initCalled = true;
  }

  update(deltaTime) {
    this.updateCalled = true;
    this.updateCount++;
    this.lastDeltaTime = deltaTime;
  }

  destroy() {
    this.destroyCalled = true;
  }
}

class FilteringSystem extends System {
  constructor(world) {
    super(world);
    this.setRequiredComponents([MockComponent]);
    this.processedEntities = [];
  }

  processEntity(entity, deltaTime) {
    this.processedEntities.push(entity.id);
  }
}

describe('World', () => {
  let world;

  beforeEach(() => {
    world = new World();
  });

  describe('constructor', () => {
    test('should initialize with empty collections', () => {
      expect(world.entities).toBeInstanceOf(Set);
      expect(world.entities.size).toBe(0);
      expect(world.systems).toBeInstanceOf(Map);
      expect(world.systems.size).toBe(0);
      expect(world.entitiesToRemove).toBeInstanceOf(Set);
      expect(world.entitiesToRemove.size).toBe(0);
    });
  });

  describe('createEntity', () => {
    test('should create and add new entity to world', () => {
      const entity = world.createEntity();

      expect(entity).toBeInstanceOf(Entity);
      expect(world.entities.has(entity)).toBe(true);
      expect(world.entities.size).toBe(1);
    });

    test('should create entities with unique IDs', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      expect(entity1.id).not.toBe(entity2.id);
      expect(world.entities.size).toBe(2);
    });
  });

  describe('addEntity', () => {
    test('should add existing entity to world', () => {
      const entity = new Entity();
      world.addEntity(entity);

      expect(world.entities.has(entity)).toBe(true);
      expect(world.entities.size).toBe(1);
    });

    test('should handle adding same entity multiple times', () => {
      const entity = new Entity();
      world.addEntity(entity);
      world.addEntity(entity);

      expect(world.entities.size).toBe(1);
    });
  });

  describe('removeEntity', () => {
    test('should mark entity for removal', () => {
      const entity = world.createEntity();
      world.removeEntity(entity);

      expect(world.entitiesToRemove.has(entity)).toBe(true);
      expect(world.entities.has(entity)).toBe(true); // Not removed yet
    });

    test('should handle removing non-existent entity', () => {
      const entity = new Entity();
      world.removeEntity(entity);

      expect(world.entitiesToRemove.has(entity)).toBe(true);
      expect(() => world.cleanupEntities()).not.toThrow();
    });
  });

  describe('addSystem', () => {
    test('should add system and call init', () => {
      const system = new MockSystem(world);
      world.addSystem('mock', system);

      expect(world.systems.get('mock')).toBe(system);
      expect(system.initCalled).toBe(true);
    });

    test('should replace existing system with same name', () => {
      const system1 = new MockSystem(world);
      const system2 = new MockSystem(world);

      world.addSystem('mock', system1);
      world.addSystem('mock', system2);

      expect(world.systems.get('mock')).toBe(system2);
      expect(world.systems.size).toBe(1);
    });
  });

  describe('getSystem', () => {
    test('should return system by name', () => {
      const system = new MockSystem(world);
      world.addSystem('mock', system);

      const retrieved = world.getSystem('mock');
      expect(retrieved).toBe(system);
    });

    test('should return undefined for non-existent system', () => {
      const retrieved = world.getSystem('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('removeSystem', () => {
    test('should remove system and call destroy', () => {
      const system = new MockSystem(world);
      world.addSystem('mock', system);

      world.removeSystem('mock');

      expect(world.systems.has('mock')).toBe(false);
      expect(system.destroyCalled).toBe(true);
    });

    test('should handle removing non-existent system', () => {
      expect(() => world.removeSystem('nonexistent')).not.toThrow();
    });
  });

  describe('update', () => {
    test('should update all systems', () => {
      const system1 = new MockSystem(world);
      const system2 = new MockSystem(world);

      world.addSystem('system1', system1);
      world.addSystem('system2', system2);

      world.update(0.016);

      expect(system1.updateCalled).toBe(true);
      expect(system2.updateCalled).toBe(true);
      expect(system1.lastDeltaTime).toBe(0.016);
      expect(system2.lastDeltaTime).toBe(0.016);
    });

    test('should cleanup entities after systems update', () => {
      const entity = world.createEntity();
      world.removeEntity(entity);

      expect(world.entities.has(entity)).toBe(true);
      
      world.update(0.016);

      expect(world.entities.has(entity)).toBe(false);
      expect(world.entitiesToRemove.size).toBe(0);
    });

    test('should handle update with no systems', () => {
      expect(() => world.update(0.016)).not.toThrow();
    });
  });

  describe('cleanupEntities', () => {
    test('should remove inactive entities', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      entity1.destroy(); // Mark as inactive

      world.cleanupEntities();

      expect(world.entities.has(entity1)).toBe(false);
      expect(world.entities.has(entity2)).toBe(true);
      expect(world.entities.size).toBe(1);
    });

    test('should remove entities marked for removal', () => {
      const entity = world.createEntity();
      world.removeEntity(entity);

      world.cleanupEntities();

      expect(world.entities.has(entity)).toBe(false);
      expect(world.entitiesToRemove.size).toBe(0);
    });

    test('should handle cleanup with no entities to remove', () => {
      const entity = world.createEntity();
      
      expect(() => world.cleanupEntities()).not.toThrow();
      expect(world.entities.has(entity)).toBe(true);
    });
  });

  describe('getEntitiesWithComponents', () => {
    test('should return entities with all specified components', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      const entity3 = world.createEntity();

      entity1.addComponent(new MockComponent(1));
      entity1.addComponent(new AnotherMockComponent('one'));

      entity2.addComponent(new MockComponent(2));

      entity3.addComponent(new AnotherMockComponent('three'));

      const result = world.getEntitiesWithComponents([MockComponent, AnotherMockComponent]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(entity1);
    });

    test('should return empty array if no entities match', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent(1));

      const result = world.getEntitiesWithComponents([AnotherMockComponent]);

      expect(result).toHaveLength(0);
    });

    test('should not return inactive entities', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent(1));
      entity.destroy(); // Mark as inactive

      const result = world.getEntitiesWithComponents([MockComponent]);

      expect(result).toHaveLength(0);
    });

    test('should handle empty component array', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      const result = world.getEntitiesWithComponents([]);

      expect(result).toHaveLength(2);
      expect(result).toContain(entity1);
      expect(result).toContain(entity2);
    });
  });

  describe('getEntityWithComponents', () => {
    test('should return first entity with all specified components', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();

      entity1.addComponent(new MockComponent(1));
      entity2.addComponent(new MockComponent(2));

      const result = world.getEntityWithComponents([MockComponent]);

      expect(result).toBe(entity1); // First entity added
    });

    test('should return null if no entities match', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent(1));

      const result = world.getEntityWithComponents([AnotherMockComponent]);

      expect(result).toBeNull();
    });

    test('should not return inactive entities', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent(1));
      entity.destroy();

      const result = world.getEntityWithComponents([MockComponent]);

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    test('should clear all entities and systems', () => {
      const system = new MockSystem(world);
      const entity = world.createEntity();

      world.addSystem('mock', system);

      world.clear();

      expect(world.entities.size).toBe(0);
      expect(world.systems.size).toBe(0);
      expect(world.entitiesToRemove.size).toBe(0);
      expect(system.destroyCalled).toBe(true);
    });
  });

  describe('getEntityCount', () => {
    test('should return correct entity count', () => {
      expect(world.getEntityCount()).toBe(0);

      world.createEntity();
      expect(world.getEntityCount()).toBe(1);

      world.createEntity();
      expect(world.getEntityCount()).toBe(2);
    });
  });

  describe('getSystemCount', () => {
    test('should return correct system count', () => {
      expect(world.getSystemCount()).toBe(0);

      world.addSystem('system1', new MockSystem(world));
      expect(world.getSystemCount()).toBe(1);

      world.addSystem('system2', new MockSystem(world));
      expect(world.getSystemCount()).toBe(2);
    });
  });

  describe('system integration', () => {
    test('should pass correct entities to filtering systems', () => {
      const system = new FilteringSystem(world);
      world.addSystem('filtering', system);

      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      const entity3 = world.createEntity();

      entity1.addComponent(new MockComponent(1));
      entity3.addComponent(new MockComponent(3));

      world.update(0.016);

      expect(system.processedEntities).toHaveLength(2);
      expect(system.processedEntities).toContain(entity1.id);
      expect(system.processedEntities).toContain(entity3.id);
      expect(system.processedEntities).not.toContain(entity2.id);
    });

    test('should handle systems added in different orders', () => {
      const system1 = new MockSystem(world);
      const system2 = new MockSystem(world);

      world.addSystem('second', system2);
      world.addSystem('first', system1);

      world.update(0.016);

      expect(system1.updateCalled).toBe(true);
      expect(system2.updateCalled).toBe(true);
    });
  });

  describe('performance and memory', () => {
    test('should handle large number of entities efficiently', () => {
      const startTime = performance.now();
      
      // Create many entities
      for (let i = 0; i < 1000; i++) {
        const entity = world.createEntity();
        entity.addComponent(new MockComponent(i));
      }

      const createTime = performance.now() - startTime;
      expect(createTime).toBeLessThan(100); // Should create 1000 entities quickly

      const queryStartTime = performance.now();
      const entities = world.getEntitiesWithComponents([MockComponent]);
      const queryTime = performance.now() - queryStartTime;

      expect(entities).toHaveLength(1000);
      expect(queryTime).toBeLessThan(50); // Should query quickly
    });

    test('should cleanup efficiently', () => {
      // Create and remove many entities
      for (let i = 0; i < 100; i++) {
        const entity = world.createEntity();
        world.removeEntity(entity);
      }

      const startTime = performance.now();
      world.cleanupEntities();
      const cleanupTime = performance.now() - startTime;

      expect(world.entities.size).toBe(0);
      expect(cleanupTime).toBeLessThan(10); // Should cleanup quickly
    });
  });
});