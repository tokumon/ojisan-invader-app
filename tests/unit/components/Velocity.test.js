/**
 * Unit tests for Velocity component
 */

import { Velocity } from '../../../js/components/Velocity.js';
import { Component } from '../../../js/core/Component.js';

describe('Velocity', () => {
  let velocity;

  beforeEach(() => {
    velocity = new Velocity();
  });

  describe('constructor', () => {
    test('should extend Component', () => {
      expect(velocity).toBeInstanceOf(Component);
      expect(velocity).toBeInstanceOf(Velocity);
    });

    test('should initialize with default values', () => {
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.maxSpeed).toBe(Infinity);
    });

    test('should initialize with provided values', () => {
      const vel = new Velocity(100, -50);
      expect(vel.x).toBe(100);
      expect(vel.y).toBe(-50);
      expect(vel.maxSpeed).toBe(Infinity);
    });

    test('should handle negative values', () => {
      const vel = new Velocity(-25, -75);
      expect(vel.x).toBe(-25);
      expect(vel.y).toBe(-75);
    });

    test('should handle floating point values', () => {
      const vel = new Velocity(3.14, 2.71);
      expect(vel.x).toBeCloseTo(3.14);
      expect(vel.y).toBeCloseTo(2.71);
    });
  });

  describe('set', () => {
    test('should set velocity values', () => {
      velocity.set(150, -100);
      expect(velocity.x).toBe(150);
      expect(velocity.y).toBe(-100);
    });

    test('should clamp to max speed when set', () => {
      velocity.setMaxSpeed(100);
      velocity.set(60, 80); // Speed = 100, should be unchanged
      
      expect(velocity.x).toBe(60);
      expect(velocity.y).toBe(80);
      expect(velocity.getSpeed()).toBeCloseTo(100);
    });

    test('should clamp when exceeding max speed', () => {
      velocity.setMaxSpeed(100);
      velocity.set(120, 160); // Speed = 200, should be clamped to 100
      
      expect(velocity.getSpeed()).toBeCloseTo(100);
      expect(velocity.x).toBeCloseTo(60);
      expect(velocity.y).toBeCloseTo(80);
    });

    test('should handle zero velocity', () => {
      velocity.x = 50;
      velocity.y = 75;
      
      velocity.set(0, 0);
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.getSpeed()).toBe(0);
    });

    test('should not clamp when maxSpeed is Infinity', () => {
      velocity.set(1000, 2000);
      
      expect(velocity.x).toBe(1000);
      expect(velocity.y).toBe(2000);
      expect(velocity.getSpeed()).toBeCloseTo(2236.07);
    });
  });

  describe('add', () => {
    test('should add to existing velocity', () => {
      velocity.x = 10;
      velocity.y = 20;
      
      velocity.add(5, -10);
      
      expect(velocity.x).toBe(15);
      expect(velocity.y).toBe(10);
    });

    test('should clamp after adding', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 60;
      velocity.y = 80; // Speed = 100
      
      velocity.add(20, 0); // Would make speed > 100
      
      expect(velocity.getSpeed()).toBeCloseTo(100);
    });

    test('should handle negative deltas', () => {
      velocity.x = 50;
      velocity.y = 75;
      
      velocity.add(-25, -35);
      
      expect(velocity.x).toBe(25);
      expect(velocity.y).toBe(40);
    });

    test('should handle zero deltas', () => {
      velocity.x = 100;
      velocity.y = 200;
      
      velocity.add(0, 0);
      
      expect(velocity.x).toBe(100);
      expect(velocity.y).toBe(200);
    });

    test('should work from zero velocity', () => {
      velocity.add(30, 40);
      
      expect(velocity.x).toBe(30);
      expect(velocity.y).toBe(40);
      expect(velocity.getSpeed()).toBe(50);
    });
  });

  describe('setMaxSpeed', () => {
    test('should set maximum speed limit', () => {
      velocity.setMaxSpeed(150);
      expect(velocity.maxSpeed).toBe(150);
    });

    test('should clamp current velocity when setting lower max speed', () => {
      velocity.x = 120;
      velocity.y = 160; // Speed = 200
      
      velocity.setMaxSpeed(100);
      
      expect(velocity.maxSpeed).toBe(100);
      expect(velocity.getSpeed()).toBeCloseTo(100);
    });

    test('should not change velocity when setting higher max speed', () => {
      velocity.x = 30;
      velocity.y = 40; // Speed = 50
      
      velocity.setMaxSpeed(100);
      
      expect(velocity.x).toBe(30);
      expect(velocity.y).toBe(40);
      expect(velocity.getSpeed()).toBe(50);
    });

    test('should handle zero max speed', () => {
      velocity.x = 100;
      velocity.y = 200;
      
      velocity.setMaxSpeed(0);
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.getSpeed()).toBe(0);
    });

    test('should handle setting Infinity', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 60;
      velocity.y = 80;
      
      velocity.setMaxSpeed(Infinity);
      
      expect(velocity.maxSpeed).toBe(Infinity);
      expect(velocity.x).toBe(60);
      expect(velocity.y).toBe(80);
    });
  });

  describe('clampToMaxSpeed', () => {
    test('should not modify velocity when under max speed', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 30;
      velocity.y = 40; // Speed = 50
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.x).toBe(30);
      expect(velocity.y).toBe(40);
    });

    test('should scale velocity when over max speed', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 120;
      velocity.y = 160; // Speed = 200
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.getSpeed()).toBeCloseTo(100);
      expect(velocity.x).toBeCloseTo(60);
      expect(velocity.y).toBeCloseTo(80);
    });

    test('should maintain direction when clamping', () => {
      velocity.setMaxSpeed(50);
      velocity.x = -60;
      velocity.y = -80; // Speed = 100, negative direction
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.getSpeed()).toBeCloseTo(50);
      expect(velocity.x).toBeCloseTo(-30);
      expect(velocity.y).toBeCloseTo(-40);
    });

    test('should handle zero velocity', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 0;
      velocity.y = 0;
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    test('should not clamp when maxSpeed is Infinity', () => {
      velocity.x = 1000;
      velocity.y = 2000;
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.x).toBe(1000);
      expect(velocity.y).toBe(2000);
    });

    test('should handle very small velocities', () => {
      velocity.setMaxSpeed(1);
      velocity.x = 0.0003;
      velocity.y = 0.0004; // Speed = 0.0005
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.x).toBeCloseTo(0.0003);
      expect(velocity.y).toBeCloseTo(0.0004);
    });
  });

  describe('getSpeed', () => {
    test('should return magnitude of velocity vector', () => {
      velocity.x = 3;
      velocity.y = 4;
      
      expect(velocity.getSpeed()).toBe(5);
    });

    test('should return zero for zero velocity', () => {
      expect(velocity.getSpeed()).toBe(0);
    });

    test('should handle negative velocities', () => {
      velocity.x = -6;
      velocity.y = -8;
      
      expect(velocity.getSpeed()).toBe(10);
    });

    test('should handle mixed positive/negative velocities', () => {
      velocity.x = 5;
      velocity.y = -12;
      
      expect(velocity.getSpeed()).toBe(13);
    });

    test('should handle floating point values', () => {
      velocity.x = 1.5;
      velocity.y = 2.5;
      
      expect(velocity.getSpeed()).toBeCloseTo(2.915);
    });

    test('should handle very large velocities', () => {
      velocity.x = 100000;
      velocity.y = 100000;
      
      expect(velocity.getSpeed()).toBeCloseTo(141421.356);
    });
  });

  describe('reset', () => {
    test('should reset all properties to defaults', () => {
      velocity.x = 100;
      velocity.y = 200;
      velocity.setMaxSpeed(150);
      
      velocity.reset();
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.maxSpeed).toBe(Infinity);
    });

    test('should reset from negative values', () => {
      velocity.x = -50;
      velocity.y = -75;
      velocity.setMaxSpeed(25);
      
      velocity.reset();
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.maxSpeed).toBe(Infinity);
    });
  });

  describe('clone', () => {
    test('should create new Velocity instance with same values', () => {
      velocity.x = 100;
      velocity.y = 200;
      velocity.setMaxSpeed(150);
      
      const cloned = velocity.clone();
      
      expect(cloned).toBeInstanceOf(Velocity);
      expect(cloned).not.toBe(velocity);
      expect(cloned.x).toBe(100);
      expect(cloned.y).toBe(200);
      expect(cloned.maxSpeed).toBe(150);
    });

    test('should clone default values', () => {
      const cloned = velocity.clone();
      
      expect(cloned.x).toBe(0);
      expect(cloned.y).toBe(0);
      expect(cloned.maxSpeed).toBe(Infinity);
    });

    test('should create independent instances', () => {
      velocity.x = 50;
      velocity.y = 75;
      velocity.setMaxSpeed(100);
      
      const cloned = velocity.clone();
      
      // Modify original
      velocity.x = 200;
      velocity.setMaxSpeed(300);
      
      // Clone should be unchanged
      expect(cloned.x).toBe(50);
      expect(cloned.y).toBe(75);
      expect(cloned.maxSpeed).toBe(100);
    });
  });

  describe('speed clamping edge cases', () => {
    test('should handle very small max speeds', () => {
      velocity.setMaxSpeed(0.001);
      velocity.x = 1;
      velocity.y = 1;
      
      expect(velocity.getSpeed()).toBeCloseTo(0.001);
    });

    test('should handle identical x and y components', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 100;
      velocity.y = 100; // Speed = 141.42
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.getSpeed()).toBeCloseTo(100);
      expect(velocity.x).toBeCloseTo(velocity.y); // Should remain equal
    });

    test('should handle one zero component', () => {
      velocity.setMaxSpeed(50);
      velocity.x = 100;
      velocity.y = 0;
      
      velocity.clampToMaxSpeed();
      
      expect(velocity.x).toBeCloseTo(50);
      expect(velocity.y).toBe(0);
      expect(velocity.getSpeed()).toBeCloseTo(50);
    });

    test('should preserve ratios when clamping', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 60;
      velocity.y = 80; // 3:4 ratio, speed = 100
      
      velocity.add(60, 80); // Double it: 120, 160 (3:4 ratio, speed = 200)
      
      expect(velocity.getSpeed()).toBeCloseTo(100);
      expect(velocity.x / velocity.y).toBeCloseTo(3/4);
    });
  });

  describe('mathematical precision', () => {
    test('should handle floating point precision in speed calculations', () => {
      velocity.x = 0.1;
      velocity.y = 0.2;
      
      const speed = velocity.getSpeed();
      expect(speed).toBeCloseTo(Math.sqrt(0.01 + 0.04));
    });

    test('should maintain precision through multiple operations', () => {
      velocity.setMaxSpeed(1);
      
      for (let i = 0; i < 100; i++) {
        velocity.add(0.01, 0.01);
        expect(velocity.getSpeed()).toBeLessThanOrEqual(1.001); // Allow small precision errors
      }
    });
  });

  describe('object pooling compatibility', () => {
    test('should support typical pooling workflow', () => {
      velocity.set(100, 200);
      velocity.setMaxSpeed(150);
      
      const pooled = velocity.clone();
      expect(pooled.x).toBe(100);
      expect(pooled.y).toBe(200);
      expect(pooled.maxSpeed).toBe(150);
      
      pooled.add(50, 75);
      pooled.setMaxSpeed(200);
      
      pooled.reset();
      expect(pooled.x).toBe(0);
      expect(pooled.y).toBe(0);
      expect(pooled.maxSpeed).toBe(Infinity);
      
      // Original should be unchanged
      expect(velocity.x).toBe(100);
      expect(velocity.y).toBe(200);
      expect(velocity.maxSpeed).toBe(150);
    });
  });

  describe('edge cases', () => {
    test('should handle NaN values', () => {
      velocity.set(NaN, NaN);
      expect(velocity.x).toBeNaN();
      expect(velocity.y).toBeNaN();
      expect(velocity.getSpeed()).toBeNaN();
    });

    test('should handle Infinity values', () => {
      velocity.set(Infinity, -Infinity);
      expect(velocity.x).toBe(Infinity);
      expect(velocity.y).toBe(-Infinity);
      expect(velocity.getSpeed()).toBe(Infinity);
    });

    test('should handle division by zero in clamping', () => {
      velocity.setMaxSpeed(100);
      velocity.x = 0;
      velocity.y = 0;
      
      expect(() => velocity.clampToMaxSpeed()).not.toThrow();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    test('should handle negative max speed', () => {
      velocity.x = 30;
      velocity.y = 40;
      
      velocity.setMaxSpeed(-50);
      
      // Negative max speed should clamp to zero
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
      expect(velocity.getSpeed()).toBe(0);
    });
  });
});