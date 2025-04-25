import * as PIXI from 'pixi.js';

export class MainMenu {
    container: PIXI.Container;
    game: any;
    buttons: PIXI.Container[];
    title: PIXI.Text;
    
    constructor(game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.buttons = [];
        
        // Créer le conteneur principal
        this.container.width = game.app.screen.width;
        this.container.height = game.app.screen.height;
        
        // Créer l'arrière-plan
        this.createBackground();
        
        // Créer le titre
        this.createTitle();
        
        // Créer les boutons
        this.createButtons();
        
        // S'assurer que le menu est visible
        this.container.visible = true;
        console.log("Menu principal créé avec des dimensions:", game.app.screen.width, "x", game.app.screen.height);
    }
    
    createBackground() {
        // Créer un dégradé pour l'arrière-plan
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x0000AA); // Bleu foncé pour le haut
        graphics.drawRect(0, 0, this.game.app.screen.width, this.game.app.screen.height / 2);
        graphics.beginFill(0x00AAFF); // Bleu clair pour le bas
        graphics.drawRect(0, this.game.app.screen.height / 2, this.game.app.screen.width, this.game.app.screen.height / 2);
        graphics.endFill();
        
        // Convertir en texture
        const texture = this.game.app.renderer.generateTexture(graphics);
        const background = new PIXI.Sprite(texture);
        
        // Ajouter le fond au container
        this.container.addChild(background);
        
        console.log("Arrière-plan du menu créé");
    }
    
    createTitle() {
        // Style du titre
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 64,
            fontWeight: 'bold',
            fill: ['#FFD700', '#FF8C00'],
            stroke: '#000000',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });
        
        this.title = new PIXI.Text('PIXI Game', titleStyle);
        this.title.x = this.game.app.screen.width / 2;
        this.title.y = this.game.app.screen.height / 4;
        this.title.anchor.set(0.5);
        
        this.container.addChild(this.title);
    }
    
    createButtons() {
        const buttonData = [
            { text: 'Jouer', action: () => this.startGame() },
            { text: 'Options', action: () => this.openOptions() },
            { text: 'Crédits', action: () => this.showCredits() }
        ];
        
        const buttonStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: ['#FFFFFF'],
            stroke: '#000000',
            strokeThickness: 4,
        });
        
        buttonData.forEach((data, index) => {
            // Créer le conteneur du bouton
            const button = new PIXI.Container();
            
            // Créer l'arrière-plan du bouton
            const background = new PIXI.Graphics();
            background.beginFill(0x0088FF);
            background.lineStyle(4, 0x004488, 1);
            background.drawRoundedRect(0, 0, 200, 60, 15);
            background.endFill();
            
            // Créer le texte du bouton
            const text = new PIXI.Text(data.text, buttonStyle);
            text.anchor.set(0.5);
            text.x = 100;
            text.y = 30;
            
            // Ajouter les éléments au bouton
            button.addChild(background);
            button.addChild(text);
            
            // Positionner le bouton
            button.x = this.game.app.screen.width / 2 - 100;
            button.y = this.game.app.screen.height / 2 + index * 80;
            
            // Rendre le bouton interactif
            button.eventMode = 'static';
            button.cursor = 'pointer';
            
            // Ajouter les événements du bouton
            button.on('pointerdown', data.action);
            button.on('pointerover', () => {
                background.tint = 0x66BBFF;
                text.scale.set(1.1);
            });
            button.on('pointerout', () => {
                background.tint = 0xFFFFFF;
                text.scale.set(1.0);
            });
            
            // Ajouter le bouton au conteneur
            this.buttons.push(button);
            this.container.addChild(button);
        });
    }
    
    handleResize() {
        // Mettre à jour la position des éléments lors du redimensionnement
        this.container.width = this.game.app.screen.width;
        this.container.height = this.game.app.screen.height;
        
        // Repositionner le titre
        this.title.x = this.game.app.screen.width / 2;
        this.title.y = this.game.app.screen.height / 4;
        
        // Repositionner les boutons
        this.buttons.forEach((button, index) => {
            button.x = this.game.app.screen.width / 2 - 100;
            button.y = this.game.app.screen.height / 2 + index * 80;
        });
    }
    
    startGame() {
        // Masquer le menu et démarrer le jeu
        this.hide();
        this.game.startGameplay();
        console.log("Jeu démarré - Menu caché");
    }
    
    openOptions() {
        // Logique pour ouvrir le menu des options
        console.log('Menu des options ouvert');
    }
    
    showCredits() {
        // Logique pour afficher les crédits
        console.log('Crédits affichés');
    }
    
    show() {
        this.container.visible = true;
    }
    
    hide() {
        this.container.visible = false;
    }
} 