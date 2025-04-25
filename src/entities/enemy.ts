import * as PIXI from 'pixi.js';

export class Enemy {
    game: any;
    x: number;
    y: number;
    boundaryLeft: number;
    boundaryRight: number;
    direction: number;
    speed: number;
    active: boolean;
    isHighlighted: boolean;
    sprite: PIXI.Sprite;
    
    constructor(game, x, y, boundaryLeft, boundaryRight) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.boundaryLeft = boundaryLeft;
        this.boundaryRight = boundaryRight;
        this.direction = 1;
        this.speed = 2;
        this.active = true;
        this.isHighlighted = false;
        
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un graphique pour l'ennemi
        const graphics = new PIXI.Graphics();
        
        // Corps de l'ennemi (rectangle rouge vif)
        graphics.beginFill(0xFF0000);
        graphics.drawRect(-30, -30, 60, 60); 
        graphics.endFill();
        
        // Yeux blancs
        graphics.beginFill(0xFFFFFF);
        graphics.drawCircle(-15, -10, 10);
        graphics.drawCircle(15, -10, 10);
        graphics.endFill();
        
        // Pupilles noires
        graphics.beginFill(0x000000);
        graphics.drawCircle(-15, -10, 5);
        graphics.drawCircle(15, -10, 5);
        graphics.endFill();
        
        // Bouche (en colère)
        graphics.lineStyle(4, 0x000000);
        graphics.moveTo(-15, 10);
        graphics.lineTo(0, 20);
        graphics.lineTo(15, 10);
        
        // Contour épais
        graphics.lineStyle(8, 0x000000);
        graphics.drawRect(-30, -30, 60, 60);
        
        // Création du sprite
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(1.5);
        
        console.log(`Ennemi rendu visible à ${this.x}, ${this.y} avec taille améliorée`);
    }
    
    update(delta: number = 1) {
        if (!this.active) return;
        
        // Déplacement horizontal
        this.x += this.speed * this.direction * (delta || 1);
        this.sprite.x = this.x;
        
        // Vérification des limites et changement de direction
        if (this.x >= this.boundaryRight) {
            this.direction = -1;
            this.sprite.scale.x = -1.5; // Retourner le sprite en conservant sa taille
        } else if (this.x <= this.boundaryLeft) {
            this.direction = 1;
            this.sprite.scale.x = 1.5;  // Remettre le sprite dans le bon sens
        }
    }
    
    destroy() {
        this.active = false;
        
        // Animation de destruction
        const destroyAnimation = () => {
            this.sprite.rotation += 0.2;
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
    
    // Vérifier si le joueur est touché par l'ennemi (collision latérale)
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