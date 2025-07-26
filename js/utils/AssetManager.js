/**
 * AssetManager - handles loading and caching of game assets
 */
export class AssetManager {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.loadingPromises = [];
    }

    /**
     * Load an image asset
     * @param {string} name - Asset name
     * @param {string} url - Image URL
     * @returns {Promise} - Loading promise
     */
    loadImage(name, url) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(name, img);
                this.loadedAssets++;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}`);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });

        this.loadingPromises.push(promise);
        this.totalAssets++;
        return promise;
    }

    /**
     * Load a sound asset
     * @param {string} name - Asset name
     * @param {string} url - Sound URL
     * @returns {Promise} - Loading promise
     */
    loadSound(name, url) {
        const promise = new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.sounds.set(name, audio);
                this.loadedAssets++;
                resolve(audio);
            };
            audio.onerror = () => {
                console.warn(`Failed to load sound: ${url}`);
                reject(new Error(`Failed to load sound: ${url}`));
            };
            audio.src = url;
        });

        this.loadingPromises.push(promise);
        this.totalAssets++;
        return promise;
    }

    /**
     * Load multiple assets
     * @param {Object} assets - Asset definitions
     * @returns {Promise} - Promise that resolves when all assets are loaded
     */
    loadAssets(assets) {
        const promises = [];

        if (assets.images) {
            for (const [name, url] of Object.entries(assets.images)) {
                promises.push(this.loadImage(name, url));
            }
        }

        if (assets.sounds) {
            for (const [name, url] of Object.entries(assets.sounds)) {
                promises.push(this.loadSound(name, url));
            }
        }

        return Promise.allSettled(promises);
    }

    /**
     * Get an image asset
     * @param {string} name - Asset name
     * @returns {Image|null} - Image or null if not found
     */
    getImage(name) {
        return this.images.get(name) || null;
    }

    /**
     * Get a sound asset
     * @param {string} name - Asset name
     * @returns {Audio|null} - Audio or null if not found
     */
    getSound(name) {
        return this.sounds.get(name) || null;
    }

    /**
     * Play a sound
     * @param {string} name - Sound name
     * @param {number} volume - Volume (0-1)
     * @returns {boolean} - True if sound was played
     */
    playSound(name, volume = 1.0) {
        const sound = this.getSound(name);
        if (sound) {
            try {
                sound.volume = Math.max(0, Math.min(1, volume));
                sound.currentTime = 0; // Reset to beginning
                sound.play();
                return true;
            } catch (error) {
                console.warn(`Failed to play sound: ${name}`, error);
            }
        }
        return false;
    }

    /**
     * Get loading progress
     * @returns {number} - Progress as percentage (0-1)
     */
    getLoadingProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1;
    }

    /**
     * Check if all assets are loaded
     * @returns {boolean} - True if all assets are loaded
     */
    isLoaded() {
        return this.loadedAssets >= this.totalAssets;
    }

    /**
     * Wait for all assets to load
     * @returns {Promise} - Promise that resolves when loading is complete
     */
    waitForLoad() {
        return Promise.allSettled(this.loadingPromises);
    }

    /**
     * Clear all assets
     */
    clear() {
        this.images.clear();
        this.sounds.clear();
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.loadingPromises = [];
    }

    /**
     * Create a placeholder colored rectangle image
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} color - Color
     * @returns {HTMLCanvasElement} - Canvas element as image
     */
    createPlaceholderImage(width, height, color) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        return canvas;
    }

    /**
     * Initialize with placeholder assets for immediate gameplay
     */
    initializePlaceholders() {
        // Create placeholder images for immediate use
        this.images.set('player', this.createPlaceholderImage(32, 32, '#4169E1'));
        this.images.set('enemy', this.createPlaceholderImage(32, 32, '#FF69B4'));
        this.images.set('projectile', this.createPlaceholderImage(8, 16, '#FF6B6B'));
        this.images.set('obstacle', this.createPlaceholderImage(60, 30, '#90EE90'));
        
        this.loadedAssets = 4;
        this.totalAssets = 4;
    }
}