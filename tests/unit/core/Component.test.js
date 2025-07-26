/**
 * Unit tests for Component class
 */

import { Component } from '../../../js/core/Component.js';

// Test component classes
class TestComponent extends Component {
  constructor(value = 0, name = 'test') {
    super();
    this.value = value;
    this.name = name;
    this.isTest = true;
  }

  reset() {
    this.value = 0;
    this.name = 'test';
    this.isTest = true;
  }
}

class ComplexComponent extends Component {
  constructor() {
    super();
    this.data = {
      x: 10,
      y: 20,
      config: {
        enabled: true,
        speed: 100
      }
    };
    this.items = [1, 2, 3];
  }

  reset() {
    this.data = {
      x: 0,
      y: 0,
      config: {
        enabled: false,
        speed: 0
      }
    };
    this.items = [];
  }
}

describe('Component', () => {
  describe('constructor', () => {
    test('should create base component instance', () => {
      const component = new Component();
      expect(component).toBeInstanceOf(Component);
    });

    test('should allow subclass construction', () => {
      const testComp = new TestComponent(42, 'hello');
      
      expect(testComp).toBeInstanceOf(Component);
      expect(testComp).toBeInstanceOf(TestComponent);
      expect(testComp.value).toBe(42);
      expect(testComp.name).toBe('hello');
      expect(testComp.isTest).toBe(true);
    });
  });

  describe('clone', () => {
    test('should clone simple component with all properties', () => {
      const original = new TestComponent(99, 'original');
      const cloned = original.clone();

      expect(cloned).not.toBe(original); // Different instances
      expect(cloned).toBeInstanceOf(TestComponent);
      expect(cloned.value).toBe(original.value);
      expect(cloned.name).toBe(original.name);
      expect(cloned.isTest).toBe(original.isTest);
    });

    test('should clone complex component with nested objects', () => {
      const original = new ComplexComponent();
      original.data.x = 100;
      original.data.config.speed = 200;
      original.items.push(4, 5);

      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned).toBeInstanceOf(ComplexComponent);
      expect(cloned.data.x).toBe(100);
      expect(cloned.data.config.speed).toBe(200);
      expect(cloned.items).toEqual([1, 2, 3, 4, 5]);
    });

    test('should create shallow copy (references shared for objects)', () => {
      const original = new ComplexComponent();
      const cloned = original.clone();

      // Modify nested object in cloned
      cloned.data.x = 999;
      
      // Original should also be affected (shallow copy)
      expect(original.data.x).toBe(999);
    });

    test('should handle component with no additional properties', () => {
      const original = new Component();
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned).toBeInstanceOf(Component);
    });

    test('should preserve constructor reference', () => {
      const original = new TestComponent();
      const cloned = original.clone();

      expect(cloned.constructor).toBe(TestComponent);
      expect(cloned.constructor.name).toBe('TestComponent');
    });
  });

  describe('reset', () => {
    test('should call reset method on component with reset implementation', () => {
      const component = new TestComponent(999, 'modified');
      component.isTest = false;

      component.reset();

      expect(component.value).toBe(0);
      expect(component.name).toBe('test');
      expect(component.isTest).toBe(true);
    });

    test('should handle reset on complex component', () => {
      const component = new ComplexComponent();
      component.data.x = 999;
      component.data.config.enabled = false;
      component.items.push(99);

      component.reset();

      expect(component.data.x).toBe(0);
      expect(component.data.y).toBe(0);
      expect(component.data.config.enabled).toBe(false);
      expect(component.data.config.speed).toBe(0);
      expect(component.items).toEqual([]);
    });

    test('should not throw error on base component without reset implementation', () => {
      const component = new Component();
      
      expect(() => component.reset()).not.toThrow();
    });
  });

  describe('inheritance and polymorphism', () => {
    test('should support multiple levels of inheritance', () => {
      class BaseGameComponent extends Component {
        constructor() {
          super();
          this.type = 'base';
        }
      }

      class SpecificGameComponent extends BaseGameComponent {
        constructor() {
          super();
          this.type = 'specific';
          this.special = true;
        }

        reset() {
          this.type = 'specific';
          this.special = false;
        }
      }

      const component = new SpecificGameComponent();
      
      expect(component).toBeInstanceOf(Component);
      expect(component).toBeInstanceOf(BaseGameComponent);
      expect(component).toBeInstanceOf(SpecificGameComponent);
      expect(component.type).toBe('specific');
      expect(component.special).toBe(true);

      component.reset();
      expect(component.special).toBe(false);
    });
  });

  describe('object pooling compatibility', () => {
    test('should support object pooling workflow', () => {
      // Create original component
      const original = new TestComponent(100, 'pooled');
      
      // Clone for pool
      const pooled = original.clone();
      expect(pooled.value).toBe(100);
      expect(pooled.name).toBe('pooled');
      
      // Modify the pooled instance
      pooled.value = 999;
      pooled.name = 'used';
      pooled.isTest = false;
      
      // Reset before returning to pool
      pooled.reset();
      expect(pooled.value).toBe(0);
      expect(pooled.name).toBe('test');
      expect(pooled.isTest).toBe(true);
      
      // Original should be unchanged
      expect(original.value).toBe(100);
      expect(original.name).toBe('pooled');
    });

    test('should handle rapid clone and reset cycles', () => {
      const original = new TestComponent(42, 'template');
      
      for (let i = 0; i < 100; i++) {
        const cloned = original.clone();
        cloned.value = i;
        cloned.name = `instance-${i}`;
        
        expect(cloned.value).toBe(i);
        expect(cloned.name).toBe(`instance-${i}`);
        
        cloned.reset();
        
        expect(cloned.value).toBe(0);
        expect(cloned.name).toBe('test');
      }
      
      // Original should remain unchanged
      expect(original.value).toBe(42);
      expect(original.name).toBe('template');
    });
  });

  describe('edge cases', () => {
    test('should handle component with undefined properties', () => {
      class WeirdComponent extends Component {
        constructor() {
          super();
          this.definedProp = 'defined';
          this.undefinedProp = undefined;
          this.nullProp = null;
        }
      }

      const component = new WeirdComponent();
      const cloned = component.clone();

      expect(cloned.definedProp).toBe('defined');
      expect(cloned.undefinedProp).toBeUndefined();
      expect(cloned.nullProp).toBeNull();
    });

    test('should handle component with function properties', () => {
      class FunctionComponent extends Component {
        constructor() {
          super();
          this.data = 42;
          this.method = function() { return this.data * 2; };
        }
      }

      const original = new FunctionComponent();
      const cloned = original.clone();

      expect(typeof cloned.method).toBe('function');
      expect(cloned.method()).toBe(84);
    });

    test('should handle component with circular references gracefully', () => {
      class CircularComponent extends Component {
        constructor() {
          super();
          this.self = this;
          this.data = { parent: this };
        }
      }

      const component = new CircularComponent();
      
      // Clone should not throw, but may not deep clone circular refs
      expect(() => component.clone()).not.toThrow();
    });
  });
});