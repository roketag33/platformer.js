import * as PIXI from 'pixi.js';

export class PowerUp {
    game: any;
    x: number;
    y: number;
    type: string;
    durations: { [key: string]: number };
    colors: { [key: string]: number };
    animationSpeed: number;
    animationDirection: number;
    animationCounter: number;
    sprite: PIXI.Sprite;
    
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Durée du power-up en millisecondes
        this.durations = {
            doubleJump: 10000,  // 10 secondes
            speed: 8000,        // 8 secondes
            invincibility: 5000,// 5 secondes
            healthBoost: 0      // permanent (ajoute de la vie)
        };
        
        // Couleurs des power-ups
        this.colors = {
            doubleJump: 0x00FF00,     // Vert
            speed: 0x00FFFF,          // Cyan
            invincibility: 0xFFFF00,  // Jaune
            healthBoost: 0xFF00FF     // Rose
        };
        
        // Paramètres d'animation
        this.animationSpeed = 0.05;
        this.animationDirection = 1;
        this.animationCounter = 0;
        
        // Création du sprite
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un sprite pour le power-up
        const graphics = new PIXI.Graphics();
        
        // Créer un diamant plus grand pour le power-up
        const size = 20; // Plus grande taille
        
        // Diamant coloré selon le type
        graphics.beginFill(this.colors[this.type] || 0xFFFFFF);
        graphics.drawRect(-size, 0, size*2, size*2);
        graphics.rotation = Math.PI / 4; // Rotation de 45 degrés pour former un diamant
        graphics.endFill();
        
        // Effet de brillance
        graphics.beginFill(0xFFFFFF, 0.5);
        graphics.drawCircle(-size/2, -size/2, size/3);
        graphics.endFill();
        
        // Création du sprite à partir du graphique
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.anchor.set(0.5);
        
        // Ajouter une animation de flottement
        this.game.app.ticker.add(this.animate.bind(this));
        
        console.log(`PowerUp rendu visible à ${this.x}, ${this.y}`);
    }
    
    animate(delta) {
        // Animation de flottement
        this.animationCounter += this.animationSpeed * this.animationDirection;
        
        if (this.animationCounter >= 1) {
            this.animationDirection = -1;
        } else if (this.animationCounter <= 0) {
            this.animationDirection = 1;
        }
        
        // Mouvement vertical léger
        this.sprite.y = this.y + Math.sin(this.animationCounter * Math.PI) * 5;
        
        // Légère rotation
        this.sprite.rotation += 0.01 * delta;
    }
    
    collect(player) {
        // Appliquer l'effet du power-up au joueur
        switch(this.type) {
            case 'doubleJump':
                player.canDoubleJump = true;
                // Réinitialiser après un délai
                setTimeout(() => {
                    player.canDoubleJump = false;
                }, this.durations.doubleJump);
                break;
                
            case 'speed':
                // Sauvegarder la vitesse actuelle
                const originalSpeed = player.speed;
                // Augmenter la vitesse
                player.speed *= 1.5;
                // Réinitialiser après un délai
                setTimeout(() => {
                    player.speed = originalSpeed;
                }, this.durations.speed);
                break;
                
            case 'invincibility':
                player.isInvincible = true;
                // Effet visuel de clignotement
                const blinkEffect = () => {
                    player.sprite.alpha = player.sprite.alpha === 1 ? 0.5 : 1;
                };
                const blinkInterval = setInterval(blinkEffect, 100);
                
                // Réinitialiser après un délai
                setTimeout(() => {
                    player.isInvincible = false;
                    clearInterval(blinkInterval);
                    player.sprite.alpha = 1;
                }, this.durations.invincibility);
                break;
                
            case 'healthBoost':
                player.health = Math.min(player.health + 1, player.maxHealth);
                break;
        }
        
        // Supprimer le power-up
        this.game.container.removeChild(this.sprite);
        const index = this.game.powerUps.indexOf(this);
        if (index !== -1) {
            this.game.powerUps.splice(index, 1);
        }
        
        // Arrêter l'animation
        this.game.app.ticker.remove(this.animate.bind(this));
    }
} 