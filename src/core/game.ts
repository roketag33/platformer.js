import * as PIXI from 'pixi.js';
import { Player } from '../entities/player';
import { Platform } from '../entities/platform';
import { Collectible } from '../entities/collectible';
import { Enemy } from '../entities/enemy';
import { PowerUp } from '../entities/powerup';
import { UI } from '../ui/ui';
import { Level } from './level';

// Extension pour PIXI.Graphics pour ajouter des méthodes personnalisées
declare global {
    namespace PIXI {
        // Interface pour ajouter nos méthodes personnalisées à Graphics
        interface Graphics {
            drawHeart(x: number, y: number, size: number, color: number, outline?: boolean): PIXI.Graphics;
            drawStar(x: number, y: number, points: number, outerRadius: number, innerRadius: number, color: number): PIXI.Graphics;
        }
    }
}

export class Game {
    width: number;
    height: number;
    gravity: number;
    score: number;
    isGameOver: boolean;
    isPaused: boolean;
    textures: { [key: string]: PIXI.Texture };
    platforms: Platform[];
    collectibles: Collectible[];
    enemies: Enemy[];
    powerUps: PowerUp[];
    app: PIXI.Application;
    container: PIXI.Container;
    ui: UI;
    level: Level;
    player: Player;
    isGameRunning: boolean;

    constructor() {
        // Configuration du jeu
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.gravity = 0.5;
        this.score = 0;
        
        // État du jeu
        this.isGameOver = false;
        this.isPaused = false;
        
        // Stockage des textures
        this.textures = {};
        
        // Collections d'objets de jeu
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.powerUps = [];
        
        // Gestion du redimensionnement
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        if (this.app) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.app.renderer.resize(this.width, this.height);
            
            // Mettre à jour la position des éléments d'UI
            if (this.ui) {
                this.ui.updatePositions();
            }
            
            // Mettre à jour le niveau
            if (this.level) {
                this.level.handleResize();
            }
            
            // Ajuster la taille du joueur si nécessaire
            if (this.player) {
                // Si le joueur est trop petit par rapport à l'écran, augmenter sa taille
                const minSize = Math.min(this.width, this.height) * 0.05; // 5% de la plus petite dimension
                if (this.player.sprite.width < minSize) {
                    const scale = minSize / this.player.sprite.width;
                    this.player.sprite.width *= scale;
                    this.player.sprite.height *= scale;
                }
            }
        }
    }

    async start() {
        // Initialiser l'application PIXI
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            backgroundColor: 0x87CEEB,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
        });
        
        // Ajouter le canvas au DOM
        document.getElementById('game-container')?.appendChild(this.app.view as unknown as HTMLCanvasElement);
        
        // Ajouter un conteneur principal pour tous les éléments du jeu
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        
        // Préparer les textures de secours
        this.createFallbackTextures();
        
        // Étendre les graphiques avec des méthodes personnalisées
        this.extendGraphics();
        
        // Charger les assets
        await this.loadAssets();
        
        // Créer le joueur
        this.createPlayer();
        
        // Initialiser l'interface utilisateur
        this.ui = new UI(this);
        
        // Initialiser le gestionnaire de niveaux
        this.level = new Level(this, {});
        
        // Charger le premier niveau
        const levelLoaded = this.level.loadLevel(0);
        console.log("Niveau chargé:", levelLoaded);
        console.log("Plateformes créées:", this.platforms.length);
        console.log("Collectibles créés:", this.collectibles.length);
        console.log("Ennemis créés:", this.enemies.length);
        console.log("Power-ups créés:", this.powerUps.length);
        
        // Forcer la mise à jour de l'affichage de santé et de niveau
        this.ui.createHealthDisplay();
        this.ui.updateLevelDisplay();
        
        // Configurer les événements clavier
        this.setupKeyboardEvents();
        
        // Commencer le jeu
        this.isGameRunning = true;
        this.app.ticker.add(this.gameLoop.bind(this));
        
        // Montrer les instructions
        this.ui.showInstructions();
        
        // Organiser les éléments pour qu'ils soient tous visibles
        this.organizeGameElements();
    }

    async loadAssets() {
        try {
            // Définition des assets à charger
            const assetMap = {
                bunny: 'public/assets/images/bunny.png',
                platform: 'public/assets/images/platform.png',
                coin: 'public/assets/images/coin.png',
            };
            
            // Préchargement des assets
            for (const [name, url] of Object.entries(assetMap)) {
                console.log(`Chargement de ${name} depuis ${url}`);
                try {
                    // Tenter de charger l'asset
                    const texture = await PIXI.Assets.load(url);
                    // Remplacer la texture de secours uniquement si le chargement a réussi
                    this.textures[name] = texture;
                    console.log(`${name} chargé avec succès`);
                } catch (error) {
                    console.error(`Erreur lors du chargement de ${name}:`, error);
                }
            }
        } catch (error) {
            console.error("Erreur générale lors du chargement des assets:", error);
        }
    }
    
    createFallbackTextures() {
        // Créer des textures de secours pour les assets essentiels
        
        // Texture de secours pour le lapin
        const bunnyGraphics = new PIXI.Graphics();
        bunnyGraphics.beginFill(0xFF00FF); // Rose vif
        bunnyGraphics.drawCircle(0, 0, 20); // Tête
        bunnyGraphics.drawEllipse(0, 30, 10, 20); // Corps
        bunnyGraphics.drawEllipse(-15, -15, 5, 15); // Oreille gauche
        bunnyGraphics.drawEllipse(15, -15, 5, 15); // Oreille droite
        bunnyGraphics.endFill();
        this.textures.bunny = this.app.renderer.generateTexture(bunnyGraphics);
        
        // Texture de secours pour la plateforme
        const platformGraphics = new PIXI.Graphics();
        platformGraphics.beginFill(0x8B4513); // Marron
        platformGraphics.drawRect(0, 0, 100, 20);
        platformGraphics.endFill();
        this.textures.platform = this.app.renderer.generateTexture(platformGraphics);
        
        // Texture de secours pour la pièce
        const coinGraphics = new PIXI.Graphics();
        coinGraphics.beginFill(0xFFD700); // Or
        coinGraphics.drawCircle(0, 0, 10);
        coinGraphics.endFill();
        this.textures.coin = this.app.renderer.generateTexture(coinGraphics);
    }
    
    extendGraphics() {
        // Cette méthode est maintenant vide car nous n'utilisons plus 
        // les extensions de prototype qui causent des problèmes avec TypeScript
        console.log('Méthodes personnalisées remplacées par des utilitaires dans la classe UI');
    }
    
    // Fonction utilitaire pour dessiner un cœur
    drawHeart(graphics: PIXI.Graphics, x: number, y: number, size: number, color: number, outline = false): PIXI.Graphics {
        if (outline) {
            graphics.lineStyle(2, color);
            graphics.beginFill(0, 0); // Transparent
        } else {
            graphics.beginFill(color);
            graphics.lineStyle(2, 0x800000);
        }
        
        graphics.moveTo(x, y + size / 4);
        
        // Côté gauche du cœur
        graphics.bezierCurveTo(
            x - size / 2, y - size / 2,
            x - size, y + size / 4,
            x, y + size
        );
        
        // Côté droit du cœur
        graphics.bezierCurveTo(
            x + size, y + size / 4,
            x + size / 2, y - size / 2,
            x, y + size / 4
        );
        
        graphics.endFill();
        return graphics;
    }
    
    // Fonction utilitaire pour dessiner une étoile
    drawStar(graphics: PIXI.Graphics, x: number, y: number, points: number, outerRadius: number, innerRadius: number, color: number): PIXI.Graphics {
        graphics.beginFill(color);
        
        // Dessiner l'étoile
        const step = Math.PI / points;
        
        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2; // Commencer par le haut
            
            if (i === 0) {
                graphics.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            } else {
                graphics.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            }
        }
        
        graphics.closePath();
        graphics.endFill();
        return graphics;
    }

    createPlayer() {
        // Création du joueur
        this.player = new Player(this);
        this.container.addChild(this.player.sprite);
    }

    setupKeyboardEvents() {
        // Gestion des touches du clavier
        const keys = {};

        window.addEventListener('keydown', (e) => {
            // Ignorer les événements si le jeu est en pause ou terminé
            if (this.isPaused || this.isGameOver) {
                // Permettre de redémarrer avec espace si game over
                if (this.isGameOver && (e.code === 'Space' || e.code === 'Enter')) {
                    this.restart();
                }
                return;
            }
            
            keys[e.code] = true;
            this.player.handleKeyDown(keys);
            
            // Gestion de la pause avec la touche 'P' ou Escape
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
            
            // Même si le jeu est en pause, on veut quand même suivre 
            // les touches relâchées pour éviter des comportements bizarres
            if (!this.isPaused && !this.isGameOver) {
                this.player.handleKeyUp(keys);
            }
        });
    }

    gameLoop(delta) {
        // Ne pas mettre à jour le jeu si en pause ou game over
        if (this.isPaused || this.isGameOver) return;
        
        // Mise à jour du joueur
        this.player.update(delta);
        
        // Mise à jour des ennemis
        this.enemies.forEach(enemy => {
            enemy.update(delta);
        });
        
        // Plus besoin d'appeler update sur les collectibles car ils sont gérés par le ticker
        
        // Vérification des collisions avec les plateformes
        this.checkPlatformCollisions();

        // Vérification des collisions avec les collectibles
        this.checkCollectibleCollisions();
        
        // Vérification des collisions avec les power-ups
        this.checkPowerUpCollisions();
        
        // Vérification des collisions avec les ennemis
        this.checkEnemyCollisions();
        
        // Vérifier si le niveau est terminé
        if (this.level.isLevelComplete()) {
            this.completeLevel();
        }

        // Mise à jour de l'interface utilisateur
        this.ui.update();
    }

    checkPlatformCollisions() {
        // Réinitialise l'état au sol du joueur
        this.player.isOnGround = false;

        for (const platform of this.platforms) {
            if (this.isColliding(this.player, platform)) {
                // Si le joueur tombe sur la plateforme
                if (this.player.velocityY >= 0 && 
                    this.player.sprite.y < platform.sprite.y) {
                    
                    this.player.sprite.y = platform.sprite.y - this.player.sprite.height / 2;
                    this.player.velocityY = 0;
                    this.player.isOnGround = true;
                }
            }
        }
    }

    checkCollectibleCollisions() {
        if (!this.player || !this.collectibles.length) {
            return;
        }
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            if (this.isColliding(this.player, collectible)) {
                // Utiliser la nouvelle méthode collect() pour l'animation
                collectible.collect();
                
                // Supprimer l'objet de la liste des collectibles
                this.collectibles.splice(i, 1);
                
                // Incrémente le score
                this.score += 1;
                console.log("Pièce collectée! Score:", this.score);
                
                // Mettre à jour l'affichage du score
                this.ui.update();
                
                // Effet sonore (à implémenter)
                // this.playSoundEffect('collect');
            }
        }
    }
    
    checkPowerUpCollisions() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (this.isColliding(this.player, powerUp)) {
                // Appliquer l'effet du power-up
                powerUp.collect(this.player);
                
                // Afficher un message
                this.ui.showPowerUpMessage(powerUp.type);
                
                // Effet sonore (à implémenter)
                // this.playSoundEffect('powerup');
            }
        }
    }
    
    checkEnemyCollisions() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Si le joueur saute sur l'ennemi
            if (enemy.isPlayerAbove(this.player)) {
                // Éliminer l'ennemi en utilisant la nouvelle méthode destroy()
                enemy.destroy();
                
                // Rebondir légèrement
                this.player.velocityY = -8;
                
                // Ajouter des points
                this.score += 5;
                
                // Effet sonore (à implémenter)
                // this.playSoundEffect('enemyDefeat');
            }
            // Si le joueur touche l'ennemi latéralement
            else if (enemy.isPlayerHit(this.player)) {
                // Prendre des dégâts
                this.player.takeDamage(1);
                
                // Effet sonore (à implémenter)
                // this.playSoundEffect('hurt');
            }
        }
    }

    isColliding(objA, objB) {
        const boundsA = objA.sprite.getBounds();
        const boundsB = objB.sprite.getBounds();
        
        return (
            boundsA.x + boundsA.width > boundsB.x &&
            boundsA.x < boundsB.x + boundsB.width &&
            boundsA.y + boundsA.height > boundsB.y &&
            boundsA.y < boundsB.y + boundsB.height
        );
    }
    
    completeLevel() {
        // Afficher un message de niveau terminé
        this.ui.showLevelCompleteMessage();
        
        // Charger le niveau suivant ou terminer le jeu
        if (!this.level.loadNextLevel()) {
            // Si c'était le dernier niveau, terminer le jeu
            this.gameComplete();
        }
    }
    
    gameComplete() {
        // Afficher un message de fin de jeu réussie
        this.ui.showMessage('Félicitations! Vous avez terminé le jeu!', 5000);
        
        // Remettre au premier niveau après un délai
        setTimeout(() => {
            this.level.loadLevel(0);
        }, 5000);
    }
    
    gameOver() {
        // Mettre le jeu en état "game over"
        this.isGameOver = true;
        
        // Afficher l'écran de game over
        this.ui.showGameOverMessage();
        
        // Effet sonore (à implémenter)
        // this.playSoundEffect('gameOver');
    }
    
    restart() {
        // Réinitialiser l'état du jeu
        this.isGameOver = false;
        this.score = 0;
        
        // Masquer le message de game over
        this.ui.hideGameOverMessage();
        
        // Recharger le premier niveau
        this.level.loadLevel(0);
        
        // Réinitialiser le joueur
        this.player.health = this.player.maxHealth;
        this.ui.updateHealthDisplay();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.ui.showMessage('Jeu en pause', 999999);
        } else {
            // Effacer le message de pause
            this.ui.messageText.text = '';
        }
    }
    
    resetPlayerPosition(x, y) {
        // Positionner le joueur à un endroit spécifique
        this.player.setPosition(x, y);
    }
    
    // Assurer que tous les éléments sont visibles
    organizeGameElements() {
        console.log("Réorganisation des éléments du jeu pour visibilité optimale");
        
        // S'assurer que les cœurs de santé sont au premier plan
        if (this.ui && this.ui.healthIcons.length > 0) {
            this.ui.healthIcons.forEach(icon => {
                this.ui.container.removeChild(icon);
                this.ui.container.addChild(icon); // Remettre au premier plan
            });
        }
        
        // S'assurer que les collectibles sont visibles
        this.collectibles.forEach((collectible, index) => {
            // Ajuster la position y pour éviter le chevauchement
            collectible.sprite.y = Math.max(100, collectible.sprite.y);
            
            // Mettre à jour l'animation (plus besoin de réajuster l'échelle)
            collectible.update(0);
            
            console.log(`Collectible ${index+1} repositionné à ${collectible.sprite.x}, ${collectible.sprite.y}`);
        });
        
        // S'assurer que les power-ups sont visibles
        this.powerUps.forEach((powerUp, index) => {
            // Ajuster la position y pour éviter le chevauchement
            powerUp.sprite.y = Math.max(150, powerUp.sprite.y);
            
            // Réajuster la taille si nécessaire
            powerUp.sprite.scale.set(1.5); // Agrandir
            
            console.log(`PowerUp ${index+1} repositionné à ${powerUp.sprite.x}, ${powerUp.sprite.y}`);
        });
        
        // S'assurer que les ennemis sont visibles
        this.enemies.forEach((enemy, index) => {
            // Ajuster la position y pour éviter le chevauchement
            enemy.sprite.y = Math.max(200, enemy.sprite.y);
            
            // Mise à jour de l'ennemi (plus besoin de réajuster l'échelle)
            enemy.update();
            
            console.log(`Ennemi ${index+1} repositionné à ${enemy.sprite.x}, ${enemy.sprite.y}`);
        });
    }

    // Forcer tous les éléments importants au premier plan
    forceInFrontElements() {
        console.log("Mise au premier plan forcée de tous les éléments");
        
        // D'abord supprimez tous les éléments du container
        this.collectibles.forEach(collectible => {
            if (collectible.sprite && collectible.sprite.parent) {
                collectible.sprite.parent.removeChild(collectible.sprite);
            }
        });
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.sprite && powerUp.sprite.parent) {
                powerUp.sprite.parent.removeChild(powerUp.sprite);
            }
        });
        
        this.enemies.forEach(enemy => {
            if (enemy.sprite && enemy.sprite.parent) {
                enemy.sprite.parent.removeChild(enemy.sprite);
            }
        });
        
        // Ensuite les collectibles
        this.collectibles.forEach(collectible => {
            this.container.addChild(collectible.sprite);
            // L'échelle est déjà gérée par la classe Collectible
            collectible.sprite.alpha = 1;
            console.log(`Collectible repositionné et mis au premier plan à ${collectible.sprite.x}, ${collectible.sprite.y}`);
        });
        
        // Les power-ups
        this.powerUps.forEach(powerUp => {
            this.container.addChild(powerUp.sprite);
            // Augmenter la taille et l'opacité
            powerUp.sprite.scale.set(3);
            powerUp.sprite.alpha = 1;
            console.log(`PowerUp repositionné et mis au premier plan à ${powerUp.sprite.x}, ${powerUp.sprite.y}`);
        });
        
        // Les ennemis en dernier pour qu'ils soient bien visibles
        this.enemies.forEach((enemy, index) => {
            this.container.addChild(enemy.sprite);
            // L'échelle est déjà gérée par la classe Enemy
            enemy.sprite.alpha = 1;
            
            // Mise à jour de l'ennemi avec une valeur delta
            enemy.update(1);
            
            console.log(`Ennemi ${index+1} repositionné à ${enemy.sprite.x}, ${enemy.sprite.y}`);
        });
        
        // Rafraîchir l'affichage pour être sûr
        this.app.renderer.render(this.app.stage);
    }
} 