/**
 * Unit tests for System class
 */

import { System } from '../../../js/core/System.js';
import { World } from '../../../js/core/World.js';
import { Entity } from '../../../js/core/Entity.js';
import { Component } from '../../../js/core/Component.js';

// Mock components for testing
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

// Test system implementations
class TestSystem extends System {
  constructor(world) {
    super(world);
    this.processedEntities = [];
    this.processCallCount = 0;
    this.lastDeltaTime = 0;
  }

  processEntity(entity, deltaTime) {
    this.processedEntities.push(entity.id);
    this.processCallCount++;
    this.lastDeltaTime = deltaTime;
  }
}

class FilteredSystem extends System {
  constructor(world) {
    super(world);
    this.setRequiredComponents([MockComponent]);
    this.processedEntities = [];
  }

  processEntity(entity, deltaTime) {
    this.processedEntities.push(entity.id);
  }
}

class MultiComponentSystem extends System {
  constructor(world) {
    super(world);
    this.setRequiredComponents([MockComponent, AnotherMockComponent]);
    this.processedEntities = [];
  }

  processEntity(entity, deltaTime) {
    this.processedEntities.push(entity.id);
  }
}

describe('System', () => {
  let world;
  let system;

  beforeEach(() => {
    world = new World();
    system = new TestSystem(world);
  });

  describe('constructor', () => {
    test('should initialize with world reference', () => {
      expect(system.world).toBe(world);
    });

    test('should initialize with empty required components', () => {
      expect(system.requiredComponents).toEqual([]);
    });

    test('should initialize with empty entity set', () => {
      expect(system.entities).toBeInstanceOf(Set);
      expect(system.entities.size).toBe(0);
    });

    test('should initialize as enabled', () => {
      expect(system.enabled).toBe(true);
    });
  });

  describe('setRequiredComponents', () => {
    test('should set required components array', () => {
      const components = [MockComponent, AnotherMockComponent];
      system.setRequiredComponents(components);

      expect(system.requiredComponents).toBe(components);
    });

    test('should handle empty components array', () => {
      system.setRequiredComponents([]);
      expect(system.requiredComponents).toEqual([]);
    });

    test('should replace existing required components', () => {
      system.setRequiredComponents([MockComponent]);
      system.setRequiredComponents([AnotherMockComponent]);

      expect(system.requiredComponents).toEqual([AnotherMockComponent]);
    });
  });

  describe('setEnabled', () => {
    test('should enable system', () => {
      system.setEnabled(true);
      expect(system.enabled).toBe(true);
    });

    test('should disable system', () => {
      system.setEnabled(false);
      expect(system.enabled).toBe(false);
    });
  });

  describe('matchesRequirements', () => {
    test('should return true for entity with no required components', () => {
      const entity = world.createEntity();
      
      expect(system.matchesRequirements(entity)).toBe(true);
    });

    test('should return true for entity with required components', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      
      expect(system.matchesRequirements(entity)).toBe(true);
    });

    test('should return false for entity missing required components', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      
      system.setRequiredComponents([AnotherMockComponent]);
      
      expect(system.matchesRequirements(entity)).toBe(false);
    });

    test('should return true for entity with all multiple required components', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      entity.addComponent(new AnotherMockComponent());
      
      system.setRequiredComponents([MockComponent, AnotherMockComponent]);
      
      expect(system.matchesRequirements(entity)).toBe(true);
    });

    test('should return false for entity missing one of multiple required components', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent, AnotherMockComponent]);
      
      expect(system.matchesRequirements(entity)).toBe(false);
    });
  });

  describe('updateEntityList', () => {
    test('should add matching entities to system entity list', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      entity1.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      system.updateEntityList();

      expect(system.entities.has(entity1)).toBe(true);
      expect(system.entities.has(entity2)).toBe(false);
      expect(system.entities.size).toBe(1);
    });

    test('should exclude inactive entities', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      entity.destroy(); // Mark as inactive
      
      system.setRequiredComponents([MockComponent]);
      system.updateEntityList();

      expect(system.entities.has(entity)).toBe(false);
      expect(system.entities.size).toBe(0);
    });

    test('should clear previous entity list', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      system.updateEntityList();
      
      expect(system.entities.size).toBe(1);
      
      // Remove component so entity no longer matches
      entity1.removeComponent(MockComponent);
      system.updateEntityList();
      
      expect(system.entities.size).toBe(0);
    });

    test('should handle entities with no required components', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      system.updateEntityList();

      expect(system.entities.size).toBe(2);
      expect(system.entities.has(entity1)).toBe(true);
      expect(system.entities.has(entity2)).toBe(true);
    });
  });

  describe('update', () => {
    test('should update entity list and process matching entities', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      entity1.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      system.update(0.016);

      expect(system.processedEntities).toHaveLength(1);
      expect(system.processedEntities).toContain(entity1.id);
      expect(system.processedEntities).not.toContain(entity2.id);
      expect(system.lastDeltaTime).toBe(0.016);
    });

    test('should not process entities when disabled', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      system.setEnabled(false);
      system.update(0.016);

      expect(system.processedEntities).toHaveLength(0);
    });

    test('should skip inactive entities during processing', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      entity1.addComponent(new MockComponent());
      entity2.addComponent(new MockComponent());
      entity2.destroy(); // Mark as inactive
      
      system.setRequiredComponents([MockComponent]);
      system.update(0.016);

      expect(system.processedEntities).toHaveLength(1);
      expect(system.processedEntities).toContain(entity1.id);
      expect(system.processedEntities).not.toContain(entity2.id);
    });

    test('should handle update with no matching entities', () => {
      system.setRequiredComponents([MockComponent]);
      
      expect(() => system.update(0.016)).not.toThrow();
      expect(system.processedEntities).toHaveLength(0);
    });

    test('should pass deltaTime to processEntity', () => {
      const entity = world.createEntity();
      const deltaTime = 0.033;
      
      system.update(deltaTime);

      expect(system.lastDeltaTime).toBe(deltaTime);
    });
  });

  describe('processEntity', () => {
    test('should be called for each matching entity', () => {
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      system.update(0.016);

      expect(system.processCallCount).toBe(2);
    });

    test('should receive correct entity and deltaTime', () => {
      const entity = world.createEntity();
      const deltaTime = 0.016;
      
      system.update(deltaTime);

      expect(system.processedEntities).toContain(entity.id);
      expect(system.lastDeltaTime).toBe(deltaTime);
    });
  });

  describe('init', () => {
    test('should not throw error when called', () => {
      expect(() => system.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    test('should clear entity list', () => {
      const entity = world.createEntity();
      system.updateEntityList();
      
      expect(system.entities.size).toBe(1);
      
      system.destroy();
      
      expect(system.entities.size).toBe(0);
    });
  });

  describe('system integration scenarios', () => {
    test('should work with filtered system', () => {
      const filteredSystem = new FilteredSystem(world);
      
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      
      entity1.addComponent(new MockComponent(42));
      
      filteredSystem.update(0.016);

      expect(filteredSystem.processedEntities).toHaveLength(1);
      expect(filteredSystem.processedEntities).toContain(entity1.id);
    });

    test('should work with multi-component requirements', () => {
      const multiSystem = new MultiComponentSystem(world);
      
      const entity1 = world.createEntity();
      const entity2 = world.createEntity();
      const entity3 = world.createEntity();
      
      entity1.addComponent(new MockComponent());
      entity1.addComponent(new AnotherMockComponent());
      
      entity2.addComponent(new MockComponent());
      
      entity3.addComponent(new AnotherMockComponent());
      
      multiSystem.update(0.016);

      expect(multiSystem.processedEntities).toHaveLength(1);
      expect(multiSystem.processedEntities).toContain(entity1.id);
    });

    test('should handle dynamic component changes', () => {
      const filteredSystem = new FilteredSystem(world);
      const entity = world.createEntity();
      
      // Initially no matching entities
      filteredSystem.update(0.016);
      expect(filteredSystem.processedEntities).toHaveLength(0);
      
      // Add component - should now match
      entity.addComponent(new MockComponent());
      filteredSystem.processedEntities = []; // Reset
      filteredSystem.update(0.016);
      expect(filteredSystem.processedEntities).toHaveLength(1);
      
      // Remove component - should no longer match
      entity.removeComponent(MockComponent);
      filteredSystem.processedEntities = []; // Reset
      filteredSystem.update(0.016);
      expect(filteredSystem.processedEntities).toHaveLength(0);
    });
  });

  describe('performance considerations', () => {
    test('should handle large numbers of entities efficiently', () => {
      const filteredSystem = new FilteredSystem(world);
      
      // Create many entities, half with required component
      for (let i = 0; i < 1000; i++) {
        const entity = world.createEntity();
        if (i % 2 === 0) {
          entity.addComponent(new MockComponent(i));
        }
      }
      
      const startTime = performance.now();
      filteredSystem.update(0.016);
      const endTime = performance.now();
      
      expect(filteredSystem.processedEntities).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
    });

    test('should handle frequent enable/disable efficiently', () => {
      const entity = world.createEntity();
      entity.addComponent(new MockComponent());
      
      system.setRequiredComponents([MockComponent]);
      
      for (let i = 0; i < 100; i++) {
        system.setEnabled(i % 2 === 0);
        system.update(0.016);
      }
      
      // Should not cause performance issues or errors
      expect(system.processCallCount).toBeGreaterThan(0);
      expect(system.processCallCount).toBeLessThan(100); // Some updates were disabled
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined world gracefully', () => {
      expect(() => new System(null)).not.toThrow();
      expect(() => new System(undefined)).not.toThrow();
    });

    test('should handle empty required components array', () => {
      system.setRequiredComponents([]);
      const entity = world.createEntity();
      
      system.update(0.016);
      
      expect(system.processedEntities).toContain(entity.id);
    });

    test('should handle entity with many components', () => {
      const entity = world.createEntity();
      
      // Add many components
      for (let i = 0; i < 10; i++) {
        entity.addComponent(new MockComponent(i));
      }
      
      system.setRequiredComponents([MockComponent]);
      system.update(0.016);
      
      expect(system.processedEntities).toContain(entity.id);
    });

    test('should handle system with no world entities', () => {
      expect(() => system.update(0.016)).not.toThrow();
      expect(system.processedEntities).toHaveLength(0);
    });
  });
});