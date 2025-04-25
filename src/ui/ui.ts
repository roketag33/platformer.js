import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

// Référence à la définition de drawHeart dans game.ts
declare global {
    namespace PIXI {
        interface Graphics {
            drawHeart(x: number, y: number, size: number, color: number, outline?: boolean): PIXI.Graphics;
        }
    }
}

export class UI {
    game: Game;
    container: PIXI.Container;
    scoreText: PIXI.Text;
    levelText: PIXI.Text;
    healthIcons: PIXI.Container[];
    messageText: PIXI.Text;
    gameOverContainer: PIXI.Container;
    
    constructor(game: Game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.healthIcons = [];
        
        // Ajouter le container de l'UI au stage
        this.game.app.stage.addChild(this.container);
        
        // Créer l'affichage du score
        this.createScoreDisplay();
        
        // Créer l'affichage du niveau
        this.createLevelDisplay();
        
        // Créer l'affichage de la santé
        this.createHealthDisplay();
        
        // Créer la zone de message
        this.createMessageDisplay();
        
        // Créer l'écran de game over (caché par défaut)
        this.createGameOverScreen();
    }
    
    createScoreDisplay() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        this.scoreText = new PIXI.Text(`Score: ${this.game.score}`, style);
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        
        this.container.addChild(this.scoreText);
    }
    
    createLevelDisplay() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        this.levelText = new PIXI.Text('Niveau: 1', style);
        this.levelText.x = this.game.width - 150;
        this.levelText.y = 20;
        
        this.container.addChild(this.levelText);
    }
    
    createHealthDisplay() {
        // Nettoyer les icônes existantes
        this.healthIcons.forEach(icon => {
            if (icon.parent) {
                icon.parent.removeChild(icon);
            }
        });
        this.healthIcons = [];
        
        // Créer une nouvelle icône pour chaque point de vie
        for (let i = 0; i < this.game.player.health; i++) {
            const icon = new PIXI.Container();
            
            // Dessiner un cœur
            const heart = new PIXI.Graphics();
            this.game.drawHeart(heart, 0, 0, 10, 0xFF0000);
            icon.addChild(heart);
            
            // Positionner l'icône
            icon.x = 20 + i * 30;
            icon.y = 60;
            
            this.container.addChild(icon);
            this.healthIcons.push(icon);
        }
    }
    
    createMessageDisplay() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        });
        
        this.messageText = new PIXI.Text('', style);
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.game.width / 2;
        this.messageText.y = this.game.height / 2;
        
        this.container.addChild(this.messageText);
    }
    
    createGameOverScreen() {
        this.gameOverContainer = new PIXI.Container();
        this.gameOverContainer.visible = false;
        
        // Fond semi-transparent
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.7);
        background.drawRect(0, 0, this.game.width, this.game.height);
        background.endFill();
        
        // Texte de Game Over
        const gameOverStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 64,
            fontWeight: 'bold',
            fill: ['#FF0000', '#FFFF00'],
            stroke: '#000000',
            strokeThickness: 6,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6
        });
        
        const gameOverText = new PIXI.Text('GAME OVER', gameOverStyle);
        gameOverText.anchor.set(0.5);
        gameOverText.x = this.game.width / 2;
        gameOverText.y = this.game.height / 3;
        
        // Instructions pour redémarrer
        const instructionStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fill: '#FFFFFF',
            align: 'center'
        });
        
        const instructionText = new PIXI.Text('Appuyez sur ESPACE pour recommencer\nou ESC pour revenir au menu', instructionStyle);
        instructionText.anchor.set(0.5);
        instructionText.x = this.game.width / 2;
        instructionText.y = this.game.height / 2;
        
        // Bouton pour revenir au menu principal
        const menuButton = this.createButton('Menu Principal', this.game.width / 2, this.game.height * 2/3, () => {
            this.game.returnToMainMenu();
        });
        
        // Ajouter tous les éléments au container
        this.gameOverContainer.addChild(background);
        this.gameOverContainer.addChild(gameOverText);
        this.gameOverContainer.addChild(instructionText);
        this.gameOverContainer.addChild(menuButton);
        
        this.container.addChild(this.gameOverContainer);
    }
    
    createButton(text: string, x: number, y: number, callback: () => void): PIXI.Container {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        
        // Créer le fond du bouton
        const background = new PIXI.Graphics();
        background.beginFill(0x0066CC);
        background.lineStyle(4, 0x0033AA);
        background.drawRoundedRect(-100, -25, 200, 50, 15);
        background.endFill();
        
        // Créer le texte du bouton
        const buttonText = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        buttonText.anchor.set(0.5);
        
        // Ajouter les éléments au container
        container.addChild(background);
        container.addChild(buttonText);
        
        // Rendre le bouton interactif
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        // Effets visuels au survol
        container.on('pointerover', () => {
            background.tint = 0x00AAFF;
            container.scale.set(1.05);
        });
        
        container.on('pointerout', () => {
            background.tint = 0xFFFFFF;
            container.scale.set(1.0);
        });
        
        // Déclencher le callback au clic
        container.on('pointerdown', callback);
        
        return container;
    }
    
    update() {
        // Mettre à jour le score
        this.scoreText.text = `Score: ${this.game.score}`;
    }
    
    updateLevelDisplay() {
        // Mettre à jour l'affichage du niveau
        this.levelText.text = `Niveau: ${this.game.level.currentLevel + 1}`;
    }
    
    updateHealthDisplay() {
        // Mettre à jour l'affichage de la santé
        this.createHealthDisplay();
    }
    
    updatePositions() {
        // Mettre à jour la position des éléments UI lors du redimensionnement
        this.levelText.x = this.game.width - 150;
        
        this.messageText.x = this.game.width / 2;
        this.messageText.y = this.game.height / 2;
        
        // Mettre à jour l'écran de game over
        if (this.gameOverContainer) {
            const background = this.gameOverContainer.children[0] as PIXI.Graphics;
            background.clear();
            background.beginFill(0x000000, 0.7);
            background.drawRect(0, 0, this.game.width, this.game.height);
            background.endFill();
            
            const gameOverText = this.gameOverContainer.children[1] as PIXI.Text;
            gameOverText.x = this.game.width / 2;
            gameOverText.y = this.game.height / 3;
            
            const instructionText = this.gameOverContainer.children[2] as PIXI.Text;
            instructionText.x = this.game.width / 2;
            instructionText.y = this.game.height / 2;
            
            const menuButton = this.gameOverContainer.children[3] as PIXI.Container;
            menuButton.x = this.game.width / 2;
            menuButton.y = this.game.height * 2/3;
        }
    }
    
    showMessage(message: string, duration: number = 2000) {
        this.messageText.text = message;
        
        // Effacer le message après la durée spécifiée
        if (duration < 999999) {  // Si la durée est très longue, ne pas effacer (utilisé pour la pause)
            setTimeout(() => {
                this.messageText.text = '';
            }, duration);
        }
    }
    
    showInstructions() {
        this.showMessage('Utilisez les flèches ou WASD pour vous déplacer. Collectez toutes les pièces!', 5000);
    }
    
    showLevelCompleteMessage() {
        this.showMessage(`Niveau ${this.game.level.currentLevel + 1} terminé!`, 3000);
    }
    
    showPowerUpMessage(type: string) {
        let message = '';
        
        switch(type) {
            case 'doubleJump':
                message = 'Double saut activé!';
                break;
                
            case 'speed':
                message = 'Vitesse augmentée!';
                break;
                
            case 'invincibility':
                message = 'Invincibilité!';
                break;
                
            case 'healthBoost':
                message = '+1 Vie!';
                break;
        }
        
        this.showMessage(message, 2000);
    }
    
    showGameOverMessage() {
        this.gameOverContainer.visible = true;
    }
    
    hideGameOverMessage() {
        this.gameOverContainer.visible = false;
    }
} 