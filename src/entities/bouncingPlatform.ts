import * as PIXI from 'pixi.js';
import { Platform } from './platform';

export class BouncingPlatform extends Platform {
    bounceForce: number;
    
    constructor(game, x, y, width = 100, height = 20, bounceForce = 15) {
        super(game, x, y, width, height);
        
        this.bounceForce = bounceForce;
        
        // Ajuster l'apparence pour les plateformes rebondissantes
        this.sprite.tint = 0x00FF00; // Couleur verte pour identifier les plateformes rebondissantes
    }
    
    onCollision(player) {
        if (super.onCollision(player)) {
            // Appliquer une force de rebond au joueur
            player.velocityY = -this.bounceForce;
            
            // Animation simple pour montrer le rebond (compression puis extension)
            const originalScaleY = this.sprite.scale.y;
            
            // Compression
            this.sprite.scale.y = originalScaleY * 0.7;
            
            // Extension
            setTimeout(() => {
                this.sprite.scale.y = originalScaleY * 1.2;
                
                // Retour à la normale
                setTimeout(() => {
                    this.sprite.scale.y = originalScaleY;
                }, 100);
            }, 100);
            
            return true;
        }
        
        return false;
    }
} 