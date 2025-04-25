import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

export class FlyingEnemy {
    game: Game;
    x: number;
    y: number;
    startY: number;
    amplitude: number;
    frequency: number;
    flyingSpeed: number;
    animationTime: number;
    direction: number;
    boundaryLeft: number;
    boundaryRight: number;
    active: boolean;
    isHighlighted: boolean;
    sprite: PIXI.Sprite;
    
    constructor(game: Game, x: number, y: number, boundaryLeft: number, boundaryRight: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.startY = y;
        this.amplitude = 50; // Amplitude du mouvement vertical
        this.frequency = 0.05; // Fréquence du mouvement vertical
        this.flyingSpeed = 1.5; // Vitesse horizontale
        this.animationTime = 0;
        this.direction = 1;
        this.boundaryLeft = boundaryLeft;
        this.boundaryRight = boundaryRight;
        this.active = true;
        this.isHighlighted = false;
        
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un graphique pour l'ennemi volant
        const graphics = new PIXI.Graphics();
        
        // Corps de l'ennemi (ovale violet)
        graphics.beginFill(0x9932CC);
        graphics.drawEllipse(0, 0, 30, 20);
        graphics.endFill();
        
        // Ailes
        graphics.beginFill(0x8A2BE2, 0.7);
        graphics.drawEllipse(-25, 0, 15, 25);
        graphics.drawEllipse(25, 0, 15, 25);
        graphics.endFill();
        
        // Yeux
        graphics.beginFill(0xFFFFFF);
        graphics.drawCircle(-10, -5, 7);
        graphics.drawCircle(10, -5, 7);
        graphics.endFill();
        
        // Pupilles
        graphics.beginFill(0x000000);
        graphics.drawCircle(-10, -5, 3);
        graphics.drawCircle(10, -5, 3);
        graphics.endFill();
        
        // Bouche
        graphics.lineStyle(3, 0xFF0000);
        graphics.moveTo(-7, 10);
        graphics.lineTo(7, 10);
        
        // Antennes
        graphics.lineStyle(2, 0x8A2BE2);
        graphics.moveTo(-15, -15);
        graphics.lineTo(-5, -25);
        graphics.moveTo(15, -15);
        graphics.lineTo(5, -25);
        
        // Création du sprite
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(1.3);
        
        console.log(`Ennemi volant créé à ${this.x}, ${this.y}`);
    }
    
    update(delta: number = 1) {
        if (!this.active) return;
        
        // Incrémenter le temps d'animation
        this.animationTime += this.frequency * delta;
        
        // Mouvement vertical sinusoïdal
        this.y = this.startY + Math.sin(this.animationTime) * this.amplitude;
        
        // Déplacement horizontal
        this.x += this.flyingSpeed * this.direction * delta;
        
        // Mettre à jour la position du sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Animation des ailes (légère oscillation)
        this.sprite.rotation = Math.sin(this.animationTime * 3) * 0.1;
        
        // Vérification des limites et changement de direction
        if (this.x >= this.boundaryRight) {
            this.direction = -1;
            this.sprite.scale.x = -1.3; // Retourner le sprite
        } else if (this.x <= this.boundaryLeft) {
            this.direction = 1;
            this.sprite.scale.x = 1.3; // Remettre le sprite dans le bon sens
        }
    }
    
    destroy() {
        this.active = false;
        
        // Animation de destruction
        const destroyAnimation = () => {
            this.sprite.rotation += 0.1;
            this.sprite.scale.x *= 0.95;
            this.sprite.scale.y *= 0.95;
            this.sprite.alpha -= 0.05;
            
            if (this.sprite.alpha <= 0) {
                // Supprimer de la scène
                if (this.sprite.parent) {
                    this.sprite.parent.removeChild(this.sprite);
                }
                // Retirer l'animation du ticker
                this.game.app.ticker.remove(destroyAnimation);
            }
        };
        
        // Ajouter l'animation au ticker du jeu
        this.game.app.ticker.add(destroyAnimation);
    }
    
    // Vérifier si le joueur est au-dessus de l'ennemi (pour l'éliminer en sautant dessus)
    isPlayerAbove(player) {
        if (!this.active) return false;
        
        const playerBounds = player.sprite.getBounds();
        const enemyBounds = this.sprite.getBounds();
        
        const isAbove = (
            playerBounds.x + playerBounds.width / 4 < enemyBounds.x + enemyBounds.width * 3/4 &&
            playerBounds.x + playerBounds.width * 3/4 > enemyBounds.x + enemyBounds.width / 4 &&
            playerBounds.y + playerBounds.height >= enemyBounds.y &&
            playerBounds.y + playerBounds.height <= enemyBounds.y + enemyBounds.height / 3 &&
            player.velocityY > 0
        );
        
        // Changer l'apparence quand le joueur est au-dessus
        if (isAbove && !this.isHighlighted) {
            this.isHighlighted = true;
            this.sprite.tint = 0xFF8800; // Teinte orange
        } else if (!isAbove && this.isHighlighted) {
            this.isHighlighted = false;
            this.sprite.tint = 0xFFFFFF; // Reset tint
        }
        
        return isAbove;
    }
    
    // Vérifier si le joueur est touché par l'ennemi
    isPlayerHit(player) {
        if (!this.active) return false;
        
        const playerBounds = player.sprite.getBounds();
        const enemyBounds = this.sprite.getBounds();
        
        return (
            playerBounds.x + playerBounds.width / 2 > enemyBounds.x &&
            playerBounds.x < enemyBounds.x + enemyBounds.width &&
            playerBounds.y + playerBounds.height > enemyBounds.y &&
            playerBounds.y < enemyBounds.y + enemyBounds.height &&
            !this.isPlayerAbove(player)
        );
    }
} 