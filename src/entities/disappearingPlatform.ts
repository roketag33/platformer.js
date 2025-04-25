import * as PIXI from 'pixi.js';
import { Platform } from './platform';

export class DisappearingPlatform extends Platform {
    active: boolean;
    disappeared: boolean;
    touchDuration: number;
    disappearingTime: number;
    reappearingTime: number;
    timer: number;
    
    constructor(game, x, y, width = 100, height = 20, options = {}) {
        super(game, x, y, width, height);
        
        this.active = true;
        this.disappeared = false;
        
        // Durées en millisecondes
        this.touchDuration = options.touchDuration || 500;     // Temps avant de commencer à disparaître
        this.disappearingTime = options.disappearingTime || 1000; // Temps pour disparaître complètement
        this.reappearingTime = options.reappearingTime || 3000;  // Temps avant de réapparaître
        
        this.timer = 0;
        
        // Ajuster l'apparence pour les plateformes qui disparaissent
        this.sprite.tint = 0xFF6600; // Couleur orange pour identifier les plateformes qui disparaissent
    }
    
    update(deltaTime) {
        if (!this.active) {
            this.timer += deltaTime;
            
            if (!this.disappeared) {
                // Phase de disparition
                const disappearProgress = this.timer / this.disappearingTime;
                
                if (disappearProgress >= 1) {
                    // Complètement disparu
                    this.sprite.alpha = 0;
                    this.disappeared = true;
                    this.timer = 0;
                } else {
                    // En train de disparaître
                    this.sprite.alpha = 1 - disappearProgress;
                }
            } else {
                // Phase de réapparition
                if (this.timer >= this.reappearingTime) {
                    // Réactivation
                    this.active = true;
                    this.disappeared = false;
                    this.sprite.alpha = 1;
                    this.timer = 0;
                }
            }
        }
    }
    
    onCollision(player) {
        if (!this.active || this.disappeared) return false;
        
        // Si collision et plateforme active, démarrer le processus de disparition
        if (super.onCollision(player)) {
            if (this.active) {
                setTimeout(() => {
                    this.active = false;
                    this.timer = 0;
                }, this.touchDuration);
            }
            return true;
        }
        
        return false;
    }
} 