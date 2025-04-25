import * as PIXI from 'pixi.js';
import { Platform } from './platform';

export class MovingPlatform extends Platform {
    originalX: number;
    originalY: number;
    moveHorizontal: boolean;
    moveVertical: boolean;
    distance: number;
    speed: number;
    direction: number;
    elapsedTime: number;
    
    constructor(game, x, y, width = 100, height = 20, options = {}) {
        super(game, x, y, width, height);
        
        this.originalX = x;
        this.originalY = y;
        
        // Options de mouvement
        this.moveHorizontal = options.moveHorizontal || false;
        this.moveVertical = options.moveVertical || false;
        this.distance = options.distance || 100;
        this.speed = options.speed || 1;
        this.direction = 1;
        this.elapsedTime = 0;
        
        // Ajuster l'apparence pour les plateformes mobiles
        this.sprite.tint = 0x00AAFF; // Couleur bleue pour identifier les plateformes mobiles
    }
    
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        
        // Calcul du mouvement avec une fonction sinus pour un mouvement fluide
        const factor = Math.sin(this.elapsedTime * 0.05 * this.speed);
        
        // Mouvement horizontal
        if (this.moveHorizontal) {
            this.sprite.x = this.originalX + factor * this.distance;
        }
        
        // Mouvement vertical
        if (this.moveVertical) {
            this.sprite.y = this.originalY + factor * this.distance;
        }
        
        // Mettre à jour les limites de collision
        this.updateBounds();
    }
    
    updateBounds() {
        this.bounds = {
            left: this.sprite.x,
            right: this.sprite.x + this.width,
            top: this.sprite.y,
            bottom: this.sprite.y + this.height
        };
    }
    
    // Vérifier si le joueur est sur la plateforme
    checkPlayerCollision(player, deltaTime = 0) {
        const playerBounds = player.sprite.getBounds();
        const platformBounds = this.sprite.getBounds();
        
        // Vérifier si le joueur est au-dessus de la plateforme
        const isOnPlatform = (
            playerBounds.x + playerBounds.width > platformBounds.x &&
            playerBounds.x < platformBounds.x + platformBounds.width &&
            playerBounds.y + playerBounds.height >= platformBounds.y &&
            playerBounds.y + playerBounds.height <= platformBounds.y + platformBounds.height / 2 &&
            player.velocityY >= 0
        );
        
        if (isOnPlatform) {
            // Placer le joueur sur la plateforme
            player.sprite.y = platformBounds.y - playerBounds.height / 2;
            player.velocityY = 0;
            player.isOnGround = true;
            
            // Si la plateforme se déplace horizontalement, déplacer le joueur avec elle
            if (this.moveHorizontal) {
                player.sprite.x += this.speed * this.direction * deltaTime;
            }
        }
        
        return isOnPlatform;
    }
} 