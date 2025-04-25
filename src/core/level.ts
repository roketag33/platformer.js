import * as PIXI from 'pixi.js';
import { Platform } from '../entities/platform';
import { Collectible } from '../entities/collectible';
import { Enemy } from '../entities/enemy';
import { PowerUp } from '../entities/powerup';

export class Level {
    game: any;
    levelData: any;
    container: PIXI.Container;
    currentLevel: number;
    requiredCoins: number;
    levels: any[];
    
    constructor(game, levelData) {
        this.game = game;
        this.levelData = levelData;
        this.container = new PIXI.Container();
        
        // Niveau actuel
        this.currentLevel = 0;
        
        // Nombre de pièces à collecter pour terminer le niveau
        this.requiredCoins = 0;
        
        // Définition des niveaux
        this.updateLevelDesigns();
    }
    
    updateLevelDesigns() {
        // Facteurs d'échelle pour adapter les niveaux à la taille de l'écran
        const scaleX = this.game.width / 800;
        const scaleY = this.game.height / 600;
        
        this.levels = [
            {
                name: "Niveau 1 - Débutant",
                platforms: [
                    { x: 0, y: this.game.height - 32, width: this.game.width, height: 32 }, // Sol
                    { x: 100 * scaleX, y: this.game.height - 150, width: 200 * scaleX },
                    { x: 400 * scaleX, y: this.game.height - 250, width: 150 * scaleX },
                    { x: 200 * scaleX, y: this.game.height - 350, width: 100 * scaleX },
                    { x: 500 * scaleX, y: this.game.height - 450, width: 180 * scaleX }
                ],
                collectibles: [
                    { x: 150 * scaleX, y: this.game.height - 200 },
                    { x: 450 * scaleX, y: this.game.height - 300 },
                    { x: 250 * scaleX, y: this.game.height - 400 },
                    { x: 550 * scaleX, y: this.game.height - 500 }
                ],
                powerUps: [
                    { x: 300 * scaleX, y: this.game.height - 200, type: 'doubleJump' }
                ],
                enemies: [
                    { x: 300 * scaleX, y: this.game.height - 500, pathWidth: 100 * scaleX, speed: 1 }
                ],
                playerStart: { x: 50 * scaleX, y: this.game.height - 150 }
            },
            {
                name: "Niveau 2 - Intermédiaire",
                platforms: [
                    { x: 0, y: this.game.height - 32, width: this.game.width, height: 32 }, // Sol
                    { x: 100 * scaleX, y: this.game.height - 100, width: 100 * scaleX },
                    { x: 250 * scaleX, y: this.game.height - 150, width: 100 * scaleX },
                    { x: 400 * scaleX, y: this.game.height - 200, width: 100 * scaleX },
                    { x: 550 * scaleX, y: this.game.height - 250, width: 100 * scaleX },
                    { x: 400 * scaleX, y: this.game.height - 350, width: 100 * scaleX },
                    { x: 250 * scaleX, y: this.game.height - 400, width: 100 * scaleX },
                    { x: 100 * scaleX, y: this.game.height - 450, width: 100 * scaleX }
                ],
                collectibles: [
                    { x: 100 * scaleX, y: this.game.height - 140 },
                    { x: 250 * scaleX, y: this.game.height - 190 },
                    { x: 400 * scaleX, y: this.game.height - 240 },
                    { x: 550 * scaleX, y: this.game.height - 290 },
                    { x: 400 * scaleX, y: this.game.height - 390 },
                    { x: 250 * scaleX, y: this.game.height - 440 },
                    { x: 100 * scaleX, y: this.game.height - 490 }
                ],
                powerUps: [
                    { x: 550 * scaleX, y: this.game.height - 290, type: 'speed' },
                    { x: 100 * scaleX, y: this.game.height - 490, type: 'invincibility' }
                ],
                enemies: [
                    { x: 300 * scaleX, y: this.game.height - 100, pathWidth: 150 * scaleX, speed: 1.5 },
                    { x: 500 * scaleX, y: this.game.height - 250, pathWidth: 100 * scaleX, speed: 2 }
                ],
                playerStart: { x: 50 * scaleX, y: this.game.height - 100 }
            },
            {
                name: "Niveau 3 - Expert",
                platforms: [
                    { x: 0, y: this.game.height - 32, width: this.game.width, height: 32 }, // Sol
                    { x: 150 * scaleX, y: this.game.height - 100, width: 80 * scaleX },
                    { x: 300 * scaleX, y: this.game.height - 150, width: 80 * scaleX },
                    { x: 450 * scaleX, y: this.game.height - 200, width: 80 * scaleX },
                    { x: 600 * scaleX, y: this.game.height - 250, width: 80 * scaleX },
                    { x: 450 * scaleX, y: this.game.height - 300, width: 80 * scaleX },
                    { x: 300 * scaleX, y: this.game.height - 350, width: 80 * scaleX },
                    { x: 150 * scaleX, y: this.game.height - 400, width: 80 * scaleX },
                    { x: 300 * scaleX, y: this.game.height - 450, width: 80 * scaleX },
                    { x: 450 * scaleX, y: this.game.height - 500, width: 80 * scaleX }
                ],
                collectibles: [
                    { x: 150 * scaleX, y: this.game.height - 140 },
                    { x: 300 * scaleX, y: this.game.height - 190 },
                    { x: 450 * scaleX, y: this.game.height - 240 },
                    { x: 600 * scaleX, y: this.game.height - 290 },
                    { x: 450 * scaleX, y: this.game.height - 340 },
                    { x: 300 * scaleX, y: this.game.height - 390 },
                    { x: 150 * scaleX, y: this.game.height - 440 },
                    { x: 300 * scaleX, y: this.game.height - 490 },
                    { x: 450 * scaleX, y: this.game.height - 540 }
                ],
                powerUps: [
                    { x: 150 * scaleX, y: this.game.height - 140, type: 'doubleJump' },
                    { x: 450 * scaleX, y: this.game.height - 340, type: 'speed' },
                    { x: 450 * scaleX, y: this.game.height - 540, type: 'healthBoost' }
                ],
                enemies: [
                    { x: 200 * scaleX, y: this.game.height - 100, pathWidth: 100 * scaleX, speed: 2 },
                    { x: 350 * scaleX, y: this.game.height - 150, pathWidth: 100 * scaleX, speed: 2 },
                    { x: 500 * scaleX, y: this.game.height - 200, pathWidth: 100 * scaleX, speed: 2 },
                    { x: 500 * scaleX, y: this.game.height - 300, pathWidth: 100 * scaleX, speed: 2 },
                    { x: 350 * scaleX, y: this.game.height - 350, pathWidth: 100 * scaleX, speed: 2 },
                    { x: 200 * scaleX, y: this.game.height - 400, pathWidth: 100 * scaleX, speed: 2 }
                ],
                playerStart: { x: 50 * scaleX, y: this.game.height - 100 }
            }
        ];
    }
    
    // Adapter les niveaux lors du redimensionnement
    handleResize() {
        this.updateLevelDesigns();
        
        // Recharger le niveau actuel pour appliquer les changements
        if (this.currentLevel >= 0) {
            this.loadLevel(this.currentLevel);
        }
    }
    
    // Charger un niveau spécifique
    loadLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            // Nettoyer le niveau actuel
            this.clear();
            
            // Mettre à jour l'index du niveau courant
            this.currentLevel = levelIndex;
            
            const levelData = this.levels[levelIndex];
            
            // Créer les plateformes
            this.createPlatforms(levelData.platforms);
            
            // Créer les collectibles
            this.createCollectibles(levelData.collectibles);
            
            // Créer les power-ups
            this.createPowerUps(levelData.powerUps);
            
            // Créer les ennemis
            this.createEnemies(levelData.enemies);
            
            // Positionner le joueur au point de départ
            this.game.resetPlayerPosition(levelData.playerStart.x, levelData.playerStart.y);
            
            // Nombre de pièces à collecter pour terminer le niveau
            this.requiredCoins = levelData.collectibles.length;
            
            // Mettre à jour l'affichage du niveau
            this.game.ui.updateLevelDisplay();
            
            return true;
        }
        return false;
    }
    
    // Charger le niveau suivant
    loadNextLevel() {
        return this.loadLevel(this.currentLevel + 1);
    }
    
    // Nettoyer le niveau actuel
    clear() {
        // Supprimer toutes les plateformes
        this.game.platforms.forEach(platform => {
            this.game.container.removeChild(platform.sprite);
        });
        this.game.platforms = [];
        
        // Supprimer tous les collectibles
        this.game.collectibles.forEach(collectible => {
            this.game.container.removeChild(collectible.sprite);
        });
        this.game.collectibles = [];
        
        // Supprimer tous les power-ups
        this.game.powerUps.forEach(powerUp => {
            this.game.container.removeChild(powerUp.sprite);
        });
        this.game.powerUps = [];
        
        // Supprimer tous les ennemis
        this.game.enemies.forEach(enemy => {
            this.game.container.removeChild(enemy.sprite);
        });
        this.game.enemies = [];
    }
    
    // Créer les plateformes pour un niveau
    createPlatforms(platformsData) {
        platformsData.forEach(data => {
            const platform = new Platform(this.game, data.x, data.y, data.width, data.height || 20);
            this.game.platforms.push(platform);
            this.game.container.addChild(platform.sprite);
        });
    }
    
    // Créer les collectibles pour un niveau
    createCollectibles(collectiblesData) {
        console.log(`Création de ${collectiblesData.length} collectibles`);
        
        collectiblesData.forEach((data, index) => {
            const collectible = new Collectible(this.game, data.x, data.y);
            this.game.collectibles.push(collectible);
            this.game.container.addChild(collectible.sprite);
            console.log(`Collectible ${index+1} créé à la position ${data.x}, ${data.y}`);
        });
    }
    
    // Créer les power-ups pour un niveau
    createPowerUps(powerUpsData) {
        console.log(`Création de ${powerUpsData.length} power-ups`);
        
        powerUpsData.forEach((data, index) => {
            const powerUp = new PowerUp(this.game, data.x, data.y, data.type);
            this.game.powerUps.push(powerUp);
            this.game.container.addChild(powerUp.sprite);
            console.log(`PowerUp ${index+1} (${data.type}) créé à la position ${data.x}, ${data.y}`);
        });
    }
    
    // Créer les ennemis pour un niveau
    createEnemies(enemiesData) {
        console.log(`Création de ${enemiesData.length} ennemis`);
        
        enemiesData.forEach((data, index) => {
            // Calculer les limites de déplacement à partir du centre et de la largeur du chemin
            const boundaryLeft = data.boundaryLeft || data.x - data.pathWidth / 2;
            const boundaryRight = data.boundaryRight || data.x + data.pathWidth / 2;
            
            // Créer l'ennemi avec les limites gauche et droite
            const enemy = new Enemy(this.game, data.x, data.y, boundaryLeft, boundaryRight);
            
            this.game.enemies.push(enemy);
            this.game.container.addChild(enemy.sprite);
            console.log(`Ennemi ${index+1} créé à la position ${data.x}, ${data.y} avec limites ${boundaryLeft}-${boundaryRight}`);
        });
    }
    
    // Vérifier si le niveau est terminé
    isLevelComplete() {
        // Le niveau est terminé quand toutes les pièces sont collectées
        return this.game.collectibles.length === 0;
    }
    
    // Vérifier si tous les niveaux sont terminés
    isGameComplete() {
        return this.currentLevel >= this.levels.length - 1 && this.isLevelComplete();
    }
} 