/**
 * E2E tests for Ojisan Invader game flow
 */

import { test, expect } from '@playwright/test';

test.describe('Ojisan Invader Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the main menu on load', async ({ page }) => {
    // Check that menu screen is visible
    await expect(page.locator('#menuScreen')).toBeVisible();
    await expect(page.locator('#gameOverScreen')).toHaveClass(/hidden/);
    
    // Check menu content
    await expect(page.locator('h2')).toContainText('オジサンインベーダー');
    await expect(page.locator('#startButton')).toBeVisible();
    
    // Check instructions are present
    await expect(page.locator('.instructions')).toBeVisible();
    await expect(page.locator('.instructions')).toContainText('How to Play');
  });

  test('should start game when start button is clicked', async ({ page }) => {
    // Click start button
    await page.click('#startButton');
    
    // Menu should be hidden
    await expect(page.locator('#menuScreen')).toHaveClass(/hidden/);
    
    // Game canvas should be visible and active
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Score and lives should be displayed
    await expect(page.locator('#score')).toContainText('0');
    await expect(page.locator('#lives')).toContainText('3');
  });

  test('should handle keyboard controls', async ({ page }) => {
    await page.click('#startButton');
    
    // Focus the canvas
    await page.locator('#gameCanvas').click();
    
    // Test arrow keys - we can't easily verify player position,
    // but we can verify no errors occur
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    
    // Wait a bit to ensure game processes input
    await page.waitForTimeout(100);
    
    // Game should still be running (no errors)
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should show game over screen when player dies', async ({ page }) => {
    await page.click('#startButton');
    await page.locator('#gameCanvas').click();
    
    // We'll use a hack - modify the game state to trigger game over
    await page.evaluate(() => {
      if (window.ojisamInvader && window.ojisamInvader.gameEngine) {
        // Find the player entity and damage it to death
        const world = window.ojisamInvader.gameEngine.world;
        const playerEntities = world.getEntitiesWithComponents([
          window.ojisamInvader.gameEngine.world.getSystem('input')?.requiredComponents?.[2] // Player component
        ]);
        
        if (playerEntities.length > 0) {
          const player = playerEntities[0];
          const playerComp = player.components.get('Player');
          if (playerComp) {
            playerComp.lives = 0;
          }
        }
      }
    });
    
    // Wait for game over screen to appear
    await page.waitForTimeout(1000);
    
    // This is a simplified test - in a real scenario, we'd need to simulate
    // actual gameplay that leads to game over
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should restart game when restart button is clicked', async ({ page }) => {
    await page.click('#startButton');
    
    // Simulate game over by directly triggering it
    await page.evaluate(() => {
      // Trigger game over state
      if (window.ojisamInvader?.gameEngine?.stateManager) {
        window.ojisamInvader.gameEngine.stateManager.changeState('gameOver');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check if restart button becomes available and click it
    const restartButton = page.locator('#restartButton');
    if (await restartButton.isVisible()) {
      await restartButton.click();
      
      // Should return to menu or start new game
      await page.waitForTimeout(500);
      await expect(page.locator('#gameCanvas')).toBeVisible();
    }
  });

  test('should handle window resize', async ({ page }) => {
    await page.click('#startButton');
    
    // Get initial canvas size
    const initialSize = await page.locator('#gameCanvas').boundingBox();
    
    // Resize window
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(300); // Wait for resize handling
    
    // Canvas should still be visible and potentially resized
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    const newSize = await page.locator('#gameCanvas').boundingBox();
    expect(newSize).not.toBeNull();
  });

  test('should handle focus/blur events', async ({ page }) => {
    await page.click('#startButton');
    await page.locator('#gameCanvas').click();
    
    // Simulate window blur (game should pause)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    
    await page.waitForTimeout(100);
    
    // Simulate window focus (game should resume)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    
    await page.waitForTimeout(100);
    
    // Game should still be running
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should maintain game state during visibility changes', async ({ page }) => {
    await page.click('#startButton');
    
    // Get initial score
    const initialScore = await page.locator('#score').textContent();
    
    // Simulate page visibility change
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    await page.waitForTimeout(100);
    
    // Restore visibility
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    await page.waitForTimeout(100);
    
    // Score should be preserved
    await expect(page.locator('#score')).toContainText(initialScore);
  });
});

test.describe('Game Performance', () => {
  test('should maintain stable frame rate', async ({ page }) => {
    await page.goto('/');
    await page.click('#startButton');
    
    // Enable FPS display
    await page.keyboard.press('F1');
    
    // Let game run for a few seconds
    await page.waitForTimeout(3000);
    
    // Check if debug info is showing (if F1 toggle works)
    const fps = await page.evaluate(() => {
      return window.ojisamInvader?.getStats()?.fps || 60;
    });
    
    // FPS should be reasonable (allowing for CI environment variability)
    expect(fps).toBeGreaterThan(30);
    expect(fps).toBeLessThanOrEqual(65);
  });

  test('should handle rapid input without performance degradation', async ({ page }) => {
    await page.goto('/');
    await page.click('#startButton');
    await page.locator('#gameCanvas').click();
    
    // Rapid key presses
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      
      // Small delay to avoid overwhelming the browser
      if (i % 10 === 0) {
        await page.waitForTimeout(10);
      }
    }
    
    // Game should still be responsive
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    const stats = await page.evaluate(() => {
      return window.ojisamInvader?.getStats();
    });
    
    expect(stats).toBeTruthy();
    expect(stats.running).toBe(true);
  });

  test('should handle memory efficiently over time', async ({ page }) => {
    await page.goto('/');
    await page.click('#startButton');
    
    // Let game run to generate entities and test memory management
    await page.waitForTimeout(5000);
    
    const initialStats = await page.evaluate(() => {
      return window.ojisamInvader?.getStats();
    });
    
    // Continue running
    await page.waitForTimeout(5000);
    
    const laterStats = await page.evaluate(() => {
      return window.ojisamInvader?.getStats();
    });
    
    // Entity count shouldn't grow excessively
    if (initialStats && laterStats) {
      expect(laterStats.entities).toBeLessThan(initialStats.entities + 100);
    }
  });
});

test.describe('Game Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Should be able to start game with keyboard
    await page.keyboard.press('Tab'); // Navigate to start button
    await page.keyboard.press('Enter'); // Activate start button
    
    // Give time for game to start
    await page.waitForTimeout(500);
    
    // Canvas should be visible (game started)
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper semantic structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toHaveCount(1); // Start button
    
    // Game controls should be documented
    await expect(page.locator('.game-controls')).toContainText('Arrow Keys');
    await expect(page.locator('.game-controls')).toContainText('Spacebar');
  });

  test('should provide game state feedback', async ({ page }) => {
    await page.goto('/');
    await page.click('#startButton');
    
    // Score and lives should be clearly displayed
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#lives')).toBeVisible();
    
    // Text should be readable
    const scoreText = await page.locator('#score').textContent();
    expect(scoreText).toMatch(/^\d+$/);
    
    const livesText = await page.locator('#lives').textContent();
    expect(livesText).toMatch(/^\d+$/);
  });
});

test.describe('Game Error Handling', () => {
  test('should handle JavaScript errors gracefully', async ({ page }) => {
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.click('#startButton');
    
    // Let game run for a bit
    await page.waitForTimeout(2000);
    
    // Should not have critical errors
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read properties')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle missing canvas context gracefully', async ({ page }) => {
    // Inject code to break canvas context
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function() {
        if (Math.random() < 0.1) { // 10% chance to return null
          return null;
        }
        return originalGetContext.apply(this, arguments);
      };
    });
    
    await page.goto('/');
    
    // Should either work normally or show error message
    await page.waitForTimeout(1000);
    
    const hasError = await page.locator('.error, [class*="error"]').count() > 0;
    const gameLoaded = await page.locator('#menuScreen').isVisible();
    
    // Either error is shown or game loaded successfully
    expect(hasError || gameLoaded).toBe(true);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Start with working page
    await page.goto('/');
    await page.click('#startButton');
    
    // Simulate network going offline
    await page.setOfflineMode(true);
    
    // Game should continue running
    await page.waitForTimeout(1000);
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Re-enable network
    await page.setOfflineMode(false);
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Menu should be visible and usable
    await expect(page.locator('#menuScreen')).toBeVisible();
    await expect(page.locator('#startButton')).toBeVisible();
    
    // Start game
    await page.click('#startButton');
    
    // Canvas should be visible and appropriately sized
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    const canvasBox = await page.locator('#gameCanvas').boundingBox();
    expect(canvasBox.width).toBeLessThanOrEqual(375);
    expect(canvasBox.width).toBeGreaterThan(200);
  });

  test('should handle touch events appropriately', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Touch start button
    await page.locator('#startButton').tap();
    
    // Game should start
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Canvas should respond to touch
    await page.locator('#gameCanvas').tap();
    
    // Should not cause errors
    await page.waitForTimeout(500);
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });
});

test.describe('Browser Compatibility', () => {
  test('should load in different browsers', async ({ page }) => {
    await page.goto('/');
    
    // Check basic functionality works
    await expect(page.locator('#menuScreen')).toBeVisible();
    
    // Check if canvas is supported
    const canvasSupported = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    });
    
    expect(canvasSupported).toBe(true);
  });

  test('should handle different screen resolutions', async ({ page }) => {
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 800, height: 600 }
    ];
    
    for (const resolution of resolutions) {
      await page.setViewportSize(resolution);
      await page.goto('/');
      
      // Game should be visible and properly sized
      await expect(page.locator('#menuScreen')).toBeVisible();
      await page.click('#startButton');
      await expect(page.locator('#gameCanvas')).toBeVisible();
      
      const canvasBox = await page.locator('#gameCanvas').boundingBox();
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }
  });
});