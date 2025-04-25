import * as PIXI from 'pixi.js';
import { Platform } from '../entities/platform';
import { Collectible } from '../entities/collectible';
import { Enemy } from '../entities/enemy';
import { PowerUp } from '../entities/powerup';
import { FlyingEnemy } from '../entities/flyingEnemy';
import { ShootingEnemy } from '../entities/shootingEnemy';
import { MovingPlatform } from '../entities/movingPlatform';
import { DisappearingPlatform } from '../entities/disappearingPlatform';

export class Level {
    game: any;
    levelData: any;
    container: PIXI.Container;
    currentLevel: number;
    requiredCoins: number;
    levels: any[];
    theme: string;
    
    constructor(game, levelData) {
        this.game = game;
        this.levelData = levelData;
        this.container = new PIXI.Container();
        
        // Niveau actuel
        this.currentLevel = 0;
        
        // Nombre de pièces à collecter pour terminer le niveau
        this.requiredCoins = 0;
        
        // Thème visuel du niveau
        this.theme = 'standard';
        
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
                theme: "standard",
                platforms: [
                    { x: 0, y: this.game.height - 32, width: this.game.width, height: 32 }, // Sol
                    { x: 100 * scaleX, y: this.game.height - 150, width: 200 * scaleX },
                    { x: 400 * scaleX, y: this.game.height - 250, width: 150 * scaleX },
                    { x: 200 * scaleX, y: this.game.height - 350, width: 100 * scaleX },
                    { x: 500 * scaleX, y: this.game.height - 450, width: 180 * scaleX }
                ],
                movingPlatforms: [
                    { 
                        x: 300 * scaleX, 
                        y: this.game.height - 200, 
                        width: 120 * scaleX, 
                        options: { 
                            moveHorizontal: true, 
                            distance: 100 * scaleX,
                            speed: 1
                        } 
                    }
                ],
                disappearingPlatforms: [
                    { x: 650 * scaleX, y: this.game.height - 150, width: 100 * scaleX }
                ],
                collectibles: [
                    { x: 150 * scaleX, y: this.game.height - 200 },
                    { x: 450 * scaleX, y: this.game.height - 300 },
                    { x: 250 * scaleX, y: this.game.height - 400 },
                    { x: 550 * scaleX, y: this.game.height - 500 },
                    { x: 650 * scaleX, y: this.game.height - 200 }
                ],
                powerUps: [
                    { x: 300 * scaleX, y: this.game.height - 200, type: 'doubleJump' }
                ],
                enemies: [
                    { x: 300 * scaleX, y: this.game.height - 500, pathWidth: 100 * scaleX, speed: 1 }
                ],
                flyingEnemies: [
                    { x: 400 * scaleX, y: this.game.height - 400, boundaryLeft: 350 * scaleX, boundaryRight: 600 * scaleX }
                ],
                shootingEnemies: [],
                playerStart: { x: 50 * scaleX, y: this.game.height - 150 }
            },
            {
                name: "Niveau 2 - Glace",
                theme: "ice",
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
                movingPlatforms: [
                    { 
                        x: 500 * scaleX, 
                        y: this.game.height - 400, 
                        width: 80 * scaleX, 
                        options: { 
                            moveVertical: true, 
                            distance: 80 * scaleY,
                            speed: 1.5
                        } 
                    }
                ],
                disappearingPlatforms: [
                    { x: 550 * scaleX, y: this.game.height - 150, width: 80 * scaleX }
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
                    { x: 300 * scaleX, y: this.game.height - 100, pathWidth: 150 * scaleX, speed: 1.5 }
                ],
                flyingEnemies: [
                    { x: 400 * scaleX, y: this.game.height - 300, boundaryLeft: 250 * scaleX, boundaryRight: 550 * scaleX }
                ],
                shootingEnemies: [
                    { x: 500 * scaleX, y: this.game.height - 250 }
                ],
                playerStart: { x: 50 * scaleX, y: this.game.height - 100 }
            },
            {
                name: "Niveau 3 - Lave",
                theme: "lava",
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
                movingPlatforms: [
                    { 
                        x: 350 * scaleX, 
                        y: this.game.height - 250, 
                        width: 60 * scaleX, 
                        options: { 
                            moveHorizontal: true, 
                            moveVertical: true,
                            distance: 100 * scaleX,
                            speed: 2
                        } 
                    }
                ],
                disappearingPlatforms: [
                    { x: 250 * scaleX, y: this.game.height - 250, width: 60 * scaleX },
                    { x: 550 * scaleX, y: this.game.height - 350, width: 60 * scaleX }
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
                    { x: 350 * scaleX, y: this.game.height - 150, pathWidth: 100 * scaleX, speed: 2 }
                ],
                flyingEnemies: [
                    { x: 400 * scaleX, y: this.game.height - 300, boundaryLeft: 300 * scaleX, boundaryRight: 500 * scaleX },
                    { x: 200 * scaleX, y: this.game.height - 450, boundaryLeft: 100 * scaleX, boundaryRight: 400 * scaleX }
                ],
                shootingEnemies: [
                    { x: 500 * scaleX, y: this.game.height - 200 },
                    { x: 350 * scaleX, y: this.game.height - 350 }
                ],
                playerStart: { x: 50 * scaleX, y: this.game.height - 100 }
            },
            {
                name: "Niveau 4 - Forêt",
                theme: "forest",
                platforms: [
                    { x: 0, y: this.game.height - 32, width: this.game.width, height: 32 }, // Sol
                    { x: 100 * scaleX, y: this.game.height - 120, width: 100 * scaleX },
                    { x: 300 * scaleX, y: this.game.height - 180, width: 100 * scaleX },
                    { x: 500 * scaleX, y: this.game.height - 240, width: 100 * scaleX },
                    { x: 650 * scaleX, y: this.game.height - 300, width: 100 * scaleX },
                    { x: 500 * scaleX, y: this.game.height - 360, width: 100 * scaleX },
                    { x: 300 * scaleX, y: this.game.height - 420, width: 100 * scaleX },
                    { x: 100 * scaleX, y: this.game.height - 480, width: 100 * scaleX }
                ],
                movingPlatforms: [
                    { 
                        x: 400 * scaleX, 
                        y: this.game.height - 300, 
                        width: 80 * scaleX, 
                        options: { 
                            moveHorizontal: true, 
                            distance: 150 * scaleX,
                            speed: 1.8
                        } 
                    },
                    { 
                        x: 200 * scaleX, 
                        y: this.game.height - 400, 
                        width: 60 * scaleX, 
                        options: { 
                            moveVertical: true, 
                            distance: 80 * scaleY,
                            speed: 1.5
                        } 
                    }
                ],
                disappearingPlatforms: [
                    { x: 200 * scaleX, y: this.game.height - 180, width: 80 * scaleX },
                    { x: 400 * scaleX, y: this.game.height - 240, width: 80 * scaleX },
                    { x: 600 * scaleX, y: this.game.height - 360, width: 80 * scaleX }
                ],
                collectibles: [
                    { x: 100 * scaleX, y: this.game.height - 160 },
                    { x: 200 * scaleX, y: this.game.height - 220 },
                    { x: 300 * scaleX, y: this.game.height - 220 },
                    { x: 400 * scaleX, y: this.game.height - 280 },
                    { x: 500 * scaleX, y: this.game.height - 280 },
                    { x: 650 * scaleX, y: this.game.height - 340 },
                    { x: 500 * scaleX, y: this.game.height - 400 },
                    { x: 300 * scaleX, y: this.game.height - 460 },
                    { x: 200 * scaleX, y: this.game.height - 460 },
                    { x: 100 * scaleX, y: this.game.height - 520 }
                ],
                powerUps: [
                    { x: 100 * scaleX, y: this.game.height - 520, type: 'doubleJump' },
                    { x: 650 * scaleX, y: this.game.height - 340, type: 'invincibility' }
                ],
                enemies: [
                    { x: 150 * scaleX, y: this.game.height - 120, pathWidth: 80 * scaleX, speed: 1 },
                    { x: 350 * scaleX, y: this.game.height - 180, pathWidth: 80 * scaleX, speed: 1.2 },
                    { x: 550 * scaleX, y: this.game.height - 240, pathWidth: 80 * scaleX, speed: 1.5 }
                ],
                flyingEnemies: [
                    { x: 400 * scaleX, y: this.game.height - 350, boundaryLeft: 300 * scaleX, boundaryRight: 600 * scaleX },
                    { x: 250 * scaleX, y: this.game.height - 450, boundaryLeft: 100 * scaleX, boundaryRight: 300 * scaleX }
                ],
                shootingEnemies: [
                    { x: 700 * scaleX, y: this.game.height - 300 },
                    { x: 150 * scaleX, y: this.game.height - 480 }
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
    
    // Appliquer un thème visuel au niveau
    applyTheme(theme) {
        this.theme = theme;
        
        // Modifier la couleur de fond selon le thème
        let backgroundColor;
        
        switch (theme) {
            case 'ice':
                backgroundColor = 0xADD8E6; // Bleu clair
                break;
            case 'lava':
                backgroundColor = 0xFF6347; // Rouge-orange
                break;
            case 'forest':
                backgroundColor = 0x228B22; // Vert forêt
                break;
            case 'standard':
            default:
                backgroundColor = 0x87CEEB; // Bleu ciel
                break;
        }
        
        // Mettre à jour la couleur de fond
        this.game.app.renderer.backgroundColor = backgroundColor;
    }
    
    // Charger un niveau spécifique
    loadLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            // Nettoyer le niveau actuel
            this.clear();
            
            // Mettre à jour l'index du niveau courant
            this.currentLevel = levelIndex;
            
            const levelData = this.levels[levelIndex];
            
            // Appliquer le thème du niveau
            this.applyTheme(levelData.theme || 'standard');
            
            // Créer les plateformes
            this.createPlatforms(levelData.platforms);
            
            // Créer les plateformes mobiles
            if (levelData.movingPlatforms) {
                this.createMovingPlatforms(levelData.movingPlatforms);
            }
            
            // Créer les plateformes disparaissantes
            if (levelData.disappearingPlatforms) {
                this.createDisappearingPlatforms(levelData.disappearingPlatforms);
            }
            
            // Créer les collectibles
            this.createCollectibles(levelData.collectibles);
            
            // Créer les power-ups
            this.createPowerUps(levelData.powerUps);
            
            // Créer les ennemis normaux
            this.createEnemies(levelData.enemies);
            
            // Créer les ennemis volants
            if (levelData.flyingEnemies) {
                this.createFlyingEnemies(levelData.flyingEnemies);
            }
            
            // Créer les ennemis tireurs
            if (levelData.shootingEnemies) {
                this.createShootingEnemies(levelData.shootingEnemies);
            }
            
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
            if (platform.sprite.parent) {
                platform.sprite.parent.removeChild(platform.sprite);
            }
        });
        this.game.platforms = [];
        
        // Supprimer toutes les plateformes mobiles
        this.game.movingPlatforms.forEach(platform => {
            if (platform.sprite.parent) {
                platform.sprite.parent.removeChild(platform.sprite);
            }
        });
        this.game.movingPlatforms = [];
        
        // Supprimer toutes les plateformes disparaissantes
        this.game.disappearingPlatforms.forEach(platform => {
            if (platform.sprite.parent) {
                platform.sprite.parent.removeChild(platform.sprite);
            }
        });
        this.game.disappearingPlatforms = [];
        
        // Supprimer tous les collectibles
        this.game.collectibles.forEach(collectible => {
            if (collectible.sprite.parent) {
                collectible.sprite.parent.removeChild(collectible.sprite);
            }
        });
        this.game.collectibles = [];
        
        // Supprimer tous les power-ups
        this.game.powerUps.forEach(powerUp => {
            if (powerUp.sprite.parent) {
                powerUp.sprite.parent.removeChild(powerUp.sprite);
            }
        });
        this.game.powerUps = [];
        
        // Supprimer tous les ennemis normaux
        this.game.enemies.forEach(enemy => {
            if (enemy.sprite.parent) {
                enemy.sprite.parent.removeChild(enemy.sprite);
            }
        });
        this.game.enemies = [];
        
        // Supprimer tous les ennemis volants
        this.game.flyingEnemies.forEach(enemy => {
            if (enemy.sprite.parent) {
                enemy.sprite.parent.removeChild(enemy.sprite);
            }
        });
        this.game.flyingEnemies = [];
        
        // Supprimer tous les ennemis tireurs et leurs projectiles
        this.game.shootingEnemies.forEach(enemy => {
            enemy.projectiles.forEach(projectile => {
                if (projectile.sprite.parent) {
                    projectile.sprite.parent.removeChild(projectile.sprite);
                }
            });
            if (enemy.sprite.parent) {
                enemy.sprite.parent.removeChild(enemy.sprite);
            }
        });
        this.game.shootingEnemies = [];
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
    
    // Créer les plateformes mobiles pour un niveau
    createMovingPlatforms(platformsData) {
        console.log(`Création de ${platformsData.length} plateformes mobiles`);
        
        platformsData.forEach((data, index) => {
            const platform = new MovingPlatform(
                this.game, 
                data.x, 
                data.y, 
                data.width, 
                data.height || 20, 
                data.options || {}
            );
            this.game.movingPlatforms.push(platform);
            this.game.container.addChild(platform.sprite);
            console.log(`Plateforme mobile ${index+1} créée à la position ${data.x}, ${data.y}`);
        });
    }
    
    // Créer les plateformes disparaissantes pour un niveau
    createDisappearingPlatforms(platformsData) {
        console.log(`Création de ${platformsData.length} plateformes disparaissantes`);
        
        platformsData.forEach((data, index) => {
            const platform = new DisappearingPlatform(
                this.game, 
                data.x, 
                data.y, 
                data.width, 
                data.height || 20, 
                data.options || {}
            );
            this.game.disappearingPlatforms.push(platform);
            this.game.container.addChild(platform.sprite);
            console.log(`Plateforme disparaissante ${index+1} créée à la position ${data.x}, ${data.y}`);
        });
    }
    
    // Créer les ennemis volants pour un niveau
    createFlyingEnemies(enemiesData) {
        console.log(`Création de ${enemiesData.length} ennemis volants`);
        
        enemiesData.forEach((data, index) => {
            const enemy = new FlyingEnemy(
                this.game, 
                data.x, 
                data.y, 
                data.boundaryLeft, 
                data.boundaryRight
            );
            this.game.flyingEnemies.push(enemy);
            this.game.container.addChild(enemy.sprite);
            console.log(`Ennemi volant ${index+1} créé à la position ${data.x}, ${data.y}`);
        });
    }
    
    // Créer les ennemis tireurs pour un niveau
    createShootingEnemies(enemiesData) {
        console.log(`Création de ${enemiesData.length} ennemis tireurs`);
        
        enemiesData.forEach((data, index) => {
            const enemy = new ShootingEnemy(
                this.game, 
                data.x, 
                data.y
            );
            this.game.shootingEnemies.push(enemy);
            this.game.container.addChild(enemy.sprite);
            console.log(`Ennemi tireur ${index+1} créé à la position ${data.x}, ${data.y}`);
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