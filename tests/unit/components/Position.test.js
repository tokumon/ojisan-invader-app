/**
 * Unit tests for Position component
 */

import { Position } from '../../../js/components/Position.js';
import { Component } from '../../../js/core/Component.js';

describe('Position', () => {
  let position;

  beforeEach(() => {
    position = new Position();
  });

  describe('constructor', () => {
    test('should extend Component', () => {
      expect(position).toBeInstanceOf(Component);
      expect(position).toBeInstanceOf(Position);
    });

    test('should initialize with default values (0, 0)', () => {
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    test('should initialize with provided values', () => {
      const pos = new Position(100, 200);
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    test('should handle negative values', () => {
      const pos = new Position(-50, -75);
      expect(pos.x).toBe(-50);
      expect(pos.y).toBe(-75);
    });

    test('should handle floating point values', () => {
      const pos = new Position(3.14, 2.71);
      expect(pos.x).toBeCloseTo(3.14);
      expect(pos.y).toBeCloseTo(2.71);
    });
  });

  describe('set', () => {
    test('should set both x and y coordinates', () => {
      position.set(150, 250);
      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    test('should overwrite existing values', () => {
      position.x = 100;
      position.y = 200;
      
      position.set(50, 75);
      
      expect(position.x).toBe(50);
      expect(position.y).toBe(75);
    });

    test('should handle negative values', () => {
      position.set(-10, -20);
      expect(position.x).toBe(-10);
      expect(position.y).toBe(-20);
    });

    test('should handle zero values', () => {
      position.x = 100;
      position.y = 200;
      
      position.set(0, 0);
      
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    test('should handle floating point values', () => {
      position.set(1.5, 2.7);
      expect(position.x).toBeCloseTo(1.5);
      expect(position.y).toBeCloseTo(2.7);
    });
  });

  describe('add', () => {
    test('should add to existing coordinates', () => {
      position.x = 100;
      position.y = 200;
      
      position.add(50, 75);
      
      expect(position.x).toBe(150);
      expect(position.y).toBe(275);
    });

    test('should handle negative deltas', () => {
      position.x = 100;
      position.y = 200;
      
      position.add(-30, -40);
      
      expect(position.x).toBe(70);
      expect(position.y).toBe(160);
    });

    test('should handle zero deltas', () => {
      position.x = 100;
      position.y = 200;
      
      position.add(0, 0);
      
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    test('should handle floating point deltas', () => {
      position.x = 10;
      position.y = 20;
      
      position.add(1.5, 2.3);
      
      expect(position.x).toBeCloseTo(11.5);
      expect(position.y).toBeCloseTo(22.3);
    });

    test('should work with default position (0, 0)', () => {
      position.add(25, 35);
      
      expect(position.x).toBe(25);
      expect(position.y).toBe(35);
    });

    test('should handle large values', () => {
      position.x = 1000000;
      position.y = 2000000;
      
      position.add(500000, 750000);
      
      expect(position.x).toBe(1500000);
      expect(position.y).toBe(2750000);
    });
  });

  describe('reset', () => {
    test('should reset coordinates to (0, 0)', () => {
      position.x = 100;
      position.y = 200;
      
      position.reset();
      
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    test('should reset from negative values', () => {
      position.x = -50;
      position.y = -75;
      
      position.reset();
      
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    test('should reset from floating point values', () => {
      position.x = 3.14159;
      position.y = 2.71828;
      
      position.reset();
      
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe('clone', () => {
    test('should create new Position instance with same values', () => {
      position.x = 150;
      position.y = 250;
      
      const cloned = position.clone();
      
      expect(cloned).toBeInstanceOf(Position);
      expect(cloned).not.toBe(position); // Different instances
      expect(cloned.x).toBe(150);
      expect(cloned.y).toBe(250);
    });

    test('should clone default values', () => {
      const cloned = position.clone();
      
      expect(cloned.x).toBe(0);
      expect(cloned.y).toBe(0);
    });

    test('should clone negative values', () => {
      position.x = -100;
      position.y = -200;
      
      const cloned = position.clone();
      
      expect(cloned.x).toBe(-100);
      expect(cloned.y).toBe(-200);
    });

    test('should clone floating point values', () => {
      position.x = 1.23;
      position.y = 4.56;
      
      const cloned = position.clone();
      
      expect(cloned.x).toBeCloseTo(1.23);
      expect(cloned.y).toBeCloseTo(4.56);
    });

    test('should create independent instances', () => {
      position.x = 100;
      position.y = 200;
      
      const cloned = position.clone();
      
      // Modify original
      position.x = 500;
      position.y = 600;
      
      // Clone should be unchanged
      expect(cloned.x).toBe(100);
      expect(cloned.y).toBe(200);
    });
  });

  describe('object pooling compatibility', () => {
    test('should support typical pooling workflow', () => {
      // Set initial values
      position.set(100, 200);
      
      // Clone for pool usage
      const pooled = position.clone();
      expect(pooled.x).toBe(100);
      expect(pooled.y).toBe(200);
      
      // Use pooled instance
      pooled.add(50, 75);
      expect(pooled.x).toBe(150);
      expect(pooled.y).toBe(275);
      
      // Reset before returning to pool
      pooled.reset();
      expect(pooled.x).toBe(0);
      expect(pooled.y).toBe(0);
      
      // Original should be unchanged
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    test('should handle multiple clone/reset cycles', () => {
      position.set(10, 20);
      
      for (let i = 0; i < 10; i++) {
        const cloned = position.clone();
        cloned.add(i * 10, i * 20);
        cloned.reset();
        
        expect(cloned.x).toBe(0);
        expect(cloned.y).toBe(0);
      }
      
      // Original should remain unchanged
      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
    });
  });

  describe('mathematical operations', () => {
    test('should handle chained operations', () => {
      position.set(10, 20);
      position.add(5, 10);
      position.add(-2, -3);
      
      expect(position.x).toBe(13);
      expect(position.y).toBe(27);
    });

    test('should handle precision with floating point arithmetic', () => {
      position.set(0.1, 0.2);
      position.add(0.2, 0.1);
      
      // Use toBeCloseTo for floating point comparison
      expect(position.x).toBeCloseTo(0.3);
      expect(position.y).toBeCloseTo(0.3);
    });

    test('should handle very large numbers', () => {
      const large = Number.MAX_SAFE_INTEGER - 1000;
      position.set(large, large);
      position.add(500, 500);
      
      expect(position.x).toBe(large + 500);
      expect(position.y).toBe(large + 500);
    });

    test('should handle very small numbers', () => {
      const small = Number.MIN_VALUE;
      position.set(small, small);
      position.add(small, small);
      
      expect(position.x).toBe(small * 2);
      expect(position.y).toBe(small * 2);
    });
  });

  describe('edge cases', () => {
    test('should handle Infinity values', () => {
      position.set(Infinity, -Infinity);
      expect(position.x).toBe(Infinity);
      expect(position.y).toBe(-Infinity);
      
      position.add(100, 200);
      expect(position.x).toBe(Infinity);
      expect(position.y).toBe(-Infinity);
    });

    test('should handle NaN values', () => {
      position.set(NaN, NaN);
      expect(position.x).toBeNaN();
      expect(position.y).toBeNaN();
    });

    test('should handle undefined/null inputs gracefully', () => {
      // These should coerce to 0 or NaN
      position.set(undefined, null);
      expect(position.x).toBeNaN();
      expect(position.y).toBe(0);
    });

    test('should handle string inputs that can be coerced to numbers', () => {
      position.set('100', '200');
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
      
      position.add('50', '75');
      expect(position.x).toBe(150);
      expect(position.y).toBe(275);
    });
  });

  describe('integration with Component base class', () => {
    test('should inherit Component methods', () => {
      expect(typeof position.clone).toBe('function');
      expect(typeof position.reset).toBe('function');
    });

    test('should work with Component.clone if not overridden', () => {
      // Test that the overridden clone works correctly
      const originalClone = Component.prototype.clone;
      
      // Temporarily remove override to test base functionality
      delete Position.prototype.clone;
      
      position.x = 50;
      position.y = 100;
      
      const baseCloned = originalClone.call(position);
      expect(baseCloned.x).toBe(50);
      expect(baseCloned.y).toBe(100);
      
      // Restore override
      Position.prototype.clone = function() {
        return new Position(this.x, this.y);
      };
    });
  });
});