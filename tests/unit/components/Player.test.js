/**
 * Unit tests for Player component
 */

import { Player } from '../../../js/components/Player.js';
import { Component } from '../../../js/core/Component.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  describe('constructor', () => {
    test('should extend Component', () => {
      expect(player).toBeInstanceOf(Component);
      expect(player).toBeInstanceOf(Player);
    });

    test('should initialize with default values', () => {
      expect(player.speed).toBe(200);
      expect(player.shootCooldown).toBe(0.2);
      expect(player.lastShotTime).toBe(0);
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
    });
  });

  describe('canShoot', () => {
    test('should return true when cooldown has elapsed', () => {
      player.lastShotTime = 1.0;
      const currentTime = 1.25; // 0.25 seconds later, > 0.2 cooldown
      
      expect(player.canShoot(currentTime)).toBe(true);
    });

    test('should return false when cooldown has not elapsed', () => {
      player.lastShotTime = 1.0;
      const currentTime = 1.1; // 0.1 seconds later, < 0.2 cooldown
      
      expect(player.canShoot(currentTime)).toBe(false);
    });

    test('should return true for first shot (lastShotTime = 0)', () => {
      const currentTime = 0.1;
      
      expect(player.canShoot(currentTime)).toBe(true);
    });

    test('should return true when cooldown exactly elapsed', () => {
      player.lastShotTime = 1.0;
      const currentTime = 1.2; // Exactly 0.2 seconds later
      
      expect(player.canShoot(currentTime)).toBe(true);
    });

    test('should handle negative time differences', () => {
      player.lastShotTime = 2.0;
      const currentTime = 1.5; // Time went backwards somehow
      
      expect(player.canShoot(currentTime)).toBe(false);
    });

    test('should work with floating point precision', () => {
      player.lastShotTime = 1.0;
      const currentTime = 1.0 + player.shootCooldown + 0.001;
      
      expect(player.canShoot(currentTime)).toBe(true);
    });

    test('should respect custom shoot cooldown', () => {
      player.shootCooldown = 0.5;
      player.lastShotTime = 1.0;
      
      expect(player.canShoot(1.3)).toBe(false); // 0.3 < 0.5
      expect(player.canShoot(1.5)).toBe(true);  // 0.5 = 0.5
      expect(player.canShoot(1.7)).toBe(true);  // 0.7 > 0.5
    });
  });

  describe('recordShot', () => {
    test('should update lastShotTime', () => {
      const shotTime = 2.5;
      player.recordShot(shotTime);
      
      expect(player.lastShotTime).toBe(shotTime);
    });

    test('should allow recording multiple shots', () => {
      player.recordShot(1.0);
      expect(player.lastShotTime).toBe(1.0);
      
      player.recordShot(2.0);
      expect(player.lastShotTime).toBe(2.0);
      
      player.recordShot(3.5);
      expect(player.lastShotTime).toBe(3.5);
    });

    test('should handle zero time', () => {
      player.recordShot(0);
      expect(player.lastShotTime).toBe(0);
    });

    test('should handle negative time', () => {
      player.recordShot(-1.5);
      expect(player.lastShotTime).toBe(-1.5);
    });

    test('should handle floating point time', () => {
      const preciseTime = 1.23456789;
      player.recordShot(preciseTime);
      expect(player.lastShotTime).toBeCloseTo(preciseTime);
    });
  });

  describe('addScore', () => {
    test('should add points to current score', () => {
      player.addScore(100);
      expect(player.score).toBe(100);
      
      player.addScore(50);
      expect(player.score).toBe(150);
    });

    test('should handle zero points', () => {
      player.score = 100;
      player.addScore(0);
      expect(player.score).toBe(100);
    });

    test('should handle negative points', () => {
      player.score = 100;
      player.addScore(-25);
      expect(player.score).toBe(75);
    });

    test('should handle large point values', () => {
      player.addScore(1000000);
      expect(player.score).toBe(1000000);
      
      player.addScore(999999);
      expect(player.score).toBe(1999999);
    });

    test('should handle floating point scores', () => {
      player.addScore(12.5);
      expect(player.score).toBeCloseTo(12.5);
      
      player.addScore(7.3);
      expect(player.score).toBeCloseTo(19.8);
    });

    test('should accumulate scores correctly', () => {
      const scores = [10, 25, 50, 100, 250];
      let expectedTotal = 0;
      
      for (const score of scores) {
        player.addScore(score);
        expectedTotal += score;
        expect(player.score).toBe(expectedTotal);
      }
    });
  });

  describe('loseLife', () => {
    test('should decrease lives by 1', () => {
      expect(player.lives).toBe(3);
      
      const hasLivesLeft = player.loseLife();
      
      expect(player.lives).toBe(2);
      expect(hasLivesLeft).toBe(true);
    });

    test('should return true when lives remain', () => {
      player.lives = 2;
      
      const hasLivesLeft = player.loseLife();
      
      expect(hasLivesLeft).toBe(true);
      expect(player.lives).toBe(1);
    });

    test('should return false when no lives remain', () => {
      player.lives = 1;
      
      const hasLivesLeft = player.loseLife();
      
      expect(hasLivesLeft).toBe(false);
      expect(player.lives).toBe(0);
    });

    test('should handle multiple life losses', () => {
      expect(player.loseLife()).toBe(true);  // 3 -> 2
      expect(player.loseLife()).toBe(true);  // 2 -> 1
      expect(player.loseLife()).toBe(false); // 1 -> 0
      expect(player.lives).toBe(0);
    });

    test('should handle losing life when already at zero', () => {
      player.lives = 0;
      
      const hasLivesLeft = player.loseLife();
      
      expect(hasLivesLeft).toBe(false);
      expect(player.lives).toBe(-1);
    });

    test('should handle losing life from negative lives', () => {
      player.lives = -1;
      
      const hasLivesLeft = player.loseLife();
      
      expect(hasLivesLeft).toBe(false);
      expect(player.lives).toBe(-2);
    });
  });

  describe('addLife', () => {
    test('should increase lives by 1', () => {
      player.lives = 3;
      
      player.addLife();
      
      expect(player.lives).toBe(4);
    });

    test('should work from zero lives', () => {
      player.lives = 0;
      
      player.addLife();
      
      expect(player.lives).toBe(1);
    });

    test('should work from negative lives', () => {
      player.lives = -1;
      
      player.addLife();
      
      expect(player.lives).toBe(0);
    });

    test('should allow multiple life additions', () => {
      player.addLife();
      player.addLife();
      player.addLife();
      
      expect(player.lives).toBe(6); // Started with 3
    });

    test('should work in combination with loseLife', () => {
      player.loseLife(); // 3 -> 2
      player.addLife(); // 2 -> 3
      player.loseLife(); // 3 -> 2
      
      expect(player.lives).toBe(2);
    });
  });

  describe('isAlive', () => {
    test('should return true when player has lives', () => {
      expect(player.isAlive()).toBe(true);
      
      player.lives = 1;
      expect(player.isAlive()).toBe(true);
      
      player.lives = 10;
      expect(player.isAlive()).toBe(true);
    });

    test('should return false when player has no lives', () => {
      player.lives = 0;
      expect(player.isAlive()).toBe(false);
    });

    test('should return false when player has negative lives', () => {
      player.lives = -1;
      expect(player.isAlive()).toBe(false);
      
      player.lives = -10;
      expect(player.isAlive()).toBe(false);
    });

    test('should reflect life changes', () => {
      expect(player.isAlive()).toBe(true);
      
      player.loseLife();
      player.loseLife();
      player.loseLife();
      
      expect(player.isAlive()).toBe(false);
      
      player.addLife();
      
      expect(player.isAlive()).toBe(true);
    });
  });

  describe('resetStats', () => {
    test('should reset score and lives to default values', () => {
      player.score = 5000;
      player.lives = 1;
      player.lastShotTime = 10.5;
      
      player.resetStats();
      
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
      expect(player.lastShotTime).toBe(0);
    });

    test('should not affect speed and shootCooldown', () => {
      player.speed = 250;
      player.shootCooldown = 0.1;
      player.score = 1000;
      player.lives = 1;
      
      player.resetStats();
      
      expect(player.speed).toBe(250);
      expect(player.shootCooldown).toBe(0.1);
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
    });

    test('should reset from negative values', () => {
      player.score = -500;
      player.lives = -2;
      player.lastShotTime = -5;
      
      player.resetStats();
      
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
      expect(player.lastShotTime).toBe(0);
    });
  });

  describe('reset', () => {
    test('should reset all properties to default values', () => {
      player.speed = 300;
      player.shootCooldown = 0.1;
      player.lastShotTime = 5.0;
      player.score = 2000;
      player.lives = 1;
      
      player.reset();
      
      expect(player.speed).toBe(200);
      expect(player.shootCooldown).toBe(0.2);
      expect(player.lastShotTime).toBe(0);
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
    });

    test('should reset from any state', () => {
      player.speed = 500;
      player.shootCooldown = 1.0;
      player.lastShotTime = 100;
      player.score = -1000;
      player.lives = 0;
      
      player.reset();
      
      expect(player.speed).toBe(200);
      expect(player.shootCooldown).toBe(0.2);
      expect(player.lastShotTime).toBe(0);
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
    });
  });

  describe('clone', () => {
    test('should create new Player instance with same values', () => {
      player.speed = 250;
      player.shootCooldown = 0.15;
      player.lastShotTime = 2.5;
      player.score = 1500;
      player.lives = 2;
      
      const cloned = player.clone();
      
      expect(cloned).toBeInstanceOf(Player);
      expect(cloned).not.toBe(player);
      expect(cloned.speed).toBe(250);
      expect(cloned.shootCooldown).toBe(0.15);
      expect(cloned.lastShotTime).toBe(2.5);
      expect(cloned.score).toBe(1500);
      expect(cloned.lives).toBe(2);
    });

    test('should clone default values', () => {
      const cloned = player.clone();
      
      expect(cloned.speed).toBe(200);
      expect(cloned.shootCooldown).toBe(0.2);
      expect(cloned.lastShotTime).toBe(0);
      expect(cloned.score).toBe(0);
      expect(cloned.lives).toBe(3);
    });

    test('should create independent instances', () => {
      player.score = 1000;
      player.lives = 2;
      
      const cloned = player.clone();
      
      // Modify original
      player.score = 5000;
      player.lives = 1;
      
      // Clone should be unchanged
      expect(cloned.score).toBe(1000);
      expect(cloned.lives).toBe(2);
      
      // Modify clone
      cloned.addScore(500);
      cloned.loseLife();
      
      // Original should be unchanged
      expect(player.score).toBe(5000);
      expect(player.lives).toBe(1);
    });
  });

  describe('gameplay scenarios', () => {
    test('should handle typical shooting pattern', () => {
      let gameTime = 0;
      const timeStep = 0.1;
      const shotTimes = [];
      
      // Simulate 2 seconds of gameplay with rapid firing attempts
      for (let i = 0; i < 20; i++) {
        gameTime += timeStep;
        
        if (player.canShoot(gameTime)) {
          player.recordShot(gameTime);
          shotTimes.push(gameTime);
        }
      }
      
      // Should have shot multiple times, but respecting cooldown
      expect(shotTimes.length).toBeGreaterThan(5);
      
      // Check cooldown between shots
      for (let i = 1; i < shotTimes.length; i++) {
        const timeBetweenShots = shotTimes[i] - shotTimes[i-1];
        expect(timeBetweenShots).toBeGreaterThanOrEqual(player.shootCooldown - 0.001);
      }
    });

    test('should handle scoring and life management in gameplay', () => {
      // Player starts with 3 lives and 0 score
      expect(player.isAlive()).toBe(true);
      expect(player.score).toBe(0);
      
      // Player scores some points
      player.addScore(100);
      player.addScore(250);
      player.addScore(500);
      expect(player.score).toBe(850);
      
      // Player takes damage
      expect(player.loseLife()).toBe(true); // 3 -> 2 lives
      expect(player.isAlive()).toBe(true);
      
      // More scoring
      player.addScore(1000);
      expect(player.score).toBe(1850);
      
      // More damage
      expect(player.loseLife()).toBe(true); // 2 -> 1 life
      expect(player.loseLife()).toBe(false); // 1 -> 0 lives, game over
      expect(player.isAlive()).toBe(false);
      
      // Score should persist after death
      expect(player.score).toBe(1850);
    });

    test('should handle game restart scenario', () => {
      // Set up mid-game state
      player.score = 5000;
      player.lives = 1;
      player.lastShotTime = 10.5;
      player.speed = 250;
      
      // Reset for new game
      player.resetStats();
      
      // Stats should reset but gameplay properties remain
      expect(player.score).toBe(0);
      expect(player.lives).toBe(3);
      expect(player.lastShotTime).toBe(0);
      expect(player.speed).toBe(250); // Unchanged
      expect(player.isAlive()).toBe(true);
    });

    test('should handle power-up scenarios', () => {
      // Speed boost power-up
      player.speed = 300;
      expect(player.speed).toBe(300);
      
      // Faster shooting power-up
      player.shootCooldown = 0.1;
      let gameTime = 0;
      
      expect(player.canShoot(gameTime)).toBe(true);
      player.recordShot(gameTime);
      
      gameTime += 0.05;
      expect(player.canShoot(gameTime)).toBe(false); // Still cooling down
      
      gameTime += 0.06;
      expect(player.canShoot(gameTime)).toBe(true); // Cooldown elapsed
      
      // Extra life power-up
      player.lives = 2;
      player.addLife();
      expect(player.lives).toBe(3);
      player.addLife();
      expect(player.lives).toBe(4);
    });
  });

  describe('object pooling compatibility', () => {
    test('should support typical pooling workflow', () => {
      player.score = 1000;
      player.lives = 2;
      player.speed = 250;
      
      const pooled = player.clone();
      expect(pooled.score).toBe(1000);
      expect(pooled.lives).toBe(2);
      expect(pooled.speed).toBe(250);
      
      // Use pooled instance
      pooled.addScore(500);
      pooled.loseLife();
      
      // Reset before returning to pool
      pooled.reset();
      expect(pooled.score).toBe(0);
      expect(pooled.lives).toBe(3);
      expect(pooled.speed).toBe(200);
      
      // Original should be unchanged
      expect(player.score).toBe(1000);
      expect(player.lives).toBe(2);
      expect(player.speed).toBe(250);
    });
  });

  describe('edge cases', () => {
    test('should handle extreme time values in shooting', () => {
      player.lastShotTime = Number.MAX_VALUE;
      expect(player.canShoot(Number.MAX_VALUE + 1)).toBe(true);
      
      player.lastShotTime = Number.MIN_VALUE;
      expect(player.canShoot(0)).toBe(true);
    });

    test('should handle extreme score values', () => {
      player.addScore(Number.MAX_SAFE_INTEGER);
      expect(player.score).toBe(Number.MAX_SAFE_INTEGER);
      
      player.addScore(-Number.MAX_SAFE_INTEGER);
      expect(player.score).toBe(0);
    });

    test('should handle extreme life values', () => {
      player.lives = Number.MAX_SAFE_INTEGER;
      expect(player.isAlive()).toBe(true);
      
      player.lives = Number.MIN_SAFE_INTEGER;
      expect(player.isAlive()).toBe(false);
    });

    test('should handle floating point precision in timing', () => {
      const baseTime = 1234567890.123456789;
      player.recordShot(baseTime);
      
      const nextTime = baseTime + player.shootCooldown + 0.000001;
      expect(player.canShoot(nextTime)).toBe(true);
    });
  });
});