import * as PIXI from 'pixi.js';

// Référence à la définition de drawHeart dans game.ts
declare global {
    namespace PIXI {
        interface Graphics {
            drawHeart(x: number, y: number, size: number, color: number, outline?: boolean): PIXI.Graphics;
        }
    }
}

export class UI {
    game: any;
    container: PIXI.Container;
    scoreText: PIXI.Text;
    levelText: PIXI.Text;
    healthIcons: PIXI.Graphics[];
    instructionsText: PIXI.Text;
    messageText: PIXI.Text;
    gameOverElements: PIXI.Text[] | null;
    
    constructor(game) {
        this.game = game;
        
        // Création du conteneur d'UI
        this.container = new PIXI.Container();
        this.game.app.stage.addChild(this.container);
        
        // Texte de score
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 4
        });
        this.scoreText = new PIXI.Text('Score: 0', scoreStyle);
        
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        
        this.container.addChild(this.scoreText);
        
        // Texte de niveau
        const levelStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 4
        });
        this.levelText = new PIXI.Text('Niveau: 1', levelStyle);
        
        this.levelText.x = this.game.width - 150;
        this.levelText.y = 20;
        
        this.container.addChild(this.levelText);
        
        // Création des icônes de vie
        this.healthIcons = [];
        // On créera l'affichage de santé une fois que le joueur sera disponible
        
        // Instructions
        const instructionsStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 2
        });
        this.instructionsText = new PIXI.Text('Flèches/WASD pour bouger, Flèche haut/W/Espace pour sauter', instructionsStyle);
        
        this.instructionsText.x = 20;
        this.instructionsText.y = this.game.height - 40;
        
        this.container.addChild(this.instructionsText);
        
        // Message (pour afficher les notifications de power-up, etc.)
        const messageStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFF00,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 3
        });
        this.messageText = new PIXI.Text('', messageStyle);
        
        this.messageText.x = this.game.width / 2;
        this.messageText.y = 70;
        this.messageText.anchor.set(0.5, 0);
        
        this.container.addChild(this.messageText);
    }
    
    update() {
        // Mise à jour du score
        this.scoreText.text = `Score: ${this.game.score}`;
        
        // Créer l'affichage de santé si nécessaire
        if (this.game.player && this.healthIcons.length === 0) {
            this.createHealthDisplay();
        }
    }
    
    createHealthDisplay() {
        // Supprimer les icônes de santé existantes
        this.healthIcons.forEach(icon => {
            this.container.removeChild(icon);
        });
        this.healthIcons = [];

        // Vérifier si le joueur existe
        if (!this.game.player) {
            console.log("Impossible de créer l'affichage de santé: le joueur n'est pas encore créé");
            return;
        }

        const maxHealth = this.game.player.maxHealth;
        const currentHealth = this.game.player.health;
        const heartSize = 40; // Cœurs plus grands
        const spacing = 10;
        
        console.log(`Création de ${maxHealth} cœurs, santé actuelle: ${currentHealth}`);
        
        for (let i = 0; i < maxHealth; i++) {
            const heart = new PIXI.Graphics();
            
            // Dessiner un cœur plein (rouge) ou vide (contour rouge)
            if (i < currentHealth) {
                // Cœur plein
                heart.beginFill(0xFF0000);
                heart.lineStyle(2, 0x800000);
            } else {
                // Cœur vide
                heart.beginFill(0, 0); // Transparent
                heart.lineStyle(2, 0xFF0000);
            }
            
            // Dessiner la forme du cœur
            const x = 0, y = 0;
            heart.moveTo(x, y + heartSize / 4);
            
            // Côté gauche du cœur
            heart.bezierCurveTo(
                x - heartSize / 2, y - heartSize / 2,
                x - heartSize, y + heartSize / 4,
                x, y + heartSize
            );
            
            // Côté droit du cœur
            heart.bezierCurveTo(
                x + heartSize, y + heartSize / 4,
                x + heartSize / 2, y - heartSize / 2,
                x, y + heartSize / 4
            );
            
            heart.endFill();
            
            // Position en haut à droite de l'écran, plus visible
            heart.x = this.game.width - (heartSize + spacing) * (i + 1);
            heart.y = spacing * 3;
            
            this.healthIcons.push(heart);
            this.container.addChild(heart);
            console.log(`Cœur ${i+1} créé à la position ${heart.x}, ${heart.y}`);
        }
    }
    
    updateHealthDisplay() {
        // Si les icônes de santé n'existent pas encore, les créer
        if (this.healthIcons.length === 0) {
            this.createHealthDisplay();
            return;
        }
        
        // Mettre à jour la couleur des cœurs
        for (let i = 0; i < this.healthIcons.length; i++) {
            const icon = this.healthIcons[i];
            
            // Supprimer le contenu précédent
            icon.clear();
            
            // Dessiner un cœur plein ou vide en fonction de la santé actuelle
            if (i < this.game.player.health) {
                // Cœur plein (rouge)
                this.drawHeartShape(icon, 0, 0, 15, 0xFF0000);
            } else {
                // Cœur vide (contour rouge)
                this.drawHeartShape(icon, 0, 0, 15, 0xFF0000, true);
            }
        }
    }
    
    // Méthode auxiliaire pour dessiner un cœur sans utiliser l'extension drawHeart
    private drawHeartShape(graphics: PIXI.Graphics, x: number, y: number, size: number, color: number, outline = false) {
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
    }
    
    updateLevelDisplay() {
        // Mettre à jour le texte du niveau
        this.levelText.text = `Niveau: ${this.game.level.currentLevel + 1}`;
    }
    
    showMessage(text, duration = 3000) {
        // Afficher un message temporaire
        this.messageText.text = text;
        
        // Effacer après un délai
        setTimeout(() => {
            this.messageText.text = '';
        }, duration);
    }
    
    showPowerUpMessage(type) {
        // Afficher un message pour le power-up collecté
        const messages = {
            doubleJump: 'Double Saut activé!',
            speed: 'Vitesse augmentée!',
            invincibility: 'Invincibilité temporaire!',
            healthBoost: '+1 Point de vie!'
        };
        
        this.showMessage(messages[type] || 'Power-up collecté!');
    }
    
    showLevelCompleteMessage() {
        // Afficher un message de niveau terminé
        this.showMessage('Niveau terminé!', 2000);
    }
    
    showGameOverMessage() {
        // Afficher un message de fin de jeu
        const gameOverStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFF0000,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 6
        });
        const gameOverText = new PIXI.Text('Game Over', gameOverStyle);
        
        gameOverText.x = this.game.width / 2;
        gameOverText.y = this.game.height / 2;
        gameOverText.anchor.set(0.5);
        
        this.container.addChild(gameOverText);
        
        // Message de redémarrage
        const restartStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 4
        });
        const restartText = new PIXI.Text('Appuyez sur Espace pour recommencer', restartStyle);
        
        restartText.x = this.game.width / 2;
        restartText.y = this.game.height / 2 + 60;
        restartText.anchor.set(0.5);
        
        this.container.addChild(restartText);
        
        // Référence pour pouvoir les supprimer plus tard
        this.gameOverElements = [gameOverText, restartText];
    }
    
    hideGameOverMessage() {
        // Supprimer les éléments de game over
        if (this.gameOverElements) {
            this.gameOverElements.forEach(element => {
                this.container.removeChild(element);
            });
            this.gameOverElements = null;
        }
    }
    
    showInstructions() {
        // Afficher les instructions de jeu
        this.showMessage('Utilisez les flèches ou WASD pour vous déplacer, Flèche haut/W/Espace pour sauter', 5000);
    }
    
    updatePositions() {
        // Mettre à jour la position du texte de score
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        
        // Mettre à jour la position du texte de niveau
        this.levelText.x = this.game.width - 150;
        this.levelText.y = 20;
        
        // Mettre à jour la position des instructions
        this.instructionsText.x = 20;
        this.instructionsText.y = this.game.height - 40;
        
        // Mettre à jour la position du message
        this.messageText.x = this.game.width / 2;
        this.messageText.y = 70;
        
        console.log("Mise à jour des positions UI");
        console.log("Joueur santé:", this.game.player ? this.game.player.health : "non disponible");
        console.log("Icônes santé:", this.healthIcons.length);
        
        // Forcer la création de l'affichage de santé
        if (this.game.player) {
            this.createHealthDisplay();
        }
    }
} 