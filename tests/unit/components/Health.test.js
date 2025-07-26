/**
 * Unit tests for Health component
 */

import { Health } from '../../../js/components/Health.js';
import { Component } from '../../../js/core/Component.js';

describe('Health', () => {
  let health;

  beforeEach(() => {
    health = new Health();
  });

  describe('constructor', () => {
    test('should extend Component', () => {
      expect(health).toBeInstanceOf(Component);
      expect(health).toBeInstanceOf(Health);
    });

    test('should initialize with default values', () => {
      expect(health.maxHealth).toBe(1);
      expect(health.currentHealth).toBe(1);
      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
      expect(health.invulnerabilityDuration).toBe(0);
    });

    test('should initialize with provided max health', () => {
      const h = new Health(5);
      expect(h.maxHealth).toBe(5);
      expect(h.currentHealth).toBe(5);
    });

    test('should handle zero max health', () => {
      const h = new Health(0);
      expect(h.maxHealth).toBe(0);
      expect(h.currentHealth).toBe(0);
    });

    test('should handle negative max health', () => {
      const h = new Health(-5);
      expect(h.maxHealth).toBe(-5);
      expect(h.currentHealth).toBe(-5);
    });

    test('should handle floating point max health', () => {
      const h = new Health(2.5);
      expect(h.maxHealth).toBeCloseTo(2.5);
      expect(h.currentHealth).toBeCloseTo(2.5);
    });
  });

  describe('takeDamage', () => {
    beforeEach(() => {
      health = new Health(10);
    });

    test('should reduce current health by damage amount', () => {
      const result = health.takeDamage(3);

      expect(result).toBe(true);
      expect(health.currentHealth).toBe(7);
    });

    test('should not reduce health below zero', () => {
      health.takeDamage(15); // More than max health

      expect(health.currentHealth).toBe(0);
      expect(health.isDead()).toBe(true);
    });

    test('should return false when invulnerable', () => {
      health.setInvulnerable(1.0);
      const result = health.takeDamage(5);

      expect(result).toBe(false);
      expect(health.currentHealth).toBe(10); // Unchanged
    });

    test('should return false for zero or negative damage', () => {
      expect(health.takeDamage(0)).toBe(false);
      expect(health.takeDamage(-5)).toBe(false);
      expect(health.currentHealth).toBe(10); // Unchanged
    });

    test('should handle floating point damage', () => {
      health.takeDamage(2.5);

      expect(health.currentHealth).toBeCloseTo(7.5);
    });

    test('should handle multiple damage instances', () => {
      health.takeDamage(2);
      health.takeDamage(3);
      health.takeDamage(1);

      expect(health.currentHealth).toBe(4);
    });

    test('should handle exact lethal damage', () => {
      health.takeDamage(10);

      expect(health.currentHealth).toBe(0);
      expect(health.isDead()).toBe(true);
    });

    test('should clamp to zero when taking excessive damage', () => {
      health.takeDamage(1000);

      expect(health.currentHealth).toBe(0);
    });
  });

  describe('heal', () => {
    beforeEach(() => {
      health = new Health(10);
      health.currentHealth = 3; // Damaged state
    });

    test('should increase current health by heal amount', () => {
      health.heal(2);

      expect(health.currentHealth).toBe(5);
    });

    test('should not exceed max health', () => {
      health.heal(10); // More than needed

      expect(health.currentHealth).toBe(10); // Capped at max
    });

    test('should handle zero heal amount', () => {
      health.heal(0);

      expect(health.currentHealth).toBe(3); // Unchanged
    });

    test('should ignore negative heal amounts', () => {
      health.heal(-5);

      expect(health.currentHealth).toBe(3); // Unchanged
    });

    test('should handle floating point heal', () => {
      health.heal(1.5);

      expect(health.currentHealth).toBeCloseTo(4.5);
    });

    test('should work when at zero health', () => {
      health.currentHealth = 0;
      health.heal(5);

      expect(health.currentHealth).toBe(5);
      expect(health.isDead()).toBe(false);
    });

    test('should work with exact amount to full', () => {
      health.heal(7); // Exactly to full

      expect(health.currentHealth).toBe(10);
      expect(health.isFullHealth()).toBe(true);
    });
  });

  describe('isDead', () => {
    test('should return true when health is zero', () => {
      health.currentHealth = 0;

      expect(health.isDead()).toBe(true);
    });

    test('should return true when health is negative', () => {
      health.currentHealth = -5;

      expect(health.isDead()).toBe(true);
    });

    test('should return false when health is positive', () => {
      health.currentHealth = 1;

      expect(health.isDead()).toBe(false);
    });

    test('should reflect damage state changes', () => {
      health = new Health(5);
      expect(health.isDead()).toBe(false);

      health.takeDamage(5);
      expect(health.isDead()).toBe(true);

      health.heal(1);
      expect(health.isDead()).toBe(false);
    });
  });

  describe('isFullHealth', () => {
    beforeEach(() => {
      health = new Health(5);
    });

    test('should return true when at max health', () => {
      expect(health.isFullHealth()).toBe(true);
    });

    test('should return false when below max health', () => {
      health.currentHealth = 4;

      expect(health.isFullHealth()).toBe(false);
    });

    test('should return false when at zero health', () => {
      health.currentHealth = 0;

      expect(health.isFullHealth()).toBe(false);
    });

    test('should reflect healing changes', () => {
      health.takeDamage(2);
      expect(health.isFullHealth()).toBe(false);

      health.heal(2);
      expect(health.isFullHealth()).toBe(true);
    });

    test('should handle floating point comparison', () => {
      health = new Health(2.5);
      health.currentHealth = 2.5;

      expect(health.isFullHealth()).toBe(true);

      health.currentHealth = 2.49999;
      expect(health.isFullHealth()).toBe(false);
    });
  });

  describe('getHealthPercentage', () => {
    beforeEach(() => {
      health = new Health(10);
    });

    test('should return 1.0 for full health', () => {
      expect(health.getHealthPercentage()).toBeCloseTo(1.0);
    });

    test('should return 0.0 for zero health', () => {
      health.currentHealth = 0;

      expect(health.getHealthPercentage()).toBeCloseTo(0.0);
    });

    test('should return correct percentage for partial health', () => {
      health.currentHealth = 7;

      expect(health.getHealthPercentage()).toBeCloseTo(0.7);
    });

    test('should handle zero max health', () => {
      health = new Health(0);

      expect(health.getHealthPercentage()).toBe(0);
    });

    test('should handle negative health values', () => {
      health.currentHealth = -5;

      expect(health.getHealthPercentage()).toBeCloseTo(-0.5);
    });

    test('should handle floating point values', () => {
      health = new Health(3);
      health.currentHealth = 1.5;

      expect(health.getHealthPercentage()).toBeCloseTo(0.5);
    });

    test('should handle health above max', () => {
      health.currentHealth = 15; // Somehow above max

      expect(health.getHealthPercentage()).toBeCloseTo(1.5);
    });
  });

  describe('setMaxHealth', () => {
    beforeEach(() => {
      health = new Health(5);
      health.currentHealth = 3;
    });

    test('should set new max health', () => {
      health.setMaxHealth(10);

      expect(health.maxHealth).toBe(10);
      expect(health.currentHealth).toBe(3); // Unchanged
    });

    test('should clamp current health when reducing max health', () => {
      health.setMaxHealth(2);

      expect(health.maxHealth).toBe(2);
      expect(health.currentHealth).toBe(2); // Clamped down
    });

    test('should heal to full when specified', () => {
      health.setMaxHealth(8, true);

      expect(health.maxHealth).toBe(8);
      expect(health.currentHealth).toBe(8); // Healed to full
    });

    test('should enforce minimum of 1 for max health', () => {
      health.setMaxHealth(0);

      expect(health.maxHealth).toBe(1);
    });

    test('should enforce minimum for negative max health', () => {
      health.setMaxHealth(-5);

      expect(health.maxHealth).toBe(1);
    });

    test('should handle floating point max health', () => {
      health.setMaxHealth(7.5);

      expect(health.maxHealth).toBeCloseTo(7.5);
    });

    test('should not change current health when increasing max without heal flag', () => {
      health.setMaxHealth(10, false);

      expect(health.maxHealth).toBe(10);
      expect(health.currentHealth).toBe(3);
    });

    test('should clamp current health when at max and reducing max', () => {
      health.currentHealth = 5; // At max
      health.setMaxHealth(3);

      expect(health.maxHealth).toBe(3);
      expect(health.currentHealth).toBe(3);
    });
  });

  describe('setInvulnerable', () => {
    test('should set invulnerable state', () => {
      health.setInvulnerable(2.0);

      expect(health.invulnerable).toBe(true);
      expect(health.invulnerabilityTimer).toBe(0);
      expect(health.invulnerabilityDuration).toBe(2.0);
    });

    test('should reset timer when setting invulnerable', () => {
      health.invulnerabilityTimer = 1.5;
      health.setInvulnerable(3.0);

      expect(health.invulnerabilityTimer).toBe(0);
    });

    test('should handle zero duration', () => {
      health.setInvulnerable(0);

      expect(health.invulnerable).toBe(true);
      expect(health.invulnerabilityDuration).toBe(0);
    });

    test('should handle negative duration', () => {
      health.setInvulnerable(-1.0);

      expect(health.invulnerable).toBe(true);
      expect(health.invulnerabilityDuration).toBe(-1.0);
    });
  });

  describe('updateInvulnerability', () => {
    beforeEach(() => {
      health.setInvulnerable(2.0);
    });

    test('should update timer when invulnerable', () => {
      health.updateInvulnerability(0.5);

      expect(health.invulnerabilityTimer).toBeCloseTo(0.5);
      expect(health.invulnerable).toBe(true);
    });

    test('should disable invulnerability when timer expires', () => {
      health.updateInvulnerability(2.0);

      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
    });

    test('should disable invulnerability when timer exceeds duration', () => {
      health.updateInvulnerability(2.5);

      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
    });

    test('should not update timer when not invulnerable', () => {
      health.invulnerable = false;
      health.invulnerabilityTimer = 0;

      health.updateInvulnerability(1.0);

      expect(health.invulnerabilityTimer).toBe(0);
    });

    test('should handle multiple small updates', () => {
      for (let i = 0; i < 10; i++) {
        health.updateInvulnerability(0.1);
      }

      expect(health.invulnerabilityTimer).toBeCloseTo(1.0);
      expect(health.invulnerable).toBe(true);

      // One more update to exceed duration
      health.updateInvulnerability(1.1);

      expect(health.invulnerable).toBe(false);
    });

    test('should handle zero delta time', () => {
      health.updateInvulnerability(0);

      expect(health.invulnerabilityTimer).toBe(0);
      expect(health.invulnerable).toBe(true);
    });

    test('should handle negative delta time', () => {
      health.invulnerabilityTimer = 1.0;
      health.updateInvulnerability(-0.5);

      expect(health.invulnerabilityTimer).toBeCloseTo(0.5);
      expect(health.invulnerable).toBe(true);
    });
  });

  describe('kill', () => {
    test('should set health to zero', () => {
      health = new Health(10);
      health.kill();

      expect(health.currentHealth).toBe(0);
      expect(health.isDead()).toBe(true);
    });

    test('should work when already at zero', () => {
      health.currentHealth = 0;
      health.kill();

      expect(health.currentHealth).toBe(0);
    });

    test('should work when invulnerable', () => {
      health = new Health(5);
      health.setInvulnerable(1.0);
      health.kill();

      expect(health.currentHealth).toBe(0);
      expect(health.isDead()).toBe(true);
    });
  });

  describe('restore', () => {
    beforeEach(() => {
      health = new Health(10);
      health.currentHealth = 3;
      health.setInvulnerable(2.0);
      health.updateInvulnerability(1.0);
    });

    test('should restore to full health', () => {
      health.restore();

      expect(health.currentHealth).toBe(10);
      expect(health.isFullHealth()).toBe(true);
    });

    test('should clear invulnerability', () => {
      health.restore();

      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
    });

    test('should work when already at full health', () => {
      health.currentHealth = 10;
      health.restore();

      expect(health.currentHealth).toBe(10);
      expect(health.invulnerable).toBe(false);
    });

    test('should work when dead', () => {
      health.currentHealth = 0;
      health.restore();

      expect(health.currentHealth).toBe(10);
      expect(health.isDead()).toBe(false);
    });
  });

  describe('reset', () => {
    test('should reset all properties to defaults', () => {
      health = new Health(20);
      health.currentHealth = 5;
      health.setInvulnerable(3.0);
      health.updateInvulnerability(1.5);

      health.reset();

      expect(health.maxHealth).toBe(1);
      expect(health.currentHealth).toBe(1);
      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
      expect(health.invulnerabilityDuration).toBe(0);
    });
  });

  describe('clone', () => {
    test('should create new Health instance with same values', () => {
      health = new Health(15);
      health.currentHealth = 8;
      health.setInvulnerable(2.5);
      health.updateInvulnerability(1.2);

      const cloned = health.clone();

      expect(cloned).toBeInstanceOf(Health);
      expect(cloned).not.toBe(health);
      expect(cloned.maxHealth).toBe(15);
      expect(cloned.currentHealth).toBe(8);
      expect(cloned.invulnerable).toBe(true);
      expect(cloned.invulnerabilityTimer).toBeCloseTo(1.2);
      expect(cloned.invulnerabilityDuration).toBeCloseTo(2.5);
    });

    test('should create independent instances', () => {
      health = new Health(10);
      health.currentHealth = 5;

      const cloned = health.clone();

      // Modify original
      health.takeDamage(3);
      health.setInvulnerable(1.0);

      // Clone should be unchanged
      expect(cloned.currentHealth).toBe(5);
      expect(cloned.invulnerable).toBe(false);

      // Modify clone
      cloned.heal(2);

      // Original should be unchanged by clone modifications
      expect(health.currentHealth).toBe(2);
    });

    test('should clone default values', () => {
      const cloned = health.clone();

      expect(cloned.maxHealth).toBe(1);
      expect(cloned.currentHealth).toBe(1);
      expect(cloned.invulnerable).toBe(false);
    });
  });

  describe('gameplay scenarios', () => {
    test('should handle typical combat scenario', () => {
      health = new Health(100); // Player with 100 HP

      // Take some damage
      health.takeDamage(25);
      expect(health.currentHealth).toBe(75);
      expect(health.getHealthPercentage()).toBeCloseTo(0.75);

      // Become invulnerable briefly
      health.setInvulnerable(1.0);
      health.takeDamage(50); // Should be ignored
      expect(health.currentHealth).toBe(75);

      // Time passes
      health.updateInvulnerability(1.1);
      expect(health.invulnerable).toBe(false);

      // Take more damage
      health.takeDamage(40);
      expect(health.currentHealth).toBe(35);

      // Heal up
      health.heal(20);
      expect(health.currentHealth).toBe(55);

      // Lethal hit
      health.takeDamage(100);
      expect(health.isDead()).toBe(true);
    });

    test('should handle boss enemy with multiple health phases', () => {
      health = new Health(300);

      // Phase 1: normal health
      health.takeDamage(100);
      expect(health.getHealthPercentage()).toBeCloseTo(0.67, 1);

      // Phase 2: increased max health
      health.setMaxHealth(500, false);
      expect(health.getHealthPercentage()).toBeCloseTo(0.4);

      // Phase 3: heal to full
      health.restore();
      expect(health.currentHealth).toBe(500);
      expect(health.isFullHealth()).toBe(true);

      // Final phase: vulnerable burst
      health.takeDamage(500);
      expect(health.isDead()).toBe(true);
    });

    test('should handle power-up scenarios', () => {
      health = new Health(50);
      health.currentHealth = 10; // Low health

      // Health power-up increases max and heals
      health.setMaxHealth(75, true);
      expect(health.currentHealth).toBe(75);
      expect(health.maxHealth).toBe(75);

      // Invulnerability power-up
      health.setInvulnerable(3.0);
      
      // Simulate taking damage over time during invulnerability
      for (let i = 0; i < 30; i++) {
        health.updateInvulnerability(0.1);
        health.takeDamage(10); // Should be ignored while invulnerable
      }
      
      expect(health.invulnerable).toBe(false); // 3.0 seconds passed
      expect(health.currentHealth).toBe(75); // No damage taken

      // Now vulnerable again
      health.takeDamage(25);
      expect(health.currentHealth).toBe(50);
    });

    test('should handle edge case of zero max health entity', () => {
      health = new Health(0);

      expect(health.isDead()).toBe(true);
      expect(health.getHealthPercentage()).toBe(0);
      
      // Healing should work
      health.heal(5);
      expect(health.currentHealth).toBe(0); // Clamped to max
      
      // Damage should work
      health.takeDamage(5);
      expect(health.currentHealth).toBe(-5);
    });
  });

  describe('object pooling compatibility', () => {
    test('should support typical pooling workflow', () => {
      health = new Health(50);
      health.currentHealth = 25;
      health.setInvulnerable(1.0);

      const pooled = health.clone();
      expect(pooled.maxHealth).toBe(50);
      expect(pooled.currentHealth).toBe(25);
      expect(pooled.invulnerable).toBe(true);

      // Use pooled instance
      pooled.takeDamage(10);
      pooled.updateInvulnerability(2.0);

      // Reset before returning to pool
      pooled.reset();
      expect(pooled.maxHealth).toBe(1);
      expect(pooled.currentHealth).toBe(1);
      expect(pooled.invulnerable).toBe(false);

      // Original should be unchanged
      expect(health.maxHealth).toBe(50);
      expect(health.currentHealth).toBe(25);
    });
  });

  describe('edge cases', () => {
    test('should handle extreme health values', () => {
      health = new Health(Number.MAX_SAFE_INTEGER);

      expect(health.maxHealth).toBe(Number.MAX_SAFE_INTEGER);
      expect(health.currentHealth).toBe(Number.MAX_SAFE_INTEGER);

      health.takeDamage(1000000);
      expect(health.currentHealth).toBe(Number.MAX_SAFE_INTEGER - 1000000);
    });

    test('should handle floating point precision in invulnerability', () => {
      health.setInvulnerable(0.1);

      for (let i = 0; i < 100; i++) {
        health.updateInvulnerability(0.001);
      }

      expect(health.invulnerable).toBe(false); // Should have expired
    });

    test('should handle NaN and Infinity values', () => {
      health = new Health(Infinity);
      expect(health.maxHealth).toBe(Infinity);

      health.takeDamage(Infinity);
      expect(health.currentHealth).toBeNaN(); // Infinity - Infinity = NaN

      health = new Health(NaN);
      expect(health.maxHealth).toBeNaN();
    });

    test('should handle rapid invulnerability toggling', () => {
      for (let i = 0; i < 100; i++) {
        health.setInvulnerable(0.1);
        health.updateInvulnerability(0.2);
      }

      expect(health.invulnerable).toBe(false);
      expect(health.invulnerabilityTimer).toBe(0);
    });
  });
});