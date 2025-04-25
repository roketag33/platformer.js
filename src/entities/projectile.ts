import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

export class Projectile {
    game: Game;
    x: number;
    y: number;
    speed: number;
    angle: number;
    active: boolean;
    sprite: PIXI.Sprite;
    
    constructor(game: Game, x: number, y: number, angle: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.angle = angle;
        this.active = true;
        
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un graphique pour le projectile
        const graphics = new PIXI.Graphics();
        
        // Corps du projectile (cercle rouge avec halo)
        graphics.beginFill(0xFF0000, 0.3);  // Halo rouge transparent
        graphics.drawCircle(0, 0, 15);
        graphics.endFill();
        
        graphics.beginFill(0xFF0000);  // Centre rouge vif
        graphics.drawCircle(0, 0, 7);
        graphics.endFill();
        
        // Création du sprite
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Rotation pour suivre la direction
        this.sprite.rotation = this.angle + Math.PI / 2;
    }
    
    update(delta: number = 1) {
        if (!this.active) return;
        
        // Déplacement selon l'angle
        this.x += Math.cos(this.angle) * this.speed * delta;
        this.y += Math.sin(this.angle) * this.speed * delta;
        
        // Mise à jour de la position du sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Effet visuel: légère oscillation de taille
        const pulseScale = 0.05 * Math.sin(Date.now() / 100) + 1;
        this.sprite.scale.set(pulseScale);
    }
    
    explode() {
        this.active = false;
        
        // Créer une explosion
        const explosion = new PIXI.Graphics();
        
        // Cercle d'explosion
        explosion.beginFill(0xFF5500, 0.7);
        explosion.drawCircle(0, 0, 20);
        explosion.endFill();
        
        // Rayons
        explosion.lineStyle(3, 0xFFFF00);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            explosion.moveTo(0, 0);
            explosion.lineTo(Math.cos(angle) * 30, Math.sin(angle) * 30);
        }
        
        const explosionSprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(explosion));
        explosionSprite.anchor.set(0.5);
        explosionSprite.x = this.x;
        explosionSprite.y = this.y;
        
        // Ajouter l'explosion à la scène
        this.game.container.addChild(explosionSprite);
        
        // Animation d'explosion
        const animateExplosion = () => {
            explosionSprite.scale.x *= 1.05;
            explosionSprite.scale.y *= 1.05;
            explosionSprite.alpha -= 0.05;
            
            if (explosionSprite.alpha <= 0) {
                // Supprimer l'explosion
                if (explosionSprite.parent) {
                    explosionSprite.parent.removeChild(explosionSprite);
                }
                // Retirer l'animation
                this.game.app.ticker.remove(animateExplosion);
            }
        };
        
        // Ajouter l'animation au ticker
        this.game.app.ticker.add(animateExplosion);
    }
} 