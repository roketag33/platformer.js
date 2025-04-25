import * as PIXI from 'pixi.js';

export class Platform {
    game: any;
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: PIXI.Sprite;
    
    constructor(game, x, y, width = 100, height = 20) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Création du sprite
        this.createSprite();
    }
    
    createSprite() {
        // Récupère la texture depuis l'objet textures de game
        const texture = this.game.textures.platform;
        
        if (!texture) {
            console.error('Texture "platform" non trouvée');
            // Créer un sprite de secours
            this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            this.sprite.tint = 0x8B4513; // Coloration brune
        } else {
            this.sprite = new PIXI.Sprite(texture);
        }
        
        // Configuration du sprite
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Définir le point d'ancrage au milieu du haut de la sprite
        this.sprite.anchor.set(0, 0);
    }
} 