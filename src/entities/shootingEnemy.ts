import * as PIXI from 'pixi.js';
import { Game } from '../core/game';
import { Projectile } from './projectile';

export class ShootingEnemy {
    game: Game;
    x: number;
    y: number;
    direction: number;
    active: boolean;
    isHighlighted: boolean;
    shootInterval: number;
    lastShootTime: number;
    detectionRange: number;
    sprite: PIXI.Sprite;
    projectiles: Projectile[];
    
    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = 1; // 1 = droite, -1 = gauche
        this.active = true;
        this.isHighlighted = false;
        
        // Paramètres de tir
        this.shootInterval = 2000; // Intervalle entre les tirs en ms
        this.lastShootTime = 0;
        this.detectionRange = 300; // Distance de détection du joueur
        
        // Liste des projectiles
        this.projectiles = [];
        
        this.createSprite();
    }
    
    createSprite() {
        // Création d'un graphique pour l'ennemi tireur
        const graphics = new PIXI.Graphics();
        
        // Corps de l'ennemi (carré vert)
        graphics.beginFill(0x006400);
        graphics.drawRect(-30, -30, 60, 60);
        graphics.endFill();
        
        // Canon
        graphics.beginFill(0x333333);
        graphics.drawRect(20, -5, 20, 10);
        graphics.endFill();
        
        // Yeux
        graphics.beginFill(0xFFFFFF);
        graphics.drawCircle(-10, -10, 7);
        graphics.drawCircle(10, -10, 7);
        graphics.endFill();
        
        // Pupilles
        graphics.beginFill(0x000000);
        graphics.drawCircle(-7, -10, 3);
        graphics.drawCircle(13, -10, 3);
        graphics.endFill();
        
        // Bouche (sourire maléfique)
        graphics.lineStyle(3, 0xFF0000);
        graphics.arc(-15, 10, 30, 0, Math.PI * 0.8);
        
        // Création du sprite
        this.sprite = new PIXI.Sprite(this.game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(1.2);
        
        console.log(`Ennemi tireur créé à ${this.x}, ${this.y}`);
    }
    
    update(delta: number = 1) {
        if (!this.active) return;
        
        // Vérifier si le joueur est dans la zone de détection
        if (this.canSeePlayer()) {
            // Orienter l'ennemi vers le joueur
            this.lookAtPlayer();
            
            // Tirer à intervalles réguliers
            const currentTime = Date.now();
            if (currentTime - this.lastShootTime > this.shootInterval) {
                this.shoot();
                this.lastShootTime = currentTime;
            }
        }
        
        // Mettre à jour les projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(delta);
            
            // Suppression des projectiles qui sortent de l'écran
            if (
                projectile.x < 0 || 
                projectile.x > this.game.width || 
                projectile.y < 0 || 
                projectile.y > this.game.height ||
                !projectile.active
            ) {
                if (projectile.sprite.parent) {
                    projectile.sprite.parent.removeChild(projectile.sprite);
                }
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    canSeePlayer() {
        // Vérifier si le joueur est assez proche
        if (!this.game.player) return false;
        
        const dx = this.game.player.sprite.x - this.sprite.x;
        const dy = this.game.player.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.detectionRange;
    }
    
    lookAtPlayer() {
        // Orienter l'ennemi vers le joueur
        if (this.game.player.sprite.x < this.sprite.x) {
            this.direction = -1;
            this.sprite.scale.x = -1.2;
        } else {
            this.direction = 1;
            this.sprite.scale.x = 1.2;
        }
    }
    
    shoot() {
        // Calculer la direction vers le joueur
        const dx = this.game.player.sprite.x - this.sprite.x;
        const dy = this.game.player.sprite.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        
        // Position de départ du projectile (à l'extrémité du canon)
        const startX = this.sprite.x + Math.cos(angle) * 35;
        const startY = this.sprite.y + Math.sin(angle) * 10;
        
        // Créer le projectile
        const projectile = new Projectile(this.game, startX, startY, angle);
        this.projectiles.push(projectile);
        
        // Ajouter le projectile à la scène
        this.game.container.addChild(projectile.sprite);
        
        // Effet visuel de recul
        this.sprite.x -= Math.cos(angle) * 5;
        this.sprite.y -= Math.sin(angle) * 5;
        
        // Revenir à la position d'origine après un court délai
        setTimeout(() => {
            this.sprite.x += Math.cos(angle) * 5;
            this.sprite.y += Math.sin(angle) * 5;
        }, 100);
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
    
    // Vérifier si le joueur est au-dessus de l'ennemi
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
    
    // Vérifier les collisions des projectiles avec le joueur
    checkProjectileCollisions() {
        if (!this.game.player) return;
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            if (projectile.active && this.isCollidingWithPlayer(projectile)) {
                // Le joueur est touché
                this.game.player.takeDamage(1);
                
                // Désactiver le projectile
                projectile.active = false;
                
                // Animation d'impact
                projectile.explode();
            }
        }
    }
    
    isCollidingWithPlayer(projectile) {
        const playerBounds = this.game.player.sprite.getBounds();
        const projectileBounds = projectile.sprite.getBounds();
        
        return (
            playerBounds.x + playerBounds.width > projectileBounds.x &&
            playerBounds.x < projectileBounds.x + projectileBounds.width &&
            playerBounds.y + playerBounds.height > projectileBounds.y &&
            playerBounds.y < projectileBounds.y + projectileBounds.height
        );
    }
} 