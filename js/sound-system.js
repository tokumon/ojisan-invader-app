/**
 * サウンドシステム - Web Audio APIを使用した音響効果
 */
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.3;
        this.enabled = true;
        
        this.init();
    }
    
    /**
     * サウンドシステムを初期化
     */
    init() {
        try {
            // Web Audio APIの初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // マスターボリュームノードを作成
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // サウンドを初期化
            this.initSounds();
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }
    
    /**
     * サウンドを初期化
     */
    initSounds() {
        if (!this.enabled) return;
        
        // ビーム発射音
        this.sounds.beam = this.createBeamSound();
        
        // 爆発音
        this.sounds.explosion = this.createExplosionSound();
        
        // ゲームオーバー音
        this.sounds.gameOver = this.createGameOverSound();
        
        // レベルアップ音
        this.sounds.levelUp = this.createLevelUpSound();
        
        // BGM
        this.sounds.bgm = this.createBGMSound();
    }
    
    /**
     * ビーム発射音を生成
     */
    createBeamSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        return { oscillator, gainNode };
    }
    
    /**
     * 爆発音を生成
     */
    createExplosionSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        return { oscillator, gainNode };
    }
    
    /**
     * ゲームオーバー音を生成
     */
    createGameOverSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        return { oscillator, gainNode };
    }
    
    /**
     * レベルアップ音を生成
     */
    createLevelUpSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        return { oscillator, gainNode };
    }
    
    /**
     * BGMを生成
     */
    createBGMSound() {
        // シンプルなBGMループ
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.value = 220;
        gainNode.gain.value = 0.05;
        
        return { oscillator, gainNode };
    }
    
    /**
     * ビーム発射音を再生
     */
    playBeamSound() {
        if (!this.enabled) return;
        
        try {
            const sound = this.createBeamSound();
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Failed to play beam sound:', error);
        }
    }
    
    /**
     * 爆発音を再生
     */
    playExplosionSound() {
        if (!this.enabled) return;
        
        try {
            const sound = this.createExplosionSound();
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Failed to play explosion sound:', error);
        }
    }
    
    /**
     * ゲームオーバー音を再生
     */
    playGameOverSound() {
        if (!this.enabled) return;
        
        try {
            const sound = this.createGameOverSound();
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Failed to play game over sound:', error);
        }
    }
    
    /**
     * レベルアップ音を再生
     */
    playLevelUpSound() {
        if (!this.enabled) return;
        
        try {
            const sound = this.createLevelUpSound();
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Failed to play level up sound:', error);
        }
    }
    
    /**
     * BGMを開始
     */
    startBGM() {
        if (!this.enabled || !this.sounds.bgm) return;
        
        try {
            this.sounds.bgm.oscillator.start();
        } catch (error) {
            console.warn('Failed to start BGM:', error);
        }
    }
    
    /**
     * BGMを停止
     */
    stopBGM() {
        if (!this.enabled || !this.sounds.bgm) return;
        
        try {
            this.sounds.bgm.oscillator.stop();
        } catch (error) {
            console.warn('Failed to stop BGM:', error);
        }
    }
    
    /**
     * ボリュームを設定
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    /**
     * サウンドを有効/無効にする
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopBGM();
        }
    }
} 