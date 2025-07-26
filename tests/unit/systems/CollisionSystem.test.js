/**
 * Unit tests for CollisionSystem
 */

import { CollisionSystem } from '../../../js/systems/CollisionSystem.js';
import { World } from '../../../js/core/World.js';
import { Entity } from '../../../js/core/Entity.js';
import { Position } from '../../../js/components/Position.js';
import { Collision } from '../../../js/components/Collision.js';
import { Health } from '../../../js/components/Health.js';
import { Player } from '../../../js/components/Player.js';
import { Enemy } from '../../../js/components/Enemy.js';
import { Projectile } from '../../../js/components/Projectile.js';
import { Obstacle } from '../../../js/components/Obstacle.js';

// Mock the missing components that are referenced in CollisionSystem
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
    this.hitCount = 0;
  }
  
  isPlayerProjectile() {
    return this.owner === 'player';
  }
  
  getDamage() {
    return this.damage;
  }
  
  onHit() {
    this.hitCount++;
    return true; // Destroy projectile on hit
  }
}

class MockObstacle {
  constructor(destructible = false, damage = 1, scoreValue = 50) {
    this.destructible = destructible;
    this.damage = damage;
    this.scoreValue = scoreValue;
  }
  
  isDestructible() {
    return this.destructible;
  }
  
  getDamage() {
    return this.damage;
  }
  
  getScoreValue() {
    return this.scoreValue;
  }
}

// Mock the Enemy, Projectile, and Obstacle components
jest.mock('../../../js/components/Enemy.js', () => ({
  Enemy: MockEnemy
}));

jest.mock('../../../js/components/Projectile.js', () => ({
  Projectile: MockProjectile
}));

jest.mock('../../../js/components/Obstacle.js', () => ({
  Obstacle: MockObstacle
}));

describe('CollisionSystem', () => {
  let world;
  let system;

  beforeEach(() => {
    world = new World();
    system = new CollisionSystem(world);
    world.addSystem('collision', system);
  });

  describe('constructor', () => {
    test('should initialize with required components', () => {
      expect(system.requiredComponents).toEqual([Position, Collision]);
    });

    test('should initialize empty collision events array', () => {
      expect(system.collisionEvents).toEqual([]);
    });
  });

  describe('collision detection', () => {
    test('should detect rectangle-rectangle collision', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ width: 32, height: 32, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(110, 110));
      entity2.addComponent(new Collision({ width: 32, height: 32, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });

    test('should not detect collision when rectangles do not overlap', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ width: 32, height: 32, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(200, 200));
      entity2.addComponent(new Collision({ width: 32, height: 32, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(false);
    });

    test('should detect circle-circle collision', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ type: 'circle', radius: 20, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(130, 100));
      entity2.addComponent(new Collision({ type: 'circle', radius: 15, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });

    test('should not detect collision when circles do not overlap', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ type: 'circle', radius: 10, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(200, 100));
      entity2.addComponent(new Collision({ type: 'circle', radius: 10, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(false);
    });

    test('should detect rectangle-circle collision', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ width: 32, height: 32, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(120, 100));
      entity2.addComponent(new Collision({ type: 'circle', radius: 10, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });
  });

  describe('collision layer filtering', () => {
    test('should not check collision between incompatible layers', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'player', mask: ['enemy'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'pickup', mask: ['player'] }));

      // entity1 can collide with 'enemy' but entity2 is 'pickup'
      const spy = jest.spyOn(system, 'checkCollision');
      system.processEntity(entity1, 0.016);

      expect(spy).not.toHaveBeenCalledWith(entity1, entity2);
    });

    test('should check collision between compatible layers', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'player', mask: ['enemy'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'enemy', mask: ['player'] }));

      const spy = jest.spyOn(system, 'checkCollision');
      system.processEntity(entity1, 0.016);

      expect(spy).toHaveBeenCalledWith(entity1, entity2);
    });

    test('should respect disabled collision components', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      const collision1 = new Collision({ layer: 'player', mask: ['enemy'] });
      collision1.enabled = false;
      entity1.addComponent(collision1);

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'enemy', mask: ['player'] }));

      const spy = jest.spyOn(system, 'checkCollision');
      system.processEntity(entity1, 0.016);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('player vs enemy collision', () => {
    test('should handle player-enemy collision', () => {
      const player = world.createEntity();
      player.addComponent(new Position(100, 100));
      player.addComponent(new Collision({ layer: 'player', mask: ['enemy'] }));
      player.addComponent(new Player());
      player.addComponent(new Health(3));

      const enemy = world.createEntity();
      enemy.addComponent(new Position(100, 100));
      enemy.addComponent(new Collision({ layer: 'enemy', mask: ['player'] }));
      enemy.addComponent(new MockEnemy());

      system.handleCollisionEvent(player, enemy);

      const playerHealth = player.getComponent(Health);
      expect(playerHealth.currentHealth).toBe(2); // Took 1 damage
      expect(enemy.active).toBe(false); // Enemy destroyed
    });

    test('should trigger game over when player dies', () => {
      const player = world.createEntity();
      player.addComponent(new Position(100, 100));
      player.addComponent(new Player());
      player.addComponent(new Health(1));

      const enemy = world.createEntity();
      enemy.addComponent(new Position(100, 100));
      enemy.addComponent(new MockEnemy());

      // Mock the game state system
      const mockGameState = { triggerGameOver: jest.fn() };
      world.addSystem('gameState', mockGameState);

      system.handlePlayerEnemyCollision(player, enemy);

      expect(mockGameState.triggerGameOver).toHaveBeenCalled();
    });
  });

  describe('projectile vs enemy collision', () => {
    test('should handle projectile hitting enemy', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new Position(100, 100));
      projectile.addComponent(new MockProjectile('player', 2));

      const enemy = world.createEntity();
      enemy.addComponent(new Position(100, 100));
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Health(3));

      system.handleProjectileEnemyCollision(projectile, enemy);

      const enemyHealth = enemy.getComponent(Health);
      expect(enemyHealth.currentHealth).toBe(1); // Took 2 damage
      expect(projectile.active).toBe(false); // Projectile destroyed
    });

    test('should award points when enemy is killed', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile('player', 5));

      const enemy = world.createEntity();
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Health(3));

      system.handleProjectileEnemyCollision(projectile, enemy);

      const playerComp = player.getComponent(Player);
      expect(playerComp.score).toBe(100); // Enemy worth 100 points
      expect(enemy.active).toBe(false); // Enemy destroyed
    });

    test('should ignore non-player projectiles', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile('enemy', 5));

      const enemy = world.createEntity();
      enemy.addComponent(new MockEnemy());
      enemy.addComponent(new Health(3));

      system.handleProjectileEnemyCollision(projectile, enemy);

      const enemyHealth = enemy.getComponent(Health);
      expect(enemyHealth.currentHealth).toBe(3); // No damage taken
    });
  });

  describe('player vs obstacle collision', () => {
    test('should handle player hitting obstacle', () => {
      const player = world.createEntity();
      player.addComponent(new Player());
      player.addComponent(new Health(3));

      const obstacle = world.createEntity();
      obstacle.addComponent(new MockObstacle(false, 2));

      system.handlePlayerObstacleCollision(player, obstacle);

      const playerHealth = player.getComponent(Health);
      expect(playerHealth.currentHealth).toBe(1); // Took 2 damage
      expect(obstacle.active).toBe(false); // Obstacle destroyed
    });
  });

  describe('projectile vs obstacle collision', () => {
    test('should handle projectile hitting destructible obstacle', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile('player', 1));

      const obstacle = world.createEntity();
      obstacle.addComponent(new MockObstacle(true, 1, 25));

      system.handleProjectileObstacleCollision(projectile, obstacle);

      const playerComp = player.getComponent(Player);
      expect(playerComp.score).toBe(25); // Obstacle worth 25 points
      expect(obstacle.active).toBe(false); // Obstacle destroyed
      expect(projectile.active).toBe(false); // Projectile destroyed
    });

    test('should handle projectile hitting indestructible obstacle', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile('player', 1));

      const obstacle = world.createEntity();
      obstacle.addComponent(new MockObstacle(false, 1, 25));

      system.handleProjectileObstacleCollision(projectile, obstacle);

      expect(obstacle.active).toBe(true); // Obstacle not destroyed
      expect(projectile.active).toBe(false); // Projectile destroyed
    });
  });

  describe('collision event processing', () => {
    test('should collect collision events during update', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'b', mask: ['a'] }));

      system.update(0.016);

      expect(system.collisionEvents).toHaveLength(1);
      expect(system.collisionEvents[0].entityA).toBe(entity1);
      expect(system.collisionEvents[0].entityB).toBe(entity2);
    });

    test('should clear collision events between updates', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'b', mask: ['a'] }));

      system.update(0.016);
      expect(system.collisionEvents).toHaveLength(1);

      // Move entities apart
      entity1.getComponent(Position).x = 200;
      system.update(0.016);
      expect(system.collisionEvents).toHaveLength(0);
    });

    test('should handle multiple collision events in single update', () => {
      // Entity 1 collides with both Entity 2 and Entity 3
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'b', mask: ['a'] }));

      const entity3 = world.createEntity();
      entity3.addComponent(new Position(100, 100));
      entity3.addComponent(new Collision({ layer: 'b', mask: ['a'] }));

      system.update(0.016);

      expect(system.collisionEvents).toHaveLength(2);
    });
  });

  describe('collision type identification', () => {
    test('should correctly identify player-enemy collision', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      const enemy = world.createEntity();
      enemy.addComponent(new MockEnemy());

      expect(system.isPlayerEnemyCollision(player, enemy)).toBe(true);
      expect(system.isPlayerEnemyCollision(enemy, player)).toBe(true);
    });

    test('should correctly identify projectile-enemy collision', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile('player'));

      const enemy = world.createEntity();
      enemy.addComponent(new MockEnemy());

      expect(system.isProjectileEnemyCollision(projectile, enemy)).toBe(true);
      expect(system.isProjectileEnemyCollision(enemy, projectile)).toBe(true);
    });

    test('should correctly identify player-obstacle collision', () => {
      const player = world.createEntity();
      player.addComponent(new Player());

      const obstacle = world.createEntity();
      obstacle.addComponent(new MockObstacle());

      expect(system.isPlayerObstacleCollision(player, obstacle)).toBe(true);
      expect(system.isPlayerObstacleCollision(obstacle, player)).toBe(true);
    });

    test('should correctly identify projectile-obstacle collision', () => {
      const projectile = world.createEntity();
      projectile.addComponent(new MockProjectile());

      const obstacle = world.createEntity();
      obstacle.addComponent(new MockObstacle());

      expect(system.isProjectileObstacleCollision(projectile, obstacle)).toBe(true);
      expect(system.isProjectileObstacleCollision(obstacle, projectile)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle entity without collision component', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      // No collision component

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision());

      expect(() => system.processEntity(entity1, 0.016)).not.toThrow();
    });

    test('should handle entity without position component', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Collision());
      // No position component

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision());

      expect(() => system.processEntity(entity1, 0.016)).not.toThrow();
    });

    test('should handle inactive entities', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ layer: 'b', mask: ['a'] }));
      entity2.active = false;

      system.update(0.016);

      expect(system.collisionEvents).toHaveLength(0);
    });

    test('should handle collision with self', () => {
      const entity = world.createEntity();
      entity.addComponent(new Position(100, 100));
      entity.addComponent(new Collision({ layer: 'a', mask: ['a'] }));

      system.update(0.016);

      expect(system.collisionEvents).toHaveLength(0);
    });

    test('should handle entities at exact same position', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ width: 32, height: 32, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ width: 32, height: 32, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });

    test('should handle zero-size collision bounds', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ width: 0, height: 0, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ width: 32, height: 32, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });

    test('should handle circle with zero radius', () => {
      const entity1 = world.createEntity();
      entity1.addComponent(new Position(100, 100));
      entity1.addComponent(new Collision({ type: 'circle', radius: 0, layer: 'a', mask: ['b'] }));

      const entity2 = world.createEntity();
      entity2.addComponent(new Position(100, 100));
      entity2.addComponent(new Collision({ type: 'circle', radius: 10, layer: 'b', mask: ['a'] }));

      const collides = system.checkCollision(entity1, entity2);
      expect(collides).toBe(true);
    });
  });

  describe('performance', () => {
    test('should handle large numbers of entities efficiently', () => {
      // Create many non-colliding entities
      for (let i = 0; i < 100; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(i * 100, i * 100));
        entity.addComponent(new Collision({ layer: 'test', mask: ['test'] }));
      }

      const startTime = performance.now();
      system.update(0.016);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
      expect(system.collisionEvents).toHaveLength(0); // No collisions
    });

    test('should handle entities with many collision checks', () => {
      // Create one entity that can collide with many others
      const central = world.createEntity();
      central.addComponent(new Position(100, 100));
      central.addComponent(new Collision({ layer: 'central', mask: ['other'] }));

      // Create many entities around it
      for (let i = 0; i < 50; i++) {
        const entity = world.createEntity();
        entity.addComponent(new Position(200 + i, 200 + i));
        entity.addComponent(new Collision({ layer: 'other', mask: ['central'] }));
      }

      const startTime = performance.now();
      system.update(0.016);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});