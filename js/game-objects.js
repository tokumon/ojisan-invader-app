/**
 * ゲームオブジェクト - ゲーム内のすべてのオブジェクトを定義
 */

/**
 * プレイヤー（中年男性）
 */
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.speed = 200;
        this.color = '#0066cc';
    }
    
    update(deltaTime) {
        // プレイヤーの更新処理
    }
    
    move(direction, canvasWidth) {
        const moveDistance = this.speed * 0.016; // 60FPS想定
        
        if (direction === 'left' && this.x > 0) {
            this.x -= moveDistance;
        } else if (direction === 'right' && this.x < canvasWidth - this.width) {
            this.x += moveDistance;
        }
    }
    
    render(ctx) {
        // 中年男性の描画
        ctx.fillStyle = this.color;
        
        // 体
        ctx.fillRect(this.x + 10, this.y + 20, 20, 30);
        
        // 頭
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 8, this.y, 24, 24);
        
        // 髪
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x + 10, this.y, 20, 8);
        
        // 目
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 25, this.y + 8, 3, 3);
        
        // 口
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x + 15, this.y + 15, 10, 2);
        
        // ネクタイ
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 18, this.y + 20, 4, 15);
        ctx.fillRect(this.x + 16, this.y + 35, 8, 8);
        
        // 腕
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 5, this.y + 25, 8, 15);
        ctx.fillRect(this.x + 27, this.y + 25, 8, 15);
    }
}

/**
 * ネクタイビーム（弾丸）
 */
class Bullet {
    constructor(x, y) {
        this.x = x - 2;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 400;
        this.color = '#ff0000';
    }
    
    update(deltaTime) {
        this.y -= this.speed * (deltaTime / 1000);
    }
    
    render(ctx) {
        // ネクタイビームの描画
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 光る効果
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 1, this.y + 2, 2, 6);
    }
}

/**
 * キャバ嬢（敵）
 */
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.speed = speed;
        this.color = '#ff69b4';
        this.animationFrame = 0;
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        this.animationFrame += deltaTime * 0.01;
    }
    
    render(ctx) {
        // キャバ嬢の描画
        ctx.fillStyle = this.color;
        
        // 体
        ctx.fillRect(this.x + 10, this.y + 25, 20, 25);
        
        // 頭
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 8, this.y, 24, 24);
        
        // 髪
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 10, this.y, 20, 10);
        
        // 目
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 25, this.y + 8, 3, 3);
        
        // 口
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(this.x + 15, this.y + 15, 10, 3);
        
        // ドレス
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(this.x + 8, this.y + 25, 24, 25);
        
        // 腕
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 5, this.y + 28, 8, 15);
        ctx.fillRect(this.x + 27, this.y + 28, 8, 15);
        
        // アニメーション効果
        const wave = Math.sin(this.animationFrame) * 2;
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 8 + wave, this.y, 4, 8);
        ctx.fillRect(this.x + 28 + wave, this.y, 4, 8);
    }
}

/**
 * ¥500,000札（回避対象）
 */
class Money {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 30;
        this.speed = 150;
        this.color = '#00ff00';
        this.rotation = 0;
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        this.rotation += deltaTime * 0.01;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // ¥500,000札の描画
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 縁取り
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 文字
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¥500,000', 0, 5);
        
        ctx.restore();
    }
}

/**
 * 爆発エフェクト
 */
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.duration = 1000; // 1秒
        this.elapsed = 0;
        this.maxParticles = 20;
        
        // パーティクルを生成
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: x + Math.random() * 40 - 20,
                y: y + Math.random() * 40 - 20,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        // パーティクルの更新
        this.particles.forEach(particle => {
            particle.x += particle.vx * (deltaTime / 1000);
            particle.y += particle.vy * (deltaTime / 1000);
            particle.life -= particle.decay;
        });
    }
    
    isFinished() {
        return this.elapsed >= this.duration;
    }
    
    render(ctx) {
        // パーティクルの描画
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.globalAlpha = particle.life;
                
                // 爆発の色（オレンジから黄色）
                const intensity = particle.life;
                ctx.fillStyle = `rgb(${255}, ${255 * intensity}, ${0})`;
                
                ctx.fillRect(particle.x, particle.y, 3, 3);
                ctx.restore();
            }
        });
    }
} 