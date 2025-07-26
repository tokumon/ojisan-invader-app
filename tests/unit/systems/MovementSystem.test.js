/**
 * Unit tests for MovementSystem
 */

import { MovementSystem } from '../../../js/systems/MovementSystem.js';
import { World } from '../../../js/core/World.js';
import { Position } from '../../../js/components/Position.js';
import { Velocity } from '../../../js/components/Velocity.js';

describe('MovementSystem', () => {
  let world;
  let system;

  beforeEach(() => {
    world = new World();
    system = new MovementSystem(world);
  });

  describe('constructor', () => {
    test('should initialize with required components', () => {
      expect(system.requiredComponents).toEqual([Position, Velocity]);
    });

    test('should extend System', () => {
      expect(system.world).toBe(world);
      expect(typeof system.update).toBe('function');
      expect(typeof system.processEntity).toBe('function');
    });
  });

  describe('processEntity', () => {
    test('should update position based on velocity and deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(50, -30); // 50 pixels/sec right, 30 pixels/sec up
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const deltaTime = 0.1; // 100ms
      system.processEntity(entity, deltaTime);

      expect(position.x).toBeCloseTo(105); // 100 + (50 * 0.1)
      expect(position.y).toBeCloseTo(197); // 200 + (-30 * 0.1)
    });

    test('should handle zero velocity', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(0, 0);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.1);

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    test('should handle negative velocity', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(-60, -40);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.1);

      expect(position.x).toBeCloseTo(94); // 100 + (-60 * 0.1)
      expect(position.y).toBeCloseTo(196); // 200 + (-40 * 0.1)
    });

    test('should handle very small deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(1000, 2000);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const deltaTime = 0.001; // 1ms
      system.processEntity(entity, deltaTime);

      expect(position.x).toBeCloseTo(101); // 100 + (1000 * 0.001)
      expect(position.y).toBeCloseTo(202); // 200 + (2000 * 0.001)
    });

    test('should handle large deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(10, 20);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const deltaTime = 5.0; // 5 seconds
      system.processEntity(entity, deltaTime);

      expect(position.x).toBeCloseTo(150); // 100 + (10 * 5)
      expect(position.y).toBeCloseTo(300); // 200 + (20 * 5)
    });

    test('should handle floating point velocity', () => {
      const entity = world.createEntity();
      const position = new Position(0, 0);
      const velocity = new Velocity(33.33, 66.67);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.1);

      expect(position.x).toBeCloseTo(3.333);
      expect(position.y).toBeCloseTo(6.667);
    });

    test('should handle floating point position and deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(12.5, 25.7);
      const velocity = new Velocity(100, -50);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const deltaTime = 0.016; // ~60fps
      system.processEntity(entity, deltaTime);

      expect(position.x).toBeCloseTo(14.1); // 12.5 + (100 * 0.016)
      expect(position.y).toBeCloseTo(24.9); // 25.7 + (-50 * 0.016)
    });

    test('should accumulate movement over multiple calls', () => {
      const entity = world.createEntity();
      const position = new Position(0, 0);
      const velocity = new Velocity(60, 120); // 60 pixels/sec right, 120 pixels/sec down
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      // Simulate 10 frames at 60fps
      for (let i = 0; i < 10; i++) {
        system.processEntity(entity, 1/60);
      }

      expect(position.x).toBeCloseTo(10); // 60 * (10/60) = 10
      expect(position.y).toBeCloseTo(20); // 120 * (10/60) = 20
    });

    test('should not modify velocity during movement', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(50, -30);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const originalVelX = velocity.x;
      const originalVelY = velocity.y;

      system.processEntity(entity, 0.1);

      expect(velocity.x).toBe(originalVelX);
      expect(velocity.y).toBe(originalVelY);
    });
  });

  describe('update integration', () => {
    test('should process all entities with position and velocity', () => {
      // Create entities with different movement patterns
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(0, 0));
      entity1.addComponent(new Velocity(100, 0)); // Moving right

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Velocity(0, -50)); // Moving up

      const entity3 = world.createEntity();
      entity3.addComponent(new Position(200, 200));
      entity3.addComponent(new Velocity(-25, 25)); // Moving left and down

      system.update(0.1);

      const pos1 = entity1.getComponent(Position);
      const pos2 = entity2.getComponent(Position);
      const pos3 = entity3.getComponent(Position);

      expect(pos1.x).toBeCloseTo(10); // 0 + (100 * 0.1)
      expect(pos1.y).toBeCloseTo(0);

      expect(pos2.x).toBeCloseTo(100);
      expect(pos2.y).toBeCloseTo(95); // 100 + (-50 * 0.1)

      expect(pos3.x).toBeCloseTo(197.5); // 200 + (-25 * 0.1)
      expect(pos3.y).toBeCloseTo(202.5); // 200 + (25 * 0.1)
    });

    test('should not process entities missing required components', () => {
      // Entity with only position
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));

      // Entity with only velocity
      const entity2 = world.createEntity();
      entity2.addComponent(new Velocity(50, 50));

      // Entity with both components
      const entity3 = world.createEntity();
      entity3.addComponent(new Position(200, 200));
      entity3.addComponent(new Velocity(30, 30));

      system.update(0.1);

      // Only entity3 should have moved
      const pos1 = entity1.getComponent(Position);
      const pos3 = entity3.getComponent(Position);

      expect(pos1.x).toBe(100); // Unchanged
      expect(pos1.y).toBe(100);

      expect(pos3.x).toBeCloseTo(203); // 200 + (30 * 0.1)
      expect(pos3.y).toBeCloseTo(203);
    });

    test('should not process inactive entities', () => {
      const entity = world.createEntity();
      entity.addComponent(new Position(100, 100));
      entity.addComponent(new Velocity(50, 50));
      entity.active = false;

      system.update(0.1);

      const position = entity.getComponent(Position);
      expect(position.x).toBe(100); // Unchanged
      expect(position.y).toBe(100);
    });
  });

  describe('edge cases', () => {
    test('should handle zero deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(1000, 2000);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0);

      expect(position.x).toBe(100); // No movement
      expect(position.y).toBe(200);
    });

    test('should handle negative deltaTime', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(50, 30);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, -0.1);

      expect(position.x).toBeCloseTo(95); // 100 + (50 * -0.1)
      expect(position.y).toBeCloseTo(197); // 200 + (30 * -0.1)
    });

    test('should handle very large velocities', () => {
      const entity = world.createEntity();
      const position = new Position(0, 0);
      const velocity = new Velocity(1000000, -1000000);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.001);

      expect(position.x).toBeCloseTo(1000); // 0 + (1000000 * 0.001)
      expect(position.y).toBeCloseTo(-1000); // 0 + (-1000000 * 0.001)
    });

    test('should handle very small velocities', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(0.001, -0.001);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 1);

      expect(position.x).toBeCloseTo(100.001);
      expect(position.y).toBeCloseTo(199.999);
    });

    test('should handle Infinity values', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(Infinity, -Infinity);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.1);

      expect(position.x).toBe(Infinity);
      expect(position.y).toBe(-Infinity);
    });

    test('should handle NaN values', () => {
      const entity = world.createEntity();
      const position = new Position(100, 200);
      const velocity = new Velocity(NaN, NaN);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      system.processEntity(entity, 0.1);

      expect(position.x).toBeNaN();
      expect(position.y).toBeNaN();
    });

    test('should handle missing components gracefully', () => {
      const entity = world.createEntity();
      
      expect(() => system.processEntity(entity, 0.1)).toThrow();
    });
  });

  describe('physics simulations', () => {
    test('should simulate projectile motion', () => {
      const entity = world.createEntity();
      const position = new Position(0, 0);
      const velocity = new Velocity(100, -200); // Initial upward velocity
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const gravity = 500; // pixels/sec²
      const deltaTime = 0.016; // ~60fps

      // Simulate projectile for 1 second
      for (let i = 0; i < 60; i++) {
        system.processEntity(entity, deltaTime);
        velocity.y += gravity * deltaTime; // Apply gravity
      }

      expect(position.x).toBeCloseTo(100); // Horizontal: 100 * 1
      expect(position.y).toBeCloseTo(50); // Vertical: -200*1 + 0.5*500*1² = 50
    });

    test('should simulate circular motion', () => {
      const entity = world.createEntity();
      const position = new Position(100, 0); // Starting at (100, 0)
      const velocity = new Velocity(0, 100); // Initial velocity upward
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const centerX = 0;
      const centerY = 0;
      const radius = 100;
      const angularVelocity = 1; // rad/sec
      const deltaTime = 0.016;

      // Simulate circular motion for quarter circle
      for (let i = 0; i < Math.floor(Math.PI / 2 / angularVelocity / deltaTime); i++) {
        system.processEntity(entity, deltaTime);
        
        // Update velocity for circular motion
        const angle = Math.atan2(position.y - centerY, position.x - centerX);
        velocity.x = -angularVelocity * radius * Math.sin(angle);
        velocity.y = angularVelocity * radius * Math.cos(angle);
      }

      // After quarter circle, should be approximately at (0, 100)
      expect(position.x).toBeCloseTo(0, 0);
      expect(position.y).toBeCloseTo(100, 0);
    });

    test('should simulate damped oscillation', () => {
      const entity = world.createEntity();
      const position = new Position(100, 0); // Displaced from equilibrium
      const velocity = new Velocity(0, 0);
      
      entity.addComponent(position);
      entity.addComponent(velocity);

      const springConstant = 100;
      const damping = 0.9;
      const deltaTime = 0.016;

      // Simulate spring motion
      for (let i = 0; i < 60; i++) {
        system.processEntity(entity, deltaTime);
        
        // Apply spring force and damping
        const force = -springConstant * position.x;
        velocity.x += force * deltaTime;
        velocity.x *= Math.pow(damping, deltaTime);
      }

      // Position should oscillate and gradually reduce
      expect(Math.abs(position.x)).toBeLessThan(100);
      expect(Math.abs(velocity.x)).toBeLessThan(50);
    });
  });

  describe('performance', () => {
    test('should handle large numbers of moving entities efficiently', () => {
      // Create many moving entities
      for (let i = 0; i < 1000; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(Math.random() * 1000, Math.random() * 1000));
        entity.addComponent(new Velocity(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ));
      }

      const startTime = performance.now();
      system.update(0.016);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
    });

    test('should maintain consistent performance across multiple updates', () => {
      // Create moderate number of entities
      for (let i = 0; i < 100; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(i, i));
        entity.addComponent(new Velocity(10, -10));
      }

      const times = [];
      
      // Measure performance across multiple updates
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        system.update(0.016);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      // Performance should be consistent
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      expect(maxTime - minTime).toBeLessThan(avgTime); // Variation should be small
      expect(avgTime).toBeLessThan(20); // Should be fast
    });
  });

  describe('real-world scenarios', () => {
    test('should handle player movement', () => {
      const player = world.createEntity();
      player.addComponent(new Position(400, 500)); // Center bottom of screen
      player.addComponent(new Velocity(0, 0)); // Initially stationary

      const speed = 200; // 200 pixels/sec

      // Simulate player moving right for 0.5 seconds
      const vel = player.getComponent(Velocity);
      vel.x = speed;

      for (let i = 0; i < 30; i++) { // 30 frames at 60fps = 0.5 sec
        system.update(1/60);
      }

      const pos = player.getComponent(Position);
      expect(pos.x).toBeCloseTo(500); // 400 + (200 * 0.5)
      expect(pos.y).toBeCloseTo(500); // Unchanged
    });

    test('should handle projectile movement', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new Position(100, 300));
      projectile.addComponent(new Velocity(0, -400)); // Moving upward fast

      // Simulate projectile for 0.75 seconds (should reach top of 600px screen)
      for (let i = 0; i < 45; i++) { // 45 frames at 60fps = 0.75 sec
        system.update(1/60);
      }

      const pos = projectile.getComponent(Position);
      expect(pos.x).toBeCloseTo(100); // No horizontal movement
      expect(pos.y).toBeCloseTo(0); // 300 + (-400 * 0.75) = 0
    });

    test('should handle enemy movement patterns', () => {
      const enemy = world.createEntity();
      enemy.addComponent(new Position(0, 100));
      enemy.addComponent(new Velocity(150, 50)); // Moving right and down

      // Simulate enemy crossing screen (800px wide)
      const targetTime = 800 / 150; // Time to cross screen
      const frames = Math.floor(targetTime * 60);

      for (let i = 0; i < frames; i++) {
        system.update(1/60);
      }

      const pos = enemy.getComponent(Position);
      expect(pos.x).toBeCloseTo(800, 1);
      expect(pos.y).toBeCloseTo(100 + (50 * targetTime), 1);
    });
  });
});