import * as PIXI from 'pixi.js';
import { Player } from '../entities/player';
import { Platform } from '../entities/platform';
import { Collectible } from '../entities/collectible';
import { Enemy } from '../entities/enemy';
import { PowerUp } from '../entities/powerup';
import { UI } from '../ui/ui';
import { Level } from './level';
import { MainMenu } from '../ui/mainMenu';
import { ScoreManager } from './scoreManager';
import { ParticleSystem } from '../effects/particleSystem';
import { FlyingEnemy } from '../entities/flyingEnemy';
import { ShootingEnemy } from '../entities/shootingEnemy';
import { MovingPlatform } from '../entities/movingPlatform';
import { DisappearingPlatform } from '../entities/disappearingPlatform';

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
    mainMenu: MainMenu;
    gameState: string; // 'menu', 'playing', 'paused', 'gameOver'
    scoreManager: ScoreManager;
    particles: ParticleSystem;
    flyingEnemies: FlyingEnemy[];
    shootingEnemies: ShootingEnemy[];
    movingPlatforms: MovingPlatform[];
    disappearingPlatforms: DisappearingPlatform[];
    gameScene: PIXI.Container;
    isGameStarted: boolean;

    constructor() {
        // Configuration du jeu
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.gravity = 0.5;
        this.score = 0;
        
        // État du jeu
        this.isGameOver = false;
        this.isPaused = false;
        this.gameState = 'menu';
        
        // Stockage des textures
        this.textures = {};
        
        // Collections d'objets de jeu
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.powerUps = [];
        this.flyingEnemies = [];
        this.shootingEnemies = [];
        this.movingPlatforms = [];
        this.disappearingPlatforms = [];
        
        // Gestion du redimensionnement
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Créer l'application PIXI
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        
        // Ajouter le canvas au DOM
        document.body.appendChild(this.app.view);
        
        // Créer la scène de jeu
        this.gameScene = new PIXI.Container();
        this.app.stage.addChild(this.gameScene);
        
        // Initialiser le menu principal
        this.mainMenu = new MainMenu(this);
        this.app.stage.addChild(this.mainMenu.container);
        
        // État initial du jeu
        this.isGameStarted = false;
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
            
            // Mettre à jour le menu principal
            if (this.mainMenu) {
                this.mainMenu.handleResize();
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
        // Initialiser l'application PIXI (déjà fait dans le constructeur)
        // NE PAS cacher le menu principal - on le laisse visible
        // this.mainMenu.hide(); <-- Commenté pour garder le menu visible
        
        // Initialiser les textures de secours
        this.createFallbackTextures();
        
        // Étendre les graphiques avec des méthodes personnalisées
        this.extendGraphics();
        
        // Charger les assets
        await this.loadAssets();
        
        // Initialiser le système de particules
        this.particles = new ParticleSystem(this);
        
        // Initialiser le gestionnaire de scores
        this.scoreManager = new ScoreManager(this);
        
        // Configurer les événements clavier
        this.setupKeyboardEvents();
        
        console.log("Menu principal initialisé et visible");
        
        // Commencer le game loop mais ne pas démarrer le jeu directement
        this.app.ticker.add(this.gameLoop.bind(this));
    }

    async loadAssets() {
        try {
            // Définition des assets à charger
            const assetMap = {
                bunny: 'public/assets/images/bunny.svg',
                platform: 'public/assets/images/platform.svg',
                coin: 'public/assets/images/coin.svg',
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
        
        // Vérifier que le container existe avant d'y ajouter le joueur
        if (!this.container) {
            console.error("Container principal non défini, initialisation...");
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
        }
        
        this.container.addChild(this.player.sprite);
        console.log("Joueur créé et ajouté au container principal");
    }

    setupKeyboardEvents() {
        // Gestion des touches du clavier
        const keys = {};
        
        console.log("Configuration des événements clavier");

        const handleKeyDown = (e) => {
            // Log pour déboguer
            console.log("Touche enfoncée:", e.code);
            
            // Gestion de la touche échap pour le menu principal
            if (e.code === 'Escape') {
                if (this.gameState === 'playing') {
                    this.togglePause();
                } else if (this.gameState === 'paused') {
                    this.togglePause();
                }
                return;
            }
            
            // Ignorer les événements si le jeu est en pause ou terminé
            if (this.isPaused || this.isGameOver) {
                // Permettre de redémarrer avec espace si game over
                if (this.isGameOver && (e.code === 'Space' || e.code === 'Enter')) {
                    this.restart();
                }
                return;
            }
            
            // Si on est dans le menu, ignorer les contrôles du jeu
            if (this.gameState === 'menu') {
                return;
            }
            
            keys[e.code] = true;
            
            // S'assurer que le joueur existe avant d'appeler ses méthodes
            if (this.player) {
                this.player.handleKeyDown(keys);
            }
            
            // Gestion de la pause avec la touche 'P'
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        };

        const handleKeyUp = (e) => {
            keys[e.code] = false;
            
            // Même si le jeu est en pause, on veut quand même suivre 
            // les touches relâchées pour éviter des comportements bizarres
            if (this.gameState === 'playing' && !this.isPaused && !this.isGameOver && this.player) {
                this.player.handleKeyUp(keys);
            }
        };

        // Supprimer les anciens écouteurs avant d'en ajouter de nouveaux
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        
        // Ajouter les nouveaux écouteurs
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Stocker les références pour pouvoir les supprimer plus tard si nécessaire
        this._keyDownHandler = handleKeyDown;
        this._keyUpHandler = handleKeyUp;
    }

    gameLoop(delta) {
        // Ajouter un log pour déboguer
        if (this.player && this.player.velocityX !== 0) {
            console.log("Mouvement joueur:", this.player.velocityX, this.player.velocityY);
        }
        
        // Si le jeu n'est pas démarré, ne rien faire
        if (!this.isGameStarted) {
            return;
        }
        
        // Gérer les différents états du jeu
        if (this.gameState === 'menu') {
            // Rien à faire ici, le menu gère son propre affichage
            return;
        }
        
        // Ne pas mettre à jour le jeu si en pause ou game over
        if (this.isPaused || this.isGameOver) return;
        
        // Mise à jour du joueur
        if (this.player) {
            this.player.update(delta);
        }
        
        // Mise à jour des ennemis
        this.enemies.forEach(enemy => {
            enemy.update(delta);
        });
        
        // Mise à jour des ennemis volants
        this.flyingEnemies.forEach(enemy => {
            enemy.update(delta);
        });
        
        // Mise à jour des ennemis tireurs et vérification des collisions de projectiles
        this.shootingEnemies.forEach(enemy => {
            enemy.update(delta);
            enemy.checkProjectileCollisions();
        });
        
        // Mise à jour des plateformes mobiles
        this.movingPlatforms.forEach(platform => {
            platform.update(delta);
            if (this.player) {
                platform.checkPlayerCollision(this.player, delta);
            }
        });
        
        // Vérification des collisions avec les plateformes disparaissantes
        this.disappearingPlatforms.forEach(platform => {
            platform.update(delta);
            if (this.player) {
                platform.checkPlayerCollision(this.player);
            }
        });
        
        // Vérification des collisions avec les plateformes standard
        if (this.player) {
            for (const platform of this.platforms) {
                platform.checkPlayerCollision(this.player);
            }
        }
        
        // Vérification des collisions avec les collectibles
        this.checkCollectibleCollisions();
        
        // Vérification des collisions avec les power-ups
        this.checkPowerUpCollisions();
        
        // Vérification des collisions avec les ennemis
        this.checkEnemyCollisions();
        
        // Vérification des collisions avec les ennemis volants
        this.checkFlyingEnemyCollisions();
        
        // Vérification des collisions avec les ennemis tireurs
        this.checkShootingEnemyCollisions();
        
        // Vérifier si le niveau est terminé
        if (this.level && this.level.isLevelComplete()) {
            this.completeLevel();
        }

        // Mise à jour de l'interface utilisateur
        if (this.ui) {
            this.ui.update();
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

    checkFlyingEnemyCollisions() {
        for (let i = this.flyingEnemies.length - 1; i >= 0; i--) {
            const enemy = this.flyingEnemies[i];
            
            // Si le joueur saute sur l'ennemi
            if (enemy.isPlayerAbove(this.player)) {
                // Éliminer l'ennemi en utilisant la méthode destroy()
                enemy.destroy();
                
                // Rebondir légèrement
                this.player.velocityY = -8;
                
                // Ajouter des points
                this.score += 8;
                
                // Effet de particules
                this.particles.createExplosion(enemy.sprite.x, enemy.sprite.y);
            }
            // Si le joueur touche l'ennemi latéralement
            else if (enemy.isPlayerHit(this.player)) {
                // Prendre des dégâts
                this.player.takeDamage(1);
                
                // Effet de particules
                this.particles.createSparks(
                    this.player.sprite.x, 
                    this.player.sprite.y,
                    Math.atan2(this.player.sprite.y - enemy.sprite.y, this.player.sprite.x - enemy.sprite.x)
                );
            }
        }
    }
    
    checkShootingEnemyCollisions() {
        for (let i = this.shootingEnemies.length - 1; i >= 0; i--) {
            const enemy = this.shootingEnemies[i];
            
            // Si le joueur saute sur l'ennemi
            if (enemy.isPlayerAbove(this.player)) {
                // Éliminer l'ennemi en utilisant la méthode destroy()
                enemy.destroy();
                
                // Rebondir légèrement
                this.player.velocityY = -8;
                
                // Ajouter des points
                this.score += 10;
                
                // Effet de particules
                this.particles.createExplosion(enemy.sprite.x, enemy.sprite.y);
            }
            // Si le joueur touche l'ennemi latéralement
            else if (enemy.isPlayerHit(this.player)) {
                // Prendre des dégâts
                this.player.takeDamage(1);
                
                // Effet de particules
                this.particles.createSparks(
                    this.player.sprite.x, 
                    this.player.sprite.y,
                    Math.atan2(this.player.sprite.y - enemy.sprite.y, this.player.sprite.x - enemy.sprite.x)
                );
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
        
        // Effet de particules festif
        this.particles.createLevelCompleteEffect(
            this.width / 2,
            this.height / 2
        );
        
        // Charger le niveau suivant ou terminer le jeu
        if (!this.level.loadNextLevel()) {
            // Si c'était le dernier niveau, terminer le jeu
            this.gameComplete();
        }
    }
    
    gameComplete() {
        // Afficher un message de fin de jeu réussie
        this.ui.showMessage('Félicitations! Vous avez terminé le jeu!', 5000);
        
        // Vérifier si le score est suffisamment élevé pour entrer dans les meilleurs scores
        if (this.scoreManager.isHighScore(this.score)) {
            // Afficher la boîte de dialogue pour entrer le nom
            const inputDialog = this.scoreManager.showNameInputDialog(this.score, this.level.currentLevel);
            this.app.stage.addChild(inputDialog);
        } else {
            // Sinon, afficher juste le tableau des scores
            setTimeout(() => {
                const scoreTable = this.scoreManager.createScoreTable();
                this.app.stage.addChild(scoreTable);
            }, 5000);
        }
    }
    
    gameOver() {
        // Mettre le jeu en état "game over"
        this.isGameOver = true;
        this.gameState = 'gameOver';
        
        // Afficher l'écran de game over
        this.ui.showGameOverMessage();
        
        // Effet de particules pour l'explosion finale
        this.particles.createExplosion(this.player.sprite.x, this.player.sprite.y, {
            count: 50,
            colors: [0xFF0000, 0xFF5500, 0xFF8800],
            sizeStart: 15,
            speed: 5
        });
    }
    
    restart() {
        // Réinitialiser l'état du jeu
        this.isGameOver = false;
        this.gameState = 'playing';
        this.score = 0;
        
        // Masquer le message de game over
        this.ui.hideGameOverMessage();
        
        // Recharger le premier niveau
        this.level.loadLevel(0);
        
        // Réinitialiser le joueur
        this.player.health = this.player.maxHealth;
        this.ui.updateHealthDisplay();
    }
    
    returnToMainMenu() {
        // Nettoyer le niveau actuel
        if (this.level) {
            this.level.clear();
        }
        
        // Supprimer le joueur
        if (this.player && this.player.sprite.parent) {
            this.player.sprite.parent.removeChild(this.player.sprite);
        }
        
        // Supprimer le tableau de scores s'il existe
        const scoreTableContainer = this.app.stage.getChildByName('scoreTableContainer');
        if (scoreTableContainer) {
            this.app.stage.removeChild(scoreTableContainer);
        }
        
        // Réinitialiser l'état du jeu
        this.isGameOver = false;
        this.isPaused = false;
        this.gameState = 'menu';
        this.score = 0;
        
        // Masquer l'UI du jeu
        if (this.ui) {
            this.ui.container.visible = false;
        }
        
        // Afficher le menu principal
        this.mainMenu.show();
    }
    
    togglePause() {
        if (this.gameState !== 'playing' && this.gameState !== 'paused') return;
        
        this.isPaused = !this.isPaused;
        this.gameState = this.isPaused ? 'paused' : 'playing';
        
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

    startGameplay() {
        // Changer l'état du jeu
        this.gameState = 'playing';
        this.isGameRunning = true;
        this.isGameStarted = true; // S'assurer que cette propriété est à true
        this.isPaused = false; // S'assurer que le jeu n'est pas en pause
        
        console.log("Démarrage du gameplay - État:", this.gameState);
        
        // Créer un container principal pour le jeu s'il n'existe pas déjà
        if (!this.container) {
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            console.log("Container principal du jeu créé");
        }
        
        // Créer le joueur
        this.createPlayer();
        
        // Initialiser l'interface utilisateur
        this.ui = new UI(this);
        
        // Initialiser le gestionnaire de niveaux
        this.level = new Level(this, {});
        
        // Configurer les événements clavier
        this.setupKeyboardEvents();
        
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
        
        // Montrer les instructions
        this.ui.showInstructions();
        
        // Positionner correctement le joueur
        if (this.player) {
            // Positionner le joueur en bas à gauche
            this.player.setPosition(100, this.height - 100);
            console.log("Joueur positionné à:", 100, this.height - 100);
        }
        
        // Organiser les éléments pour qu'ils soient tous visibles
        this.organizeGameElements();
    }
} 