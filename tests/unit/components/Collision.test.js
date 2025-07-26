/**
 * Unit tests for Collision component
 */

import { Collision } from '../../../js/components/Collision.js';
import { Component } from '../../../js/core/Component.js';

describe('Collision', () => {
  let collision;

  beforeEach(() => {
    collision = new Collision();
  });

  describe('constructor', () => {
    test('should extend Component', () => {
      expect(collision).toBeInstanceOf(Component);
      expect(collision).toBeInstanceOf(Collision);
    });

    test('should initialize with default values', () => {
      expect(collision.width).toBe(32);
      expect(collision.height).toBe(32);
      expect(collision.offsetX).toBe(0);
      expect(collision.offsetY).toBe(0);
      expect(collision.type).toBe('rectangle');
      expect(collision.radius).toBe(16);
      expect(collision.layer).toBe('default');
      expect(collision.mask).toEqual(['default']);
      expect(collision.isTrigger).toBe(false);
      expect(collision.enabled).toBe(true);
    });

    test('should initialize with provided config', () => {
      const config = {
        width: 64,
        height: 48,
        offsetX: 10,
        offsetY: 20,
        type: 'circle',
        radius: 25,
        layer: 'player',
        mask: ['enemy', 'obstacle'],
        isTrigger: true,
        enabled: false
      };

      const col = new Collision(config);

      expect(col.width).toBe(64);
      expect(col.height).toBe(48);
      expect(col.offsetX).toBe(10);
      expect(col.offsetY).toBe(20);
      expect(col.type).toBe('circle');
      expect(col.radius).toBe(25);
      expect(col.layer).toBe('player');
      expect(col.mask).toEqual(['enemy', 'obstacle']);
      expect(col.isTrigger).toBe(true);
      expect(col.enabled).toBe(false);
    });

    test('should handle partial config', () => {
      const col = new Collision({ width: 100, layer: 'custom' });

      expect(col.width).toBe(100);
      expect(col.height).toBe(32); // default
      expect(col.layer).toBe('custom');
      expect(col.mask).toEqual(['default']); // default
    });

    test('should handle empty config', () => {
      const col = new Collision({});

      expect(col.width).toBe(32);
      expect(col.height).toBe(32);
      expect(col.enabled).toBe(true);
    });
  });

  describe('setSize', () => {
    test('should set width and height', () => {
      collision.setSize(100, 80);

      expect(collision.width).toBe(100);
      expect(collision.height).toBe(80);
    });

    test('should handle negative values', () => {
      collision.setSize(-50, -30);

      expect(collision.width).toBe(-50);
      expect(collision.height).toBe(-30);
    });

    test('should handle zero values', () => {
      collision.setSize(0, 0);

      expect(collision.width).toBe(0);
      expect(collision.height).toBe(0);
    });

    test('should handle floating point values', () => {
      collision.setSize(12.5, 34.7);

      expect(collision.width).toBeCloseTo(12.5);
      expect(collision.height).toBeCloseTo(34.7);
    });
  });

  describe('setOffset', () => {
    test('should set offset values', () => {
      collision.setOffset(15, -10);

      expect(collision.offsetX).toBe(15);
      expect(collision.offsetY).toBe(-10);
    });

    test('should handle zero offset', () => {
      collision.offsetX = 100;
      collision.offsetY = 200;

      collision.setOffset(0, 0);

      expect(collision.offsetX).toBe(0);
      expect(collision.offsetY).toBe(0);
    });

    test('should handle floating point offset', () => {
      collision.setOffset(2.5, -7.3);

      expect(collision.offsetX).toBeCloseTo(2.5);
      expect(collision.offsetY).toBeCloseTo(-7.3);
    });
  });

  describe('setLayer', () => {
    test('should set collision layer', () => {
      collision.setLayer('player');

      expect(collision.layer).toBe('player');
    });

    test('should handle empty string', () => {
      collision.setLayer('');

      expect(collision.layer).toBe('');
    });

    test('should handle special characters', () => {
      collision.setLayer('player_projectile');

      expect(collision.layer).toBe('player_projectile');
    });
  });

  describe('setMask', () => {
    test('should set mask array', () => {
      collision.setMask(['enemy', 'obstacle']);

      expect(collision.mask).toEqual(['enemy', 'obstacle']);
    });

    test('should convert string to array', () => {
      collision.setMask('enemy');

      expect(collision.mask).toEqual(['enemy']);
    });

    test('should handle empty array', () => {
      collision.setMask([]);

      expect(collision.mask).toEqual([]);
    });

    test('should handle single element array', () => {
      collision.setMask(['single']);

      expect(collision.mask).toEqual(['single']);
    });

    test('should create new array (not reference)', () => {
      const originalMask = ['enemy', 'obstacle'];
      collision.setMask(originalMask);

      originalMask.push('new');

      expect(collision.mask).toEqual(['enemy', 'obstacle']);
    });
  });

  describe('canCollideWith', () => {
    test('should return true for layers in mask', () => {
      collision.setMask(['enemy', 'obstacle']);

      expect(collision.canCollideWith('enemy')).toBe(true);
      expect(collision.canCollideWith('obstacle')).toBe(true);
    });

    test('should return false for layers not in mask', () => {
      collision.setMask(['enemy', 'obstacle']);

      expect(collision.canCollideWith('player')).toBe(false);
      expect(collision.canCollideWith('pickup')).toBe(false);
    });

    test('should handle empty mask', () => {
      collision.setMask([]);

      expect(collision.canCollideWith('enemy')).toBe(false);
      expect(collision.canCollideWith('anything')).toBe(false);
    });

    test('should handle default mask', () => {
      expect(collision.canCollideWith('default')).toBe(true);
      expect(collision.canCollideWith('other')).toBe(false);
    });

    test('should be case sensitive', () => {
      collision.setMask(['Enemy']);

      expect(collision.canCollideWith('Enemy')).toBe(true);
      expect(collision.canCollideWith('enemy')).toBe(false);
    });
  });

  describe('getBounds rectangle', () => {
    test('should return rectangle bounds centered on position', () => {
      collision.setSize(40, 60);
      const bounds = collision.getBounds(100, 200);

      expect(bounds.left).toBe(80);   // 100 - 40/2
      expect(bounds.top).toBe(170);   // 200 - 60/2
      expect(bounds.right).toBe(120); // 100 + 40/2
      expect(bounds.bottom).toBe(230); // 200 + 60/2
    });

    test('should apply offset to bounds', () => {
      collision.setSize(40, 60);
      collision.setOffset(10, -15);
      const bounds = collision.getBounds(100, 200);

      expect(bounds.left).toBe(90);   // (100 + 10) - 40/2
      expect(bounds.top).toBe(155);   // (200 - 15) - 60/2
      expect(bounds.right).toBe(130); // (100 + 10) + 40/2
      expect(bounds.bottom).toBe(215); // (200 - 15) + 60/2
    });

    test('should handle zero size', () => {
      collision.setSize(0, 0);
      const bounds = collision.getBounds(50, 75);

      expect(bounds.left).toBe(50);
      expect(bounds.top).toBe(75);
      expect(bounds.right).toBe(50);
      expect(bounds.bottom).toBe(75);
    });

    test('should handle negative position', () => {
      collision.setSize(20, 30);
      const bounds = collision.getBounds(-50, -100);

      expect(bounds.left).toBe(-60);
      expect(bounds.top).toBe(-115);
      expect(bounds.right).toBe(-40);
      expect(bounds.bottom).toBe(-85);
    });

    test('should handle floating point values', () => {
      collision.setSize(10.5, 20.7);
      collision.setOffset(2.3, -1.8);
      const bounds = collision.getBounds(100.2, 200.4);

      expect(bounds.left).toBeCloseTo(97.25);  // (100.2 + 2.3) - 10.5/2
      expect(bounds.top).toBeCloseTo(188.25);  // (200.4 - 1.8) - 20.7/2
      expect(bounds.right).toBeCloseTo(107.75); // (100.2 + 2.3) + 10.5/2
      expect(bounds.bottom).toBeCloseTo(208.95); // (200.4 - 1.8) + 20.7/2
    });
  });

  describe('getBounds circle', () => {
    beforeEach(() => {
      collision.type = 'circle';
      collision.radius = 25;
    });

    test('should return circle bounds', () => {
      const bounds = collision.getBounds(100, 200);

      expect(bounds.centerX).toBe(100);
      expect(bounds.centerY).toBe(200);
      expect(bounds.radius).toBe(25);
      expect(bounds.left).toBe(75);   // 100 - 25
      expect(bounds.top).toBe(175);   // 200 - 25
      expect(bounds.right).toBe(125); // 100 + 25
      expect(bounds.bottom).toBe(225); // 200 + 25
    });

    test('should apply offset to circle center', () => {
      collision.setOffset(10, -15);
      const bounds = collision.getBounds(100, 200);

      expect(bounds.centerX).toBe(110); // 100 + 10
      expect(bounds.centerY).toBe(185); // 200 - 15
      expect(bounds.radius).toBe(25);
      expect(bounds.left).toBe(85);   // 110 - 25
      expect(bounds.top).toBe(160);   // 185 - 25
      expect(bounds.right).toBe(135); // 110 + 25
      expect(bounds.bottom).toBe(210); // 185 + 25
    });

    test('should handle zero radius', () => {
      collision.radius = 0;
      const bounds = collision.getBounds(50, 75);

      expect(bounds.centerX).toBe(50);
      expect(bounds.centerY).toBe(75);
      expect(bounds.radius).toBe(0);
      expect(bounds.left).toBe(50);
      expect(bounds.top).toBe(75);
      expect(bounds.right).toBe(50);
      expect(bounds.bottom).toBe(75);
    });

    test('should handle floating point radius', () => {
      collision.radius = 12.5;
      const bounds = collision.getBounds(100.3, 200.7);

      expect(bounds.centerX).toBeCloseTo(100.3);
      expect(bounds.centerY).toBeCloseTo(200.7);
      expect(bounds.radius).toBeCloseTo(12.5);
      expect(bounds.left).toBeCloseTo(87.8);
      expect(bounds.top).toBeCloseTo(188.2);
      expect(bounds.right).toBeCloseTo(112.8);
      expect(bounds.bottom).toBeCloseTo(213.2);
    });
  });

  describe('setEnabled', () => {
    test('should enable collision', () => {
      collision.enabled = false;
      collision.setEnabled(true);

      expect(collision.enabled).toBe(true);
    });

    test('should disable collision', () => {
      collision.setEnabled(false);

      expect(collision.enabled).toBe(false);
    });

    test('should handle truthy/falsy values', () => {
      collision.setEnabled(1);
      expect(collision.enabled).toBe(true);

      collision.setEnabled(0);
      expect(collision.enabled).toBe(false);

      collision.setEnabled('yes');
      expect(collision.enabled).toBe(true);

      collision.setEnabled('');
      expect(collision.enabled).toBe(false);
    });
  });

  describe('reset', () => {
    test('should reset all properties to defaults', () => {
      collision.width = 100;
      collision.height = 80;
      collision.offsetX = 15;
      collision.offsetY = -10;
      collision.type = 'circle';
      collision.radius = 50;
      collision.layer = 'custom';
      collision.mask = ['enemy', 'obstacle'];
      collision.isTrigger = true;
      collision.enabled = false;

      collision.reset();

      expect(collision.width).toBe(32);
      expect(collision.height).toBe(32);
      expect(collision.offsetX).toBe(0);
      expect(collision.offsetY).toBe(0);
      expect(collision.type).toBe('rectangle');
      expect(collision.radius).toBe(16);
      expect(collision.layer).toBe('default');
      expect(collision.mask).toEqual(['default']);
      expect(collision.isTrigger).toBe(false);
      expect(collision.enabled).toBe(true);
    });
  });

  describe('clone', () => {
    test('should create new Collision instance with same values', () => {
      collision.width = 64;
      collision.height = 48;
      collision.offsetX = 10;
      collision.offsetY = -5;
      collision.type = 'circle';
      collision.radius = 30;
      collision.layer = 'player';
      collision.mask = ['enemy', 'obstacle'];
      collision.isTrigger = true;
      collision.enabled = false;

      const cloned = collision.clone();

      expect(cloned).toBeInstanceOf(Collision);
      expect(cloned).not.toBe(collision);
      expect(cloned.width).toBe(64);
      expect(cloned.height).toBe(48);
      expect(cloned.offsetX).toBe(10);
      expect(cloned.offsetY).toBe(-5);
      expect(cloned.type).toBe('circle');
      expect(cloned.radius).toBe(30);
      expect(cloned.layer).toBe('player');
      expect(cloned.mask).toEqual(['enemy', 'obstacle']);
      expect(cloned.isTrigger).toBe(true);
      expect(cloned.enabled).toBe(false);
    });

    test('should create independent mask array', () => {
      collision.mask = ['enemy', 'obstacle'];
      const cloned = collision.clone();

      // Modify original mask
      collision.mask.push('pickup');

      // Clone should be unaffected
      expect(cloned.mask).toEqual(['enemy', 'obstacle']);
    });

    test('should clone default values', () => {
      const cloned = collision.clone();

      expect(cloned.width).toBe(32);
      expect(cloned.height).toBe(32);
      expect(cloned.type).toBe('rectangle');
      expect(cloned.layer).toBe('default');
      expect(cloned.mask).toEqual(['default']);
      expect(cloned.enabled).toBe(true);
    });

    test('should create completely independent instances', () => {
      collision.setLayer('player');
      collision.setMask(['enemy']);

      const cloned = collision.clone();

      // Modify original
      collision.setLayer('modified');
      collision.setMask(['modified']);

      // Clone should be unchanged
      expect(cloned.layer).toBe('player');
      expect(cloned.mask).toEqual(['enemy']);
    });
  });

  describe('collision type scenarios', () => {
    test('should handle rectangle collision setup for different entity types', () => {
      // Player collision
      const player = new Collision({
        width: 32,
        height: 32,
        layer: 'player',
        mask: ['enemy', 'obstacle', 'pickup']
      });

      expect(player.type).toBe('rectangle');
      expect(player.canCollideWith('enemy')).toBe(true);
      expect(player.canCollideWith('player')).toBe(false);

      // Enemy collision
      const enemy = new Collision({
        width: 24,
        height: 24,
        layer: 'enemy',
        mask: ['player', 'player_projectile']
      });

      expect(enemy.canCollideWith('player')).toBe(true);
      expect(enemy.canCollideWith('enemy')).toBe(false);
    });

    test('should handle circle collision setup', () => {
      const projectile = new Collision({
        type: 'circle',
        radius: 4,
        layer: 'player_projectile',
        mask: ['enemy', 'obstacle']
      });

      const bounds = projectile.getBounds(100, 200);
      expect(bounds.radius).toBe(4);
      expect(bounds.centerX).toBe(100);
      expect(bounds.centerY).toBe(200);
    });

    test('should handle trigger collisions', () => {
      const pickup = new Collision({
        width: 16,
        height: 16,
        layer: 'pickup',
        mask: ['player'],
        isTrigger: true
      });

      expect(pickup.isTrigger).toBe(true);
      expect(pickup.canCollideWith('player')).toBe(true);
    });
  });

  describe('bounds calculation edge cases', () => {
    test('should handle very large positions', () => {
      collision.setSize(32, 32);
      const bounds = collision.getBounds(1000000, 2000000);

      expect(bounds.left).toBe(999984);
      expect(bounds.right).toBe(1000016);
      expect(bounds.top).toBe(1999984);
      expect(bounds.bottom).toBe(2000016);
    });

    test('should handle very small sizes', () => {
      collision.setSize(0.1, 0.2);
      const bounds = collision.getBounds(10, 20);

      expect(bounds.left).toBeCloseTo(9.95);
      expect(bounds.right).toBeCloseTo(10.05);
      expect(bounds.top).toBeCloseTo(19.9);
      expect(bounds.bottom).toBeCloseTo(20.1);
    });

    test('should handle negative sizes', () => {
      collision.setSize(-20, -30);
      const bounds = collision.getBounds(100, 200);

      expect(bounds.left).toBe(110);  // 100 - (-20)/2
      expect(bounds.right).toBe(90);  // 100 + (-20)/2
      expect(bounds.top).toBe(215);   // 200 - (-30)/2
      expect(bounds.bottom).toBe(185); // 200 + (-30)/2
    });

    test('should handle circle with negative radius', () => {
      collision.type = 'circle';
      collision.radius = -10;
      const bounds = collision.getBounds(100, 200);

      expect(bounds.radius).toBe(-10);
      expect(bounds.left).toBe(110);  // 100 - (-10)
      expect(bounds.right).toBe(90);  // 100 + (-10)
    });
  });

  describe('object pooling compatibility', () => {
    test('should support typical pooling workflow', () => {
      collision.setSize(100, 80);
      collision.setLayer('player');
      collision.setMask(['enemy', 'obstacle']);

      const pooled = collision.clone();
      expect(pooled.width).toBe(100);
      expect(pooled.layer).toBe('player');

      // Use pooled instance
      pooled.setSize(50, 40);
      pooled.setLayer('projectile');

      // Reset before returning to pool
      pooled.reset();
      expect(pooled.width).toBe(32);
      expect(pooled.layer).toBe('default');

      // Original should be unchanged
      expect(collision.width).toBe(100);
      expect(collision.layer).toBe('player');
    });
  });

  describe('edge cases', () => {
    test('should handle undefined/null values in config', () => {
      const col = new Collision({
        width: null,
        height: undefined,
        layer: null,
        mask: undefined
      });

      expect(col.width).toBe(32);  // default fallback
      expect(col.height).toBe(32); // default fallback
      expect(col.layer).toBe('default'); // default fallback
      expect(col.mask).toEqual(['default']); // default fallback
    });

    test('should handle Infinity and NaN values', () => {
      collision.setSize(Infinity, NaN);
      collision.setOffset(-Infinity, NaN);

      expect(collision.width).toBe(Infinity);
      expect(collision.height).toBeNaN();
      expect(collision.offsetX).toBe(-Infinity);
      expect(collision.offsetY).toBeNaN();
    });

    test('should handle very long layer names and masks', () => {
      const longLayer = 'a'.repeat(1000);
      const longMask = Array.from({ length: 100 }, (_, i) => `layer${i}`);

      collision.setLayer(longLayer);
      collision.setMask(longMask);

      expect(collision.layer).toBe(longLayer);
      expect(collision.mask).toHaveLength(100);
      expect(collision.canCollideWith('layer50')).toBe(true);
    });
  });
});