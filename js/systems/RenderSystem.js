import { System } from '../core/System.js';
import { Position } from '../components/Position.js';
import { Sprite } from '../components/Sprite.js';

/**
 * RenderSystem - handles rendering of all visible entities
 */
export class RenderSystem extends System {
    constructor(world, canvas) {
        super(world);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setRequiredComponents([Position, Sprite]);
        
        // Enable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Update - render all entities
     * @param {number} deltaTime - Time elapsed since last frame
     */
    update(deltaTime) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set default styles
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        super.update(deltaTime);
    }

    /**
     * Process entity rendering
     * @param {Entity} entity - Entity to render
     * @param {number} deltaTime - Time elapsed since last frame
     */
    processEntity(entity, deltaTime) {
        const position = entity.getComponent(Position);
        const sprite = entity.getComponent(Sprite);

        if (!sprite.visible || sprite.opacity <= 0) {
            return;
        }

        this.ctx.save();

        // Set opacity
        this.ctx.globalAlpha = sprite.opacity;

        // Apply transformations
        this.ctx.translate(position.x, position.y);
        if (sprite.rotation !== 0) {
            this.ctx.rotate(sprite.rotation);
        }
        if (sprite.scale !== 1) {
            this.ctx.scale(sprite.scale, sprite.scale);
        }

        // Render based on sprite type
        if (sprite.image) {
            this.renderImage(sprite);
        } else if (sprite.text) {
            this.renderText(sprite);
        } else if (sprite.customRender) {
            sprite.customRender(this.ctx, sprite);
        } else {
            this.renderShape(sprite);
        }

        this.ctx.restore();
    }

    /**
     * Render an image sprite
     * @param {Sprite} sprite - Sprite component
     */
    renderImage(sprite) {
        const width = sprite.width;
        const height = sprite.height;
        
        this.ctx.drawImage(
            sprite.image,
            -width / 2,
            -height / 2,
            width,
            height
        );
    }

    /**
     * Render text sprite
     * @param {Sprite} sprite - Sprite component
     */
    renderText(sprite) {
        this.ctx.fillStyle = sprite.color;
        this.ctx.font = sprite.font;
        this.ctx.textAlign = sprite.textAlign;
        this.ctx.fillText(sprite.text, 0, 0);
    }

    /**
     * Render geometric shape
     * @param {Sprite} sprite - Sprite component
     */
    renderShape(sprite) {
        this.ctx.fillStyle = sprite.color;
        
        const width = sprite.width;
        const height = sprite.height;

        switch (sprite.shape) {
            case 'rectangle':
                this.ctx.fillRect(-width / 2, -height / 2, width, height);
                break;
                
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -height / 2);
                this.ctx.lineTo(-width / 2, height / 2);
                this.ctx.lineTo(width / 2, height / 2);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'necktie':
                this.renderNecktie(width, height);
                break;

            case 'money':
                this.renderMoney(width, height);
                break;

            case 'ojisan':
                this.renderOjisan(width, height);
                break;

            case 'cabaret':
                this.renderCabaret(width, height);
                break;

            default:
                this.ctx.fillRect(-width / 2, -height / 2, width, height);
                break;
        }
    }

    /**
     * Render necktie projectile
     * @param {number} width - Width
     * @param {number} height - Height
     */
    renderNecktie(width, height) {
        // Simple necktie shape
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(-width / 4, -height / 2, width / 2, height);
        
        // Necktie knot
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(-width / 3, -height / 3, width / 1.5, height / 3);
    }

    /**
     * Render money bill obstacle
     * @param {number} width - Width
     * @param {number} height - Height
     */
    renderMoney(width, height) {
        // Money bill background
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Border
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // ¥ symbol
        this.ctx.fillStyle = '#228B22';
        this.ctx.font = '16px bold Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¥500K', 0, 0);
    }

    /**
     * Render Ojisan player character
     * @param {number} width - Width
     * @param {number} height - Height
     */
    renderOjisan(width, height) {
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(-width / 3, -height / 2, width / 1.5, height / 2);
        
        // Body
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(-width / 2, 0, width, height / 2);
        
        // Tie
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-width / 8, 0, width / 4, height / 3);
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-width / 4, -height / 3, 3, 3);
        this.ctx.fillRect(width / 6, -height / 3, 3, 3);
    }

    /**
     * Render cabaret girl enemy
     * @param {number} width - Width
     * @param {number} height - Height
     */
    renderCabaret(width, height) {
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(-width / 3, -height / 2, width / 1.5, height / 2);
        
        // Hair
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-width / 2, -height / 2, width, height / 3);
        
        // Dress
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.fillRect(-width / 2, 0, width, height / 2);
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-width / 4, -height / 3, 3, 3);
        this.ctx.fillRect(width / 6, -height / 3, 3, 3);
        
        // Lipstick
        this.ctx.fillStyle = '#FF1493';
        this.ctx.fillRect(-width / 8, -height / 6, width / 4, 2);
    }
}