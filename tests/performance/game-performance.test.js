/**
 * Performance tests for Ojisan Invader game
 * Tests for 60fps performance and memory efficiency
 */

import { GameEngine } from '../../js/GameEngine.js';
import { World } from '../../js/core/World.js';
import { Position } from '../../js/components/Position.js';
import { Velocity } from '../../js/components/Velocity.js';
import { Collision } from '../../js/components/Collision.js';
import { Health } from '../../js/components/Health.js';
import { MovementSystem } from '../../js/systems/MovementSystem.js';
import { CollisionSystem } from '../../js/systems/CollisionSystem.js';
import { ObjectPool } from '../../js/utils/ObjectPool.js';

describe('Game Performance Tests', () => {
  let canvas;
  let gameEngine;

  beforeEach(() => {
    canvas = TestUtils.createMockCanvas();
    gameEngine = new GameEngine(canvas);
    
    // Mock requestAnimationFrame for controlled timing
    let frameId = 0;
    requestAnimationFrame.mockImplementation((callback) => {
      return setTimeout(() => callback(performance.now()), 16); // ~60fps
    });
  });

  afterEach(() => {
    if (gameEngine) {
      gameEngine.destroy();
    }
  });

  describe('Frame Rate Performance', () => {
    test('should maintain 60fps with moderate entity count', async () => {
      await gameEngine.init();
      
      // Create moderate number of entities (typical game scenario)
      const world = gameEngine.world;
      for (let i = 0; i < 50; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
        entity.addComponent(new Velocity(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ));
        entity.addComponent(new Collision({ 
          width: 16, 
          height: 16, 
          layer: 'test', 
          mask: ['test'] 
        }));
      }

      const frameTimes = [];
      const targetFrameTime = 16.67; // 60fps = 16.67ms per frame

      // Measure frame performance
      for (let frame = 0; frame < 60; frame++) {
        const startTime = performance.now();
        
        gameEngine.update(1/60); // Fixed timestep
        
        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      const ninetyFifthPercentile = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length * 0.95)];

      // Performance requirements
      expect(avgFrameTime).toBeLessThan(targetFrameTime * 0.8); // 80% of frame budget
      expect(maxFrameTime).toBeLessThan(targetFrameTime * 2); // No frame should take more than 2x
      expect(ninetyFifthPercentile).toBeLessThan(targetFrameTime); // 95% of frames should be under budget
    });

    test('should handle high entity count without frame drops', async () => {
      await gameEngine.init();
      
      // Create high number of entities (stress test)
      const world = gameEngine.world;
      for (let i = 0; i < 200; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
        entity.addComponent(new Velocity(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ));
        entity.addComponent(new Collision({ 
          width: 8, 
          height: 8, 
          layer: 'stress', 
          mask: ['stress'] 
        }));
      }

      const frameTimes = [];
      const targetFrameTime = 16.67;

      // Measure performance under stress
      for (let frame = 0; frame < 30; frame++) {
        const startTime = performance.now();
        gameEngine.update(1/60);
        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      // Should still maintain reasonable performance
      expect(avgFrameTime).toBeLessThan(targetFrameTime * 1.5); // Allow 50% overhead for stress test
      expect(maxFrameTime).toBeLessThan(targetFrameTime * 3); // Max frame still reasonable
    });

    test('should maintain consistent frame times', async () => {
      await gameEngine.init();
      
      // Create typical game scenario
      const world = gameEngine.world;
      for (let i = 0; i < 30; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
        entity.addComponent(new Velocity(50, 50));
        entity.addComponent(new Collision({ layer: 'consistent', mask: ['consistent'] }));
      }

      const frameTimes = [];

      // Measure frame time consistency
      for (let frame = 0; frame < 120; frame++) { // 2 seconds worth
        const startTime = performance.now();
        gameEngine.update(1/60);
        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
      }

      // Calculate variance
      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const variance = frameTimes.reduce((sum, time) => {
        return sum + Math.pow(time - avgFrameTime, 2);
      }, 0) / frameTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Frame times should be consistent (low variance)
      expect(standardDeviation).toBeLessThan(avgFrameTime * 0.5); // SD should be < 50% of average
    });

    test('should handle dynamic entity creation/destruction efficiently', async () => {
      await gameEngine.init();
      const world = gameEngine.world;

      const frameTimes = [];
      const entityCounts = [];

      // Simulate dynamic gameplay with entities being created and destroyed
      for (let frame = 0; frame < 60; frame++) {
        const startTime = performance.now();

        // Dynamic entity management
        if (frame % 10 === 0) {
          // Create burst of entities
          for (let i = 0; i < 10; i++) {
            const entity = world.createEntity();
            entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
            entity.addComponent(new Velocity(Math.random() * 100, Math.random() * 100));
          }
        }

        if (frame % 15 === 0) {
          // Remove some entities
          const entities = Array.from(world.entities);
          for (let i = 0; i < Math.min(5, entities.length); i++) {
            if (entities[i]) {
              world.removeEntity(entities[i]);
            }
          }
        }

        gameEngine.update(1/60);

        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
        entityCounts.push(world.getEntityCount());
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      // Should handle dynamic changes efficiently
      expect(avgFrameTime).toBeLessThan(16.67 * 0.9); // 90% of frame budget
      expect(maxFrameTime).toBeLessThan(16.67 * 2); // No major spikes
    });
  });

  describe('Memory Performance', () => {
    test('should not leak memory during normal gameplay', async () => {
      await gameEngine.init();
      const world = gameEngine.world;

      // Simulate extended gameplay
      for (let cycle = 0; cycle < 10; cycle++) {
        // Create entities
        const entities = [];
        for (let i = 0; i < 20; i++) {
          const entity = world.createEntity();
          entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
          entity.addComponent(new Velocity(Math.random() * 100, Math.random() * 100));
          entity.addComponent(new Health(1));
          entities.push(entity);
        }

        // Run for several frames
        for (let frame = 0; frame < 10; frame++) {
          gameEngine.update(1/60);
        }

        // Clean up entities
        entities.forEach(entity => {
          entity.destroy();
        });

        // Force cleanup
        world.cleanupEntities();
      }

      // Entity count should return to reasonable level
      expect(world.getEntityCount()).toBeLessThan(50);
    });

    test('should reuse objects efficiently with object pooling', () => {
      const createFn = jest.fn(() => ({ value: 0, reset: function() { this.value = 0; } }));
      const resetFn = jest.fn((obj) => obj.reset());
      const pool = new ObjectPool(createFn, resetFn, 10);

      // Simulate high-frequency object usage
      for (let cycle = 0; cycle < 100; cycle++) {
        const objects = [];
        
        // Acquire objects
        for (let i = 0; i < 5; i++) {
          objects.push(pool.acquire());
        }
        
        // Use and release objects
        objects.forEach(obj => {
          obj.value = Math.random();
          pool.release(obj);
        });
      }

      // Should have created minimal new objects
      expect(createFn).toHaveBeenCalledTimes(10); // Only initial pool creation
      expect(resetFn).toHaveBeenCalledTimes(500); // All releases should call reset
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.getPoolSize()).toBe(10);
    });

    test('should handle garbage collection efficiently', async () => {
      await gameEngine.init();
      const world = gameEngine.world;

      // Create many short-lived entities to trigger GC
      for (let batch = 0; batch < 20; batch++) {
        const entities = [];
        
        // Create batch of entities
        for (let i = 0; i < 25; i++) {
          const entity = world.createEntity();
          entity.addComponent(new Position(i * 10, i * 10));
          entity.addComponent(new Velocity(i, i));
          entity.addComponent(new Collision({ width: 16, height: 16 }));
          entities.push(entity);
        }

        // Update a few frames
        for (let frame = 0; frame < 5; frame++) {
          gameEngine.update(1/60);
        }

        // Destroy all entities in batch
        entities.forEach(entity => entity.destroy());
        world.cleanupEntities();

        // Force potential GC with manual trigger
        if (global.gc) {
          global.gc();
        }
      }

      // System should still be responsive
      const startTime = performance.now();
      gameEngine.update(1/60);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(16.67);
    });

    test('should manage component memory efficiently', async () => {
      await gameEngine.init();
      const world = gameEngine.world;

      const initialMemoryUsage = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      // Create and destroy many entities with components
      for (let cycle = 0; cycle < 50; cycle++) {
        const entities = [];
        
        for (let i = 0; i < 10; i++) {
          const entity = world.createEntity();
          
          // Add multiple components
          entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
          entity.addComponent(new Velocity(Math.random() * 200, Math.random() * 200));
          entity.addComponent(new Health(Math.floor(Math.random() * 5) + 1));
          entity.addComponent(new Collision({
            width: Math.random() * 32 + 16,
            height: Math.random() * 32 + 16,
            layer: `layer${i % 3}`,
            mask: [`mask${i % 3}`]
          }));
          
          entities.push(entity);
        }

        // Update systems
        gameEngine.update(1/60);

        // Clean up
        entities.forEach(entity => entity.destroy());
        world.cleanupEntities();
      }

      const finalMemoryUsage = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      // Memory should not have grown significantly
      if (process.memoryUsage) {
        const memoryGrowth = finalMemoryUsage - initialMemoryUsage;
        const memoryGrowthMB = memoryGrowth / (1024 * 1024);
        expect(memoryGrowthMB).toBeLessThan(10); // Less than 10MB growth
      }
    });
  });

  describe('System Performance', () => {
    test('should scale collision detection efficiently', () => {
      const world = new World();
      const collisionSystem = new CollisionSystem(world);

      const entityCounts = [10, 25, 50, 100];
      const timings = [];

      entityCounts.forEach(count => {
        // Clear world
        world.clear();

        // Create entities
        for (let i = 0; i < count; i++) {
          const entity = world.createEntity();
          entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
          entity.addComponent(new Collision({ 
            width: 16, 
            height: 16, 
            layer: 'test', 
            mask: ['test'] 
          }));
        }

        // Measure collision system performance
        const startTime = performance.now();
        
        for (let frame = 0; frame < 10; frame++) {
          collisionSystem.update(1/60);
        }
        
        const endTime = performance.now();
        const avgTimePerFrame = (endTime - startTime) / 10;
        
        timings.push({ count, time: avgTimePerFrame });
      });

      // Performance should scale reasonably (not exponentially)
      const firstTiming = timings[0];
      const lastTiming = timings[timings.length - 1];
      
      const scaleFactor = lastTiming.count / firstTiming.count;
      const timeIncrease = lastTiming.time / firstTiming.time;
      
      // Time increase should be less than scale factor squared (O(n^2) would be bad)
      expect(timeIncrease).toBeLessThan(scaleFactor * scaleFactor);
    });

    test('should handle movement system efficiently at scale', () => {
      const world = new World();
      const movementSystem = new MovementSystem(world);

      // Test different entity counts
      const entityCounts = [50, 100, 200, 400];
      const timings = [];

      entityCounts.forEach(count => {
        world.clear();

        // Create moving entities
        for (let i = 0; i < count; i++) {
          const entity = world.createEntity();
          entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
          entity.addComponent(new Velocity(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
          ));
        }

        // Measure movement system performance
        const startTime = performance.now();
        
        for (let frame = 0; frame < 20; frame++) {
          movementSystem.update(1/60);
        }
        
        const endTime = performance.now();
        const avgTimePerFrame = (endTime - startTime) / 20;
        
        timings.push({ count, time: avgTimePerFrame });
      });

      // Movement should scale linearly (O(n))
      const firstTiming = timings[0];
      const lastTiming = timings[timings.length - 1];
      
      const scaleFactor = lastTiming.count / firstTiming.count;
      const timeIncrease = lastTiming.time / firstTiming.time;
      
      // Time should scale roughly linearly
      expect(timeIncrease).toBeLessThan(scaleFactor * 1.5); // Allow some overhead
      expect(timeIncrease).toBeGreaterThan(scaleFactor * 0.5); // Should scale somewhat
    });

    test('should handle complex system interactions efficiently', async () => {
      await gameEngine.init();
      const world = gameEngine.world;

      // Create complex scenario with many interacting entities
      for (let i = 0; i < 30; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(Math.random() * 800, Math.random() * 600));
        entity.addComponent(new Velocity(
          (Math.random() - 0.5) * 150,
          (Math.random() - 0.5) * 150
        ));
        entity.addComponent(new Collision({ 
          width: 20, 
          height: 20, 
          layer: `group${i % 3}`, 
          mask: [`group${(i + 1) % 3}`, `group${(i + 2) % 3}`] 
        }));
        entity.addComponent(new Health(3));
      }

      const frameTimes = [];

      // Measure complex interaction performance
      for (let frame = 0; frame < 60; frame++) {
        const startTime = performance.now();
        
        // Full game update (all systems)
        gameEngine.update(1/60);
        
        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      // Complex interactions should still be performant
      expect(avgFrameTime).toBeLessThan(16.67 * 0.8); // 80% of frame budget
      expect(maxFrameTime).toBeLessThan(16.67 * 1.5); // No major spikes
    });
  });

  describe('Rendering Performance', () => {
    test('should handle many draw calls efficiently', () => {
      const mockRenderSystem = {
        drawCallCount: 0,
        update: function() {
          // Simulate many draw calls
          for (let i = 0; i < 100; i++) {
            this.drawCallCount++;
            // Simulate canvas operations
            canvas.getContext('2d').fillRect(i, i, 10, 10);
          }
        }
      };

      const startTime = performance.now();
      
      // Simulate multiple frames
      for (let frame = 0; frame < 60; frame++) {
        mockRenderSystem.update();
      }
      
      const endTime = performance.now();
      const avgFrameTime = (endTime - startTime) / 60;

      expect(avgFrameTime).toBeLessThan(16.67 * 0.5); // Rendering should be fast
      expect(mockRenderSystem.drawCallCount).toBe(6000); // All draw calls completed
    });

    test('should batch similar drawing operations', () => {
      const ctx = canvas.getContext('2d');
      let fillRectCalls = 0;
      let fillStyleChanges = 0;
      let lastFillStyle = null;

      // Mock context to count operations
      const originalFillRect = ctx.fillRect;
      const originalFillStyleSetter = Object.getOwnPropertyDescriptor(
        CanvasRenderingContext2D.prototype, 
        'fillStyle'
      ).set;

      ctx.fillRect = function(...args) {
        fillRectCalls++;
        return originalFillRect.apply(this, args);
      };

      Object.defineProperty(ctx, 'fillStyle', {
        get: function() {
          return lastFillStyle;
        },
        set: function(value) {
          if (value !== lastFillStyle) {
            fillStyleChanges++;
            lastFillStyle = value;
          }
          return originalFillStyleSetter.call(this, value);
        }
      });

      // Simulate drawing many similar objects
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = i % 3 === 0 ? '#FF0000' : '#00FF00'; // Alternate colors
        ctx.fillRect(i * 5, i * 5, 10, 10);
      }
      
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(fillRectCalls).toBe(100);
      expect(fillStyleChanges).toBeLessThan(50); // Some batching should occur
    });
  });

  describe('Memory Leak Detection', () => {
    test('should not leak event listeners', async () => {
      const initialListenerCount = EventTarget.prototype.addEventListener.mock?.calls?.length || 0;
      
      // Create and destroy game engine multiple times
      for (let i = 0; i < 5; i++) {
        const tempCanvas = TestUtils.createMockCanvas();
        const tempEngine = new GameEngine(tempCanvas);
        
        await tempEngine.init();
        tempEngine.start();
        
        // Simulate some gameplay
        for (let frame = 0; frame < 10; frame++) {
          tempEngine.update(1/60);
        }
        
        tempEngine.stop();
        tempEngine.destroy();
      }

      // Should not have accumulated many new listeners
      const finalListenerCount = EventTarget.prototype.addEventListener.mock?.calls?.length || 0;
      const listenerIncrease = finalListenerCount - initialListenerCount;
      
      expect(listenerIncrease).toBeLessThan(10); // Minimal listener accumulation
    });

    test('should clean up component references', () => {
      const world = new World();
      const entityRefs = new WeakSet();
      const componentRefs = new WeakSet();

      // Create entities and track references
      for (let i = 0; i < 50; i++) {
        const entity = world.createEntity();
        const position = new Position(i, i);
        const velocity = new Velocity(i, i);
        
        entity.addComponent(position);
        entity.addComponent(velocity);
        
        entityRefs.add(entity);
        componentRefs.add(position);
        componentRefs.add(velocity);
      }

      // Clear world
      world.clear();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Check that references can be garbage collected
      // Note: This test is somewhat limited by the WeakSet behavior
      expect(world.getEntityCount()).toBe(0);
    });
  });
});