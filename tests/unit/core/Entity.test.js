/**
 * Unit tests for Entity class
 */

import { Entity } from '../../../js/core/Entity.js';
import { Component } from '../../../js/core/Component.js';

// Mock component classes for testing
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

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity();
  });

  describe('constructor', () => {
    test('should create entity with unique ID', () => {
      const entity1 = new Entity();
      const entity2 = new Entity();
      
      expect(entity1.id).toBeDefined();
      expect(entity2.id).toBeDefined();
      expect(entity1.id).not.toBe(entity2.id);
    });

    test('should initialize with empty components map', () => {
      expect(entity.components).toBeInstanceOf(Map);
      expect(entity.components.size).toBe(0);
    });

    test('should initialize as active', () => {
      expect(entity.active).toBe(true);
    });
  });

  describe('addComponent', () => {
    test('should add component successfully', () => {
      const component = new MockComponent(42);
      const result = entity.addComponent(component);

      expect(entity.components.has('MockComponent')).toBe(true);
      expect(entity.components.get('MockComponent')).toBe(component);
      expect(result).toBe(entity); // Should return entity for chaining
    });

    test('should replace existing component of same type', () => {
      const component1 = new MockComponent(1);
      const component2 = new MockComponent(2);

      entity.addComponent(component1);
      entity.addComponent(component2);

      expect(entity.components.size).toBe(1);
      expect(entity.components.get('MockComponent')).toBe(component2);
    });

    test('should allow multiple different component types', () => {
      const mockComp = new MockComponent(42);
      const anotherComp = new AnotherMockComponent('hello');

      entity.addComponent(mockComp);
      entity.addComponent(anotherComp);

      expect(entity.components.size).toBe(2);
      expect(entity.components.get('MockComponent')).toBe(mockComp);
      expect(entity.components.get('AnotherMockComponent')).toBe(anotherComp);
    });
  });

  describe('getComponent', () => {
    test('should return component if exists', () => {
      const component = new MockComponent(42);
      entity.addComponent(component);

      const retrieved = entity.getComponent(MockComponent);
      expect(retrieved).toBe(component);
    });

    test('should return undefined if component does not exist', () => {
      const retrieved = entity.getComponent(MockComponent);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('hasComponent', () => {
    test('should return true if component exists', () => {
      const component = new MockComponent(42);
      entity.addComponent(component);

      expect(entity.hasComponent(MockComponent)).toBe(true);
    });

    test('should return false if component does not exist', () => {
      expect(entity.hasComponent(MockComponent)).toBe(false);
    });
  });

  describe('removeComponent', () => {
    test('should remove component and return true if exists', () => {
      const component = new MockComponent(42);
      entity.addComponent(component);

      const result = entity.removeComponent(MockComponent);

      expect(result).toBe(true);
      expect(entity.hasComponent(MockComponent)).toBe(false);
      expect(entity.components.size).toBe(0);
    });

    test('should return false if component does not exist', () => {
      const result = entity.removeComponent(MockComponent);
      expect(result).toBe(false);
    });

    test('should not affect other components', () => {
      const mockComp = new MockComponent(42);
      const anotherComp = new AnotherMockComponent('hello');

      entity.addComponent(mockComp);
      entity.addComponent(anotherComp);

      entity.removeComponent(MockComponent);

      expect(entity.hasComponent(MockComponent)).toBe(false);
      expect(entity.hasComponent(AnotherMockComponent)).toBe(true);
      expect(entity.components.size).toBe(1);
    });
  });

  describe('hasComponents', () => {
    test('should return true if entity has all specified components', () => {
      const mockComp = new MockComponent(42);
      const anotherComp = new AnotherMockComponent('hello');

      entity.addComponent(mockComp);
      entity.addComponent(anotherComp);

      expect(entity.hasComponents([MockComponent, AnotherMockComponent])).toBe(true);
    });

    test('should return false if entity is missing any component', () => {
      const mockComp = new MockComponent(42);
      entity.addComponent(mockComp);

      expect(entity.hasComponents([MockComponent, AnotherMockComponent])).toBe(false);
    });

    test('should return true for empty component array', () => {
      expect(entity.hasComponents([])).toBe(true);
    });

    test('should return true if entity has single specified component', () => {
      const mockComp = new MockComponent(42);
      entity.addComponent(mockComp);

      expect(entity.hasComponents([MockComponent])).toBe(true);
    });
  });

  describe('destroy', () => {
    test('should mark entity as inactive', () => {
      expect(entity.active).toBe(true);
      
      entity.destroy();
      
      expect(entity.active).toBe(false);
    });

    test('should not affect components when destroyed', () => {
      const component = new MockComponent(42);
      entity.addComponent(component);

      entity.destroy();

      expect(entity.hasComponent(MockComponent)).toBe(true);
      expect(entity.components.size).toBe(1);
    });
  });

  describe('getComponentNames', () => {
    test('should return empty array for entity with no components', () => {
      const names = entity.getComponentNames();
      expect(names).toEqual([]);
    });

    test('should return array of component names', () => {
      const mockComp = new MockComponent(42);
      const anotherComp = new AnotherMockComponent('hello');

      entity.addComponent(mockComp);
      entity.addComponent(anotherComp);

      const names = entity.getComponentNames();
      expect(names).toContain('MockComponent');
      expect(names).toContain('AnotherMockComponent');
      expect(names).toHaveLength(2);
    });
  });

  describe('ID generation', () => {
    test('should generate sequential unique IDs', () => {
      const entities = [];
      for (let i = 0; i < 10; i++) {
        entities.push(new Entity());
      }

      const ids = entities.map(e => e.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10); // All IDs should be unique
      
      // IDs should be sequential
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBe(ids[i-1] + 1);
      }
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined component gracefully', () => {
      expect(() => entity.addComponent(null)).toThrow();
      expect(() => entity.addComponent(undefined)).toThrow();
    });

    test('should handle component with no constructor name', () => {
      const anonymousComponent = Object.create(Component.prototype);
      anonymousComponent.constructor = { name: 'AnonymousComponent' };
      
      entity.addComponent(anonymousComponent);
      expect(entity.hasComponent({ name: 'AnonymousComponent' })).toBe(true);
    });
  });
});