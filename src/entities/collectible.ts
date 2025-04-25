import * as PIXI from 'pixi.js';

export class Collectible {
    game: any;
    x: number;
    y: number;
    active: boolean;
    animationTime: number;
    sprite: PIXI.Sprite;
    animateFunc: (delta: number) => void;
    
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.active = true;
        this.animationTime = 0;
        
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un simple graphique pour le collectible
        const graphics = new PIXI.Graphics();
        
        // Effet de lueur extérieure
        graphics.beginFill(0xFFFF00, 0.3);  // Jaune transparent pour le halo
        graphics.drawCircle(0, 0, 40);
        graphics.endFill();
        
        // Corps brillant du collectible
        graphics.beginFill(0xFFD700);  // Or
        graphics.drawCircle(0, 0, 25);
        graphics.endFill();
        
        // Contour
        graphics.lineStyle(4, 0xFFA500);  // Orange
        graphics.drawCircle(0, 0, 25);
        
        // Effet de brillance sur le dessus
        graphics.beginFill(0xFFFFFF, 0.7);
        graphics.drawCircle(-8, -8, 8);
        graphics.endFill();
        
        // Convertir en sprite
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(1.5);
        
        // Ajouter l'animation
        this.animateFunc = this.animate.bind(this);
        this.game.app.ticker.add(this.animateFunc);
        
        console.log(`Collectible rendu visible à ${this.x}, ${this.y} avec taille améliorée`);
    }
    
    animate(delta) {
        if (!this.active) return;
        
        // Animation de pulsation
        this.animationTime += delta * 0.1;
        const pulseFactor = 0.2 * Math.sin(this.animationTime) + 1.5;
        this.sprite.scale.set(pulseFactor);
        
        // Légère rotation
        this.sprite.rotation = Math.sin(this.animationTime * 0.5) * 0.2;
    }
    
    update(delta) {
        this.animate(delta);
    }
    
    collect() {
        this.active = false;
        
        // Retirer l'animation normale du ticker
        this.game.app.ticker.remove(this.animateFunc);
        
        // Animation de collecte (disparition avec effet)
        const collectAnimation = () => {
            this.sprite.scale.x *= 1.1;
            this.sprite.scale.y *= 1.1;
            this.sprite.alpha -= 0.1;
            
            if (this.sprite.alpha <= 0) {
                // Supprimer le collectible
                if (this.sprite.parent) {
                    this.sprite.parent.removeChild(this.sprite);
                }
                // Retirer l'animation de collecte du ticker
                this.game.app.ticker.remove(collectAnimation);
            }
        };
        
        this.game.app.ticker.add(collectAnimation);
    }
} 