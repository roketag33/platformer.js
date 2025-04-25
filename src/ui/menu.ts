import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

export class MainMenu {
    game: Game;
    container: PIXI.Container;
    background: PIXI.Sprite;
    title: PIXI.Text;
    startButton: PIXI.Container;
    settingsButton: PIXI.Container;
    creditsButton: PIXI.Container;
    
    constructor(game: Game) {
        this.game = game;
        this.container = new PIXI.Container();
        
        // Ajouter le container au stage
        this.game.app.stage.addChild(this.container);
        
        // Créer l'arrière-plan
        this.createBackground();
        
        // Créer le titre du jeu
        this.createTitle();
        
        // Créer les boutons
        this.createButtons();
        
        // Par défaut, le menu est visible
        this.show();
    }
    
    createBackground() {
        // Créer un dégradé pour l'arrière-plan
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x0000AA);
        graphics.drawRect(0, 0, this.game.width, this.game.height / 2);
        graphics.beginFill(0x00AAFF);
        graphics.drawRect(0, this.game.height / 2, this.game.width, this.game.height / 2);
        graphics.endFill();
        
        // Convertir en texture
        const texture = this.game.app.renderer.generateTexture(graphics);
        this.background = new PIXI.Sprite(texture);
        this.container.addChild(this.background);
        
        // Ajouter des nuages décoratifs
        for (let i = 0; i < 10; i++) {
            const cloud = this.createCloud();
            cloud.x = Math.random() * this.game.width;
            cloud.y = Math.random() * (this.game.height / 2);
            this.container.addChild(cloud);
        }
    }
    
    createCloud() {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 0.8);
        
        // Dessiner une forme de nuage
        const centerX = 0;
        const centerY = 0;
        const size = 30 + Math.random() * 50;
        
        graphics.drawCircle(centerX, centerY, size);
        graphics.drawCircle(centerX + size * 0.5, centerY, size * 0.8);
        graphics.drawCircle(centerX - size * 0.5, centerY, size * 0.7);
        graphics.drawCircle(centerX, centerY - size * 0.4, size * 0.6);
        
        graphics.endFill();
        
        const texture = this.game.app.renderer.generateTexture(graphics);
        return new PIXI.Sprite(texture);
    }
    
    createTitle() {
        // Style du texte pour le titre
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 64,
            fontWeight: 'bold',
            fill: ['#FFFFFF', '#FFFF00'],
            stroke: '#4A1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6
        });
        
        this.title = new PIXI.Text('PixiGame', titleStyle);
        this.title.anchor.set(0.5);
        this.title.x = this.game.width / 2;
        this.title.y = this.game.height / 4;
        
        this.container.addChild(this.title);
    }
    
    createButtons() {
        // Créer les 3 boutons du menu
        this.startButton = this.createButton('Démarrer', this.game.width / 2, this.game.height / 2, () => this.startGame());
        this.settingsButton = this.createButton('Paramètres', this.game.width / 2, this.game.height / 2 + 80, () => this.openSettings());
        this.creditsButton = this.createButton('Crédits', this.game.width / 2, this.game.height / 2 + 160, () => this.showCredits());
        
        // Ajouter les boutons au container
        this.container.addChild(this.startButton);
        this.container.addChild(this.settingsButton);
        this.container.addChild(this.creditsButton);
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
    
    startGame() {
        // Cacher le menu et démarrer le jeu
        this.hide();
        this.game.startGameplay();
    }
    
    openSettings() {
        // Afficher les paramètres (à implémenter)
        console.log("Ouverture des paramètres");
    }
    
    showCredits() {
        // Afficher les crédits (à implémenter)
        console.log("Affichage des crédits");
    }
    
    show() {
        this.container.visible = true;
    }
    
    hide() {
        this.container.visible = false;
    }
    
    handleResize() {
        // Mettre à jour la position des éléments lors du redimensionnement
        this.background.width = this.game.width;
        this.background.height = this.game.height;
        
        this.title.x = this.game.width / 2;
        this.title.y = this.game.height / 4;
        
        this.startButton.x = this.game.width / 2;
        this.startButton.y = this.game.height / 2;
        
        this.settingsButton.x = this.game.width / 2;
        this.settingsButton.y = this.game.height / 2 + 80;
        
        this.creditsButton.x = this.game.width / 2;
        this.creditsButton.y = this.game.height / 2 + 160;
    }
} 