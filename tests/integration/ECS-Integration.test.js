/**
 * Integration tests for ECS system interactions
 */

import { World } from '../../js/core/World.js';
import { Entity } from '../../js/core/Entity.js';
import { Position } from '../../js/components/Position.js';
import { Velocity } from '../../js/components/Velocity.js';
import { Health } from '../../js/components/Health.js';
import { Player } from '../../js/components/Player.js';
import { Collision } from '../../js/components/Collision.js';
import { MovementSystem } from '../../js/systems/MovementSystem.js';
import { CollisionSystem } from '../../js/systems/CollisionSystem.js';

// Mock components for testing
class MockEnemy {
  constructor() {
    this.points = 100;
  }
  getPoints() {
    return this.points;
  }
}

class MockProjectile {
  constructor(owner = 'player', damage = 1) {
    this.owner = owner;
    this.damage = damage;
  }
  
  isPlayerProjectile() {
    return this.owner === 'player';
  }
  
  getDamage() {
    return this.damage;
  }
  
  onHit() {
    return true;
  }
}

describe('ECS Integration Tests', () => {
  let world;
  let movementSystem;
  let collisionSystem;

  beforeEach(() => {
    world = new World();
    movementSystem = new MovementSystem(world);
    collisionSystem = new CollisionSystem(world);
    
    world.addSystem('movement', movementSystem);
    world.addSystem('collision', collisionSystem);
  });

  describe('Movement and Collision Integration', () => {
    test('should handle moving objects detecting collisions', () => {
      // Create two entities that will collide due to movement
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Velocity(50, 0)); // Moving right
      entity1.addComponent(new Collision({ width: 32, height: 32, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(150, 100)); // To the right
      entity2.addComponent(new Velocity(0, 0)); // Stationary
      entity2.addComponent(new Collision({ width: 32, height: 32, layer: 'b', mask: ['a'] }));

      // Initially no collision
      world.update(0.01); // Small timestep
      expect(collisionSystem.collisionEvents).toHaveLength(0);

      // Move for enough time to cause collision
      world.update(0.5); // entity1 moves 25 pixels right
      
      // Should now detect collision
      expect(collisionSystem.collisionEvents).toHaveLength(1);
      expect(collisionSystem.collisionEvents[0].entityA).toBe(entity1);
      expect(collisionSystem.collisionEvents[0].entityB).toBe(entity2);
    });

    test('should handle fast-moving objects that would tunnel through', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(50, 100));
      entity1.addComponent(new Velocity(1000, 0)); // Very fast
      entity1.addComponent(new Collision({ width: 16, height: 16, layer: 'fast', mask: ['slow'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Velocity(0, 0));
      entity2.addComponent(new Collision({ width: 16, height: 16, layer: 'slow', mask: ['fast'] }));

      // Large timestep that would move entity1 past entity2
      world.update(0.1); // Moves 100 pixels

      // Should still detect collision (even though it "tunneled")
      expect(collisionSystem.collisionEvents).toHaveLength(1);
    });

    test('should handle multiple moving objects with complex collision scenarios', () => {
      // Create a chain of objects that will collide in sequence
      const entities = [];
      for (let i = 0; i < 5; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(100 + i * 40, 100));
        entity.addComponent(new Velocity(-20, 0)); // All moving left
        entity.addComponent(new Collision({ 
          width: 32, 
          height: 32, 
          layer: 'chain', 
          mask: ['chain'] 
        }));
        entities.push(entity);
      }

      // Initial update - no collisions yet
      world.update(0.1);
      expect(collisionSystem.collisionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Player Gameplay Integration', () => {
    test('should handle complete player vs enemy collision scenario', () => {
      // Create player
      const player = world.createEntity();
      player.addComponent(new Position(400, 500));
      player.addComponent(new Velocity(0, 0));
      player.addComponent(new Player());
      player.addComponent(new Health(3));
      player.addComponent(new Collision({ 
        width: 32, 
        height: 32, 
        layer: 'player', 
        mask: ['enemy'] 
      }));

      // Create moving enemy
      const enemy = world.createEntity();
      enemy.addComponent(new Position(400, 300));
      enemy.addComponent(new Velocity(0, 100)); // Moving down toward player
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Collision({ 
        width: 32, 
        height: 32, 
        layer: 'enemy', 
        mask: ['player'] 
      }));

      const playerHealth = player.getComponent(Health);
      const playerComp = player.getComponent(Player);

      // Simulate enemy moving toward player
      expect(playerHealth.currentHealth).toBe(3);
      expect(playerComp.lives).toBe(3);

      // Move until collision
      world.update(1.8); // Enemy should reach player position

      // Check collision occurred and damage was applied
      expect(playerHealth.currentHealth).toBeLessThan(3);
      expect(enemy.active).toBe(false); // Enemy destroyed
    });

    test('should handle projectile hitting moving enemy', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      // Create projectile
      const projectile = world.createEntity();
      projectile.addComponent(new Position(200, 300));
      projectile.addComponent(new Velocity(200, 0)); // Moving right
      projectile.addComponent(new MockProjectile('player', 2));
      projectile.addComponent(new Collision({ 
        width: 8, 
        height: 8, 
        layer: 'player_projectile', 
        mask: ['enemy'] 
      }));

      // Create moving enemy
      const enemy = world.createEntity();
      enemy.addComponent(new Position(350, 300));
      enemy.addComponent(new Velocity(-50, 0)); // Moving left toward projectile
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Health(3));
      enemy.addComponent(new Collision({ 
        width: 32, 
        height: 32, 
        layer: 'enemy', 
        mask: ['player_projectile'] 
      }));

      const enemyHealth = enemy.getComponent(Health);
      const playerComp = player.getComponent(Player);
      
      expect(enemyHealth.currentHealth).toBe(3);
      expect(playerComp.score).toBe(0);

      // Move until collision
      world.update(0.6); // Should be enough time for collision

      // Check projectile hit enemy
      expect(enemyHealth.currentHealth).toBe(1); // Took 2 damage
      expect(projectile.active).toBe(false); // Projectile destroyed
    });

    test('should handle player movement with boundary collision', () => {
      const player = world.createEntity();
      player.addComponent(new Position(10, 300));
      player.addComponent(new Velocity(-100, 0)); // Moving left toward boundary
      player.addComponent(new Player());
      player.addComponent(new Collision({ 
        width: 32, 
        height: 32, 
        layer: 'player', 
        mask: ['boundary'] 
      }));

      // Create boundary
      const boundary = world.createEntity();
      boundary.addComponent(new Position(0, 300));
      boundary.addComponent(new Velocity(0, 0));
      boundary.addComponent(new Collision({ 
        width: 16, 
        height: 600, 
        layer: 'boundary', 
        mask: ['player'] 
      }));

      // Move player toward boundary
      world.update(0.2); // Player should hit boundary

      // Check collision was detected
      expect(collisionSystem.collisionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('System Update Order Integration', () => {
    test('should process movement before collision detection', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Velocity(100, 0));
      entity1.addComponent(new Collision({ layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(120, 100));
      entity2.addComponent(new Velocity(0, 0));
      entity2.addComponent(new Collision({ layer: 'b', mask: ['a'] }));

      // Spy on system methods to check call order
      const movementSpy = jest.spyOn(movementSystem, 'update');
      const collisionSpy = jest.spyOn(collisionSystem, 'update');

      world.update(0.016);

      expect(movementSpy).toHaveBeenCalledBefore(collisionSpy);
    });

    test('should handle system dependencies correctly', () => {
      // Create entities that depend on proper system ordering
      const movingCollider = world.createEntity();
      movingCollider.addComponent(new Position(100, 100));
      movingCollider.addComponent(new Velocity(50, 0));
      movingCollider.addComponent(new Collision({ 
        width: 20, 
        height: 20, 
        layer: 'moving', 
        mask: ['static'] 
      }));

      const staticTarget = world.createEntity();
      staticTarget.addComponent(new Position(125, 100));
      staticTarget.addComponent(new Velocity(0, 0));
      staticTarget.addComponent(new Collision({ 
        width: 20, 
        height: 20, 
        layer: 'static', 
        mask: ['moving'] 
      }));

      // Update should move first, then check collisions
      world.update(0.5); // Move 25 pixels

      // Verify position was updated before collision check
      const position = movingCollider.getComponent(Position);
      expect(position.x).toBeCloseTo(125);
      expect(collisionSystem.collisionEvents).toHaveLength(1);
    });
  });

  describe('Entity Lifecycle Integration', () => {
    test('should handle entity destruction during system updates', () => {
      const entities = [];
      
      // Create multiple entities
      for (let i = 0; i < 5; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(i * 50, 100));
        entity.addComponent(new Velocity(10, 0));
        entity.addComponent(new Collision({ layer: 'test', mask: ['test'] }));
        entities.push(entity);
      }

      // Destroy some entities during update
      world.update(0.1);
      
      entities[1].destroy();
      entities[3].destroy();

      // Next update should handle destroyed entities properly
      world.update(0.1);

      expect(world.getEntityCount()).toBe(3); // 2 destroyed
    });

    test('should handle entity deactivation and reactivation', () => {
      const entity = world.createEntity();
      entity.addComponent(new Position(100, 100));
      entity.addComponent(new Velocity(50, 0));
      entity.addComponent(new Collision({ layer: 'test', mask: ['test'] }));

      // Normal update
      world.update(0.1);
      let position = entity.getComponent(Position);
      expect(position.x).toBeCloseTo(105);

      // Deactivate entity
      entity.active = false;
      world.update(0.1);
      
      // Position should not change when inactive
      expect(position.x).toBeCloseTo(105);

      // Reactivate entity
      entity.active = true;
      world.update(0.1);
      
      // Should move again
      expect(position.x).toBeCloseTo(110);
    });
  });

  describe('Performance Integration', () => {
    test('should handle large numbers of entities efficiently', () => {
      // Create many moving entities
      for (let i = 0; i < 200; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(
          Math.random() * 800, 
          Math.random() * 600
        ));
        entity.addComponent(new Velocity(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ));
        entity.addComponent(new Collision({ 
          width: 16, 
          height: 16, 
          layer: 'crowd', 
          mask: ['crowd'] 
        }));
      }

      const startTime = performance.now();
      
      // Run multiple updates
      for (let i = 0; i < 10; i++) {
        world.update(0.016);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200); // Should complete in reasonable time
    });

    test('should maintain consistent performance across updates', () => {
      // Create moderate number of entities
      for (let i = 0; i < 50; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(i * 10, i * 10));
        entity.addComponent(new Velocity(100, -100));
        entity.addComponent(new Collision({ layer: 'perf', mask: ['perf'] }));
      }

      const times = [];
      
      // Measure multiple updates
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        world.update(0.016);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      // Performance should be consistent
      expect(maxTime - minTime).toBeLessThan(avgTime * 2);
      expect(avgTime).toBeLessThan(10); // Average should be fast
    });
  });

  describe('Complex Gameplay Scenarios', () => {
    test('should handle multi-entity chain reactions', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      // Create a line of dominoes that will trigger each other
      const dominoes = [];
      for (let i = 0; i < 5; i++) {
        const domino = world.createEntity();
        domino.addComponent(new Position(100 + i * 30, 300));
        domino.addComponent(new Velocity(0, 0));
        domino.addComponent(new Health(1));
        domino.addComponent(new Collision({ 
          width: 20, 
          height: 40, 
          layer: 'domino', 
          mask: ['projectile', 'domino'] 
        }));
        dominoes.push(domino);
      }

      // Create projectile to hit first domino
      const projectile = world.createEntity();
      projectile.addComponent(new Position(50, 300));
      projectile.addComponent(new Velocity(200, 0));
      projectile.addComponent(new MockProjectile('player', 1));
      projectile.addComponent(new Collision({ 
        width: 8, 
        height: 8, 
        layer: 'projectile', 
        mask: ['domino'] 
      }));

      // Simulate chain reaction
      world.update(0.3); // Projectile hits first domino

      // Check that collision occurred
      expect(collisionSystem.collisionEvents.length).toBeGreaterThan(0);
    });

    test('should handle player shooting while moving', () => {
      const player = world.createEntity();
      player.addComponent(new Position(400, 500));
      player.addComponent(new Velocity(100, 0)); // Moving right
      player.addComponent(new Player());

      // Create enemy for projectile to hit
      const enemy = world.createEntity();
      enemy.addComponent(new Position(500, 400));
      enemy.addComponent(new Velocity(0, 50)); // Moving down
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Health(2));
      enemy.addComponent(new Collision({ 
        width: 32, 
        height: 32, 
        layer: 'enemy', 
        mask: ['player_projectile'] 
      }));

      // Create projectile shot by moving player
      const projectile = world.createEntity();
      projectile.addComponent(new Position(400, 480)); // Slightly above player
      projectile.addComponent(new Velocity(0, -300)); // Moving up fast
      projectile.addComponent(new MockProjectile('player', 1));
      projectile.addComponent(new Collision({ 
        width: 6, 
        height: 12, 
        layer: 'player_projectile', 
        mask: ['enemy'] 
      }));

      const enemyHealth = enemy.getComponent(Health);
      expect(enemyHealth.currentHealth).toBe(2);

      // Simulate movement and collision
      world.update(0.4); // Should be enough time for projectile to reach enemy area

      // Check if projectile-enemy collision occurred
      expect(collisionSystem.collisionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Case Integration', () => {
    test('should handle entities with zero-size collision bounds', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Velocity(10, 0));
      entity1.addComponent(new Collision({ 
        width: 0, 
        height: 0, 
        layer: 'point', 
        mask: ['normal'] 
      }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(110, 100));
      entity2.addComponent(new Velocity(0, 0));
      entity2.addComponent(new Collision({ 
        width: 20, 
        height: 20, 
        layer: 'normal', 
        mask: ['point'] 
      }));

      expect(() => world.update(0.5)).not.toThrow();
    });

    test('should handle entities with extreme velocities', () => {
      const entity = world.createEntity();
      entity.addComponent(new Position(0, 0));
      entity.addComponent(new Velocity(1000000, -1000000));
      entity.addComponent(new Collision({ layer: 'extreme', mask: [] }));

      expect(() => world.update(0.001)).not.toThrow();
      
      const position = entity.getComponent(Position);
      expect(position.x).toBe(1000);
      expect(position.y).toBe(-1000);
    });

    test('should handle concurrent entity modifications', () => {
      const entities = [];
      
      // Create entities
      for (let i = 0; i < 10; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(i * 50, 100));
        entity.addComponent(new Velocity(10, 0));
        entity.addComponent(new Health(1));
        entities.push(entity);
      }

      // Modify entities during update cycle
      let updateCount = 0;
      const originalUpdate = movementSystem.processEntity;
      movementSystem.processEntity = function(entity, deltaTime) {
        originalUpdate.call(this, entity, deltaTime);
        
        updateCount++;
        if (updateCount === 5) {
          // Destroy an entity mid-update
          entities[7].destroy();
          // Add velocity to another
          entities[2].getComponent(Velocity).x = 50;
        }
      };

      expect(() => world.update(0.1)).not.toThrow();
      expect(world.getEntityCount()).toBe(9); // One destroyed
    });
  });
});