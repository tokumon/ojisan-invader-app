import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Player } from '../components/Player.js';
import { Projectile } from '../components/Projectile.js';
import { Sprite } from '../components/Sprite.js';
import { Collision } from '../components/Collision.js';

/**
 * InputSystem - handles player input and controls
 */
export class InputSystem extends System {
    constructor(world, canvas) {
        super(world);
        this.canvas = canvas;
        this.setRequiredComponents([Position, Velocity, Player]);
        
        this.keys = {};
        this.gameTime = 0;
        
        this.setupEventListeners();
    }

    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Update input system
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        super.update(deltaTime);
    }

    /**
     * Process player entity input
     * @param {Entity} entity - Player entity
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const velocity = entity.getComponent(Velocity);
        const player = entity.getComponent(Player);

        // Handle movement input
        this.handleMovementInput(position, velocity, player, deltaTime);
        
        // Handle shooting input
        this.handleShootingInput(entity, player);
        
        // Keep player within screen bounds
        this.constrainPlayerPosition(position);
    }

    /**
     * Handle player movement input
     * @param {Position} position - Player position
     * @param {Velocity} velocity - Player velocity
     * @param {Player} player - Player component
     * @param {number} deltaTime - Time elapsed since last frame
     */
    handleMovementInput(position, velocity, player, deltaTime) {
        let moveX = 0;

        // Left arrow key
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            moveX -= 1;
        }

        // Right arrow key
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            moveX += 1;
        }

        // Set velocity based on input
        velocity.x = moveX * player.speed;
        velocity.y = 0; // Player only moves horizontally
    }

    /**
     * Handle player shooting input
     * @param {Entity} playerEntity - Player entity
     * @param {Player} player - Player component
     */
    handleShootingInput(playerEntity, player) {
        // Spacebar to shoot
        if (this.keys['Space'] && player.canShoot(this.gameTime)) {
            this.createProjectile(playerEntity);
            player.recordShot(this.gameTime);
        }
    }

    /**
     * Create a projectile from player position
     * @param {Entity} playerEntity - Player entity
     */
    createProjectile(playerEntity) {
        const playerPos = playerEntity.getComponent(Position);
        
        // Create projectile entity
        const projectile = this.world.createEntity();
        
        // Add position component
        projectile.addComponent(new Position(playerPos.x, playerPos.y - 20));
        
        // Add velocity component (moving upward)
        const projectileVel = new Velocity(0, -300); // 300 pixels per second upward
        projectile.addComponent(projectileVel);
        
        // Add projectile component
        const projComp = new Projectile('necktie', 1);
        projComp.setOwner('player');
        projectile.addComponent(projComp);
        
        // Add sprite component
        const sprite = new Sprite({
            width: 8,
            height: 16,
            color: '#FF6B6B',
            shape: 'necktie'
        });
        projectile.addComponent(sprite);
        
        // Add collision component
        const collision = new Collision({
            width: 6,
            height: 14,
            layer: 'player_projectile',
            mask: ['enemy', 'obstacle']
        });
        projectile.addComponent(collision);
    }

    /**
     * Constrain player position within screen bounds
     * @param {Position} position - Player position
     */
    constrainPlayerPosition(position) {
        const margin = 20; // Keep player sprite fully on screen
        
        if (position.x < margin) {
            position.x = margin;
        } else if (position.x > this.canvas.width - margin) {
            position.x = this.canvas.width - margin;
        }
        
        // Keep player in bottom area of screen
        if (position.y < this.canvas.height * 0.7) {
            position.y = this.canvas.height * 0.7;
        } else if (position.y > this.canvas.height - margin) {
            position.y = this.canvas.height - margin;
        }
    }

    /**
     * Check if a key is currently pressed
     * @param {string} keyCode - Key code to check
     * @returns {boolean} - True if key is pressed
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    /**
     * Reset all key states
     */
    resetKeys() {
        this.keys = {};
    }

    /**
     * Cleanup event listeners
     */
    destroy() {
        super.destroy();
        // Event listeners will be cleaned up when the page unloads
    }
}