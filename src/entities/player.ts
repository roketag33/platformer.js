import * as PIXI from 'pixi.js';

export class Player {
    game: any;
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    jumpPower: number;
    isOnGround: boolean;
    isJumping: boolean;
    direction: number;
    maxHealth: number;
    health: number;
    canDoubleJump: boolean;
    hasDoubleJumped: boolean;
    isInvincible: boolean;
    hurtInvincibility: boolean;
    hurtInvincibilityDuration: number;
    sprite: PIXI.Sprite;
    
    constructor(game) {
        this.game = game;
        
        // Position et vitesse initiales
        this.x = game.width / 2;
        this.y = game.height / 2;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Constantes de mouvement
        this.speed = 5;
        this.jumpPower = 12;
        
        // État du joueur
        this.isOnGround = false;
        this.isJumping = false;
        this.direction = 1; // 1 = droite, -1 = gauche
        
        // Système de points de vie
        this.maxHealth = 3;
        this.health = 3;
        
        // État des power-ups
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.isInvincible = false;
        
        // Période d'invincibilité temporaire après avoir été touché
        this.hurtInvincibility = false;
        this.hurtInvincibilityDuration = 1500; // 1.5 secondes
        
        // Création du sprite
        this.createSprite();
    }
    
    createSprite() {
        // Récupère la texture depuis l'objet textures de game
        const texture = this.game.textures.bunny;
        
        if (!texture) {
            console.error('Texture "bunny" non trouvée');
            // Créer un sprite de secours
            this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            this.sprite.width = 32;
            this.sprite.height = 32;
            this.sprite.tint = 0xFF00FF; // Coloration rose pour indiquer l'erreur
        } else {
            this.sprite = new PIXI.Sprite(texture);
        }
        
        // Configuration du sprite
        this.sprite.anchor.set(0.5); // Point d'ancrage au centre
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        
        // Adapter la taille en fonction de la taille de l'écran
        const screenScale = Math.min(this.game.width, this.game.height) / 600;
        const baseWidth = 32;
        const baseHeight = 48;
        
        this.sprite.width = baseWidth * screenScale;
        this.sprite.height = baseHeight * screenScale;
    }
    
    update(delta) {
        // Application de la gravité
        this.velocityY += this.game.gravity;
        
        // Mise à jour de la position
        this.sprite.x += this.velocityX;
        this.sprite.y += this.velocityY;
        
        // Limites de l'écran
        this.checkBoundaries();
        
        // Réinitialiser le double saut si on touche le sol
        if (this.isOnGround) {
            this.hasDoubleJumped = false;
        }
    }
    
    checkBoundaries() {
        // Empêche le joueur de sortir de l'écran
        if (this.sprite.x < this.sprite.width / 2) {
            this.sprite.x = this.sprite.width / 2;
            this.velocityX = 0;
        } else if (this.sprite.x > this.game.width - this.sprite.width / 2) {
            this.sprite.x = this.game.width - this.sprite.width / 2;
            this.velocityX = 0;
        }
        
        // Si le joueur tombe hors de l'écran, perd une vie
        if (this.sprite.y > this.game.height + 100) {
            this.takeDamage(1);
        }
    }
    
    handleKeyDown(keys) {
        // Mouvement horizontal
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.velocityX = -this.speed;
            this.direction = -1;
            this.sprite.scale.x = -1; // Retourne le sprite
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            this.velocityX = this.speed;
            this.direction = 1;
            this.sprite.scale.x = 1; // Sprite dans le sens normal
        }
        
        // Saut normal
        if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && this.isOnGround && !this.isJumping) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
            this.isJumping = true;
        }
        // Double saut (si le power-up est actif)
        else if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && 
                 !this.isOnGround && 
                 !this.hasDoubleJumped && 
                 this.canDoubleJump) {
            this.velocityY = -this.jumpPower * 0.8; // Légèrement moins puissant
            this.hasDoubleJumped = true;
        }
    }
    
    handleKeyUp(keys) {
        // Arrêt du mouvement horizontal si les touches correspondantes sont relâchées
        if ((!keys['ArrowLeft'] && !keys['KeyA'] && this.velocityX < 0) || 
            (!keys['ArrowRight'] && !keys['KeyD'] && this.velocityX > 0)) {
            this.velocityX = 0;
        }
        
        // Réinitialisation du saut
        if (!keys['ArrowUp'] && !keys['KeyW'] && !keys['Space']) {
            this.isJumping = false;
        }
    }
    
    takeDamage(amount) {
        // Ne pas prendre de dégâts si invincible
        if (this.isInvincible || this.hurtInvincibility) return;
        
        // Réduire les points de vie
        this.health -= amount;
        
        // Mort si plus de points de vie
        if (this.health <= 0) {
            this.die();
            return;
        }
        
        // Mise à jour de l'interface utilisateur
        this.game.ui.updateHealthDisplay();
        
        // Effet de clignotement temporaire
        this.hurtInvincibility = true;
        
        const blinkEffect = () => {
            this.sprite.alpha = this.sprite.alpha === 1 ? 0.5 : 1;
        };
        
        const blinkInterval = setInterval(blinkEffect, 100);
        
        // Réinitialiser l'invincibilité après un délai
        setTimeout(() => {
            this.hurtInvincibility = false;
            clearInterval(blinkInterval);
            this.sprite.alpha = 1;
        }, this.hurtInvincibilityDuration);
        
        // Légère impulsion vers l'arrière
        this.velocityY = -5;
        this.velocityX = -5 * this.direction;
    }
    
    die() {
        // Réinitialiser les points de vie
        this.health = this.maxHealth;
        
        // Mettre à jour l'interface utilisateur
        this.game.ui.updateHealthDisplay();
        
        // Réinitialiser la position
        this.reset();
        
        // Effet visuel de réapparition (clignotement)
        this.hurtInvincibility = true;
        
        const blinkEffect = () => {
            this.sprite.alpha = this.sprite.alpha === 1 ? 0.5 : 1;
        };
        
        const blinkInterval = setInterval(blinkEffect, 100);
        
        // Réinitialiser l'invincibilité après un délai
        setTimeout(() => {
            this.hurtInvincibility = false;
            clearInterval(blinkInterval);
            this.sprite.alpha = 1;
        }, this.hurtInvincibilityDuration * 2);
    }
    
    reset() {
        // Réinitialiser la position et la vitesse
        this.sprite.x = this.game.width / 2;
        this.sprite.y = this.game.height / 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.isJumping = false;
        this.hasDoubleJumped = false;
    }
    
    // Repositionner le joueur à une position spécifique (pour le chargement de niveau)
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
    }
} 