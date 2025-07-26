/**
 * ゲームエンジン - ゲームのコア機能を管理
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemySpeed = 1;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // ゲームオブジェクトの配列
        this.gameObjects = {
            player: null,
            bullets: [],
            enemies: [],
            money: [],
            explosions: []
        };
        
        // ゲーム設定
        this.config = {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            fps: 60,
            frameTime: 1000 / 60
        };
    }
    
    /**
     * ゲームを初期化
     */
    init() {
        this.gameObjects.player = new Player(
            this.config.canvasWidth / 2,
            this.config.canvasHeight - 60
        );
        
        this.spawnEnemies();
        this.gameLoop();
    }
    
    /**
     * ゲームループ
     */
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        
        if (this.deltaTime >= this.config.frameTime) {
            this.update();
            this.render();
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * ゲーム状態を更新
     */
    update() {
        if (this.gameState !== 'playing') return;
        
        // プレイヤーの更新
        this.gameObjects.player.update(this.deltaTime);
        
        // 弾丸の更新
        this.updateBullets();
        
        // 敵の更新
        this.updateEnemies();
        
        // お金の更新
        this.updateMoney();
        
        // 爆発エフェクトの更新
        this.updateExplosions();
        
        // 衝突検出
        this.checkCollisions();
        
        // レベルアップ
        this.checkLevelUp();
    }
    
    /**
     * 弾丸の更新
     */
    updateBullets() {
        for (let i = this.gameObjects.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameObjects.bullets[i];
            bullet.update(this.deltaTime);
            
            // 画面外に出た弾丸を削除
            if (bullet.y < 0) {
                this.gameObjects.bullets.splice(i, 1);
            }
        }
    }
    
    /**
     * 敵の更新
     */
    updateEnemies() {
        for (let i = this.gameObjects.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameObjects.enemies[i];
            enemy.update(this.deltaTime);
            
            // 画面外に出た敵を削除
            if (enemy.y > this.config.canvasHeight) {
                this.gameObjects.enemies.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // 敵が少なくなったら新しい敵を生成
        if (this.gameObjects.enemies.length < 3) {
            this.spawnEnemies();
        }
    }
    
    /**
     * お金の更新
     */
    updateMoney() {
        for (let i = this.gameObjects.money.length - 1; i >= 0; i--) {
            const money = this.gameObjects.money[i];
            money.update(this.deltaTime);
            
            // 画面外に出たお金を削除
            if (money.y > this.config.canvasHeight) {
                this.gameObjects.money.splice(i, 1);
            }
        }
        
        // ランダムにお金を生成
        if (Math.random() < 0.001) {
            this.spawnMoney();
        }
    }
    
    /**
     * 爆発エフェクトの更新
     */
    updateExplosions() {
        for (let i = this.gameObjects.explosions.length - 1; i >= 0; i--) {
            const explosion = this.gameObjects.explosions[i];
            explosion.update(this.deltaTime);
            
            // アニメーションが終了した爆発を削除
            if (explosion.isFinished()) {
                this.gameObjects.explosions.splice(i, 1);
            }
        }
    }
    
    /**
     * 衝突検出
     */
    checkCollisions() {
        // 弾丸と敵の衝突
        for (let i = this.gameObjects.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameObjects.bullets[i];
            
            for (let j = this.gameObjects.enemies.length - 1; j >= 0; j--) {
                const enemy = this.gameObjects.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    // 敵を倒す
                    this.gameObjects.enemies.splice(j, 1);
                    this.gameObjects.bullets.splice(i, 1);
                    this.score += 100;
                    
                    // 爆発エフェクトを追加
                    this.gameObjects.explosions.push(
                        new Explosion(enemy.x, enemy.y)
                    );
                    
                    break;
                }
            }
        }
        
        // プレイヤーと敵の衝突
        for (let i = this.gameObjects.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameObjects.enemies[i];
            
            if (this.isColliding(this.gameObjects.player, enemy)) {
                this.gameObjects.enemies.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // プレイヤーとお金の衝突
        for (let i = this.gameObjects.money.length - 1; i >= 0; i--) {
            const money = this.gameObjects.money[i];
            
            if (this.isColliding(this.gameObjects.player, money)) {
                this.gameObjects.money.splice(i, 1);
                this.gameOver();
            }
        }
    }
    
    /**
     * 衝突判定
     */
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    /**
     * 敵を生成
     */
    spawnEnemies() {
        const numEnemies = Math.min(3 + Math.floor(this.level / 2), 8);
        
        for (let i = 0; i < numEnemies; i++) {
            const x = Math.random() * (this.config.canvasWidth - 40);
            const y = -50 - Math.random() * 200;
            
            this.gameObjects.enemies.push(
                new Enemy(x, y, this.enemySpeed)
            );
        }
    }
    
    /**
     * お金を生成
     */
    spawnMoney() {
        const x = Math.random() * (this.config.canvasWidth - 60);
        this.gameObjects.money.push(new Money(x, -60));
    }
    
    /**
     * レベルアップチェック
     */
    checkLevelUp() {
        if (this.score >= this.level * 1000) {
            this.level++;
            this.enemySpeed += 0.2;
        }
    }
    
    /**
     * ゲームオーバー
     */
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
    }
    
    /**
     * ゲームをリスタート
     */
    restart() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemySpeed = 1;
        
        // ゲームオブジェクトをリセット
        this.gameObjects = {
            player: new Player(this.config.canvasWidth / 2, this.config.canvasHeight - 60),
            bullets: [],
            enemies: [],
            money: [],
            explosions: []
        };
        
        this.spawnEnemies();
        document.getElementById('gameOver').style.display = 'none';
    }
    
    /**
     * ゲームを開始
     */
    start() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
    }
    
    /**
     * レンダリング
     */
    render() {
        // キャンバスをクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // ゲームオブジェクトを描画
        if (this.gameObjects.player) {
            this.gameObjects.player.render(this.ctx);
        }
        
        this.gameObjects.bullets.forEach(bullet => bullet.render(this.ctx));
        this.gameObjects.enemies.forEach(enemy => enemy.render(this.ctx));
        this.gameObjects.money.forEach(money => money.render(this.ctx));
        this.gameObjects.explosions.forEach(explosion => explosion.render(this.ctx));
    }
    
    /**
     * 弾丸を発射
     */
    fireBullet() {
        if (this.gameState === 'playing') {
            const bullet = new Bullet(
                this.gameObjects.player.x + this.gameObjects.player.width / 2,
                this.gameObjects.player.y
            );
            this.gameObjects.bullets.push(bullet);
        }
    }
    
    /**
     * プレイヤーを移動
     */
    movePlayer(direction) {
        if (this.gameState === 'playing' && this.gameObjects.player) {
            this.gameObjects.player.move(direction, this.config.canvasWidth);
        }
    }
} 